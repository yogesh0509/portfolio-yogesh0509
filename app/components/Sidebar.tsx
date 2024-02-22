'use client'

// components/Sidebar.tsx
import React from 'react';
import FolderDropdown from './FolderDropdown';
import FileButton from './FileButton';
import { useSidebar } from '../context/SidebarContext';

const Sidebar: React.FC = () => {
  const { minimized, toggleMinimized } = useSidebar();

  const folders = [
    { folderName: 'Hackathons', files: ['chainlinkHackathon.sol', 'ETHForAll.sol'] },
    { folderName: 'Projects', files: ['1inch_api_defi.jsx', 'CrossChainHub.ts', 'TakeYourQuiz.js', 'web3_dream11.sol'] },
    // Add more folders as needed
  ];

  return (
    <div className={`w-1/5 ${minimized ? 'w-8 text-center' : 'pl-2'} py-2 transition-all overflow-auto text-[#c9d1d9] bg-[#0d1117] border-r border-[#30363d]`}>
      <button className="text-white mx-auto" onClick={toggleMinimized}>
        {minimized ? '☰' : '☰'}
      </button>
      {!minimized && (
        <>
          {folders.map((folder) => (
            <FolderDropdown key={folder.folderName} folderName={folder.folderName} files={folder.files} />
          ))}
          <FileButton fileName="README.md" nested={false}/>
          {/* Add more root files as needed */}
        </>
      )}
    </div>
  );
};

export default Sidebar;

