'use client'

import React from 'react';

const Readme: React.FC = () => {
    return (
        <div className="p-5">
            <div className="container mx-auto">
                <h1 className="text-4xl font-bold mb-4">About Me <hr className='border-gray-500'/> </h1>
                <p className="mb-8">
                    👋 Hey there! I'm Yogesh Agrawal, a passionate developer and an engineering student specializing in Information Science and Engineering at BMS College of Engineering. I'm excited to share my journey in the world of technology, blockchain, and open-source contributions with you.
                </p>

                <h2 className="text-2xl font-bold mb-4">Skills & Qualifications <hr className='border-gray-500'/> </h2>
                <ul className="list-disc pl-6 mb-8">
                    <li>💻 MERN Stack Developer</li>
                    <li>🌐 Full Stack Blockchain Developer</li>
                    <li>🔗 Built projects using oracles, automation, and DeFi</li>
                    <li>📡 Proficient in creating RESTful APIs</li>
                    <li>🚀 Open source contributor</li>
                </ul>

                <h2 className="text-2xl font-bold mb-4">Projects <hr className='border-gray-500'/> </h2>
                <p className="mb-8">
                    I've had the opportunity to work on various projects in the blockchain and web development space. Some of my notable projects include:
                </p>
                <ul className="list-disc pl-6 mb-8">
                    <li>📈 WEB3-DREAM11: Live auction using real-time data.</li>
                    <li>🔄 SocioDAO: Generates zk-proofs on-chain using polygonID.</li>
                    <li>⛓️ TakeYourQuiz: A customizable quiz platform.</li>
                    <li>...and many more!</li>
                </ul>
                <p className="mb-8">
                    Feel free to explore these projects and contribute. Your feedback and collaboration are always welcome.
                </p>
                <h2 className="text-2xl font-bold mb-4">Education <hr className='border-gray-500'/> </h2>
                <p className="mb-2">
                    I'm currently pursuing my Bachelor's degree in Information Science and Engineering at BMS College of Engineering and expect to graduate in 2025. I'm constantly learning and striving to stay at the cutting edge of technology.
                </p>
            </div>
        </div>
    );
};

export default Readme;
