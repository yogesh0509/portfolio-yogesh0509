'use server'

import values from './constants/values.json';

interface Technology {
    framework: string[];
    language: string[];
}

const regexHandlers: RegExp[] = [
    /^npx hardhat run scripts\/(\w+) --args (\w+)\(\)$/,
    /^curl http:\/\/localhost:3000\/(\w+)\/(\w+)$/
];

const handler = (matchResult: RegExpMatchArray) => {
    const fileName = matchResult[1];
    const functionName = matchResult[2];
    const project = values[fileName as keyof typeof values];

    if (project && project[functionName as keyof typeof project]) {

        if (functionName === "devTools") {
            const devTools = project.devTools as Technology;
            return {
                message: devTools
            }
        }
        else if(functionName === "info") {
            return {
                message: project.info
            }
        }
        else {
            return { message: "Function or file not found!!" };
        }

    } else {
        return { message: "Function or file not found!!" };
    }
}


export const project = async (command: string) => {
    if (command.startsWith("cd ")) {
        return {message: "  "}
    }
    for (const pattern of regexHandlers) {
        const matchResult = command.match(pattern);
        if (matchResult) {
            return handler(matchResult);
        }
    }
    return { message: "I nvalid Command!!" };
}

export const resources = async (project: string) => {
    return values[project as keyof typeof values] ? values[project as keyof typeof values].resources : {};
}