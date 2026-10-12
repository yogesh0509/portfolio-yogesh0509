/**
 * Pulls public GitHub data into data/ so the site can be built from files in the repo.
 *
 *   npm run sync                 write data/ if anything changed
 *   npm run sync -- --dry-run    report what would change, write nothing
 *
 * Set GITHUB_TOKEN for the 5,000/hour API limit (the weekly workflow does); without it
 * the limit is 60 requests/hour and one run uses about 25.
 *
 * Writes nothing at all when the data is identical, so `git status` stays clean and the
 * weekly job only commits real changes.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync, appendFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { excludedRepos, projects } from "../content/config";
import { createClient, type GitHubClient } from "../lib/github/client";
import { EMPTY_SNAPSHOT, SnapshotSchema, type Demo, type Snapshot } from "../lib/github/schema";
import {
  ApiRepoSchema,
  ApiSearchSchema,
  ApiUserSchema,
  scanForSecrets,
  serializeSnapshot,
  sliceLines,
  snapshotsDiffer,
  toProfile,
  toPullRequest,
  toRepo,
} from "../lib/github/transform";
import { excerptName } from "../lib/vfs/excerpt";
import { z } from "zod";

const LOGIN = "yogesh0509";
const ROOT = process.cwd();
const DATA = join(ROOT, "data");
const dryRun = process.argv.includes("--dry-run");

const log = (message: string) => console.log(message);

const readIfExists = (path: string) => (existsSync(path) ? readFileSync(path, "utf8") : null);

async function allPages<T>(client: GitHubClient, path: string, schema: z.ZodType<T[]>): Promise<T[]> {
  const out: T[] = [];
  for (let page = 1; page <= 5; page += 1) {
    const batch = schema.parse(await client.json(`${path}${path.includes("?") ? "&" : "?"}per_page=100&page=${page}`));
    out.push(...batch);
    if (batch.length < 100) break;
  }
  return out;
}

/** Merged PRs by me to repositories I do not own. The search API wraps results in { items }. */
async function searchMergedPullRequests(client: GitHubClient) {
  const query = encodeURIComponent(`is:pr is:merged author:${LOGIN} -user:${LOGIN}`);
  const items: z.infer<typeof ApiSearchSchema>["items"] = [];
  for (let page = 1; page <= 10; page += 1) {
    const body = ApiSearchSchema.parse(await client.json(`/search/issues?q=${query}&sort=updated&per_page=100&page=${page}`));
    items.push(...body.items);
    if (items.length >= body.total_count || body.items.length === 0) {
      if (items.length < body.total_count) throw new Error(`Search returned ${items.length} of ${body.total_count} PRs`);
      return items;
    }
  }
  throw new Error("Search has more than 1,000 results; extend the pagination");
}

async function fetchReadme(client: GitHubClient, repo: string, branch: string): Promise<string | null> {
  for (const name of ["README.md", "readme.md", "Readme.md"]) {
    const text = await client.raw(repo, branch, name);
    if (text !== null) return text;
  }
  return null;
}

async function checkDemo(repo: string, url: string): Promise<Demo> {
  let status: number | null = null;
  for (let attempt = 0; attempt < 2 && (status === null || status >= 500); attempt += 1) {
    try {
      // Free hosts sleep when idle, so allow a slow first response.
      const res = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(30_000) });
      status = res.status;
    } catch {
      status = null;
    }
  }
  return { repo, url, status, checkedAt: new Date().toISOString() };
}

/** Every file under a directory, as paths relative to ROOT. */
function listFiles(relDir: string): string[] {
  const dir = join(ROOT, relDir);
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((entry) => {
    const rel = `${relDir}/${entry}`;
    return statSync(join(ROOT, rel)).isDirectory() ? listFiles(rel) : [rel];
  });
}

async function main() {
  const client = createClient({ token: process.env.GITHUB_TOKEN });
  const previousRaw = readIfExists(join(DATA, "github.json"));
  const previous: Snapshot = previousRaw ? SnapshotSchema.parse(JSON.parse(previousRaw)) : EMPTY_SNAPSHOT;

  log(`Syncing github.com/${LOGIN}${process.env.GITHUB_TOKEN ? " (authenticated)" : " (no token)"}`);

  const user = ApiUserSchema.parse(await client.json(`/users/${LOGIN}`));
  const apiRepos = await allPages(client, `/users/${LOGIN}/repos?type=owner&sort=pushed`, z.array(ApiRepoSchema));

  const featured = new Set(projects.flatMap((p) => [p.repo, ...(p.extraRepos ?? [])]).map((r) => r.toLowerCase()));
  const excluded = new Set(excludedRepos.map((r) => r.toLowerCase()));
  const files = new Map<string, string>(); // relative path -> desired content

  const repos = [];
  for (const api of apiRepos) {
    if (api.fork) continue; // forks are not shown; contributions come from merged PRs
    // The name becomes a file name under data/readmes/, so it must be a plain GitHub repo name.
    if (!/^[A-Za-z0-9._-]+$/.test(api.name) || api.name === "." || api.name === "..") throw new Error(`Unexpected repository name: ${JSON.stringify(api.name)}`);
    const languages = z.record(z.string(), z.number()).parse(await client.json(`/repos/${api.full_name}/languages`));
    const shown = !api.archived && !featured.has(api.full_name.toLowerCase()) && !excluded.has(api.name.toLowerCase());
    const readme = shown ? await fetchReadme(client, api.full_name, api.default_branch) : null;
    if (readme !== null) files.set(`data/readmes/${api.name}.md`, readme);
    repos.push(toRepo(api, languages, readme !== null));
  }

  const search = await searchMergedPullRequests(client);
  const pullRequests = search.map(toPullRequest).filter((pr) => pr !== null);

  const demos: Demo[] = [];
  for (const project of projects) {
    if (project.live) demos.push(await checkDemo(project.repo, project.live));
  }

  const stale: string[] = [];
  for (const project of projects) {
    for (const spec of project.excerpts) {
      const pinned = await client.raw(spec.repo, spec.ref, spec.path);
      if (pinned === null) throw new Error(`${spec.repo}@${spec.ref.slice(0, 7)}:${spec.path} does not exist`);
      files.set(`data/excerpts/${project.slug}/${excerptName(spec)}`, sliceLines(pinned, spec.lines));
      if (!spec.pinnedOnPurpose) {
        const head = await client.raw(spec.repo, "HEAD", spec.path);
        if (head !== pinned) stale.push(`${spec.repo}:${spec.path} has changed since ${spec.ref.slice(0, 7)}`);
      }
    }
  }

  const now = new Date().toISOString();
  const candidate: Snapshot = { schemaVersion: 1, syncedAt: previous.syncedAt, profile: toProfile(user), repos, pullRequests, demos };

  // Never publish something that looks like a credential. Report the file and the kind, not the text.
  for (const [path, content] of [...files, ["data/github.json", serializeSnapshot(candidate)] as [string, string]]) {
    const found = scanForSecrets(content);
    if (found.length > 0) throw new Error(`Refusing to publish ${path}: it looks like it contains a ${found.join(" and a ")}.`);
  }


  // What is on disk now, under the two directories this script owns.
  const owned = [...listFiles("data/readmes"), ...listFiles("data/excerpts")];
  const changedFiles = [...files].filter(([path, content]) => readIfExists(join(ROOT, path)) !== content).map(([path]) => path);
  const removedFiles = owned.filter((path) => !files.has(path));
  const dataChanged = snapshotsDiffer(previous, candidate);
  const changed = dataChanged || changedFiles.length > 0 || removedFiles.length > 0;

  const lines = [
    `## GitHub sync: ${changed ? "changes found" : "no changes"}`,
    "",
    `- ${repos.length} original repos, ${pullRequests.length} merged pull requests to other projects, ${apiRepos.length - repos.length} forks skipped.`,
    `- ${client.apiCalls} GitHub API requests.`,
    `- Snapshot ${dataChanged ? "changed" : "unchanged"}; ${changedFiles.length} files added or changed, ${removedFiles.length} removed.`,
  ];
  for (const demo of demos) lines.push(`- Demo ${demo.url}: ${demo.status ?? "no response"}${demo.status === 200 ? "" : " (check this)"}`);
  for (const message of stale) lines.push(`- Stale excerpt: ${message}. Review it and update the pinned commit on purpose.`);
  log(lines.join("\n"));
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, lines.join("\n") + "\n");

  if (!changed || dryRun) {
    if (changed && dryRun) log("Dry run: nothing written.");
    return;
  }

  const next: Snapshot = { ...candidate, syncedAt: now };
  mkdirSync(DATA, { recursive: true });
  writeFileSync(join(DATA, "github.json"), serializeSnapshot(next));
  for (const [path, content] of files) {
    mkdirSync(dirname(join(ROOT, path)), { recursive: true });
    writeFileSync(join(ROOT, path), content);
  }
  for (const path of removedFiles) rmSync(join(ROOT, path));
  log("Wrote data/.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
