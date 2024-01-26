'use server'
 
interface PackageJson {
    name: string;
    version: string;
    scripts: {
        [key: string]: string;
    };
}

const packageJson: PackageJson = {
    name: "portfolio-yogesh0509",
    version: "0.1.0",
    scripts: {
        "dev": "next dev",
        "build": "next build",
        "start": "next start",
        "lint": "next lint"
    }
};

const web3_dream11: string = `pragma solidity 0.8.19;
contract web3_dream11 {
    function getLanguageUsed() external returns(string[] memory){}
    function about() external {}
    function liveProject() external {}
    // To run a function type this command "npx hardhat scripts/<functionName>"
}`;

export const code = (fileName: string)=>{
    switch (fileName) {
        case "package":
            return JSON.stringify(packageJson, null, 2);
            break;
    
        case "web3-dream11":
            return web3_dream11
            break;
    }
    return ""
}

export const lang = (extension: string)=>{
    switch (extension) {
        case "json":
            return "json"
            break;
        
        case "sol":
                return "solidity"
            break;
    }
}