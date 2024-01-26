import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { code, lang } from '../lib/constants';


export default function Page({ params }: { params: { file: string[] } }) {
    const customStyles = {
        width: '100%',
        height: '100%',
        margin: '0px',
        padding: '0px',
        backgroundColor: 'black'
    };
    const fileName: string[] = params.file[params.file.length-1].split('.')
    const codeFile: string = code(fileName[0])
    const language: string | undefined = lang(fileName[1])

    return (
        <SyntaxHighlighter customStyle={customStyles} language={language} style={atomDark} showLineNumbers={true}>
            {codeFile}
        </SyntaxHighlighter>
    )
}