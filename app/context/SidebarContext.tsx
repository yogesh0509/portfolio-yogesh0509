'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SidebarContextProps {
  minimized: boolean;
  toggleMinimized: () => void;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(undefined);

interface SidebarProviderProps {
  children: ReactNode;
}

export const SidebarProvider: React.FC<SidebarProviderProps> = ({ children }) => {
  const [minimized, setMinimized] = useState(false);

  const toggleMinimized = () => {
    setMinimized((prevMinimized) => !prevMinimized);
  };

  return (
    <SidebarContext.Provider value={{ minimized, toggleMinimized }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};