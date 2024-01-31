'use server'

interface Values {
    [projectName: string]: {
        [functionName: string]: string;
    };
}

const values: Values = {
    "chainlinkHackathon": {
        "about()": "A project that rewards rainforest owners with tokens for preserving their land, helping fight climate change and protect biodiversity.Tokens representing one ton of fixed carbon dioxide, given to registered rainforest owners for conservation efforts.",
        "TechUsed()": `solidity\njavascript\nreact`,
        "link()": `https://www.racoto.network/`
    },
    "ETHForAll": {
        "about()": "A DAO (Decentralized Autonomous Organization) can be designed as a society that allows members to buy properties listed on the platform, which in turn grants them voting powers in the proposals of the society. The society aims to be a democratic and decentralized organization, where decisions are made by its members through voting.",
        "TechUsed()": `react\njavascript`,
        "link()": `https://github.com/yogesh0509/SocioDAO`
    },
    "1inch_api_defi": {
        "about()": "Token swap using 1inch protocol to exchange one cryptocurrency for another without a middleman.",
        "TechUsed()": `javascript\npug`,
        "link()": `https://github.com/yogesh0509/1inch-API-defi`
    },
    "TakeYourQuiz": {
        "about()": "A customizable quiz website is an online platform that enables users to create and administer custom quizzes using their own questions and answers. With this particular website, users can easily create a quiz by uploading a PDF file containing the questions and answer choices.",
        "TechUsed()": `javascript\npug`,
        "link()": `https://github.com/yogesh0509/TakeYourQuiz`
    },
    "web3_dream11": {
        "about()": "Fantasy sports have witnessed an astounding rise in India, attracting millions of players to various platforms. However, persistent issues such as data privacy, insider trading, and a lack of transparency prompted the development of web3-DREAM11. This project utilizes blockchain technology, oracles, and NFTs to elevate the security, transparency, and fairness of fantasy sports experiences. It is a platform where cricket teams and franchises can buy and sell players for their respective leagues or tournaments. The marketplace usually operates online and facilitates the bidding and trading process for cricket players.",
        "TechUsed()": `solidity\njavascript\nreact`,
        "link()": `https://github.com/yogesh0509/web3-DREAM11`
    },
}

const regexHandlers: RegExp[] = [
    /^npx hardhat run scripts\/(\w+) --args "(\w+\(.*\))"$/,
    /^npm (\w+).js\/(\w+\(.*\))$/,
    /^npm run dev (\w+)\/(\w+\(.*\))$/
];

const handler = (matchResult: RegExpMatchArray | null) => {
    if (matchResult) {
        const fileName = matchResult[1];
        const functionName = matchResult[2];
        console.log(fileName, functionName)
        if (values[fileName] && values[fileName][functionName]) {
            return JSON.stringify({
                message: values[fileName][functionName]
            })
        }
        else {
            return JSON.stringify({ message: "Function not found!!" })
        }
    }
    else {
        return JSON.stringify({ message: "Invalid Command!!" })
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