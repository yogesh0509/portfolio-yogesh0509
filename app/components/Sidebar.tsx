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
    { folderName: 'Projects', files: ['web3-dream11.sol', '1inch-app-defi.tsx', 'TakeYourQuiz.js'] },
    // Add more folders as needed
  ];

  return (
    <div className={`w-1/5 ${minimized ? 'w-8' : ''} transition-all overflow-auto text-white border border-gray-700`}>
      <button className="text-white" onClick={toggleMinimized}>
        {minimized ? '▶' : '◁'}
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

