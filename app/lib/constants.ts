'use server'

interface PackageJson {
    name: string;
    version: string;
    scripts: {
        [key: string]: string;
    };
}

// const packageJson: PackageJson = {
//     name: "portfolio-yogesh0509",
//     version: "0.1.0",
//     scripts: {
//         "dev": "next dev",
//         "build": "next build",
//         "start": "next start",
//         "lint": "next lint"
//     }
// };

const inch1_api_defi: string = `import React from 'react'

export default function Index() {
    const about = () => {}
    const TechUsed = () => {}
    function link = () => {}
}

// To run a function type this command "npm run dev 1inch_api_defi/<functionName>"`;

const web3_dream11: string = `pragma solidity 0.8.19;
contract web3_dream11 {
    function about() external {}
    function TechUsed() external {}
    function link() external {}
    // To run a function type this command "npx hardhat run scripts/web3_dream11 --args <functionName>"
}`;

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

export const code = (fileName: string) => {
    switch (fileName) {
        // case "package":
        //     return JSON.stringify(packageJson, null, 2);

        case "chainlinkHackathon":
            return chainlinkHackathon

        case "ETHForAll":
            return ETHForAll

        case "1inch_api_defi":
            return inch1_api_defi

        case "web3_dream11":
            return web3_dream11

        case "TakeYourQuiz":
            return TakeYourQuiz            

        default:
            return ""
    }
}

export const lang = (extension: string) => {
    switch (extension) {
        case "json":
            return "json"

        case "sol":
            return "solidity"

        case "js":
            return "javascript"

        case "jsx":
            return "jsx"
    }
}