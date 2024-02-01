'use server'

interface Technology {
    framework: string[],
    language: string[]
}

interface link {
    github: string,
    live?: string,
    hackathon?: string
}

interface Terminal {
    [projectName: string]: {
        [functionName: string]: string | Technology | link;
    };
}

const callback: Terminal = {
    "chainlinkHackathon": {
        "about()": "A project that rewards rainforest owners with tokens for preserving their land, helping fight climate change and protect biodiversity.Tokens representing one ton of fixed carbon dioxide, given to registered rainforest owners for conservation efforts.",
        "TechUsed()": {
            framework: ["Hardhat", "React.js", "chainlink", "wagmi", "tailwind CSS"],
            language: ["Solidity", "Javascript"]
        },
        "link()": {
            github: "https://github.com/Rainforest-Conservation-Tokens/RaCoTo",
            live: "https://www.racoto.network",
            hackathon: "https://devpost.com/software/raico-rainforest-proof-of-conservation"
        }
    },
    "ETHForAll": {
        "about()": "A DAO (Decentralized Autonomous Organization) can be designed as a society that allows members to buy properties listed on the platform, which in turn grants them voting powers in the proposals of the society. The society aims to be a democratic and decentralized organization, where decisions are made by its members through voting.",
        "TechUsed()": {
            framework: ["Hardhat", "polygon", "chainlink"],
            language: ["Solidity", "Javascript"]
        },
        "link()": {
            github: "https://github.com/yogesh0509/SocioDAO",
            hackathon: "https://devfolio.co/projects/sociodao-8d7e"
        }
    },
    "1inch_api_defi": {
        "about()": "Token swap using 1inch protocol to exchange one cryptocurrency for another without a middleman.",
        "TechUsed()": {
            framework: ["Next.js", "React.js", "ethers.js", "wagmi", "tailwind CSS"],
            language: ["Javascript"]
        },
        "link()": {
            github: "https://github.com/yogesh0509/1inch-API-defi",
            live: "https://dzap-task1.vercel.app"
        }
    },
    "CrossChainHub": {
        "about()": "An API service that enables users to call smart contracts residing on different chains. This strategic integration streamlines cross-chain smart contract interaction, allowing us to seamlessly interact with diverse blockchain architectures.",
        "TechUsed()": {
            framework: ["React.js", "tailwind CSS", "ethers.js", "node.js", "express.js", "chainlink"],
            language: ["Javascript", "Typescript", "Solidity"]
        },
        "link()": {
            github: "https://github.com/yogesh0509/CrossChain-Hub"
        }
    },
    "TakeYourQuiz": {
        "about()": "A customizable quiz website is an online platform that enables users to create and administer custom quizzes using their own questions and answers. With this particular website, users can easily create a quiz by uploading a PDF file containing the questions and answer choices.",
        "TechUsed()": {
            framework: ["node.js", "express.js", "mongoDB", "aws", "multer"],
            language: ["Javascript", "pug"]
        },
        "link()": {
            github: "https://github.com/yogesh0509/TakeYourQuiz",
            live: "https://takeyourquiz.onrender.com/"
        }
    },
    "web3_dream11": {
        "about()": "Fantasy sports have witnessed an astounding rise in India, attracting millions of players to various platforms. However, persistent issues such as data privacy, insider trading, and a lack of transparency prompted the development of web3-DREAM11. This project utilizes blockchain technology, oracles, and NFTs to elevate the security, transparency, and fairness of fantasy sports experiences. It is a platform where cricket teams and franchises can buy and sell players for their respective leagues or tournaments. The marketplace usually operates online and facilitates the bidding and trading process for cricket players.",
        "TechUsed()": {
            framework: ["React.js", "tailwind CSS", "ethers.js", "NEXT.js", "chainlink"],
            language: ["Javascript", "Solidity", "toml"]
        },
        "link()": {
            github: "https://github.com/yogesh0509/web3-DREAM11",
            live: "https://web3-dream-11.vercel.app/"
        }
    },
}

const regexHandlers: RegExp[] = [
    /^npx hardhat run scripts\/(\w+) --args "(\w+\(.*\))"$/,
    /^npm (\w+).js\/(\w+\(.*\))$/,
    /^npm (\w+).ts\/(\w+\(.*\))$/,
    /^npm run dev (\w+)\/(\w+\(.*\))$/
];

const handler = (matchResult: RegExpMatchArray) => {
    const fileName = matchResult[1];
    const functionName = matchResult[2];
    if (callback[fileName] && callback[fileName][functionName]) {
        return JSON.stringify({
            message: callback[fileName][functionName]
        })
    }
    else {
        return JSON.stringify({ message: "Function not found!!" })
    }

}

export const ValiateCommands = (command: string, path: string) => {
    for (const pattern of regexHandlers) {
        const matchResult = command.match(pattern);
        if (matchResult) {
            return handler(matchResult);
        }
    }
    return JSON.stringify({ message: "Invalid Command!!" })
}