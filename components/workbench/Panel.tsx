'use client'

import dynamic from "next/dynamic";
import { VscChevronDown, VscChevronUp, VscClose } from "react-icons/vsc";
import PortsView from "./PortsView";
import { useWorkbench, type PanelTab } from "./WorkbenchProvider";

// The terminal is only downloaded the first time the panel can be seen.
const Terminal = dynamic(() => import("@/components/terminal/Terminal"), {
  ssr: false,
  loading: () => <p className="p-3 text-[#bbbbbb]">Starting terminal…</p>,
});

const TABS: { id: PanelTab; label: string }[] = [
  { id: "terminal", label: "TERMINAL" },
  { id: "ports", label: "PORTS" },
];

export default function Panel() {
  const { panel, panelTab, setPanelTab, maximizePanel, closePanel, focusMode, panelEverShown, ports } = useWorkbench();

  // "auto": shown on desktop and hidden on phones by CSS alone, so there is no layout jump.
  const visibility = focusMode || panel === "closed" ? "hidden" : panel === "auto" ? "hidden md:flex" : "flex";
  const size = panel === "maximized" ? "flex-1" : "h-[38%] min-h-44 max-h-[70%]";

  return (
    <section aria-label="Panel" className={`${visibility} ${size} shrink-0 flex-col border-t border-line bg-chrome print:hidden`}>
      <div className="flex h-9 shrink-0 items-center justify-between px-2 text-[11px]">
        <div role="tablist" aria-label="Panel views" className="flex">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`panel-tab-${tab.id}`}
              aria-selected={panelTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              onClick={() => setPanelTab(tab.id)}
              className={`mx-2 border-b px-1 py-1.5 ${panelTab === tab.id ? "border-ubuntu text-white" : "border-transparent text-fg-dim hover:text-white"}`}
            >
              {tab.label}
              {tab.id === "ports" && ports.length > 0 && (
                <span className="ml-1.5 rounded-full bg-[#4d4d4d] px-1.5 text-[10px] text-white">{ports.length}</span>
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center text-base">
          <button type="button" className="grid size-7 place-items-center hover:text-white" onClick={maximizePanel} aria-label={panel === "maximized" ? "Restore panel size" : "Maximise panel"}>
            {panel === "maximized" ? <VscChevronDown aria-hidden /> : <VscChevronUp aria-hidden />}
          </button>
          <button type="button" className="grid size-7 place-items-center hover:text-white" onClick={closePanel} aria-label="Close panel">
            <VscClose aria-hidden />
          </button>
        </div>
      </div>
      <div
        role="tabpanel"
        id="panel-terminal"
        data-scroll-container
        aria-labelledby="panel-tab-terminal"
        hidden={panelTab !== "terminal"}
        className="relative min-h-0 flex-1 overflow-auto bg-aubergine font-mono text-[13px] text-[#eeeeec]"
      >
        {panelEverShown && <Terminal />}
      </div>
      <div
        role="tabpanel"
        id="panel-ports"
        aria-labelledby="panel-tab-ports"
        hidden={panelTab !== "ports"}
        className="relative min-h-0 flex-1 overflow-auto bg-editor text-[13px]"
      >
        <PortsView />
      </div>
    </section>
  );
}
