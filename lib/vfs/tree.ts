import { pathKey } from "./paths";
import type { ExplorerNode, VfsDir, VfsFile, VfsNode } from "./types";

export function countLines(text: string): number {
  if (text === "") return 0;
  return text.endsWith("\n") ? text.split("\n").length - 1 : text.split("\n").length;
}

/** Finds a node by path, ignoring case. Returns null when nothing is there. */
export function findNode(root: VfsDir, path: string): VfsNode | null {
  const wanted = pathKey(path);
  if (wanted === "/") return root;
  let current: VfsNode = root;
  for (const part of wanted.slice(1).split("/")) {
    if (current.kind !== "dir") return null;
    const next: VfsNode | undefined = current.children.find((child) => child.name.toLowerCase() === part);
    if (!next) return null;
    current = next;
  }
  return current;
}

export function walkFiles(node: VfsNode): VfsFile[] {
  if (node.kind === "file") return [node];
  return node.children.flatMap(walkFiles);
}

/** Every file in an explorer tree, in display order. */
export function explorerFiles(nodes: ExplorerNode[]): ExplorerNode[] {
  return nodes.flatMap((node) => (node.kind === "file" ? [node] : explorerFiles(node.children ?? [])));
}

export function toExplorer(node: VfsNode): ExplorerNode {
  if (node.kind === "file") {
    return { kind: "file", name: node.name, path: node.path, url: node.url, lang: node.lang, lines: node.lines, size: node.size, links: node.links };
  }
  return { kind: "dir", name: node.name, path: node.path, children: node.children.map(toExplorer) };
}
