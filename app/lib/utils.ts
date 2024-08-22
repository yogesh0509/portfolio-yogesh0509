'use server'
import { promises as fs } from 'fs';

async function loadResources() {
    const inch1APIDefi = fs.readFile(process.cwd() + '/public/content/inch1APIDefi.txt', 'utf8');
    const CrossChainHub = fs.readFile(process.cwd() + '/public/content/CrossChainHub.txt', 'utf8');
    const TakeYourQuiz = fs.readFile(process.cwd() + '/public/content/TakeYourQuiz.txt', 'utf8');
    const Web3Dream11 = fs.readFile(process.cwd() + '/public/content/Web3Dream11.txt', 'utf8');
    const chainlinkHackathon = fs.readFile(process.cwd() + '/public/content/chainlinkHackathon.txt', 'utf8');
    const ETHForAll = fs.readFile(process.cwd() + '/public/content/ETHForAll.txt', 'utf8');

    const [ inch1APIDefiContent, CrossChainHubContent, TakeYourQuizContent, Web3Dream11Content, chainlinkHackathonContent, ETHForAllContent ] = await Promise.all([
        inch1APIDefi,
        CrossChainHub,
        TakeYourQuiz,
        Web3Dream11,
        chainlinkHackathon,
        ETHForAll,
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
