'use client'

import type { ReactNode } from "react";
import ActivityBar from "./ActivityBar";
import EditorTabs from "./EditorTabs";
import EditorToolbar from "./EditorToolbar";
import MobileBar from "./MobileBar";
import Panel from "./Panel";
import QuickOpen from "./QuickOpen";
import Sidebar from "./Sidebar";
import StatusBar from "./StatusBar";
import TitleBar from "./TitleBar";
import { useWorkbench } from "./WorkbenchProvider";

/** The VS Code window: title bar, activity bar, explorer, tabs, editor, panel and status bar. */
export default function Workbench({ children }: { children: ReactNode }) {
  const { panel, focusMode } = useWorkbench();
  return (
    <div className="relative flex h-dvh flex-col overflow-clip bg-editor font-sans text-[13px] text-fg print:block print:h-auto print:overflow-visible">
      <a href="#editor" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-sm focus:bg-accent focus:px-3 focus:py-1 focus:text-white print:hidden">
        Skip to the editor
      </a>
      <TitleBar />
      <MobileBar />
      <div className="flex min-h-0 flex-1 print:block">
        {!focusMode && <ActivityBar />}
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col print:block">
          <EditorTabs />
          <EditorToolbar />
          <main id="editor" tabIndex={-1} className={`relative min-h-0 flex-1 overflow-auto bg-editor outline-none print:static print:overflow-visible ${panel === "maximized" ? "hidden" : ""}`}>
            {children}
          </main>
          <Panel />
        </div>
      </div>
      <StatusBar />
      <QuickOpen />
    </div>
  );
}
