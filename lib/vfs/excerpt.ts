import type { ExcerptSpec } from "../../content/config";
import type { LangId } from "../languages";

/** Line-comment marker for the header written at the top of an excerpt. */
export function commentPrefix(lang: LangId): string {
  switch (lang) {
    case "python":
    case "toml":
    case "shellscript":
      return "#";
    default:
      return "//";
  }
}

export function excerptName(spec: ExcerptSpec): string {
  return spec.name ?? spec.path.slice(spec.path.lastIndexOf("/") + 1);
}

/** GitHub URL of the exact commit and lines the excerpt was taken from. */
export function permalink(spec: ExcerptSpec): string {
  const base = `https://github.com/${spec.repo}/blob/${spec.ref}/${spec.path}`;
  if (!spec.lines) return base;
  const [start, end] = spec.lines;
  return start === end ? `${base}#L${start}` : `${base}#L${start}-L${end}`;
}

export function excerptHeader(spec: ExcerptSpec, lang: LangId): string {
  const c = commentPrefix(lang);
  const range = spec.lines ? `, lines ${spec.lines[0]}-${spec.lines[1]}` : "";
  return [
    `${c} Source:  github.com/${spec.repo}`,
    `${c} File:    ${spec.path}${range}`,
    `${c} Commit:  ${spec.ref.slice(0, 7)} (pinned)`,
    `${c} Link:    ${permalink(spec)}`,
    "",
    "",
  ].join("\n");
}
