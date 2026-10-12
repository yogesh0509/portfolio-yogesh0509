'use client'

import { VscClose, VscGithub } from "react-icons/vsc";
import { FaLinkedin } from "react-icons/fa6";
import ExplorerTree from "./ExplorerTree";
import { useWorkbench } from "./WorkbenchProvider";

/**
 * The explorer. On desktop it sits beside the editor; below the md breakpoint it becomes a
 * drawer with a backdrop, using CSS alone (no window-width logic in JavaScript).
 */
export default function Sidebar() {
  const { tree, explorerVisible, focusMode, drawerOpen, setDrawerOpen, profile } = useWorkbench();
  const hiddenOnDesktop = !explorerVisible || focusMode;

  return (
    <>
      {drawerOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 md:hidden" onClick={() => setDrawerOpen(false)} aria-hidden />
      )}
      <aside
        aria-label="Explorer"
        className={[
          "flex w-72 shrink-0 flex-col border-r border-line bg-chrome print:hidden",
          // drawer on small screens
          "fixed inset-y-0 left-0 z-40 -translate-x-full transition-transform md:static md:z-auto md:w-64 md:translate-x-0",
          drawerOpen ? "translate-x-0" : "",
          hiddenOnDesktop ? "md:hidden" : "",
        ].join(" ")}
      >
        <div className="flex h-9 items-center justify-between px-4 text-[11px] uppercase tracking-wide text-[#bbbbbb]">
          <span>Explorer</span>
          <button type="button" className="text-lg md:hidden" onClick={() => setDrawerOpen(false)} aria-label="Close explorer">
            <VscClose aria-hidden />
          </button>
        </div>
        <p className="px-4 pb-1 text-[11px] font-bold uppercase text-[#bbbbbb]">{profile.handle}</p>
        <div className="relative min-h-0 flex-1 overflow-y-auto pb-4">
          <ExplorerTree tree={tree} />
        </div>
        <div className="flex gap-4 border-t border-line p-3 text-xl text-[#858585] md:hidden">
          <a href={profile.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub profile" className="hover:text-white">
            <VscGithub aria-hidden />
          </a>
          <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn profile" className="hover:text-white">
            <FaLinkedin aria-hidden />
          </a>
        </div>
      </aside>
    </>
  );
}
