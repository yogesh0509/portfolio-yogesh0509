'use client'

import React from 'react';
import Link from 'next/link'
import Image from 'next/image'

const FileButton: React.FC<{ fileName: string; nested: boolean, folderName?: string }> = ({ fileName, nested, folderName }) => {
  const marginClass = nested ? 'ml-4' : 'ml-2';
  const lang: string = fileName.split('.')[1]

  return (
    <Link
      href={nested ? `/${folderName}/${fileName}` : `/${fileName}`}
      className={`flex items-center text-white cursor-pointer p-1 ${marginClass} hover:bg-gray-600`}
    >
      <Image
        src={`/language/${lang}.png`}
        width={20}
        height={20}
        alt={fileName}
      />  
      <span>{fileName}</span>
    </Link>
  );
};

export default FileButton;
