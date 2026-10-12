'use client'

import { VscFilePdf } from "react-icons/vsc";

/** Opens the browser's print dialog, which can also save the page as a PDF. */
export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-sm border border-[#454545] px-3 py-1 text-sm hover:bg-[#2a2d2e] print:hidden"
    >
      <VscFilePdf aria-hidden />
      Print or save as PDF
    </button>
  );
}
