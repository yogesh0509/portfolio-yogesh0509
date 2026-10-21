'use client'

import { useState, type ReactNode } from "react";

/**
 * Switches a markdown file between its rendered preview and its source, like
 * VS Code's "Open Preview" / source toggle. Both views are rendered at build time.
 */
export default function ViewToggle({ preview, source }: { preview: ReactNode; source: ReactNode }) {
  const [view, setView] = useState<"preview" | "source">("preview");

  const button = (name: "preview" | "source", label: string) => (
    <button
      type="button"
      aria-pressed={view === name}
      onClick={() => setView(name)}
      className={`px-2 py-0.5 text-xs rounded-sm ${view === name ? "bg-[#37373d] text-white" : "text-[#9d9d9d] hover:text-white"}`}
    >
      {label}
    </button>
  );

  return (
    <div>
      <div role="group" aria-label="Markdown view" className="flex justify-end gap-1 px-3 py-1">
        {button("preview", "Preview")}
        {button("source", "Source")}
      </div>
      {view === "preview" ? preview : source}
    </div>
  );
}
