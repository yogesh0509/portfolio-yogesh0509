'use client'

// components/Sidebar.tsx
import React from 'react';
import FolderDropdown from './FolderDropdown';
import FileButton from './FileButton';
import { useSidebar } from './SidebarContext';

const Sidebar: React.FC = () => {
  const { minimized, toggleMinimized } = useSidebar();

  const folders = [
    { folderName: 'src', files: ['index.js', 'app.js', 'utils.js'] },
    { folderName: 'components', files: ['Header.js', 'Sidebar.js', 'FileButton.js', 'FolderDropdown.js'] },
    // Add more folders as needed
  ];

  return (
    <div className={`w-1/5 ${minimized ? 'w-16' : ''} transition-all overflow-auto text-white border border-gray-700`}>
      <button className="text-white" onClick={toggleMinimized}>
        {minimized ? '▶' : '◁'}
      </button>
      {!minimized && (
        <>
          {folders.map((folder) => (
            <FolderDropdown key={folder.folderName} folderName={folder.folderName} files={folder.files} />
          ))}
          <FileButton fileName="index.html" />
          <FileButton fileName="styles.css" />
          <FileButton fileName="app.js" />
          {/* Add more root files as needed */}
        </>
      )}
    </div>
  );
};

export default Sidebar;

