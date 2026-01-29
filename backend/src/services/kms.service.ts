import crypto from 'crypto';

/**
 * Key Management Service (KMS)
 * Handles master key validation, per-user key derivation, and key rotation
 */
export class KeyManagementService {
    private masterKey: Buffer;

    constructor() {
        const keyHex = process.env.ENCRYPTION_KEY;

        if (!keyHex) {
            throw new Error('ENCRYPTION_KEY environment variable is not set');
        }

        // Validate key format: must be 64 hex characters (256 bits)
        if (!/^[0-9a-fA-F]{64}$/.test(keyHex)) {
            throw new Error('ENCRYPTION_KEY must be a 64-character hexadecimal string (256 bits)');
        }

        this.masterKey = Buffer.from(keyHex, 'hex');
    }

    /**
     * Get the master encryption key
     */
    getMasterKey(): Buffer {
        return this.masterKey;
    }

    /**
     * Derive a user-specific key using HKDF-SHA256
     * @param userId - User ID for key derivation
     * @param info - Context information (default: 'pharmalync-user-key')
     */
    deriveUserKey(userId: string, info: string = 'pharmalync-user-key'): Buffer {
        const salt = Buffer.from(userId, 'utf-8');
        const infoBuffer = Buffer.from(info, 'utf-8');

        // HKDF-SHA256: Extract
        const prk = crypto.createHmac('sha256', salt)
            .update(this.masterKey)
            .digest();

        // HKDF-SHA256: Expand
        const okm = crypto.createHmac('sha256', prk)
            .update(Buffer.concat([infoBuffer, Buffer.from([0x01])]))
            .digest();

        return okm;
    }

    /**
     * Rotate master key (for future KMS integration)
     * This is a placeholder for AWS KMS or similar services
     */
    async rotateKey(): Promise<void> {
        // TODO: Implement key rotation with KMS
        // For production: integrate with AWS KMS, Azure Key Vault, or Google Cloud KMS
        throw new Error('Key rotation not yet implemented. Use KMS for production.');
    }

    /**
     * Validate environment configuration
     */
    static validateConfig(): void {
        const requiredVars = [
            'ENCRYPTION_KEY',
            'JWT_ACCESS_SECRET',
            'JWT_REFRESH_SECRET',
            'CONSENT_TOKEN_SECRET'
        ];

        const missing = requiredVars.filter(v => !process.env[v]);

        if (missing.length > 0) {
            throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
        }
    }
}

// Singleton instance
let kmsInstance: KeyManagementService | null = null;

export function getKMS(): KeyManagementService {
    if (!kmsInstance) {
        kmsInstance = new KeyManagementService();
    }
    return kmsInstance;
}
