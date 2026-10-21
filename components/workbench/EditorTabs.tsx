'use client'

import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import { VscClose } from "react-icons/vsc";
import { FileIcon } from "./ExplorerTree";
import { RESUME_URL, useWorkbench } from "./WorkbenchProvider";

const parentName = (path: string) => path.split("/").slice(-2, -1)[0] ?? "";

export default function EditorTabs() {
  const { tabs, files, activeUrl, pinTab, closeTab } = useWorkbench();
  const activeRef = useRef<HTMLLIElement | null>(null);

  // Several README.md files exist, so tabs for repeated names also show their folder.
  const repeated = useMemo(() => {
    const counts = new Map<string, number>();
    for (const f of files) counts.set(f.name, (counts.get(f.name) ?? 0) + 1);
    return new Set([...counts].filter(([, n]) => n > 1).map(([name]) => name));
  }, [files]);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [activeUrl, tabs.length]);

  if (tabs.length === 0) return <div className="h-9 shrink-0 border-b border-line bg-chrome print:hidden" />;

  return (
    <nav aria-label="Open editors" className="shrink-0 overflow-x-auto border-b border-line bg-chrome print:hidden">
      <ul className="flex min-w-max">
        {tabs.map((tab) => {
          const file = files.find((f) => f.url === tab.url);
          const isResume = tab.url === RESUME_URL;
          const name = isResume ? "resume" : (file?.name ?? tab.url);
          const folder = file && repeated.has(file.name) && file.url !== "/" ? parentName(file.path) : "";
          const active = tab.url === activeUrl;
          return (
            <li
              key={tab.url}
              ref={active ? activeRef : undefined}
              onAuxClick={(e) => {
                if (e.button === 1) {
                  e.preventDefault();
                  closeTab(tab.url);
                }
              }}
              className={`group flex h-9 items-center border-r border-line ${
                active ? "border-t-2 border-t-accent bg-editor text-white" : "border-t-2 border-t-transparent text-fg-dim hover:bg-[#222]"
              }`}
            >
              <Link
                href={tab.url}
                prefetch={false}
                aria-current={active ? "page" : undefined}
                onDoubleClick={() => pinTab(tab.url)}
                className="flex h-full items-center gap-2 pl-3"
              >
                <FileIcon lang={file?.lang} />
                <span className={tab.pinned ? "" : "italic"}>
                  {name}
                  {folder && <span className="ml-2 text-xs text-[#9d9d9d]">{folder}</span>}
                </span>
              </Link>
              <button
                type="button"
                onClick={() => closeTab(tab.url)}
                aria-label={`Close ${name}`}
                className={`mx-1.5 grid size-5 place-items-center rounded-sm hover:bg-[#3a3a3a] ${active ? "" : "opacity-0 group-hover:opacity-100 focus:opacity-100"}`}
              >
                <VscClose aria-hidden />
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
