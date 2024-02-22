'use client'

import React from 'react';
import Sidebar from './Sidebar';
import Terminal from './Terminal';
import Navbar from './Navbar';
import { useSidebar } from '../context/SidebarContext';
import { useEffect, useState } from 'react';

export default function Main({ children }: { children: React.ReactNode }) {
    const { minimized, setMinimized, handleDrawer, isDrawer, drawer } = useSidebar();
    const [width, setWidth] = useState(0);
    useEffect(() => {
        const handleResize = () => {
            const newWidth = window.innerWidth;
            if (newWidth !== width) {
                setWidth(newWidth);
                if (newWidth < 900) {
                    setMinimized(true);
                    handleDrawer(true)
                }
                else {
                    handleDrawer(false)
                }
            }
        };

        handleResize(); // Get initial width
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [width]);

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className={`flex-1 flex flex-col ${isDrawer && !drawer ? "filter blur-sm": ""}`}>
                <Navbar />
                <main className={`flex-1 p-4 overflow-auto ${minimized ? 'overflow-x-auto' : ''} transition-all bg-[#0d1117] border-l border-[#30363d]`}>
                    {children}
                </main>
                <Terminal />
            </div>
        </div>
    );
};