import type { TimelineEntry } from "../data";
import { splitFlags } from "../parse";
import { closest } from "../suggest";
import { blank, color, error, link, plain } from "../text";
import type { Command, Line, Result, Span } from "../types";

const ok = (lines: Line[], extra: Partial<Result> = {}): Result => ({ lines, ...extra });

/** What the git "hash" column shows: the real PR number, or a star for events that have none. */
const refSpan = (entry: TimelineEntry): Span =>
  entry.ref && entry.url ? { text: entry.ref, fg: "brightYellow", href: entry.url, underline: true } : { text: "*", fg: "brightYellow" };

function logLines(entries: TimelineEntry[], oneline: boolean): Line[] {
  if (oneline) {
    const refWidth = Math.max(...entries.map((e) => (e.ref ?? "*").length), 1);
    const dateWidth = Math.max(...entries.map((e) => e.date.length), 1);
    return entries.map((e): Line => {
      const ref = refSpan(e);
      return [
        ref,
        { text: " ".repeat(refWidth - ref.text.length + 2) },
        color(e.date.padEnd(dateWidth), "brightGreen"),
        { text: "  " },
        { text: e.kind === "pr" ? `${e.text} ` : e.text },
        ...(e.kind === "pr" && e.repo ? [{ text: `(${e.repo})`, dim: true } as Span] : []),
      ];
    });
  }
  return entries.flatMap((e, i): Line[] => [
    ...(i > 0 ? [blank()] : []),
    [color("commit ", "brightYellow"), refSpan(e), ...(e.kind === "pr" ? [{ text: " (merged)", fg: "brightCyan" } as Span] : [])],
    [{ text: `Date:   ${e.date}` }],
    blank(),
    plain(`    ${e.text}`),
    ...(e.repo ? [plain(`    ${e.repo}`)] : []),
  ]);
}

export const gitCommand: Command = {
  name: "git",
  group: "work",
  summary: "my career as a commit log (git log)",
  usage: "git log [--long] [-n N] | git status | git remote -v | git branch",
  complete: (args) => (args.length <= 1 ? ["log", "status", "remote", "branch"].filter((s) => s.startsWith(args[0] ?? "")) : []),
  run(args, _s, env) {
    const { data } = env;
    const [sub, ...rest] = args;
    if (!sub) return ok([plain("usage: git log [--long] [-n N] | git status | git remote -v | git branch")], { status: 1 });

    if (sub === "log") {
      const { flags, operands } = splitFlags(rest);
      let limit = Infinity;
      const nFlag = rest.findIndex((a) => a === "-n");
      if (nFlag !== -1 && /^\d+$/.test(rest[nFlag + 1] ?? "")) limit = Number(rest[nFlag + 1]);
      for (const a of operands) if (/^\d+$/.test(a) && nFlag === -1) limit = Number(a);
      const dashN = rest.find((a) => /^-\d+$/.test(a));
      if (dashN) limit = Number(dashN.slice(1));
      const entries = data.timeline.slice(0, Math.max(limit, 0));
      if (entries.length === 0) return ok([plain("fatal: your current branch 'main' does not have any commits yet")], { status: 128 });
      // The compact timeline is the default: the full career fits on one screen. --long gives git's longer layout.
      return ok(logLines(entries, !flags.has("--long")));
    }

    if (sub === "status") {
      return ok([plain(`On branch ${data.build.branch}`), plain(`Your branch is up to date with 'origin/${data.build.branch}'.`), blank(), plain("nothing to commit, working tree clean")]);
    }
    if (sub === "remote") {
      return ok((["fetch", "push"] as const).map((kind): Line => [{ text: "origin\t" }, link(data.build.repoUrl), { text: ` (${kind})` }]));
    }
    if (sub === "branch") return ok([[color(`* ${data.build.branch}`, "brightGreen")]]);

    const guess = closest(sub, ["log", "status", "remote", "branch"]);
    return {
      lines: [error(`git: '${sub}' is not a git command. See 'git --help'.`), ...(guess ? [plain(""), plain("The most similar command is"), plain(`\t${guess}`)] : [])],
      status: 1,
    };
  },
};
