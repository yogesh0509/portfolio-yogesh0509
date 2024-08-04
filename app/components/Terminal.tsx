'use client'

import React, { useState } from 'react';
import { usePathname } from 'next/navigation'
import { project } from '../lib/project';
import TypingText from "./TypingText"

interface Technology {
  framework: string[];
  language: string[];
}

type OutputItem = string | Technology;

const isTechnology = (item: OutputItem): item is Technology => {
  return typeof item === 'object' && item !== null && 'framework' in item && 'language' in item;
};

const Terminal: React.FC = () => {
  const pathname = usePathname()
  const lastSlashIndex = pathname.lastIndexOf("/");
  const finalPath = pathname.substring(0, lastSlashIndex);

  const [userInput, setUserInput] = useState<string>('');
  const [commands, setCommands] = useState<string[]>([]);
  const [paths, setPaths] = useState<string[]>([]);
  const [output, setOutput] = useState<OutputItem[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      // You can implement command history navigation here
    }
  }

  const handleEnterPress = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const result = await project(userInput, finalPath);
      const returnOutput: OutputItem | string = result.message;

      if (typeof returnOutput === 'string' || isTechnology(returnOutput)) {
        setOutput((prevOutput) => [...prevOutput, returnOutput]);
      }
      setCommands((prevCommands) => [...prevCommands, userInput]);
      setPaths((prevPaths) => [...prevPaths, finalPath]);
      setUserInput('');
    }
  };

  return (
    <div
      id="terminal"
      className={`flex-shrink-0 relative overflow-y-auto w-full h-1/5 md:h-2/5 pb-2 pl-2 md:pl-4 border-t-4 border-l border-[#30363d] bg-[#0d1117] text-[#c9d1d9]`}
    >
      <div className="flex text-xs pt-2 pb-6 bg-[#0d1117] text-[#95a1ad] sticky top-0 z-10">
        <div className="mr-4">PROBLEMS</div>
        <div className="mr-4">OUTPUT</div>
        <div className="mr-4 cursor-pointer underline underline-offset-8 text-[#c5d1db]">TERMINAL</div>
        <div className="mr-4">PORTS</div>
        <div className="mr-4">DEBUG CONSOLE</div>
      </div>

      {commands.map((command, index) => (
        <div key={index}>
          <div>
            <span className='text-[#4169E1]'>o yogesh0509:~ {paths[index]}$</span> {command}
          </div>
          <div key={`${index}_output`}>
            {typeof output[index] === 'string' ? (
              <TypingText text={output[index] as string} />
            ) : isTechnology(output[index]) ? (
              <div>
                <div>Language:</div>
                {(output[index] as Technology).language.map((ele, i) => (
                  <div key={`${index}_lang_${i}`}>
                    <TypingText text={`--   ${ele}`} />
                  </div>
                ))}
                <br />
                <div>Framework/Library:</div>
                {(output[index] as Technology).framework.map((ele, i) => (
                  <div key={`${index}_framework_${i}`}>
                    <TypingText text={`--   ${ele}`} />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
          <br />
        </div>
      ))}

      <div className="flex items-center">
        <div className="mr-2 whitespace-nowrap text-[#4169E1]">o yogesh0509:~ {finalPath}$ </div>
        <input
          type="text"
          value={userInput}
          onChange={handleInputChange}
          onKeyUp={handleKeyUp}
          onKeyPress={handleEnterPress}
          className="flex-grow bg-transparent border-none outline-none text-[#95a1ad]"
          placeholder="Type your command..."
        />
      </div>
    </div>
  );
};

export default Terminal;
