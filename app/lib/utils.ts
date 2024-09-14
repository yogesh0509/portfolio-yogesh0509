'use server'
import { promises as fs } from 'fs';
import path from 'path';

async function loadResources() {
    const inch1APIDefiPath = path.join(process.cwd(), 'public/content/inch1APIDefi.txt');
    const CrossChainHubPath = path.join(process.cwd(), 'public/content/CrossChainHub.txt');
    const TakeYourQuizPath = path.join(process.cwd(), 'public/content/TakeYourQuiz.txt');
    const Web3Dream11Path = path.join(process.cwd(), 'public/content/Web3Dream11.txt');
    const chainlinkHackathonPath = path.join(process.cwd(), 'public/content/chainlinkHackathon.txt');
    const ETHForAllPath = path.join(process.cwd(), 'public/content/ETHForAll.txt');

    // Read the files asynchronously
    const [
        inch1APIDefiContent,
        CrossChainHubContent,
        TakeYourQuizContent,
        Web3Dream11Content,
        chainlinkHackathonContent,
        ETHForAllContent
    ] = await Promise.all([
        fs.readFile(inch1APIDefiPath, 'utf8'),
        fs.readFile(CrossChainHubPath, 'utf8'),
        fs.readFile(TakeYourQuizPath, 'utf8'),
        fs.readFile(Web3Dream11Path, 'utf8'),
        fs.readFile(chainlinkHackathonPath, 'utf8'),
        fs.readFile(ETHForAllPath, 'utf8')
    ]);

    const resources = {
        chainlinkHackathon: chainlinkHackathonContent,
        ETHForAll: ETHForAllContent,
        inch1APIDefi: inch1APIDefiContent,
        CrossChainHub: CrossChainHubContent,
        TakeYourQuiz: TakeYourQuizContent,
        Web3Dream11: Web3Dream11Content,
    };

    return resources;
}

const language = {
    sol: "solidity",
    jsx: "jsx",
    ts: "typescript",
    js: "javascript",
};

export const code = async (fileName: string) => {
    const resources = await loadResources();
    return resources[fileName as keyof typeof resources] || "";
};

export const lang = (lang: string) => {
    return language[lang as keyof typeof language] || "txt";
};
