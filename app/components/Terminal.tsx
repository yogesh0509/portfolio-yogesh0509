'use client'

import { MdOutlineKeyboardArrowUp, MdOutlineKeyboardArrowDown } from "react-icons/md";
import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { project } from '../lib/project';
import TypingText from "./TypingText";
import { useRouter } from 'next/navigation';

interface Technology {
  framework: string[];
  language: string[];
}

type OutputItem = string | Technology;

const isTechnology = (item: OutputItem): item is Technology => {
  return typeof item === 'object' && item !== null && 'framework' in item && 'language' in item;
};

const Terminal: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<string>('TERMINAL');
  const [userInput, setUserInput] = useState<string>('');
  const [commands, setCommands] = useState<string[]>([]);
  const [paths, setPaths] = useState<string[]>([]);
  const [output, setOutput] = useState<OutputItem[]>([]);
  const [heightStage, setHeightStage] = useState<number>(1);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      // You can implement command history navigation here
    }
  };

  const handleEnterPress = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {

      if (userInput.startsWith("cd ")) {
        const path = userInput.substring(3).trim();
        const newPath = `${pathname}/${path}`.replace(/\/+/g, '/');
        router.push(newPath);
      }

      const result = await project(userInput);
      const returnOutput: OutputItem | string = result.message;

      if (typeof returnOutput === 'string' || isTechnology(returnOutput)) {
        setOutput((prevOutput) => [...prevOutput, returnOutput]);
      }

      setCommands((prevCommands) => [...prevCommands, userInput]);
      setPaths((prevPaths) => [...prevPaths, pathname]);
      setUserInput('');
    }
  };

  const toggleHeightStageUp = () => {
    setHeightStage((prevStage) => (prevStage === 0 ? 2 : prevStage - 1));
  };

  const toggleHeightStageDown = () => {
    setHeightStage((prevStage) => (prevStage === 2 ? 0 : prevStage + 1));
  };

  const heightClass = () => {
    switch (heightStage) {
      case 0:
        return 'h-full';
      case 1:
        return 'h-1/5 md:h-2/5';
      case 2:
        return 'h-10';
      default:
        return 'h-1/5 md:h-2/5';
    }
  };

  const handleClick = (tab: string) => {
    setActiveTab(tab);
  };

  const getTabClassName = (tab: string) => {
    return `mr-4 cursor-pointer ${activeTab === tab ? 'underline underline-offset-8 text-[#c5d1d9]' : 'text-[#95a1ad] hover:text-[#c5d1d9]'}`;
  };

  return (
    <div
      id="terminal"
      className={`relative flex-shrink-0 overflow-y-auto w-full ${heightClass()} pb-2 pl-2 md:pl-4 border-t-4 border-l border-[#30363d] bg-[#0d1117] text-[#c9d1d9] transition-all`}
    >
      <div className="flex justify-between items-center text-xs pt-2 pb-6 bg-[#0d1117] text-[#95a1ad] sticky top-0 z-10">
        <div className="flex">
          <div className="mr-4">PROBLEMS</div>
          <div className="mr-4">OUTPUT</div>
          <div className={getTabClassName('TERMINAL')} onClick={() => handleClick('TERMINAL')}>TERMINAL</div>
          <div className={getTabClassName('PORTS')} onClick={() => handleClick('PORTS')}>PORTS</div>
          <div className="mr-4">DEBUG CONSOLE</div>
        </div>
        <div className="flex space-x-2 mx-4 text-2xl">
          <button onClick={toggleHeightStageUp} className="text-[#95a1ad] hover:text-white">
            <MdOutlineKeyboardArrowUp />
          </button>
          <button onClick={toggleHeightStageDown} className="text-[#95a1ad] hover:text-white">
            <MdOutlineKeyboardArrowDown />
          </button>
        </div>
      </div>

      {activeTab === 'PORTS' ? (
        <div className='text-[#23d18b]'>
          <TypingText text="S erver is listening on port 3000!!" />
        </div>
      ) : (
        <>
          {commands.map((command, index) => (
            <div key={index}>
              <div>
                <div>
                  <span className='text-[#23d18b]'>o yogesh0509:</span>
                  <span className='text-[#4169E1]'>~{paths[index]}</span>
                  <span>$</span> {command}
                </div>
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
            <div className="mr-2 whitespace-nowrap">
              <span className='text-[#23d18b]'>o yogesh0509:</span>
              <span className='text-[#4169E1]'>~{pathname}</span>
              <span>$</span>
            </div>
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
        </>
      )}
    </div>
  );
};

export default Terminal;
