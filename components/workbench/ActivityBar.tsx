'use client'

import Link from "next/link";
import { VscAccount, VscFiles, VscGithub, VscSearch } from "react-icons/vsc";
import { FaLinkedin } from "react-icons/fa6";
import { useWorkbench } from "./WorkbenchProvider";

const button = "grid size-12 place-items-center text-xl text-[#858585] hover:text-white";

export default function ActivityBar() {
  const { explorerVisible, toggleExplorer, openQuickOpen, profile, activeUrl } = useWorkbench();
  return (
    <nav aria-label="Activity bar" className="hidden print:hidden w-12 shrink-0 flex-col border-r border-line bg-chrome md:flex">
      <button
        type="button"
        className={`${button} ${explorerVisible ? "border-l-2 border-accent text-white" : ""}`}
        onClick={toggleExplorer}
        aria-label="Toggle explorer"
        aria-pressed={explorerVisible}
        title="Explorer"
      >
        <VscFiles aria-hidden />
      </button>
      <button type="button" className={button} onClick={() => openQuickOpen("")} aria-label="Search files (Ctrl+P)" title="Search files (Ctrl+P)">
        <VscSearch aria-hidden />
      </button>
      <Link
        href="/resume"
        prefetch={false}
        className={`${button} ${activeUrl === "/resume" ? "border-l-2 border-accent text-white" : ""}`}
        aria-label="Résumé"
        title="Résumé"
      >
        <VscAccount aria-hidden />
      </Link>
      <div className="mt-auto flex flex-col">
        <a className={button} href={profile.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub profile" title="GitHub">
          <VscGithub aria-hidden />
        </a>
        <a className={button} href={profile.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn profile" title="LinkedIn">
          <FaLinkedin aria-hidden />
        </a>
      </div>
    </nav>
  );
}
