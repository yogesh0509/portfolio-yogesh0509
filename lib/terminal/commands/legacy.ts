import type { TerminalData } from "../data";
import { blank, bold, error, link, plain } from "../text";
import type { Command, Line, Result } from "../types";
import { findProject } from "./shared";

/**
 * The commands my 2024 site taught, kept working:
 *   curl http://localhost:3000/<Project>/info
 *   npx hardhat run scripts/<Project> --args info()
 * Both read the same project data as everything else.
 */

const ok = (lines: Line[]): Result => ({ lines });
const notFound: Result = { lines: [plain("Function or file not found!!")], status: 1 };

function answer(data: TerminalData, projectName: string, fn: string): Result {
  const project = findProject(data, projectName);
  if (!project) return notFound;
  switch (fn.toLowerCase()) {
    case "info":
      return ok([plain(project.tagline)]);
    case "devtools":
      return ok([
        [bold("Language:")],
        ...project.stack.languages.map((l): Line => plain(`--   ${l}`)),
        blank(),
        [bold("Framework/Library:")],
        ...project.stack.frameworks.map((f): Line => plain(`--   ${f}`)),
      ]);
    case "resources":
      return ok([
        [{ text: "github: " }, link(`https://github.com/${project.repo}`)],
        ...(project.live ? [[{ text: "live: " }, link(project.live)] as Line] : []),
      ]);
    default:
      return notFound;
  }
}

const curl: Command = {
  name: "curl",
  group: "linux",
  summary: "fetch a URL (only the old localhost:3000 project endpoints work)",
  run(args, _s, env) {
    const url = args.find((a) => !a.startsWith("-"));
    if (!url) return { lines: [plain("curl: try 'curl --help' for more information")], status: 2 };
    const match = /^https?:\/\/localhost:3000\/([^/]+)\/([^/]+)\/?$/i.exec(url);
    if (match) return answer(env.data, match[1], match[2]);
    return { lines: [error(`curl: (7) Failed to connect to ${url.replace(/^https?:\/\//, "").split("/")[0]}: this is a static site with no network access`)], status: 7 };
  },
};

const npx: Command = {
  name: "npx",
  group: "linux",
  summary: "run a package binary (only the old hardhat project scripts work)",
  run(args, _s, env) {
    // npx hardhat run scripts/<Project> --args info()
    const match = args.join(" ").match(/^hardhat run scripts\/(\S+) --args (\w+)\(\)$/i);
    if (match) return answer(env.data, match[1], match[2]);
    return { lines: [error("npm error could not determine executable to run")], status: 1 };
  },
};

export const legacyCommands: Command[] = [curl, npx];
