/**
 * Declare a contract using Starknet.js (Option 3: Declare separately)
 */
async function declareContract(
    contractName: string,
    account: Account
): Promise<{ classHash: string; declareTx: string }> {
    const spinner = ora(`Declaring ${contractName}...`).start();
    
    try {
        // Read the compiled contract files (both Sierra and CASM)
        const sierraPath = `target/dev/l2_${contractName}.contract_class.json`;
        const casmPath = `target/dev/l2_${contractName}.compiled_contract_class.json`;
        
        if (!fs.existsSync(sierraPath)) {
            throw new Error(`Sierra contract file not found: ${sierraPath}`);
        }
        
        if (!fs.existsSync(casmPath)) {
            throw new Error(`CASM contract file not found: ${casmPath}. Run 'scarb build' to generate CASM files.`);
        }
        
        const sierraContract = json.parse(fs.readFileSync(sierraPath).toString("ascii"));
        const casmContract = json.parse(fs.readFileSync(casmPath).toString("ascii"));
        
        const declareResponse = await account.declare({
            contract: sierraContract,
            casm: casmContract,
        });
        
        // Wait for the declare transaction to be accepted
        await account.waitForTransaction(declareResponse.transaction_hash);
        
        spinner.succeed(`${contractName} declared with class hash: ${declareResponse.class_hash}`);
        
        return {
            classHash: declareResponse.class_hash,
            declareTx: declareResponse.transaction_hash
        };
        
    } catch (error: any) {
        // If contract is already declared, extract class hash from error
        if (error.message.includes("is already declared")) {
            const classHashMatch = error.message.match(/Class with hash (0x[a-fA-F0-9]+) is already declared/);
            if (classHashMatch) {
                const classHash = classHashMatch[1];
                spinner.info(`${contractName} already declared with class hash: ${classHash}`);
                return {
                    classHash: classHash,
                    declareTx: "already_declared"
                };
            }
        }
        spinner.fail(`${contractName} declaration failed!`);
        console.error(error.toString());
        throw error;
    }
}

/**
 * Deploy a contract using Starknet.js
 */
async function deployContract(
    contractName: string,
    classHash: string,
    constructorArgs: any[],
    account: Account,
    network: string
): Promise<{ address: string; deploymentTx: string }> {
    const spinner = ora(`Deploying ${contractName}...`).start();
    
    try {
        // Deploy the contract
        const deployResponse = await account.deployContract({
            classHash: classHash,
            constructorCalldata: constructorArgs,
        });
        
        // Wait for the deployment transaction to be accepted
        await account.waitForTransaction(deployResponse.transaction_hash);
        
        spinner.succeed(`${contractName} deployed at: ${deployResponse.contract_address}`);
        
        return {
            address: deployResponse.contract_address,
            deploymentTx: deployResponse.transaction_hash
        };
        
    } catch (error: any) {
        spinner.fail(`${contractName} deployment failed!`);
        console.error(error.toString());
        throw error;
    }
}
