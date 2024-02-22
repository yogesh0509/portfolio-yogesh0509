'use client'

import React, { useState } from 'react';
import FileButton from './FileButton';

const FolderDropdown: React.FC<{ folderName: string; files?: string[]; nested?: boolean; folders?: { folderName: string; files: string[] }[] }> = ({ folderName, files, nested, folders }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <div
        className={`flex items-center cursor-pointer p-1 ${nested ? 'ml-4' : 'ml-2'} hover:bg-gray-800`}
        onClick={toggleDropdown}
      >
        {isOpen ? '▼' : '▶'} {folderName}
      </div>
      {isOpen && (
        <div className={`pl-2 ${nested ? 'ml-4' : ''}`}>
          {files && files.map((fileName) => (
            <FileButton key={fileName} fileName={fileName} nested={true} folderName={folderName}/>
          ))}
          {folders && folders.map((nestedFolder) => (
            <FolderDropdown
              key={nestedFolder.folderName}
              folderName={nestedFolder.folderName}
              files={nestedFolder.files}
              nested
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FolderDropdown;
