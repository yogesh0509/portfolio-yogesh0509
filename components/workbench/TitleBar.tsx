'use client'

import { VscChromeClose, VscChromeMaximize, VscChromeMinimize, VscVscode } from "react-icons/vsc";
import { useWorkbench } from "./WorkbenchProvider";

/** A GNOME-style window title bar (desktop only). Its three buttons do what their icons say. */
export default function TitleBar() {
  const { activeFile, activeUrl, profile, closeAllTabs, toggleFocusMode, focusMode } = useWorkbench();
  const name = activeFile?.name ?? (activeUrl === "/resume" ? "resume" : profile.handle);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      // Fullscreen can be refused (iframes, some browsers); nothing else to do.
    }
  };

  const round = "grid size-6 place-items-center rounded-full bg-[#3a3a3a] text-[#d0d0d0] hover:bg-[#4a4a4a]";

  return (
    <header className="hidden print:hidden h-9 shrink-0 select-none items-center border-b border-line bg-chrome px-3 md:flex">
      <VscVscode aria-hidden className="size-4 text-[#3b9de0]" />
      <p className="flex-1 truncate text-center text-xs text-fg-dim">
        {name} — {profile.handle} — Visual Studio Code
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className={round}
          onClick={toggleFocusMode}
          aria-pressed={focusMode}
          aria-label="Minimise: hide the sidebar and terminal"
          title="Focus mode"
        >
          <VscChromeMinimize aria-hidden />
        </button>
        <button type="button" className={round} onClick={toggleFullscreen} aria-label="Maximise: toggle fullscreen" title="Fullscreen">
          <VscChromeMaximize aria-hidden />
        </button>
        <button
          type="button"
          className="grid size-6 place-items-center rounded-full bg-ubuntu text-white hover:brightness-110"
          onClick={closeAllTabs}
          aria-label="Close all tabs and return to the welcome page"
          title="Close all tabs"
        >
          <VscChromeClose aria-hidden />
        </button>
      </div>
    </header>
  );
}
