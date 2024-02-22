import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coldarkDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { code, lang } from '../lib/constants';
import Readme from '../components/Readme';

export default function Page({ params }: { params: { file: string[] } }) {
    const customStyles = {
        margin: '0px',
        padding: '0px',
        backgroundColor: 'rgb(13,17,23)'
    };
    const fileName: string[] = params.file[params.file.length-1].split('.')
    const codeFile: string = code(fileName[0])
    const language: string | undefined = lang(fileName[1])

    return fileName[1] === "md" ? (
        <Readme />
      ) : (
        <SyntaxHighlighter customStyle={customStyles} language={language} style={coldarkDark} showLineNumbers={true}>
          {codeFile}
        </SyntaxHighlighter>
      );
}