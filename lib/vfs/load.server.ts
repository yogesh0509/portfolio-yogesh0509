import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import * as config from "../../content/config";
import { EMPTY_SNAPSHOT, SnapshotSchema, type Snapshot } from "../github/schema";
import { buildVfs } from "./build";
import { getBuildInfo } from "../build-info.server";
import { buildContracts } from "../chain/contracts.server";
import { buildTerminalData, type TerminalData } from "../terminal/data";
import { pathKey } from "./paths";
import { toExplorer, walkFiles } from "./tree";
import type { ExplorerNode, VfsDir, VfsFile } from "./types";

/** Build-time only: reads content/ and data/ from disk. Never import this from client code. */
const root = process.cwd();

function read(relPath: string): string | null {
  const full = join(root, relPath);
  return existsSync(full) ? readFileSync(full, "utf8") : null;
}

export function loadSnapshot(): Snapshot {
  const raw = read("data/github.json");
  if (raw === null) return EMPTY_SNAPSHOT;
  return SnapshotSchema.parse(JSON.parse(raw));
}

let cached: VfsDir | undefined;

export function getVfs(): VfsDir {
  cached ??= buildVfs({ config, snapshot: loadSnapshot(), read });
  return cached;
}

export function allFiles(): VfsFile[] {
  return walkFiles(getVfs());
}

export function explorerTree(): ExplorerNode[] {
  return getVfs().children.map(toExplorer);
}

/** Everything the terminal's commands read, served as /vfs/terminal.json. */
export function getTerminalData(): TerminalData {
  return buildTerminalData({
    system: config.system,
    profile: {
      name: config.profile.name,
      handle: config.profile.handle,
      headline: config.profile.headline,
      summary: config.profile.summary,
      location: config.profile.location,
      email: config.profile.email,
      github: config.profile.github,
      linkedin: config.profile.linkedin,
      resumeUrl: config.profile.resumeUrl,
    },
    build: getBuildInfo(),
    experience: config.experience,
    education: config.education,
    skills: config.skills,
    projects: config.projects,
    excludedRepos: config.excludedRepos,
    contracts: buildContracts(config.projects),
    snapshot: loadSnapshot(),
  });
}

/** The text of every file by lower-cased path, served as /vfs/content.json for `cat`. */
export function contentIndex(): Record<string, string> {
  return Object.fromEntries(allFiles().map((f) => [pathKey(f.path), f.content]));
}
