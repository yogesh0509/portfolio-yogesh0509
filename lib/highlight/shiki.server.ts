import type { Root } from "hast";
import { createHighlighter, type Highlighter, type LanguageRegistration } from "shiki";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import cairoGrammar from "./grammars/cairo.tmLanguage.json";
import type { LangId } from "../languages";

/** Build-time only: Shiki never ships to the browser. */

/** VS Code's Dark+ theme, so the colours match what the editor shows. */
export const THEME = "dark-plus";

/** Everything the site's files and the code blocks in fetched READMEs are likely to use. */
const LANGUAGES = [
  "rust", "solidity", "typescript", "javascript", "tsx", "jsx", "json", "jsonc", "toml",
  "shellscript", "python", "markdown", "yaml", "dockerfile", "diff", "sql", "c", "cpp",
  "html", "css", "ini", "makefile", "console",
] as const;

/** Names READMEs use for the same languages. */
const ALIASES: Record<string, string> = {
  sh: "shellscript", bash: "shellscript", zsh: "shellscript", shell: "shellscript",
  rs: "rust", sol: "solidity", ts: "typescript", js: "javascript", py: "python",
  yml: "yaml", md: "markdown", "c++": "cpp", docker: "dockerfile", plaintext: "text", txt: "text", plain: "text",
};

let highlighter: Promise<Highlighter> | undefined;

export function getHighlighter(): Promise<Highlighter> {
  highlighter ??= createHighlighter({
    themes: [THEME],
    langs: [...LANGUAGES, { ...cairoGrammar, name: "cairo" } as unknown as LanguageRegistration],
    // Pure JavaScript regex engine: no WebAssembly to load at build time.
    engine: createJavaScriptRegexEngine(),
  });
  return highlighter;
}

/** Maps what a README calls a language to one Shiki has loaded, or "text" when it has none. */
export function normalizeLang(h: Highlighter, lang: string): string {
  const wanted = lang.toLowerCase();
  const name = ALIASES[wanted] ?? wanted;
  return name === "text" || h.getLoadedLanguages().includes(name) ? name : "text";
}

export async function highlightToHast(code: string, lang: LangId | string): Promise<Root> {
  const h = await getHighlighter();
  return h.codeToHast(code, { lang: normalizeLang(h, lang), theme: THEME });
}
