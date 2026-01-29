import { ethers } from 'ethers';

/**
 * Blockchain Service
 * Handles interaction with Sepolia testnet and smart contracts
 */
export class BlockchainService {
    private provider?: ethers.JsonRpcProvider;
    private wallet?: ethers.Wallet;
    private pharmalyncCore?: ethers.Contract;
    private pharmalyncAudit?: ethers.Contract;

    private readonly CORE_ABI = [
        "function registerMedicine(string name, string manufacturer, string batchNumber) public returns (bytes32)",
        "function dispenseMedicine(bytes32 medicineId) public",
        "function isMedicineDispensed(bytes32 medicineId) public view returns (bool)",
        "event MedicineRegistered(bytes32 indexed medicineId, string name, string batchNumber)",
        "event MedicineDispensed(bytes32 indexed medicineId, address indexed pharmacy)"
    ];

    private readonly AUDIT_ABI = [
        "function logAudit(string auditId, string action, string dataHash, uint256 timestamp) public",
        "function verifyAudit(string auditId) public view returns (string action, string dataHash, uint256 timestamp)",
        "event AuditLogged(string auditId, string action, string dataHash)"
    ];

    constructor() {
        const rpcUrl = process.env.BLOCKCHAIN_RPC_URL;
        const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY;
        const coreAddress = process.env.PHARMALYNC_CORE_ADDRESS;
        const auditAddress = process.env.PHARMALYNC_AUDIT_ADDRESS;

        if (!rpcUrl || !privateKey || !coreAddress || !auditAddress) {
            console.warn('⚠️  Blockchain configuration incomplete - features will be disabled');
            return;
        }

        try {
            this.provider = new ethers.JsonRpcProvider(rpcUrl);
            this.wallet = new ethers.Wallet(privateKey, this.provider);
            this.pharmalyncCore = new ethers.Contract(coreAddress, this.CORE_ABI, this.wallet);
            this.pharmalyncAudit = new ethers.Contract(auditAddress, this.AUDIT_ABI, this.wallet);
        } catch (error) {
            console.error('Failed to initialize blockchain provider:', error);
        }
    }

    public async registerMedicine(name: string, manufacturer: string, batchNumber: string): Promise<{ medicineId: string, txHash: string }> {
        if (!this.pharmalyncCore) throw new Error('Blockchain service not initialized');

        const tx = await this.pharmalyncCore.registerMedicine(name, manufacturer, batchNumber);
        const receipt = await tx.wait();

        // Find MedicineRegistered event to get medicineId
        const event = receipt.logs.find((log: any) => log.fragment && log.fragment.name === 'MedicineRegistered');
        const medicineId = event ? event.args[0] : ethers.keccak256(ethers.toUtf8Bytes(batchNumber));

        return { medicineId, txHash: tx.hash };
    }

    public async isMedicineDispensed(medicineId: string): Promise<boolean> {
        if (!this.pharmalyncCore) return false;
        return await this.pharmalyncCore.isMedicineDispensed(medicineId);
    }

    public async dispenseMedicine(medicineId: string): Promise<string> {
        if (!this.pharmalyncCore) throw new Error('Blockchain service not initialized');
        const tx = await this.pharmalyncCore.dispenseMedicine(medicineId);
        await tx.wait();
        return tx.hash;
    }

    public async verifyAudit(auditId: string): Promise<string> {
        if (!this.pharmalyncAudit) return '';
        try {
            const result = await this.pharmalyncAudit.verifyAudit(auditId);
            return result[1]; // dataHash is at index 1 in the returned tuple
        } catch (error) {
            console.error(`Blockchain audit verification failed for ${auditId}:`, error);
            return '';
        }
    }

    public async logAuditToBlockchain(auditId: string, action: string, dataHash: string, timestamp: Date): Promise<string> {
        if (!this.pharmalyncAudit) return 'OFF_CHAIN';
        const tx = await this.pharmalyncAudit.logAudit(auditId, action, dataHash, Math.floor(timestamp.getTime() / 1000));
        return tx.hash;
    }
}

// Singleton
let instance: BlockchainService | null = null;
export function getBlockchainService(): BlockchainService {
    if (!instance) {
        instance = new BlockchainService();
    }
    return instance;
}
