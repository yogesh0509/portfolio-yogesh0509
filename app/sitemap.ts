import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { allFiles, loadSnapshot } from "@/lib/vfs/load.server";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = loadSnapshot().syncedAt ?? undefined;
  const urls = ["/resume", ...allFiles().map((file) => file.url)];
  // The welcome page is "/", so it is listed without a trailing path.
  return [...new Set(urls)].map((url) => ({ url: `${SITE_URL}${url === "/" ? "" : url}`, lastModified, changeFrequency: "weekly" as const }));
}
