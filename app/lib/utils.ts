'use server'
const fs = require('fs');

const inch1APIDefi = fs.readFileSync('./app/lib/constants/inch1APIDefi.txt', 'utf8');
const CrossChainHub = fs.readFileSync('./app/lib/constants/CrossChainHub.txt', 'utf8');
const TakeYourQuiz = fs.readFileSync('./app/lib/constants/TakeYourQuiz.txt', 'utf8');
const Web3Dream11 = fs.readFileSync('./app/lib/constants/Web3Dream11.txt', 'utf8');
const chainlinkHackathon = fs.readFileSync('./app/lib/constants/chainlinkHackathon.txt', 'utf8');
const ETHForAll: string = fs.readFileSync('./app/lib/constants/ETHForAll.txt', 'utf8');

const resources = {
    chainlinkHackathon: chainlinkHackathon,
    ETHForAll: ETHForAll,
    inch1APIDefi: inch1APIDefi,
    CrossChainHub: CrossChainHub,
    TakeYourQuiz: TakeYourQuiz,
    Web3Dream11: Web3Dream11,
};

const language = {
    sol: "solidity",
    jsx: "jsx",
    ts: "typescript",
    js: "javascript",
};

export const code = (fileName: string) => {
    return resources[fileName as keyof typeof resources] || "";
}

export const lang = (lang: string) => {
    return language[lang as keyof typeof language] || "txt";
}