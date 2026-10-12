import { buildSums } from "@/lib/chain/sums";
import { allFiles } from "@/lib/vfs/load.server";

// Written once at build time: the SHA-256 of every file on the site, in `sha256sum` format.
export const dynamic = "force-static";

export async function GET() {
  const body = await buildSums(allFiles().map((f) => ({ path: f.path, content: f.content })));
  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
