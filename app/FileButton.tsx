'use client'

import React from 'react';

const FileButton: React.FC<{ fileName: string; nested?: boolean }> = ({ fileName, nested }) => {
  const marginClass = nested ? 'ml-4' : 'ml-2';

  return (
    <div className={`flex items-center text-white cursor-pointer p-1 ${marginClass} hover:bg-gray-600`}>
      {fileName}
    </div>
  );
};

export default FileButton;
