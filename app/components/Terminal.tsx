'use client'

import React, { useState } from 'react';
import { usePathname } from 'next/navigation'
import { project } from '../lib/project';
import TypingText from "./TypingText"

interface Link {
  github: string;
  live?: string;
  hackathon?: string;
}

interface Technology {
  framework: string[];
  language: string[];
}

type OutputItem = string | Link | Technology;

const isLink = (item: OutputItem): item is Link => {
  return typeof item !== 'string' && 'github' in item;
};

const isTechnology = (item: OutputItem): item is Technology => {
  return typeof item !== 'string' && 'framework' in item && 'language' in item;
};

const Terminal: React.FC = () => {
  const pathname = usePathname()
  const lastSlashIndex = pathname.lastIndexOf("/");
  const stringWithoutAfterLastSlash = pathname.substring(0, lastSlashIndex + 1);
  const finalPath = stringWithoutAfterLastSlash.replace(/\//g, "\\");

  const [userInput, setUserInput] = useState<string>('');
  const [commands, setCommands] = useState<string[]>([]);
  const [paths, setPaths] = useState<string[]>([]);
  const [output, setOutput] = useState<OutputItem[]>([]);

  // const combinedData = [...commands, ...output];

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
      const returnOutput: Link | Technology | string = JSON.parse(await project(userInput, finalPath)).message
      console.log(returnOutput)
      if (typeof returnOutput === 'string' || isLink(returnOutput) || isTechnology(returnOutput)) {
        setOutput((prevOutput) => [...prevOutput, returnOutput]);
      }
      setCommands((prevCommands) => [...prevCommands, userInput]);
      setPaths((prevPaths) => [...prevPaths, finalPath]);
      setUserInput('');
    }
  };

  // const handleClick = (urlString: string) => {
  //   window.open(urlString, '_blank');
  // };

  return (
    <div
      id="terminal"
      className={`flex-shrink-0 relative overflow-y-auto w-full h-1/5 md:h-2/5 pb-2 pl-2 md:pl-4 border-t-4 border-l border-[#30363d] bg-[#0d1117] text-[#c9d1d9]`}
    >
      <div className="flex cursor-pointer text-xs pt-2 pb-6 bg-[#0d1117] text-[#95a1ad] sticky top-0 z-10">
        <div className="mr-4">PROBLEMS</div>
        <div className="mr-4">OUTPUT</div>
        <div className="mr-4 underline underline-offset-8 text-[#c5d1db]">TERMINAL</div>
        <div className="mr-4">PORTS</div>
        <div className="mr-4">DEBUG CONSOLE</div>
      </div>

      {/* <div className="resize-handle absolute top-0 left-0 w-full h-2 cursor-row-resize bg-gray-700"></div> */}
      {commands.map((command, index) => (
        <>
          <div key={index}>
            <span>$ yogesh0509{paths[index]}&gt;</span> {command}
          </div>
          {console.log(output[index])}
          <div key={index + 3 * 100}>
            {typeof output[index] === 'string' ? (
              <TypingText text={output[index] as string} />
            ) : isLink(output[index]) ? (
              <>
                <a
                  href={(output[index] as Link).github}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'underline', color: 'blue' }}
                >
                  <TypingText text="G itHub" />
                </a>
                {(output[index] as Link).hackathon && (
                  <a
                    href={(output[index] as Link).hackathon}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'underline', color: 'blue' }}
                  >
                    <TypingText text="H ackathon" />
                  </a>
                )}
                {(output[index] as Link).live && (
                  <a
                    href={(output[index] as Link).live}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'underline', color: 'blue' }}
                  >
                    <TypingText text="L ive" />
                  </a>
                )}
              </>
            ) : isTechnology(output[index]) ? (
              <div>
                <div>Language:</div>
                {(output[index] as Technology).language.map((ele, i) => (
                  <div key={i}>
                    <TypingText text={`--   ${ele}`} />
                  </div>
                ))}
                <br />
                <div>Framework/Library:</div>
                {(output[index] as Technology).framework.map((ele, i) => (
                  <div key={i}>
                    <TypingText text={`--   ${ele}`} />
                  </div>
                ))}
              </div>
            ) : (
              <></>
            )}
          </div>
          <br />
        </>
      ))}

      <div className="flex items-center">
        <div className="mr-2 whitespace-nowrap">$ yogesh0509{finalPath}&gt;</div>
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
