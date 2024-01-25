'use client'

import React from 'react';
import Sidebar from './Sidebar';
import Terminal from './Terminal';
import { useSidebar } from './SidebarContext';

export default function Main({ children }: { children: React.ReactNode }) {
    const { minimized } = useSidebar();

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <main className={`flex-1 p-4 overflow-auto ${minimized ? 'overflow-x-auto' : ''} transition-all text-white`}>
                    {children}
                </main>
                <Terminal />
            </div>
        </div>
    );
};