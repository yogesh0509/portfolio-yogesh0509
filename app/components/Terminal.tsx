'use client'

// components/Terminal.tsx
import React from 'react';
import { useSidebar } from '../context/SidebarContext';

const Terminal: React.FC = () => {
    const { minimized } = useSidebar();

  return (
    <div className="flex-shrink-0 fixed bottom-0 w-full p-4 pb-36 bg-black text-white border border-gray-700">
      <div>
        <span>$yogesh0509&gt;</span>
        <input
          type="text"
          className="bg-transparent border-none outline-none text-white ml-2"
          placeholder="Type your command..."
        />
      </div>
    </div>
  );
};

export default Terminal;
