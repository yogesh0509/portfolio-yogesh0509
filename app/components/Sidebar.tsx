'use client'

import React from 'react';
import { useRouter } from 'next/navigation'
import FolderDropdown from './FolderDropdown';
import FileButton from './FileButton';
import { useSidebar } from '../context/SidebarContext';
import { VscHome } from "react-icons/vsc";
import { CgProfile } from "react-icons/cg";
import { IoSearchSharp } from "react-icons/io5";
import { FiMenu } from "react-icons/fi";
import { FaGithub } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa6";

const Sidebar: React.FC = () => {
  const router = useRouter()
  const { minimized, toggleMinimized, isDrawer, drawer, toggleDrawer } = useSidebar();

  const folders = [
    { folderName: 'Hackathons', files: ['chainlinkHackathon.sol', 'ETHForAll.sol'] },
    { folderName: 'Projects', files: ['inch1APIDefi.jsx', 'CrossChainHub.ts', 'TakeYourQuiz.js', 'Web3Dream11.sol'] },
    { folderName: 'Experience', files: ['Hashstack.ts', 'GoogleSummerOfCode.sol'] }
    // Add more folders as needed
  ];

  return (
    <div className={
      isDrawer
        ? `p-3 md:p-2 flex flex-row ${!drawer ? 'w-auto text-center' : 'fixed top-0 w-80 left-0 h-full'} z-50 transition-all transform-gpu shadow-lg text-[#c9d1d9] bg-[#0d1117] border-r border-[#30363d]`
        : `p-3 md:p-2 flex flex-row ${minimized ? 'w-auto text-center' : 'w-1/5'} transition-all text-[#c9d1d9] bg-[#0d1117] border-r border-[#30363d]`
    }>
      <div className="flex flex-col text-2xl bg-[#0d1117] text-[#c9d1d9]">
        <button className="mx-auto pb-5" onClick={isDrawer ? toggleDrawer : toggleMinimized}> <FiMenu /> </button>
        <button className="mx-auto pb-5" onClick={() => router.push('/')}> <VscHome /> </button>
        <button className="mx-auto pb-5"> <IoSearchSharp /> </button>
        <button className="mx-auto pb-5" onClick={() => router.push('/resume')}> <CgProfile /> </button>
        <button className="mx-auto pb-5 mt-auto" onClick={() => window.open('https://www.github.com/yogesh0509', '_blank', 'noopener,noreferrer')}> <FaGithub /> </button>
        <button className="mx-auto pb-5" onClick={() => window.open('https://www.linkedin.com/in/yogesh0509', '_blank', 'noopener,noreferrer')}> <FaLinkedin /> </button>
      </div>
      {(!minimized || (isDrawer && drawer)) && (
        <div className='pl-3'>
          {folders.map((folder) => (
            <FolderDropdown key={folder.folderName} folderName={folder.folderName} files={folder.files} />
          ))}
          <FileButton fileName="README.md" nested={false} />
          {/* Add more root files as needed */}
        </div>
      )}
    </div>
  );
};

export default Sidebar;

