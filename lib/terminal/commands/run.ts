import type { TerminalData, TerminalProject } from "../data";
import { closest } from "../suggest";
import { blank, bold, cmd, color, dim, error, link, plain } from "../text";
import type { Command, Line, Result, Span } from "../types";
import { findProject, projectAt, shortDate } from "./shared";

const ok = (lines: Line[], extra: Partial<Result> = {}): Result => ({ lines, ...extra });
const norm = (text: string) => text.trim().replace(/\s+/g, " ");

const runnable = (p: TerminalProject) => p.recordings.length > 0 || Boolean(p.live) || Boolean(p.local);

function statusText(p: TerminalProject): Span[] {
  if (p.liveStatus === undefined) return [dim("not checked yet")];
  if (p.liveStatus === null) return [color("no response", "brightRed"), p.liveCheckedAt ? dim(` on ${shortDate(p.liveCheckedAt)}`) : dim("")];
  const good = p.liveStatus >= 200 && p.liveStatus < 400;
  return [color(`HTTP ${p.liveStatus}`, good ? "brightGreen" : "brightRed"), ...(p.liveCheckedAt ? [dim(` on ${shortDate(p.liveCheckedAt)}`)] : [])];
}

/** What running a project does: replay a recording, forward a live demo, or explain why it cannot run. */
export function runProject(p: TerminalProject, which = 0): Result {
  const out: Line[] = [];
  const effects: Result["effects"] = [];

  if (p.recordings.length > 0) {
    const rec = p.recordings[Math.min(Math.max(which, 0), p.recordings.length - 1)];
    out.push([color("> ", "brightGreen"), bold(rec.title)]);
    effects.push({ type: "replay", cast: `/casts/${rec.cast}`, title: rec.title });
    const others = p.recordings.map((r, i) => ({ r, i })).filter(({ i }) => i !== Math.min(Math.max(which, 0), p.recordings.length - 1));
    if (others.length > 0) {
      out.push(blank(), [dim("Other recorded runs:")]);
      for (const { r, i } of others) out.push([{ text: "  " }, cmd(r.command, `run ${p.slug} ${i + 1}`), { text: `  ${r.title}`, dim: true }]);
    }
  }

  if (p.live) {
    if (out.length > 0) out.push(blank());
    out.push([bold(`${p.title}: live demo`)], [{ text: "  " }, link(p.live), { text: "  " }, ...statusText(p)], [dim("  Forwarded to the PORTS tab: "), cmd("ports")]);
  }

  if (p.local) {
    if (out.length > 0) out.push(blank());
    out.push(
      [bold(`${p.title}: runs on your machine`)],
      plain("  Its demo is a local web page, not something this static site can host. To start it:"),
      [{ text: "    " }, color(p.local.command, "brightYellow")],
      [{ text: `  then open http://127.0.0.1:${p.local.port}` }],
    );
  }

  if (out.length === 0) {
    out.push(
      plain(`${p.title} cannot run on this site: it needs private services or keys that are not public.`),
      [{ text: "Read the code and the write-up instead: " }, cmd(`cat ${p.path.slice(1)}/README.md`), { text: "  " }, link(`https://github.com/${p.repo}`)],
    );
  }
  return ok(out, { effects });
}

/** Lists the live demos and local-only demos the way VS Code lists forwarded ports, and shows the PORTS tab. */
export const portsCommand: Command = {
  name: "ports",
  group: "work",
  summary: "list the live demos (the PORTS tab)",
  run(_args, _s, env) {
    const rows = env.data.projects.filter((p) => p.live || p.local);
    if (rows.length === 0) return ok([plain("No demos are listed yet.")]);
    const lines: Line[] = [];
    for (const p of rows) {
      if (p.live) lines.push([bold(p.title.padEnd(16)), link(p.live), { text: "  " }, ...statusText(p)]);
      if (p.local) lines.push([bold(p.title.padEnd(16)), { text: `127.0.0.1:${p.local.port}  ` }, dim("local only: runs on your machine")]);
    }
    return ok(lines, { effects: [{ type: "openPanel", tab: "ports" }] });
  },
};

export const runCommand: Command = {
  name: "run",
  group: "work",
  summary: "run a project: replay a recorded run, or open its live demo",
  usage: "run [project] [n]",
  complete: (args, _s, env) => env.data.projects.map((p) => p.slug).filter((s) => s.startsWith((args[args.length - 1] ?? "").toLowerCase())),
  run(args, session, env) {
    const { data } = env;
    const index = /^\d+$/.test(args[args.length - 1] ?? "") ? Number(args[args.length - 1]) - 1 : 0;
    const nameArgs = /^\d+$/.test(args[args.length - 1] ?? "") ? args.slice(0, -1) : args;

    if (nameArgs.length > 0) {
      const project = findProject(data, nameArgs.join(" "));
      if (!project) {
        const guess = closest(nameArgs[0], data.projects.map((p) => p.slug));
        return { lines: [error(`run: no project named '${nameArgs.join(" ")}'`), ...(guess ? [[{ text: "Did you mean " }, cmd(guess, `run ${guess}`), { text: "?" }] as Line] : [])], status: 1 };
      }
      return runProject(project, index);
    }

    const here = projectAt(data, session.cwd);
    if (here) return runProject(here, index);

    const list = data.projects.filter(runnable);
    return ok([
      plain("Pick a project to run:"),
      ...list.map((p): Line => [{ text: "  " }, cmd(`run ${p.slug}`), { text: `  ${p.tagline}`, dim: true }]),
    ]);
  },
};

/** Typed commands that mean "run this project": the exact recorded command, or a dev-server alias. */
export function matchNative(input: string, cwd: string, data: TerminalData): Result | null {
  const typed = norm(input);
  const here = projectAt(data, cwd);

  const recorded = (p: TerminalProject) => p.recordings.findIndex((r) => norm(r.command) === typed);
  if (here) {
    const i = recorded(here);
    if (i !== -1) return runProject(here, i);
    if (/^(npm run dev|npm start|npm run start|yarn dev|yarn start|pnpm dev)$/.test(typed)) return runnable(here) ? runProject(here) : { lines: [error("npm error enoent Could not read package.json: this folder has none")], status: 254 };
    if (here.local && norm(here.local.command) === typed) return runProject(here);
    return null;
  }

  // The command belongs to a project, but the user is somewhere else.
  const owner = data.projects.find((p) => recorded(p) !== -1);
  if (owner) {
    return { lines: [[{ text: "That command was recorded in " }, cmd(owner.path.slice(1), `cd ${owner.path}`), { text: ". Go there first, or use " }, cmd(`run ${owner.slug}`)]], status: 1 };
  }
  return null;
}
