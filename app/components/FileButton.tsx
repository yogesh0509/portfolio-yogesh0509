'use client'

import React from 'react';
import Link from 'next/link'

const FileButton: React.FC<{ fileName: string; nested: boolean, folderName?: string}> = ({ fileName, nested, folderName }) => {
  const marginClass = nested ? 'ml-4' : 'ml-2';

  return (
    <div className={`flex items-center text-white cursor-pointer p-1 ${marginClass} hover:bg-gray-600`}>
      <Link href={nested ? `/${folderName}/${fileName}` : `/${fileName}`}>{fileName}</Link>
    </div>
  );
};

export default FileButton;
