import type { FeaturedProject } from "../content/config";
import type { Demo } from "./github/schema";

/** One row of the PORTS tab, the way VS Code lists a forwarded port. */
export interface PortEntry {
  id: string;
  label: string;
  kind: "live" | "local";
  /** Public URL, for live demos. */
  url?: string;
  /** Local port and the command that starts it, for demos that only run on a developer machine. */
  local?: { port: number; command: string };
  /** HTTP status at the last sync, or null when the request failed. Undefined when never checked. */
  status?: number | null;
  checkedAt?: string;
}

export function buildPorts(projects: FeaturedProject[], demos: Demo[]): PortEntry[] {
  return projects.flatMap((project): PortEntry[] => {
    const entries: PortEntry[] = [];
    if (project.live) {
      const demo = demos.find((d) => d.url === project.live);
      entries.push({
        id: `${project.slug}-live`,
        label: project.title,
        kind: "live",
        url: project.live,
        status: demo?.status,
        checkedAt: demo?.checkedAt,
      });
    }
    if (project.local) {
      entries.push({ id: `${project.slug}-local`, label: project.title, kind: "local", local: project.local });
    }
    return entries;
  });
}
