'use client'

import { useSyncExternalStore } from "react";
import { VscRemote, VscSourceControl, VscTerminal } from "react-icons/vsc";
import { LANG_LABEL } from "@/lib/languages";
import { formatRelative } from "@/lib/time";
import ChainHeights from "./ChainHeights";
import { useWorkbench } from "./WorkbenchProvider";

const noSubscription = () => () => {};

/** "synced 3 days ago" depends on the visitor's clock, so the server renders the plain date. */
function useSyncedText(syncedAt: string | null): string | null {
  const relative = useSyncExternalStore(
    noSubscription,
    () => (syncedAt ? formatRelative(syncedAt, Date.now()) : null),
    () => null,
  );
  if (!syncedAt) return null;
  return relative ?? syncedAt.slice(0, 10);
}

export default function StatusBar() {
  const { build, syncedAt, system, activeFile, openQuickOpen, togglePanel, panel, focusMode } = useWorkbench();
  const synced = useSyncedText(syncedAt);
  const short = build.commit.slice(0, 7);
  const item = "flex items-center gap-1 px-2 hover:bg-[#2a2d2e]";

  return (
    <footer className="flex h-6 shrink-0 print:hidden select-none items-stretch justify-between border-t border-line bg-chrome text-xs text-fg-dim">
      <div className="flex min-w-0 items-stretch">
        <button
          type="button"
          onClick={() => openQuickOpen(">")}
          className="flex items-center gap-1 bg-ubuntu-strong px-2 font-medium text-white hover:bg-[#b53d15]"
          title="Open the command palette"
        >
          <VscRemote aria-hidden />
          <span className="hidden sm:inline">WSL: {system.distro}</span>
        </button>
        {short ? (
          <a className={item} href={`${build.repoUrl}/commit/${build.commit}`} target="_blank" rel="noopener noreferrer" title="The commit this site was built from">
            <VscSourceControl aria-hidden />
            <span>
              {build.branch}
              <span className="hidden sm:inline"> @ {short}</span>
            </span>
          </a>
        ) : (
          <span className={item}>
            <VscSourceControl aria-hidden />
            {build.branch}
          </span>
        )}
        {synced && (
          <span className={`${item} hidden md:flex`} title="When the GitHub data was last refreshed">
            synced {synced}
          </span>
        )}
      </div>
      <div className="flex items-stretch">
        <ChainHeights />
        {activeFile && !focusMode && (
          <>
            <span className={`${item} hidden sm:flex`}>{LANG_LABEL[activeFile.lang ?? "text"]}</span>
            {activeFile.lines !== undefined && <span className={`${item} hidden sm:flex`}>{activeFile.lines} lines</span>}
          </>
        )}
        <button
          type="button"
          onClick={togglePanel}
          className={item}
          aria-label="Toggle terminal (Ctrl+`)"
          aria-pressed={panel === "open" || panel === "maximized"}
          title="Toggle terminal (Ctrl+`)"
        >
          <VscTerminal aria-hidden />
        </button>
      </div>
    </footer>
  );
}
