'use server'

const chainlinkHackathon: string = `// Online hackathon conducted by Chainlink from April 2023 to June 2023. 

pragma solidity 0.8.19;
contract RaCoTo {
    function about() external {}
    function TechUsed() external {}
    function link() external {}
    // To run a function type this command "npx hardhat run scripts/chainlinkHackathon --args <functionName>"
}`;

const ETHForAll: string = `// Online hackathon conducted during the month of Feb 2023 

pragma solidity 0.8.19;
contract SocioDAO {
    function about() external {}
    function TechUsed() external {}
    function link() external {}
    // To run a function type this command "npx hardhat run scripts/ETHForAll --args <functionName>"
}`;

const inch1_api_defi: string = `import React from 'react'

export default function Index() {
    const about = () => {}
    const TechUsed = () => {}
    function link = () => {}
}

// To run a function type this command "npm run dev 1inch_api_defi/<functionName>"`;

const CrossChainHub: string = `import express, { Express, Request, Response } from 'express';
const app: Express = express();

app.get("/about()", (req: Request, res: Response) =>{
    res.render("about");
})
app.get("/TechUsed()", (req: Request, res: Response) =>{
    res.render("TechUsed");
})
app.get("/link()", (req: Request, res: Response) =>{
    res.render("link");
})
app.listen(80)

// To run a function type this command "npm CrossChainHub.ts/<functionName>"`;

const TakeYourQuiz: string = `const express = require('express');
const app = express();

app.get("/about()", (req, res) =>{
    res.render("about");
})
app.get("/TechUsed()", (req, res) =>{
    res.render("TechUsed");
})
app.get("/link()", (req, res) =>{
    res.render("link");
})
app.listen(80)

// To run a function type this command "npm TakeYourQuiz.js/<functionName>"`;

const web3_dream11: string = `pragma solidity 0.8.19;
contract web3_dream11 {
    function about() external {}
    function TechUsed() external {}
    function link() external {}
    // To run a function type this command "npx hardhat run scripts/web3_dream11 --args <functionName>"
}`;

export const code = (fileName: string) => {
    switch (fileName) {

        case "chainlinkHackathon":
            return chainlinkHackathon

        case "ETHForAll":
            return ETHForAll

        case "1inch_api_defi":
            return inch1_api_defi
        
        case "CrossChainHub":
            return CrossChainHub  

        case "TakeYourQuiz":
            return TakeYourQuiz  

        case "web3_dream11":
            return web3_dream11          

        default:
            return ""
    }
}

export const lang = (extension: string) => {
    switch (extension) {
        case "sol":
            return "solidity"

        case "js":
            return "javascript"

        case "jsx":
            return "jsx"

        case "ts":
            return "typescript"

        default:
            return "txt"
    }
}