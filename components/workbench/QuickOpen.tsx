'use client'

import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useState } from "react";
import { fuzzyFilter, type FuzzyMatch } from "@/lib/fuzzy";
import { FileIcon } from "./ExplorerTree";
import { RESUME_URL, useWorkbench } from "./WorkbenchProvider";

interface Command {
  id: string;
  title: string;
  run: () => void;
}

/** Text with the fuzzy-matched characters picked out, as VS Code does. */
function Highlighted({ text, indices, offset = 0 }: { text: string; indices: number[]; offset?: number }) {
  const hit = new Set(indices.map((i) => i - offset));
  return (
    <>
      {[...text].map((char, i) =>
        hit.has(i) ? (
          <b key={i} className="font-semibold text-[#4daafc]">
            {char}
          </b>
        ) : (
          <span key={i}>{char}</span>
        ),
      )}
    </>
  );
}

function useCommands(): Command[] {
  const router = useRouter();
  const wb = useWorkbench();
  const { profile } = wb;
  return useMemo(() => {
    const copy = (text: string) => () => void navigator.clipboard?.writeText(text).catch(() => {});
    const open = (url: string) => () => void window.open(url, "_blank", "noopener,noreferrer");
    const list: (Command | null)[] = [
      { id: "welcome", title: "Go to Welcome Page", run: () => router.push("/") },
      { id: "resume", title: "Open Résumé", run: () => router.push(RESUME_URL) },
      profile.resumeUrl ? { id: "download", title: "Download Résumé (PDF)", run: open(profile.resumeUrl) } : null,
      { id: "email", title: "Copy Email Address", run: copy(profile.email) },
      { id: "github", title: "Open GitHub Profile", run: open(profile.github) },
      { id: "linkedin", title: "Open LinkedIn Profile", run: open(profile.linkedin) },
      { id: "terminal", title: "Toggle Terminal", run: wb.togglePanel },
      { id: "ports", title: "Show Ports (Live Demos)", run: () => wb.openPanel("ports") },
      { id: "explorer", title: "Toggle Explorer", run: wb.toggleExplorer },
      { id: "focus", title: "Toggle Focus Mode", run: wb.toggleFocusMode },
      {
        id: "fullscreen",
        title: "Toggle Fullscreen",
        run: () => void (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen()).catch(() => {}),
      },
      { id: "closeall", title: "Close All Tabs", run: wb.closeAllTabs },
    ];
    return list.filter((c): c is Command => c !== null);
  }, [router, wb, profile]);
}

function Dialog() {
  const router = useRouter();
  const { quickOpen, closeQuickOpen, files } = useWorkbench();
  const commands = useCommands();
  const [query, setQuery] = useState(quickOpen.initial);
  const [selected, setSelected] = useState(0);
  const listId = useId();

  // Return focus to whatever had it before the dialog opened.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    return () => previous?.focus?.();
  }, []);

  const commandMode = query.startsWith(">");
  const results = useMemo(() => {
    if (commandMode) {
      return fuzzyFilter(commands, query.slice(1), (c) => c.title)
        .slice(0, 50)
        .map(({ item, match }) => ({ key: item.id, label: item.title, detail: "", match, offset: 0, run: item.run, lang: undefined as undefined | string }));
    }
    // A folder's README gets a small bonus: typing a project's name should open its README first.
    return fuzzyFilter(files, query, (f) => f.path, (f) => (f.name === "README.md" ? 1 : 0))
      .slice(0, 50)
      .map(({ item, match }) => ({
        key: item.path,
        label: item.path.slice(1),
        detail: "",
        match,
        offset: 1,
        run: () => router.push(item.url ?? item.path),
        lang: item.lang as string | undefined,
      }));
  }, [commandMode, commands, files, query, router]);

  const choose = (index: number) => {
    const result = results[index];
    if (!result) return;
    closeQuickOpen();
    result.run();
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelected((s) => (results.length ? (s + 1) % results.length : 0));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelected((s) => (results.length ? (s - 1 + results.length) % results.length : 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      choose(selected);
    } else if (event.key === "Escape") {
      event.preventDefault();
      closeQuickOpen();
    } else if (event.key === "Tab") {
      event.preventDefault(); // the input is the only control; keep focus inside the dialog
    }
  };

  const active = Math.min(selected, Math.max(results.length - 1, 0));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-3 pt-[12vh] print:hidden" onKeyDown={onKeyDown}>
      <div className="absolute inset-0 bg-black/50" onClick={closeQuickOpen} aria-hidden />
      <div role="dialog" aria-modal="true" aria-label={commandMode ? "Command palette" : "Go to file"} className="relative w-full max-w-xl overflow-hidden rounded-md border border-[#454545] bg-[#252526] shadow-2xl">
        <input
          autoFocus
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelected(0);
          }}
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-activedescendant={results[active] ? `${listId}-${active}` : undefined}
          aria-label={commandMode ? "Type a command" : "Type a file name"}
          placeholder="Search files by name (type > for commands)"
          className="w-full border-b border-[#454545] bg-[#3c3c3c] px-3 py-2 text-sm text-white outline-none placeholder:text-[#9d9d9d] focus:border-accent"
        />
        <ul id={listId} role="listbox" className="max-h-80 overflow-y-auto py-1">
          {results.length === 0 && <li className="px-3 py-2 text-fg-dim">No matches</li>}
          {results.map((result, index) => (
            <li
              key={result.key}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === active}
              onMouseMove={() => setSelected(index)}
              onClick={() => choose(index)}
              className={`flex cursor-pointer items-center gap-2 px-3 py-1 ${index === active ? "bg-[#04395e] text-white" : ""}`}
            >
              {result.lang !== undefined && <FileIcon lang={result.lang as never} />}
              <span className="truncate">
                <Highlighted text={result.label} indices={(result.match as FuzzyMatch).indices} offset={result.offset} />
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function QuickOpen() {
  const { quickOpen } = useWorkbench();
  // Mounting the dialog fresh each time resets its query and selection.
  return quickOpen.open ? <Dialog /> : null;
}
