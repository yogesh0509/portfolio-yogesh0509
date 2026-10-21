'use client'

import { VscMenu, VscSearch, VscTerminal } from "react-icons/vsc";
import { useWorkbench } from "./WorkbenchProvider";

/** The top bar on phones, where the activity bar and title bar are hidden. */
export default function MobileBar() {
  const { activeFile, activeUrl, setDrawerOpen, openQuickOpen, togglePanel, profile } = useWorkbench();
  const button = "grid size-10 place-items-center text-xl";
  return (
    <header className="flex h-11 shrink-0 items-center border-b border-line bg-chrome px-1 md:hidden print:hidden">
      <button type="button" className={button} onClick={() => setDrawerOpen(true)} aria-label="Open explorer">
        <VscMenu aria-hidden />
      </button>
      <p className="min-w-0 flex-1 truncate px-1 text-center text-sm">{activeFile?.name ?? (activeUrl === "/resume" ? "resume" : profile.handle)}</p>
      <button type="button" className={button} onClick={() => openQuickOpen("")} aria-label="Search files">
        <VscSearch aria-hidden />
      </button>
      <button type="button" className={button} onClick={togglePanel} aria-label="Toggle terminal">
        <VscTerminal aria-hidden />
      </button>
    </header>
  );
}
