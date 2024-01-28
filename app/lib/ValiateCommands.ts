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
        "about()": "Hello the name of the project is web3 dream11."
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
            else{
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