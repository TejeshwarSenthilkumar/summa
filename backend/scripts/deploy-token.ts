import { ethers } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Deploy PharmaLyncToken (ERC-20) to Sepolia testnet
 */
async function deployToken(): Promise<void> {
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║   PharmaLync Token Deployment              ║');
    console.log('╚════════════════════════════════════════════╝\n');

    const rpcUrl = process.env.BLOCKCHAIN_RPC_URL;
    const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY;

    if (!rpcUrl || !privateKey) {
        console.error('✗ Missing BLOCKCHAIN_RPC_URL or BLOCKCHAIN_PRIVATE_KEY');
        process.exit(1);
    }

    try {
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const wallet = new ethers.Wallet(privateKey, provider);

        console.log(`🔗 Connecting to Sepolia...`);
        console.log(`📍 Deployer address: ${wallet.address}`);

        const balance = await provider.getBalance(wallet.address);
        console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH\n`);

        if (balance === 0n) {
            console.error('✗ Insufficient balance for deployment');
            process.exit(1);
        }

        // Note: To run this, you must have compiled the contract:
        // npx hardhat compile
        // Then load the ABI and Bytecode from artifacts/contracts/PharmaLyncToken.sol/PharmaLyncToken.json

        console.log('🚀 Preparing deployment of PharmaLyncToken (PLT)...');
        console.log('📋 Token Details:');
        console.log('   - Name: PharmaLync Token');
        console.log('   - Symbol: PLT');
        console.log('   - Initial Supply: 10,000,000 PLT');
        console.log('');

        console.log('⚠️  Make sure you have compiled your contracts before running this script.');
        console.log('    Use: npx hardhat compile');
        console.log('');

        /* 
        // TEMPLATE FOR ACTUAL DEPLOYMENT
        const artifactPath = path.resolve(__dirname, '../artifacts/contracts/PharmaLyncToken.sol/PharmaLyncToken.json');
        const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    
        const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
        const contract = await factory.deploy(wallet.address);
        
        console.log('📡 Deployment transaction sent. Waiting for confirmation...');
        await contract.waitForDeployment();
        
        const address = await contract.getAddress();
        console.log(`\n✅ PharmaLyncToken deployed at: ${address}`);
        console.log(`📄 Update your .env file with: PLT_TOKEN_ADDRESS="${address}"`);
        */

    } catch (error) {
        console.error('✗ Deployment failed:', error);
        process.exit(1);
    }
}

deployToken();
