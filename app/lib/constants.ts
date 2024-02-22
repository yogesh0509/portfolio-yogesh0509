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

const inch1_api_defi: string = `import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Index() {
    const [aboutData, setAboutData] = useState(null);
    const [techUsedData, setTechUsedData] = useState(null);
    const [linkData, setLinkData] = useState(null);

    useEffect(() => {
        // Fetch data for the "about" endpoint
        fetch('/api/about')
            .then(response => response.json())
            .then(data => setAboutData(data))
            .catch(error => console.error('Error fetching about data:', error));

        // Fetch data for the "techused" endpoint
        fetch('/api/techused')
            .then(response => response.json())
            .then(data => setTechUsedData(data))
            .catch(error => console.error('Error fetching techused data:', error));

            
        // Fetch data for the "link" endpoint
        fetch('/api/link')
            .then(response => response.json())
            .then(data => setLinkData(data))
            .catch(error => console.error('Error fetching link data:', error));
    }, []);

    return (
        <div>
            <h1>Welcome to my Next.js App!</h1>
            <Link href="/about"><a>{JSON.stringify(aboutData, null, 2)}</a></Link>
            <Link href="/TechUsed"><a>{JSON.stringify(techUsedData, null, 2)}</a></Link>
            <Link href="/link"><a>{JSON.stringify(linkData, null, 2)}</a></Link>
        </div>
    );
}

// pages/api/[endpoint].js
export default function handler(req, res) {
    const { endpoint } = req.query;
    switch (endpoint) {
      case 'about':
        // Your logic for the "about" functionality goes here
        res.status(200).json({ message: 'About functionality executed.' });
        break;
      case 'techused':
        // Your logic for the "techused" functionality goes here
        res.status(200).json({ message: 'TechUsed functionality executed.' });
        break;
      case 'link':
        // Your logic for the "link" functionality goes here
        res.status(200).json({ message: 'Link functionality executed.' });
        break;
      default:
        res.status(404).json({ message: 'Endpoint not found' });
        break;
    }
}

// To run an endpoint type this command in the command line "curl http://localhost:3000/1inch_api_defi/about"`;

const CrossChainHub: string = `import express, { Request, Response, NextFunction } from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

// Routes
app.get("/about", (req: Request, res: Response) =>{
    res.render("about");
});

app.get("/TechUsed", (req: Request, res: Response) =>{
    res.render("TechUsed");
});

app.get("/link", (req: Request, res: Response) =>{
    res.render("link");
});

// Error Handling Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
    const error: Error = new Error('Not Found');
    (error as any).status = 404;
    next(error);
});

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
    res.status((error as any).status || 500);
    res.send('Error: ' + error.message);
});

// Start the server
app.listen(PORT, () => {
    console.log("Server is running on port 3000");
});

// To run an endpoint type this command in the command line "curl http://localhost:3000/CrossChainHub/about"`;

const TakeYourQuiz: string = `const express = require('express');
const app = express();

// Routes
app.get("/about", (req, res) =>{
    res.render("about");
});

app.get("/TechUsed", (req, res) =>{
    res.render("TechUsed");
});

app.get("/link", (req, res) =>{
    res.render("link");
});

// Error Handling Middleware
app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.send('Error: ' + error.message);
});

// Start the server
app.listen(PORT, () => {
    console.log("Server is running on port 3000");
});

// To run an endpoint type this command in the command line "curl http://localhost:3000/TakeYourQuiz/about"`;

const Web3Dream11: string = `pragma solidity ^0.8.0;

contract Web3Dream11 {
    address public owner;
    string[] public technologiesUsed;

    constructor(string[] memory _technologies) {
        owner = msg.sender;
        technologiesUsed = _technologies;
    }

    function about() external {}

    function TechUsed() external view returns (string memory) {
        string memory techList;
        for (uint256 i = 0; i < technologiesUsed.length; i++) {
            if (i > 0) {
                techList = string(abi.encodePacked(techList, ", ", technologiesUsed[i]));
            } else {
                techList = technologiesUsed[i];
            }
        }
        return techList;
    }

    function link() external {}
}

// test/TechUsed.test.js
const { expect } = require('chai');

describe('TechUsed', function () {
  let Web3Dream11;
  let web3Dream11;
  let owner;
  const technologies = ['Solidity', 'Hardhat', 'React'];

  beforeEach(async function () {
    Web3Dream11 = await ethers.getContractFactory('Web3Dream11');
    [owner] = await ethers.getSigners();
    web3Dream11 = await Web3Dream11.deploy(technologies);
    await web3Dream11.deployed();
  });

  it('should return correct tech list', async function () {
    const expectedTechList = 'Solidity, Hardhat, React';
    expect(await web3Dream11.TechUsed()).to.equal(expectedTechList);
  });
});

// To run a function type this command in the command line "npx hardhat run scripts/Web3Dream11 --args about()"`;

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

        case "Web3Dream11":
            return Web3Dream11

        default:
            return ""
    }
}

export const lang = (extension: string) => {
    switch (extension) {
        case "sol":
            return "solidity"

        case "jsx":
            return "jsx"

        case "ts":
            return "typescript"

        case "js":
            return "javascript"

        default:
            return "txt"
    }
}