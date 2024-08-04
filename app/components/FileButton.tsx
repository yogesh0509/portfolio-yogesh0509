'use client'

import React from 'react';
import Link from 'next/link'
import { IoLogoJavascript } from "react-icons/io";
import { SiTypescript } from "react-icons/si";
import { FaReact } from "react-icons/fa";
import { SiSolidity } from "react-icons/si";
import { AiFillInfoCircle } from "react-icons/ai";

const LanguageIcon: React.FC<{ language: string }> = ({ language }) => {
  switch (language) {
    case 'js':
      return <IoLogoJavascript color='yellow' />;
    case 'ts':
      return <SiTypescript color='teal' />;
    case 'jsx':
      return <FaReact color='teal' />;
    case 'sol':
      return <SiSolidity color='gray'/>;
    case 'md':
        return <AiFillInfoCircle color='teal'/>;
    default:
      return <></>;
  }
};


const FileButton: React.FC<{ fileName: string; nested: boolean, folderName?: string }> = ({ fileName, nested, folderName }) => {
  const marginClass = nested ? 'ml-4' : 'ml-2';
  const lang: string = fileName.split('.')[1]

  return (
    <Link
      href={nested ? `/${folderName}/${fileName}` : `/${fileName}`}
      className={`flex items-center cursor-pointer p-1 ${marginClass} hover:bg-gray-800`}
    >
      <LanguageIcon language={lang} /><pre> </pre>
      <span>{fileName}</span>
    </Link>
  );
};

export default FileButton;