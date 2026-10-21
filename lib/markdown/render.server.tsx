import type { Element, Root } from "hast";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import Link from "next/link";
import type { ReactNode } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import rehypeShikiFromHighlighter from "@shikijs/rehype/core";
import { getHighlighter, normalizeLang, THEME } from "../highlight/shiki.server";
import type { MarkdownSource } from "../vfs/types";

/**
 * Markdown to React, at build time.
 *
 * Fetched READMEs often contain raw HTML (<p align="center"><img ...>), so raw HTML is
 * parsed and then sanitised with GitHub's allow-list. Scripts, event handlers and
 * javascript: links never reach the page. Highlighting runs after sanitising, because
 * the sanitiser would strip Shiki's inline colours.
 */

const SCHEME = /^[a-z][a-z0-9+.-]*:/i;

/** Makes a relative URL from a README absolute, pointing at the commit it was fetched from. */
export function absoluteUrl(url: string, origin: MarkdownSource, kind: "link" | "image"): string {
  if (url === "" || url.startsWith("#") || url.startsWith("//") || SCHEME.test(url)) return url;
  const path = url.replace(/^\.?\//, "");
  if (kind === "image") return `https://raw.githubusercontent.com/${origin.repo}/${origin.ref}/${path}`;
  const type = path.endsWith("/") ? "tree" : "blob";
  return `https://github.com/${origin.repo}/${type}/${origin.ref}/${path}`;
}

function rehypeAbsoluteUrls(origin: MarkdownSource | undefined) {
  return (tree: Root) => {
    if (!origin) return;
    visit(tree, "element", (node: Element) => {
      if (node.tagName === "a" && typeof node.properties.href === "string") {
        node.properties.href = absoluteUrl(node.properties.href, origin, "link");
      }
      if (node.tagName === "img" && typeof node.properties.src === "string") {
        node.properties.src = absoluteUrl(node.properties.src, origin, "image");
      }
    });
  };
}

/** Rewrites each code block's language to one Shiki has loaded, so an unknown one never throws. */
function rehypeKnownLanguages(loaded: { getLoadedLanguages(): string[] }) {
  return (tree: Root) => {
    visit(tree, "element", (node: Element, _i, parent) => {
      if (node.tagName !== "code" || (parent as Element | undefined)?.tagName !== "pre") return;
      const classes = (node.properties.className as string[] | undefined) ?? [];
      const index = classes.findIndex((c) => c.startsWith("language-"));
      if (index === -1) return;
      const lang = normalizeLang(loaded as Parameters<typeof normalizeLang>[0], classes[index].slice("language-".length));
      node.properties.className = classes.map((c, i) => (i === index ? `language-${lang}` : c));
    });
  };
}

export async function markdownToHast(source: string, origin?: MarkdownSource): Promise<Root> {
  const highlighter = await getHighlighter();
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSanitize)
    .use(rehypeSlug) // after sanitising, so README anchors like #install keep matching
    .use(rehypeAbsoluteUrls, origin)
    .use(rehypeKnownLanguages, highlighter)
    .use(rehypeShikiFromHighlighter, highlighter, { theme: THEME, defaultLanguage: "text" });
  const tree = processor.parse(source);
  return (await processor.run(tree)) as Root;
}

function MdLink(props: React.ComponentProps<"a">) {
  const { href, children, ...rest } = props;
  // The sanitiser removes the href of an unsafe link; show its text instead of a link to this very page.
  if (!href) return <span>{children}</span>;
  // Site-internal links navigate in place; everything else opens in a new tab.
  if (href.startsWith("/") && !href.startsWith("//")) {
    return (
      <Link href={href} prefetch={false} {...rest}>
        {children}
      </Link>
    );
  }
  const external = SCHEME.test(href) && !href.startsWith("mailto:");
  return (
    <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} {...rest}>
      {children}
    </a>
  );
}

function MdImage(props: React.ComponentProps<"img">) {
  // eslint-disable-next-line @next/next/no-img-element -- static export: no image optimizer
  return <img loading="lazy" decoding="async" alt="" {...props} />;
}

function MdTable(props: React.ComponentProps<"table">) {
  return (
    <div className="md-table-scroll" tabIndex={0}>
      <table {...props} />
    </div>
  );
}

export async function renderMarkdown(source: string, origin?: MarkdownSource): Promise<ReactNode> {
  const tree = await markdownToHast(source, origin);
  return toJsxRuntime(tree, {
    Fragment,
    jsx,
    jsxs,
    components: { a: MdLink, img: MdImage, table: MdTable },
  });
}
