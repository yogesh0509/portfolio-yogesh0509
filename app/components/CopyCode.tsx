'use client'

import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark, darcula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CopyToClipboard } from 'react-copy-to-clipboard';

interface CodeDisplayProps {
    codeString: string;
    language: string;
}

const CodeDisplay: React.FC<CodeDisplayProps> = ({ codeString, language }) => {
    const [copySuccess, setCopySuccess] = useState('Copy code');

    return (
        <div className="relative bg-black rounded-lg overflow-hidden shadow-lg">
            <div className="flex justify-between items-center bg-gray-900 px-2 py-1">
                <CopyToClipboard text={codeString} onCopy={() => setCopySuccess('Copied!')}>
                    <button className="py-1 px-2 rounded">
                        <span className={`text-sm ${copySuccess === 'Copied!' ? 'text-green-500' : ''}`}>
                            {copySuccess}
                        </span>
                    </button>
                </CopyToClipboard>
            </div>
            <div className="p-4 overflow-x-auto">
                <SyntaxHighlighter language={language} style={atomDark} customStyle={{ margin: 0, backgroundColor: 'black' }}>
                    {codeString}
                </SyntaxHighlighter>
            </div>
        </div>
    );
};

export default CodeDisplay;
