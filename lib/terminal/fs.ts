import { normalizePath, pathKey, resolvePath } from "../vfs/paths";
import type { ExplorerNode } from "../vfs/types";

/** Looks things up in the explorer tree the terminal was given. Case-insensitive, like the URLs. */

export const rootOf = (tree: ExplorerNode[]): ExplorerNode => ({ kind: "dir", name: "", path: "/", children: tree });

export function lookup(tree: ExplorerNode[], path: string): ExplorerNode | null {
  const wanted = pathKey(path);
  let current = rootOf(tree);
  if (wanted === "/") return current;
  for (const part of wanted.slice(1).split("/")) {
    if (current.kind !== "dir") return null;
    const next: ExplorerNode | undefined = current.children?.find((c) => c.name.toLowerCase() === part);
    if (!next) return null;
    current = next;
  }
  return current;
}

export function flattenFiles(nodes: ExplorerNode[]): ExplorerNode[] {
  return nodes.flatMap((n) => (n.kind === "file" ? [n] : flattenFiles(n.children ?? [])));
}

/**
 * Completion candidates for a path being typed: "pro" gives "projects/", "projects/ha" gives
 * "projects/haystack/". Only directories (when `dirsOnly`) or everything are offered.
 */
export function completePath(tree: ExplorerNode[], cwd: string, partial: string, dirsOnly = false): string[] {
  const slash = partial.lastIndexOf("/");
  const dirPart = slash === -1 ? "" : partial.slice(0, slash + 1);
  const namePart = slash === -1 ? partial : partial.slice(slash + 1);
  const dir = lookup(tree, dirPart === "" ? cwd : resolvePath(cwd, dirPart === "/" ? "/" : dirPart));
  if (!dir || dir.kind !== "dir") return [];
  const prefix = namePart.toLowerCase();
  return (dir.children ?? [])
    .filter((c) => c.name.toLowerCase().startsWith(prefix) && (!dirsOnly || c.kind === "dir"))
    .map((c) => `${dirPart}${c.name}${c.kind === "dir" ? "/" : ""}`);
}

/** Absolute path for display in error messages such as "cat: foo: No such file or directory". */
export const absolute = (cwd: string, typed: string) => normalizePath(resolvePath(cwd, typed));
