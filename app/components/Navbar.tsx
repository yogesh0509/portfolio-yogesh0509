'use client'

import React, { useEffect, useState, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { FaGithub } from "react-icons/fa";
import { PiLinkSimpleBold } from "react-icons/pi";
import { FaDev } from "react-icons/fa";
import { resources } from '../lib/project';

const Navbar: React.FC = () => {
    const pathname = usePathname();
    
    const newPaths = useMemo(() => {
        const paths: string[] = pathname.split("/");
        paths.shift();
        return paths.map((str) => str.split(".")[0]);
    }, [pathname]);

    const [links, setLinks] = useState<{ github?: string, live?: string, hackathon?: string }>({});

    useEffect(() => {
        async function fetchLinks() {
            const result = await resources(newPaths[newPaths.length - 1]);
            setLinks(result);
        }
        fetchLinks();
    }, [newPaths]);

    return (
        <div className="w-full px-3 pt-1 text-xs shadow-2xl text-[#95a1ad] bg-[#0d1117] border-l border-[#30363d] flex justify-between items-center">
            <div>
                <Link href={`/`}>yogesh0509 &gt; </Link>
                {newPaths.map((path, index, array) => (
                    <Link href={`/${array.slice(0, index + 1).join("/")}`} key={index}>{path} &gt; </Link>
                ))}
            </div>
            <div className="flex space-x-4">
                {links.github && <a href={links.github} target="_blank" rel="noopener noreferrer"><FaGithub /></a>}
                {links.live && <a href={links.live} target="_blank" rel="noopener noreferrer"><PiLinkSimpleBold /></a>}
                {links.hackathon && <a href={links.hackathon} target="_blank" rel="noopener noreferrer"><FaDev /></a>}
            </div>
        </div>
    );
};

export default Navbar;
