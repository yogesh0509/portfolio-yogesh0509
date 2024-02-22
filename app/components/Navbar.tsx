'use client'

import React from 'react';
import { usePathname } from 'next/navigation'
import Link from 'next/link'


const Navbar: React.FC = () => {
    const pathname = usePathname()
    const paths: string[] = pathname.split("/")
    paths.shift()
    const newPaths = paths.map((str) => str.split(".")[0]);

    return (
        <div className="w-full px-3 pt-1 text-xs shadow-2xl text-[#95a1ad] bg-[#0d1117] border-l border-[#30363d]">
            <Link href={`/`}>yogesh0509 &gt; </Link>
            {newPaths.map((path, index, array) => (                
                <Link href={`/${array.slice(0, index + 1).join("/")}`} key={index}>{path} &gt; </Link>
            ))}
        </div>
    );
};

export default Navbar;

