'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SidebarContextProps {
  minimized: boolean;
  toggleMinimized: () => void;
  setMinimized: (value: boolean) => void;
  handleDrawer: (value: boolean) => void;
  isDrawer: boolean
  drawer: boolean;
  toggleDrawer: () => void;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(undefined);

interface SidebarProviderProps {
  children: ReactNode;
}

export const SidebarProvider: React.FC<SidebarProviderProps> = ({ children }) => {
  const [minimized, setMinimized] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [isDrawer, handleDrawer] = useState(false);

  const toggleMinimized = () => {
    setMinimized((prevMinimized) => !prevMinimized);
  };

  const toggleDrawer = () => {
    setDrawer((prevDrawer) => !prevDrawer);
  };

  return (
    <SidebarContext.Provider value={{ minimized, toggleMinimized, setMinimized, handleDrawer, isDrawer, drawer, toggleDrawer }}>
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