import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { highlightToHast } from "@/lib/highlight/shiki.server";
import type { LangId } from "@/lib/languages";

/** Highlighted code with line numbers. Highlighting happens at build time. */
export default async function CodeView({ code, lang }: { code: string; lang: LangId }) {
  const tree = await highlightToHast(code, lang);
  return <div className="code-view">{toJsxRuntime(tree, { Fragment, jsx, jsxs })}</div>;
}
