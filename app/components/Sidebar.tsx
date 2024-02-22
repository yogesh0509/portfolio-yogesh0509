'use client'

import React from 'react';
import FolderDropdown from './FolderDropdown';
import FileButton from './FileButton';
import { useSidebar } from '../context/SidebarContext';

const Sidebar: React.FC = () => {
  const { minimized, toggleMinimized, isDrawer, drawer, toggleDrawer } = useSidebar();

  const folders = [
    { folderName: 'Hackathons', files: ['chainlinkHackathon.sol', 'ETHForAll.sol'] },
    { folderName: 'Projects', files: ['1inch_api_defi.jsx', 'CrossChainHub.ts', 'TakeYourQuiz.js', 'Web3Dream11.sol'] },
    // Add more folders as needed
  ];

  return (
    <div className={
      isDrawer
        ? `p-3 md:p-2 flex flex-row ${!drawer ? 'w-auto text-center' : 'fixed top-0 w-80 left-0 h-full'} z-50 transition-all transform-gpu shadow-lg text-[#c9d1d9] bg-[#0d1117] border-r border-[#30363d]`
        : `p-3 md:p-2 flex flex-row ${minimized ? 'w-auto text-center' : 'w-1/5'} transition-all text-[#c9d1d9] bg-[#0d1117] border-r border-[#30363d]`
    }>
      <div className="flex flex-col text-2xl bg-[#0d1117] text-[#c9d1d9]">
        <button className="mx-auto pb-5" onClick={isDrawer ? toggleDrawer : toggleMinimized}> ☰ </button>
        <button className="mx-auto pb-5"> 🔍 </button>
        <button className="mx-auto pb-5"> 🛠️ </button>
        <button className="mx-auto pb-5"> 💻 </button>
        <button className="mx-auto pb-5 mt-auto"> 👤 </button>
        <button className="mx-auto pb-5"> ⚙️ </button>
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

