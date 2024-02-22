'use client'

import React from 'react';
import FolderDropdown from './FolderDropdown';
import FileButton from './FileButton';
import { useSidebar } from '../context/SidebarContext';

const Sidebar: React.FC = () => {
  const { minimized, toggleMinimized, isDrawer, drawer, toggleDrawer } = useSidebar();

  const folders = [
    { folderName: 'Hackathons', files: ['chainlinkHackathon.sol', 'ETHForAll.sol'] },
    { folderName: 'Projects', files: ['1inch_api_defi.jsx', 'CrossChainHub.ts', 'TakeYourQuiz.js', 'web3_dream11.sol'] },
    // Add more folders as needed
  ];

  return (
    <div className={
      isDrawer
        ? `p-3 md:p-2 ${drawer ? 'w-auto text-center' : 'fixed top-0 w-80 left-0 h-full'} z-50 transition-all transform-gpu shadow-lg text-[#c9d1d9] bg-[#0d1117] border-r border-[#30363d]`
        : `p-3 md:p-2 ${minimized ? 'w-auto text-center' : 'w-1/5'} transition-all text-[#c9d1d9] bg-[#0d1117] border-r border-[#30363d]`
    }>
      <button className="text-white mx-auto" onClick={isDrawer ? toggleDrawer : toggleMinimized}>
        ☰
      </button>
      {(!minimized || (isDrawer && !drawer)) && (
        <>
          {folders.map((folder) => (
            <FolderDropdown key={folder.folderName} folderName={folder.folderName} files={folder.files} />
          ))}
          <FileButton fileName="README.md" nested={false} />
          {/* Add more root files as needed */}
        </>
      )}
    </div>
  );
};

export default Sidebar;

