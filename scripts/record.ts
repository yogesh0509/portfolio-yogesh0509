/**
 * Records a command into an asciicast file the site can replay.
 *
 *   npm run record -- <name> [--cwd <dir>] [--as <shown path>] [--note "<text>"] [--cols 100] [--rows 30] -- <command...>
 *
 * Example:
 *   npm run record -- haystack-strategies --cwd ~/Haystack --as "~/Haystack" \
 *     --note "Haystack at c745fe6" -- python3 -m attack strategies
 *
 * The command runs in a pseudo-terminal (via util-linux `script`), so tools print colours and
 * progress the way they do on a screen. Before the file is written, the working directory and the
 * home directory are replaced with the `--as` path and "~", and the recording is refused if it
 * looks like it contains a credential.
 */
import { spawn } from "node:child_process";
import { mkdirSync, realpathSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { StringDecoder } from "node:string_decoder";
import { writeCastV2, type CastEvent } from "../lib/cast/parse";
import { scanForSecrets } from "../lib/github/transform";

function usage(message?: string): never {
  if (message) console.error(`${message}\n`);
  console.error('usage: npm run record -- <name> [--cwd <dir>] [--as <shown path>] [--note "<text>"] [--cols N] [--rows N] -- <command...>');
  process.exit(2);
}

const argv = process.argv.slice(2);
const dashDash = argv.indexOf("--");
if (dashDash === -1) usage("Put the command after a lone --");
const head = argv.slice(0, dashDash);
const command = argv.slice(dashDash + 1).join(" ");
if (!command.trim()) usage("No command given");

const name = head[0];
if (!name || name.startsWith("--") || !/^[a-z0-9][a-z0-9._-]*$/i.test(name)) usage("The first argument is the recording's name, e.g. haystack-strategies");
const option = (flag: string) => {
  const i = head.indexOf(flag);
  return i === -1 ? undefined : head[i + 1];
};
const cwd = resolve((option("--cwd") ?? ".").replace(/^~(?=\/|$)/, homedir()));
const shownCwd = option("--as") ?? "~";
const note = option("--note");
const cols = Number(option("--cols") ?? 100);
const rows = Number(option("--rows") ?? 30);
if (!Number.isInteger(cols) || !Number.isInteger(rows) || cols < 20 || rows < 5) usage("--cols and --rows must be whole numbers (at least 20 and 5)");

const env: NodeJS.ProcessEnv = {
  ...process.env,
  TERM: "xterm-256color",
  COLORTERM: "truecolor",
  COLUMNS: String(cols),
  LINES: String(rows),
  // Ask common tools for colour even though their output is being captured.
  FORCE_COLOR: "1",
  CLICOLOR_FORCE: "1",
  CARGO_TERM_COLOR: "always",
  CARGO_TERM_PROGRESS_WHEN: "never",
  FOUNDRY_COLOR: "always",
  PY_COLORS: "1",
  PYTHONUNBUFFERED: "1",
};
delete env.NO_COLOR;

const events: CastEvent[] = [];
const started = process.hrtime.bigint();
const decoder = new StringDecoder("utf8");

const child = spawn("script", ["-qfec", `stty cols ${cols} rows ${rows}; ${command}`, "/dev/null"], { cwd, env, stdio: ["ignore", "pipe", "inherit"] });
child.stdout.on("data", (chunk: Buffer) => {
  const data = decoder.write(chunk);
  if (data) events.push({ time: Number(process.hrtime.bigint() - started) / 1e9, data });
});

child.on("error", (error) => {
  console.error(`Could not start the recording: ${error.message}`);
  process.exit(1);
});

child.on("close", (code) => {
  const rest = decoder.end();
  if (rest) events.push({ time: Number(process.hrtime.bigint() - started) / 1e9, data: rest });

  // Redact local paths: the working directory first (it is usually inside the home directory).
  const real = realpathSync(cwd);
  const redact = (text: string) =>
    text.split(real).join(shownCwd).split(cwd).join(shownCwd).split(homedir()).join("~");
  const cleaned = events.map((e) => ({ time: e.time, data: redact(e.data) }));

  const everything = cleaned.map((e) => e.data).join("");
  const found = scanForSecrets(everything);
  if (found.length > 0) {
    console.error(`Refusing to save the recording: the output looks like it contains a ${found.join(" and a ")}.`);
    process.exit(1);
  }

  const title = [note, `$ ${command}`].filter(Boolean).join(" | ");
  const file = join(process.cwd(), "public", "casts", `${name}.cast`);
  mkdirSync(join(process.cwd(), "public", "casts"), { recursive: true });
  writeFileSync(file, writeCastV2({ width: cols, height: rows, timestamp: Math.floor(Date.now() / 1000), idleTimeLimit: 1, title }, cleaned, { TERM: "xterm-256color", SHELL: "/bin/bash" }));

  const seconds = cleaned.length > 0 ? cleaned[cleaned.length - 1].time : 0;
  console.log(`Saved ${file}: ${cleaned.length} events, ${seconds.toFixed(2)} s, exit status ${code}.`);
  if (code !== 0) console.log("Note: the command exited with a non-zero status; check that the recording shows what you want.");
});
