import { sha256Hex, parseSums, SumsError } from "../../chain/sums";
import { absolute, completePath, lookup } from "../fs";
import { splitFlags } from "../parse";
import { color, dim, error, plain } from "../text";
import type { Command, Line, Result } from "../types";

const fail = (text: string, status = 1): Result => ({ lines: [error(text)], status });

const isPublishedList = (typed: string) => typed.replace(/^\//, "").toLowerCase() === "sha256sums";

export const sha256sum: Command = {
  name: "sha256sum",
  group: "chain",
  summary: "check a file's SHA-256, or all of them against SHA256SUMS",
  usage: "sha256sum <file ...> | sha256sum -c SHA256SUMS",
  complete: (args, s, env) => {
    const last = args[args.length - 1] ?? "";
    return [...completePath(env.tree, s.cwd, last), ...(last === "" || "SHA256SUMS".toLowerCase().startsWith(last.toLowerCase()) ? ["SHA256SUMS"] : [])];
  },
  async run(args, session, env) {
    const { flags, operands } = splitFlags(args);

    if (flags.has("-c")) {
      const [listName] = operands;
      if (!listName) return fail("sha256sum: no file specified", 1);
      if (!isPublishedList(listName)) return fail(`sha256sum: ${listName}: No such file or directory`);
      let entries;
      try {
        const res = await env.fetch("/SHA256SUMS");
        if (!res.ok) return fail(`sha256sum: SHA256SUMS: could not be downloaded (HTTP ${res.status})`);
        entries = parseSums(await res.text());
      } catch (cause) {
        if (cause instanceof SumsError) return fail(`sha256sum: SHA256SUMS: ${cause.message}`);
        return fail("sha256sum: SHA256SUMS: could not be downloaded");
      }

      const lines: Line[] = [];
      let bad = 0;
      for (const entry of entries) {
        const text = await env.readFile(`/${entry.path}`);
        if (text === null) {
          lines.push([{ text: `${entry.path}: ` }, color("FAILED open or read", "brightRed")]);
          bad += 1;
          continue;
        }
        const match = (await sha256Hex(text)) === entry.hash;
        if (!match) bad += 1;
        lines.push([{ text: `${entry.path}: ` }, match ? color("OK", "brightGreen") : color("FAILED", "brightRed")]);
      }
      lines.push(bad === 0 ? [dim(`${entries.length} files recomputed in your browser and matched.`)] : error(`sha256sum: WARNING: ${bad} computed checksum${bad === 1 ? "" : "s"} did NOT match`));
      return { lines, status: bad === 0 ? 0 : 1 };
    }

    if (operands.length === 0) return fail("sha256sum: reading from standard input is not supported here; name a file");
    const lines: Line[] = [];
    let status = 0;
    for (const typed of operands) {
      const node = lookup(env.tree, absolute(session.cwd, typed));
      if (!node) {
        lines.push(error(`sha256sum: ${typed}: No such file or directory`));
        status = 1;
      } else if (node.kind === "dir") {
        lines.push(error(`sha256sum: ${typed}: Is a directory`));
        status = 1;
      } else {
        try {
          lines.push(plain(`${await sha256Hex((await env.readFile(node.path)) ?? "")}  ${typed}`));
        } catch (cause) {
          lines.push(error(`sha256sum: ${cause instanceof Error ? cause.message : "failed"}`));
          status = 1;
        }
      }
    }
    return { lines, status };
  },
};
