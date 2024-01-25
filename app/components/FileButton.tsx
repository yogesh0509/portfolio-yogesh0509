'use client'

import React from 'react';
import Link from 'next/link'

const FileButton: React.FC<{ fileName: string; nested?: boolean }> = ({ fileName, nested }) => {
  const marginClass = nested ? 'ml-4' : 'ml-2';

  return (
    <div className={`flex items-center text-white cursor-pointer p-1 ${marginClass} hover:bg-gray-600`}>
      <Link href={`/${fileName}`}>{fileName}</Link>
    </div>
  );
};

export default FileButton;
