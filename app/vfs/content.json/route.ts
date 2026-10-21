import { contentIndex } from "@/lib/vfs/load.server";

// The text of every file, for the terminal's `cat`. Fetched only when `cat` is first used.
export const dynamic = "force-static";

export function GET() {
  return Response.json(contentIndex());
}
