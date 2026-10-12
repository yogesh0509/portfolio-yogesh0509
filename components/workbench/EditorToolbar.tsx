'use client'

import Link from "next/link";
import { useState } from "react";
import { VscCheck, VscCopy, VscGithub, VscLinkExternal } from "react-icons/vsc";
import { safeHref } from "@/lib/safe-url";
import { RESUME_URL, useWorkbench } from "./WorkbenchProvider";

const action = "grid size-7 place-items-center rounded-sm text-base text-[#c5c5c5] hover:bg-[#2a2d2e] hover:text-white";

/** Breadcrumbs on the left, per-file actions on the right: where VS Code puts both. */
export default function EditorToolbar() {
  const { activeFile, activeUrl, files, profile } = useWorkbench();
  const [copied, setCopied] = useState(false);

  const segments = activeFile ? activeFile.path.split("/").filter(Boolean) : activeUrl === RESUME_URL ? ["resume"] : [];
  const raw = activeFile?.links ?? {};
  // These come from data, so each must be a safe link target to be shown at all.
  const links = { github: safeHref(raw.github), live: safeHref(raw.live), permalink: safeHref(raw.permalink) };

  const copyPermalink = async () => {
    if (!links.permalink) return;
    try {
      await navigator.clipboard.writeText(links.permalink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be unavailable (insecure context); the permalink is still in the file header.
    }
  };

  return (
    <section aria-label="Editor toolbar" className="flex h-7 shrink-0 items-center justify-between gap-2 bg-editor px-3 text-xs text-fg-dim print:hidden">
      <nav aria-label="Breadcrumbs" className="min-w-0 flex-1 overflow-hidden">
        <ol className="flex items-center gap-1 whitespace-nowrap">
          <li>
            <Link href="/" prefetch={false} className="hover:text-white">
              {profile.handle}
            </Link>
          </li>
          {segments.map((segment, index) => {
            const path = "/" + segments.slice(0, index + 1).join("/");
            const isLast = index === segments.length - 1;
            // A folder crumb opens that folder's README, since folders are not pages.
            const target = isLast ? null : files.find((f) => f.path.toLowerCase() === `${path}/readme.md`)?.url;
            return (
              <li key={path} className="flex items-center gap-1">
                <span aria-hidden>›</span>
                {target ? (
                  <Link href={target} prefetch={false} className="hover:text-white">
                    {segment}
                  </Link>
                ) : (
                  <span aria-current={isLast ? "page" : undefined} className={isLast ? "text-white" : ""}>
                    {segment}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <div className="flex shrink-0 items-center">
        {links.permalink && (
          <button type="button" className={action} onClick={copyPermalink} aria-label="Copy permalink to these lines" title="Copy permalink to these lines">
            {copied ? <VscCheck aria-hidden /> : <VscCopy aria-hidden />}
          </button>
        )}
        {links.github && (
          <a className={action} href={links.permalink ?? links.github} target="_blank" rel="noopener noreferrer" aria-label="Open on GitHub" title="Open on GitHub">
            <VscGithub aria-hidden />
          </a>
        )}
        {links.live && (
          <a className={action} href={links.live} target="_blank" rel="noopener noreferrer" aria-label="Open live demo" title="Open live demo">
            <VscLinkExternal aria-hidden />
          </a>
        )}
      </div>
      <span role="status" className="sr-only">
        {copied ? "Permalink copied" : ""}
      </span>
    </section>
  );
}
