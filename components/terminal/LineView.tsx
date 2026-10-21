'use client'

import Link from "next/link";
import { safeHref } from "@/lib/safe-url";
import type { Line, Span } from "@/lib/terminal/types";

/** Renders terminal output: styled text, with links and click-to-run commands. */

function classes(span: Span): string {
  return [
    span.fg ? `t-${span.fg}` : "",
    span.bold ? "font-bold" : "",
    span.dim ? "opacity-70" : "",
    span.italic ? "italic" : "",
    span.underline ? "underline underline-offset-2" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function SpanView({ span, run }: { span: Span; run: (command: string) => void }) {
  const className = classes(span);
  // Exact colours come from replayed recordings (256-colour and true-colour output).
  const style = span.rgb || span.bg ? { color: span.rgb, backgroundColor: span.bg } : undefined;
  if (span.run) {
    const command = span.run;
    return (
      <button type="button" className={`${className} cursor-pointer text-left hover:brightness-125`} onClick={() => run(command)} title={`Run: ${command}`}>
        {span.text}
      </button>
    );
  }
  // Links come from data, so only safe targets become links; anything else is shown as plain text.
  const open = span.open?.startsWith("/") ? safeHref(span.open) : undefined;
  if (open) {
    return (
      <Link href={open} prefetch={false} className={`${className} hover:brightness-125`}>
        {span.text}
      </Link>
    );
  }
  const href = safeHref(span.href);
  if (href) {
    const external = !href.startsWith("mailto:");
    return (
      <a href={href} className={`${className} hover:brightness-125`} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {span.text}
      </a>
    );
  }
  return className || style ? (
    <span className={className} style={style}>
      {span.text}
    </span>
  ) : (
    <>{span.text}</>
  );
}

export default function LineView({ line, run, wrap = true }: { line: Line; run: (command: string) => void; wrap?: boolean }) {
  // An empty line still needs height, so it keeps one character of space.
  return (
    <div className={wrap ? "whitespace-pre-wrap break-words" : "whitespace-pre"}>
      {line.length === 0 || line.every((s) => s.text === "") ? " " : line.map((span, i) => <SpanView key={i} span={span} run={run} />)}
    </div>
  );
}

export const promptLine = (user: string, host: string, path: string): Span[] => [
  { text: `${user}@${host}`, fg: "brightGreen", bold: true },
  { text: ":" },
  { text: path, fg: "brightBlue", bold: true },
  { text: "$ " },
];

export function Prompt({ user, host, path }: { user: string; host: string; path: string }) {
  return (
    <span className="whitespace-pre">
      {promptLine(user, host, path).map((span, i) => (
        <span key={i} className={classes(span)}>
          {span.text}
        </span>
      ))}
    </span>
  );
}
