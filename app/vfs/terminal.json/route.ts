import { getTerminalData } from "@/lib/vfs/load.server";

// Written once at build time and fetched by the terminal the first time it opens.
export const dynamic = "force-static";

export function GET() {
  return Response.json(getTerminalData());
}
