'use client'

import { useState } from "react";
import { VscCheck, VscCopy } from "react-icons/vsc";
import type { PortEntry } from "@/lib/ports";
import { safeHref } from "@/lib/safe-url";
import { useWorkbench } from "./WorkbenchProvider";

function Status({ entry }: { entry: PortEntry }) {
  if (entry.status === undefined) return <span className="text-fg-dim">not checked yet</span>;
  if (entry.status === null) return <span className="text-[#f48771]">no response</span>;
  const ok = entry.status >= 200 && entry.status < 400;
  return (
    <span className={ok ? "text-[#23d18b]" : "text-[#f48771]"}>
      {entry.status}
      {entry.checkedAt ? <span className="text-fg-dim"> on {entry.checkedAt.slice(0, 10)}</span> : null}
    </span>
  );
}

function CopyCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable; the command is visible and can be selected by hand.
    }
  };
  return (
    <div className="mt-1 flex items-start gap-2">
      <code className="min-w-0 flex-1 break-all rounded-sm bg-[#1f1f1f] px-2 py-1 text-xs">{command}</code>
      <button type="button" onClick={copy} aria-label="Copy command" className="mt-1 text-base hover:text-white">
        {copied ? <VscCheck aria-hidden /> : <VscCopy aria-hidden />}
      </button>
    </div>
  );
}

/** Live demos listed the way VS Code lists forwarded ports. */
export default function PortsView() {
  const { ports } = useWorkbench();
  if (ports.length === 0) return <p className="p-3 text-fg-dim">No demos are listed yet.</p>;
  return (
    <ul className="divide-y divide-line">
      {ports.map((entry) => (
        <li key={entry.id} className="grid gap-x-4 gap-y-1 px-3 py-2 sm:grid-cols-[12rem_1fr_9rem]">
          <span className="font-medium text-white">{entry.label}</span>
          <div className="min-w-0">
            {entry.kind === "live" && entry.url && (
              safeHref(entry.url) ? (
                <a href={safeHref(entry.url)} target="_blank" rel="noopener noreferrer" className="break-all text-[#4daafc] underline underline-offset-2">
                  {entry.url}
                </a>
              ) : (
                <span className="break-all">{entry.url}</span>
              )
            )}
            {entry.kind === "local" && entry.local && (
              <>
                <span>127.0.0.1:{entry.local.port}</span>
                <span className="ml-2 text-fg-dim">local only: it runs on your machine</span>
                <CopyCommand command={entry.local.command} />
              </>
            )}
          </div>
          <span>{entry.kind === "live" ? <Status entry={entry} /> : <span className="text-fg-dim">not forwarded</span>}</span>
        </li>
      ))}
    </ul>
  );
}
