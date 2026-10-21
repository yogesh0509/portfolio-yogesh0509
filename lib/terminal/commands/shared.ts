import type { TerminalData, TerminalProject, TerminalSystem } from "../data";
import { bold, color, dim } from "../text";
import type { Line, Span } from "../types";

/** Letters and digits only, lower case: "web3-DREAM11", "Web3Dream11" and "web3dream11" all match. */
export const squash = (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, "");

/** Finds a featured project by slug, title or repo name; an unambiguous prefix also works. */
export function findProject(data: TerminalData, query: string): TerminalProject | null {
  const q = squash(query);
  if (q === "") return null;
  const names = (p: TerminalProject) => [p.slug, p.title, p.repo.split("/")[1] ?? ""].map(squash);
  const exact = data.projects.find((p) => names(p).includes(q));
  if (exact) return exact;
  const prefix = data.projects.filter((p) => names(p).some((n) => n.startsWith(q)));
  return prefix.length === 1 ? prefix[0] : null;
}

/** The featured project whose folder contains the current directory, if any. */
export function projectAt(data: TerminalData, cwd: string): TerminalProject | null {
  return data.projects.find((p) => cwd === p.path || cwd.startsWith(`${p.path}/`)) ?? null;
}

export const homeDir = (system: TerminalSystem) => `/home/${system.user}`;

/** "Thu Oct  8 18:22:03 UTC 2026", the format of the `date` command. */
export function formatDate(d: Date): string {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const p = (n: number) => String(n).padStart(2, "0");
  return `${days[d.getUTCDay()]} ${months[d.getUTCMonth()]} ${String(d.getUTCDate()).padStart(2, " ")} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())} UTC ${d.getUTCFullYear()}`;
}

export const plural = (n: number, word: string, many = `${word}s`) => `${n} ${n === 1 ? word : many}`;

/** "2026-10-05" to "2026.10.05", the way a package version would read. */
export const versionOf = (iso: string) => iso.slice(0, 10).replaceAll("-", ".");

/** Wraps text to a width, indenting every line. */
export function wrap(text: string, width: number, indent = 0): string[] {
  const out: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    if (line !== "" && line.length + 1 + word.length > width - indent) {
      out.push(" ".repeat(indent) + line);
      line = word;
    } else {
      line = line === "" ? word : `${line} ${word}`;
    }
  }
  if (line !== "") out.push(" ".repeat(indent) + line);
  return out;
}

export const heading = (text: string): Line => [bold(text)];
export const labelled = (label: string, value: Span | string): Line => [
  color(`${label}: `, "brightGreen", { bold: true }),
  typeof value === "string" ? { text: value } : value,
];
export const note = (text: string): Line => [dim(text)];

export const shortDate = (iso: string) => iso.slice(0, 10);

/** The prompt's working directory for a VFS path. */
export const promptPath = (cwd: string) => (cwd === "/" ? "~" : `~${cwd}`);
