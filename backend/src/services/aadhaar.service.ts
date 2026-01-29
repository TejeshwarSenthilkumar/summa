import crypto from 'crypto';
import { getKMS } from './kms.service';

/**
 * Three-Layer Aadhaar Security Service
 * Layer 1: Tokenization (HMAC-SHA256)
 * Layer 2: Encryption (AES-256-GCM)
 * Layer 3: Hashing (SHA-256)
 */
export class AadhaarService {
    private kms = getKMS();

    /**
     * Validate Aadhaar format (exactly 12 digits)
     */
    validateAadhaarFormat(aadhaar: string): boolean {
        return /^\d{12}$/.test(aadhaar);
    }

    /**
     * Layer 1: Tokenize Aadhaar using HMAC-SHA256
     * Converts 12-digit Aadhaar into a deterministic 16-character hex token
     */
    private tokenizeAadhaar(aadhaar: string): string {
        if (!this.validateAadhaarFormat(aadhaar)) {
            throw new Error('Invalid Aadhaar format. Must be exactly 12 digits.');
        }

        const hmac = crypto.createHmac('sha256', this.kms.getMasterKey());
        hmac.update(aadhaar);
        const token = hmac.digest('hex').substring(0, 32); // 16 bytes = 32 hex chars

        return token;
    }

    /**
     * Layer 2: Encrypt tokenized Aadhaar using AES-256-GCM
     * Returns: [IV(16) | AuthTag(16) | Ciphertext]
     */
    encryptAadhaar(aadhaar: string): Buffer {
        const token = this.tokenizeAadhaar(aadhaar);

        // Generate random 16-byte IV
        const iv = crypto.randomBytes(16);

        // Create cipher
        const cipher = crypto.createCipheriv(
            'aes-256-gcm',
            this.kms.getMasterKey(),
            iv
        );

        // Encrypt
        const encrypted = Buffer.concat([
            cipher.update(token, 'utf-8'),
            cipher.final()
        ]);

        // Get auth tag (16 bytes)
        const authTag = cipher.getAuthTag();

        // Combine: IV | AuthTag | Ciphertext
        return Buffer.concat([iv, authTag, encrypted]);
    }

    /**
     * Layer 3: Hash the token (not raw Aadhaar) for lookups
     * Uses SHA-256 for deterministic hashing
     */
    hashAadhaar(aadhaar: string): string {
        const token = this.tokenizeAadhaar(aadhaar);
        return crypto.createHash('sha256').update(token).digest('hex');
    }

    /**
     * Decrypt Aadhaar from encrypted buffer
     * Reverses Layer 2 encryption
     */
    decryptAadhaar(encryptedBuffer: Buffer): string {
        if (encryptedBuffer.length < 32) {
            throw new Error('Invalid encrypted Aadhaar buffer');
        }

        // Extract components
        const iv = encryptedBuffer.subarray(0, 16);
        const authTag = encryptedBuffer.subarray(16, 32);
        const ciphertext = encryptedBuffer.subarray(32);

        // Create decipher
        const decipher = crypto.createDecipheriv(
            'aes-256-gcm',
            this.kms.getMasterKey(),
            iv
        );

        // Set auth tag
        decipher.setAuthTag(authTag);

        // Decrypt
        const decrypted = Buffer.concat([
            decipher.update(ciphertext),
            decipher.final()
        ]);

        // Return the token (not the original Aadhaar)
        // Note: Original Aadhaar cannot be recovered from token (one-way HMAC)
        return decrypted.toString('utf-8');
    }

    /**
     * Complete encryption flow for storage
     * Returns both encrypted buffer and hash for database
     */
    encryptForStorage(aadhaar: string): {
        encrypted: Buffer;
        hash: string;
    } {
        return {
            encrypted: this.encryptAadhaar(aadhaar),
            hash: this.hashAadhaar(aadhaar)
        };
    }

    /**
     * Verify Aadhaar against stored hash (for lookups)
     */
    verifyAadhaarHash(aadhaar: string, storedHash: string): boolean {
        const computedHash = this.hashAadhaar(aadhaar);
        return crypto.timingSafeEqual(
            Buffer.from(computedHash),
            Buffer.from(storedHash)
        );
    }
}

// Singleton instance
let aadhaarServiceInstance: AadhaarService | null = null;

export function getAadhaarService(): AadhaarService {
    if (!aadhaarServiceInstance) {
        aadhaarServiceInstance = new AadhaarService();
    }
    return aadhaarServiceInstance;
}
