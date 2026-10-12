/**
 * Deploy a contract using Foundry script
 */
async function deployContract(
    contractName: string,
    network: string,
    config: DeploymentConfig
): Promise<{ address: string; deploymentTx: string }> {
    const spinner = ora(`Deploying ${contractName}...`).start();
    
    try {
        // Run forge script
        const scriptPath = `scripts/contracts/${contractName}.s.sol`;
        
        // Build the command
        let forgeCommand = `forge script ${scriptPath} --rpc-url ${config.rpcUrl} --broadcast --verify`;
        
        // For ZeroXBridgeL1, check and pass ProofRegistry address
        if (contractName === "ZeroXBridgeL1") {
            const deploymentState = loadDeploymentState(network);
            const proofRegistry = deploymentState["ProofRegistry"];
            
            if (!proofRegistry?.address) {
                spinner.fail("ProofRegistry address not found in deployments. Deploy ProofRegistry first.");
                throw new Error("ProofRegistry must be deployed before ZeroXBridgeL1");
            }
            
            forgeCommand = `PROOF_REGISTRY=${proofRegistry.address} ${forgeCommand}`;
        }

        // Execute the deployment
        await execAsync(forgeCommand);

        // Read deployment information from run-latest.json
        const deploymentInfo = await readLatestDeployment(contractName, network);

        spinner.succeed(`${contractName} deployed at: ${deploymentInfo.address}`);
        
        return deploymentInfo;
        
    } catch (error: any) {
        spinner.fail(`${contractName} deployment failed!`);
        console.error(error.toString());
        throw error;
    }
}

// === Main Deployment Orchestration =============================================================

/**
 * Deploy all contracts in the correct order
 */
async function deployAllContracts(config: DeploymentConfig): Promise<void> {
    console.log(`\n🚀 Starting ZeroXBridge L1 deployment on ${config.network}...\n`);

    // Load existing deployment state for this network
    const deploymentState = loadDeploymentState(config.network!);

    // Deploy contracts in dependency order
    for (const contractName of DEPLOYMENT_ORDER) {
        if (deploymentState[contractName]) {
            console.log(`${contractName} already deployed at: ${deploymentState[contractName].address}`);
            continue;
        }

        const { address, deploymentTx } = await deployContract(
            contractName, 
            config.network!, 
            config
        );
        
        deploymentState[contractName] = {
            address,
            deploymentTx,
            timestamp: Date.now(),
            network: config.network!
        };
        
        saveDeploymentState(deploymentState, config.network!);
    }

    // Final deployment summary
    console.log("\n✅ Deployment completed successfully!\n");
    console.log("📋 Deployed Contracts:");
    console.log("=======================");
    
    for (const [contractName, deployment] of Object.entries(deploymentState)) {
        console.log(`${contractName}:`);
        console.log(`  Address: ${deployment.address}`);
        console.log(`  Deploy Tx: ${deployment.deploymentTx}`);
        console.log();
    }

    const deploymentsFilename = getDeploymentsFilename(config.network!);
    console.log(`💾 Deployment state saved to: ${deploymentsFilename}`);
}
