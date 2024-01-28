'use server'

interface RegexHandler {
    pattern: RegExp;
    handler: (matchResult: RegExpMatchArray | null) => string;
}

interface Values {
    [projectName: string]: {
        [functionName: string]: string;
    };
}

const values: Values = {
    "web3_dream11": {
        "about()": "Fantasy sports have witnessed an astounding rise in India, attracting millions of players to various platforms. However, persistent issues such as data privacy, insider trading, and a lack of transparency prompted the development of web3-DREAM11. This project utilizes blockchain technology, oracles, and NFTs to elevate the security, transparency, and fairness of fantasy sports experiences. It is a platform where cricket teams and franchises can buy and sell players for their respective leagues or tournaments. The marketplace usually operates online and facilitates the bidding and trading process for cricket players.",
        "getLanguageUsed()": `solidity javascript react`
    }
}

const regexHandlers: RegexHandler[] = [
    {
        pattern: /^npx hardhat run scripts\/(\w+) --args "(\w+\(.*\))"$/,
        handler: (matchResult) => {
            if (matchResult) {
                const fileName = matchResult[1];
                const functionName = matchResult[2];
                console.log('Handling case 1:');
                console.log('web3Variable:', fileName);
                console.log('aboutVariable:', functionName);
                if (values[fileName][functionName]) {
                    return values[fileName][functionName]
                }
                else {
                    return "Command not found!!"
                }
            }
            else {
                return "Invalid Command!!"
            }
        },
    },
];

export const ValiateCommands = (command: string, path: string) => {
    console.log(command)
    for (const { pattern, handler } of regexHandlers) {
        const matchResult = command.match(pattern);
        console.log(matchResult)
        if (matchResult) {
            return handler(matchResult);
        }
    }

    return ("Invalid Command!!")
}