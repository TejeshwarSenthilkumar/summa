import crypto from 'crypto';
import { getKMS } from './kms.service';

/**
 * PII Encryption Service
 * Encrypts personally identifiable information using AES-256-GCM
 */
export class EncryptionService {
    private kms = getKMS();

    /**
     * Encrypt PII data using AES-256-GCM with per-user key derivation
     * Storage format: [IV(16) | AuthTag(16) | Ciphertext]
     * 
     * @param data - Plain text data to encrypt
     * @param userId - User ID for key derivation (optional, uses master key if not provided)
     */
    encryptPII(data: string, userId?: string): Buffer {
        if (!data) {
            throw new Error('Data to encrypt cannot be empty');
        }

        // Derive user-specific key or use master key
        const key = userId
            ? this.kms.deriveUserKey(userId)
            : this.kms.getMasterKey();

        // Generate random 16-byte IV
        const iv = crypto.randomBytes(16);

        // Create cipher
        const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

        // Encrypt
        const encrypted = Buffer.concat([
            cipher.update(data, 'utf-8'),
            cipher.final()
        ]);

        // Get auth tag (16 bytes)
        const authTag = cipher.getAuthTag();

        // Combine: IV | AuthTag | Ciphertext
        return Buffer.concat([iv, authTag, encrypted]);
    }

    /**
     * Decrypt PII data using AES-256-GCM
     * 
     * @param encryptedBuffer - Encrypted buffer in format [IV | AuthTag | Ciphertext]
     * @param userId - User ID for key derivation (optional, uses master key if not provided)
     */
    decryptPII(encryptedBuffer: Buffer, userId?: string): string {
        if (encryptedBuffer.length < 32) {
            throw new Error('Invalid encrypted buffer');
        }

        // Derive user-specific key or use master key
        const key = userId
            ? this.kms.deriveUserKey(userId)
            : this.kms.getMasterKey();

        // Extract components
        const iv = encryptedBuffer.subarray(0, 16);
        const authTag = encryptedBuffer.subarray(16, 32);
        const ciphertext = encryptedBuffer.subarray(32);

        // Create decipher
        const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);

        // Set auth tag for verification
        decipher.setAuthTag(authTag);

        try {
            // Decrypt and verify
            const decrypted = Buffer.concat([
                decipher.update(ciphertext),
                decipher.final()
            ]);

            return decrypted.toString('utf-8');
        } catch (error) {
            throw new Error('Decryption failed. Data may be corrupted or tampered with.');
        }
    }

    /**
     * Encrypt multiple PII fields
     */
    encryptFields(fields: Record<string, string>, userId?: string): Record<string, Buffer> {
        const encrypted: Record<string, Buffer> = {};

        for (const [key, value] of Object.entries(fields)) {
            if (value) {
                encrypted[key] = this.encryptPII(value, userId);
            }
        }

        return encrypted;
    }

    /**
     * Decrypt multiple PII fields
     */
    decryptFields(fields: Record<string, Buffer>, userId?: string): Record<string, string> {
        const decrypted: Record<string, string> = {};

        for (const [key, value] of Object.entries(fields)) {
            if (value) {
                decrypted[key] = this.decryptPII(value, userId);
            }
        }

        return decrypted;
    }

    /**
     * Generate a secure random token (for session tokens, etc.)
     */
    generateSecureToken(length: number = 32): string {
        return crypto.randomBytes(length).toString('hex');
    }

    /**
     * Hash data using SHA-256 (for non-reversible hashing)
     */
    hash(data: string): string {
        return crypto.createHash('sha256').update(data).digest('hex');
    }
}

// Singleton instance
let encryptionServiceInstance: EncryptionService | null = null;

export function getEncryptionService(): EncryptionService {
    if (!encryptionServiceInstance) {
        encryptionServiceInstance = new EncryptionService();
    }
    return encryptionServiceInstance;
}
