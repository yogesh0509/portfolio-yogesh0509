import React, { useState } from 'react';

const Terminal: React.FC = () => {
  const [userInput, setUserInput] = useState<string>('');
  const [commands, setCommands] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
  };

  const handleEnterPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setCommands((prevCommands) => [...prevCommands, userInput]);
      setUserInput('');
    }
  };

  return (
    <div
      id="terminal"
      className={`flex-shrink-0 fixed bottom-0 w-full h-2/5 bg-black text-white border border-gray-700 relative overflow-y-auto`}
    >
      <div className="resize-handle absolute top-0 left-0 w-full h-2 cursor-row-resize bg-gray-700"></div>
      {commands.map((command, index) => (
        <div key={index}>
          <span>$yogesh0509&gt;</span> {command}
        </div>
      ))}

      <div>
        <span>$yogesh0509&gt;</span>
        <input
          type="text"
          value={userInput}
          onChange={handleInputChange}
          onKeyPress={handleEnterPress}
          className="bg-transparent border-none outline-none text-white ml-2"
          placeholder="Type your command..."
        />
      </div>
    </div>
  );
};

export default Terminal;
