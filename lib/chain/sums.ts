/**
 * SHA-256 checksums of every file on the site, in the format `sha256sum` prints and reads:
 * "<64 hex characters>  <path>". Distros and Bitcoin Core publish release checksums the same way.
 * The build writes the list (app/SHA256SUMS) and the terminal can recompute the hashes in the
 * browser with the Web Crypto API, so `sha256sum -c SHA256SUMS` is real verification.
 */

const encoder = new TextEncoder();

export async function sha256Hex(text: string): Promise<string> {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) throw new Error("the Web Crypto API is not available here (it needs a secure context, https)");
  const digest = await subtle.digest("SHA-256", encoder.encode(text));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

export interface SumEntry {
  hash: string;
  /** Path relative to the site root, no leading slash. */
  path: string;
}

export async function buildSums(files: { path: string; content: string }[]): Promise<string> {
  const entries = await Promise.all(files.map(async (f) => ({ hash: await sha256Hex(f.content), path: f.path.replace(/^\//, "") })));
  // Plain code-point order, like `LC_ALL=C sort`: localeCompare would depend on the build machine's locale.
  return entries.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0)).map((e) => `${e.hash}  ${e.path}`).join("\n") + "\n";
}

export class SumsError extends Error {}

/** Parses a checksum list. Blank lines are skipped; any other malformed line is an error. */
export function parseSums(text: string): SumEntry[] {
  return text
    .split("\n")
    .filter((line) => line.trim() !== "")
    .map((line, index) => {
      const match = /^([0-9a-f]{64}) [ *](.+)$/.exec(line);
      if (!match) throw new SumsError(`improperly formatted checksum line ${index + 1}`);
      return { hash: match[1], path: match[2] };
    });
}
