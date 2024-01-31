'use client'

// components/Navbar.tsx
import React from 'react';
import { usePathname } from 'next/navigation'
import Link from 'next/link'


const Navbar: React.FC = () => {
    const pathname = usePathname()
    const paths: string[] = pathname.split("/")
    paths.shift()
    const newPaths = paths.map((str) => str.split(".")[0]);

    return (
        <div className="w-full mx-3 mt-1 text-xs text-neutral-300 shadow-2xl bg-black">
            <Link href={`/`}>yogesh0509 &gt; </Link>
            {newPaths.map((path, index, array) => (                
                <Link href={`/${array.slice(0, index + 1).join("/")}`}>{path} &gt; </Link>
            ))}
        </div>
    );
};

export default Navbar;
