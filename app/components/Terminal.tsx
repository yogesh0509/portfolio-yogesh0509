'use client'

import React, { useState } from 'react';
import { usePathname } from 'next/navigation'
import { ValiateCommands } from '../lib/ValiateCommands';
import TypingText from "./TypingText"

const Terminal: React.FC = () => {
  const pathname = usePathname()
  const lastSlashIndex = pathname.lastIndexOf("/");
  const stringWithoutAfterLastSlash = pathname.substring(0, lastSlashIndex + 1);
  const finalPath = stringWithoutAfterLastSlash.replace(/\//g, "\\");

  const [userInput, setUserInput] = useState<string>('');
  const [commands, setCommands] = useState<string[]>([]);
  const [paths, setPaths] = useState<string[]>([]);
  const [output, setOutput] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      console.log("H")
      // commands[commands.length-1]
    }
  }

  const handleEnterPress = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const returnOutput = JSON.parse(await ValiateCommands(userInput, finalPath)).message
      console.log(returnOutput)
      setOutput((prevOutput) => [...prevOutput, returnOutput])
      setCommands((prevCommands) => [...prevCommands, userInput]);
      setPaths((prevPaths) => [...prevPaths, finalPath]);
      setUserInput('');
    }
  };

  const handleClick = (urlString: string) => {
    window.open(urlString, '_blank');
  };

  return (
    <div
      id="terminal"
      className={`flex-shrink-0 fixed bottom-0 w-full h-2/5 py-4 pl-6 text-white relative overflow-y-auto`}
    >
      <div className="resize-handle absolute top-0 left-0 w-full h-2 cursor-row-resize bg-gray-700"></div>
      {commands.map((command, index) => (
        <>
          <div key={index}>
            <span>$ yogesh0509{paths[index]}&gt;</span> {command}
          </div>
          <div
            key={(index + 3) * 100}
            onClick={output[index].startsWith('http') ? handleClick.bind(null, output[index]) : undefined}
            style={output[index].startsWith('http') ? {
              textDecoration: 'underline',
              cursor: 'pointer',
            } : {}}
          >
            <TypingText text={output[index]} />
          </div>
          <br />
        </>
      ))}

      <div className="flex items-center">
        <span className="mr-2">$ yogesh0509{finalPath}&gt;</span>
        <input
          type="text"
          value={userInput}
          onChange={handleInputChange}
          onKeyUp={handleKeyUp}
          onKeyPress={handleEnterPress}
          className="flex-grow bg-transparent border-none outline-none text-white"
          placeholder="Type your command..."
        />
      </div>
    </div>
  );
};

export default Terminal;
