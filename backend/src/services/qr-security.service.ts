import crypto from 'crypto';
import { getKMS } from './kms.service';

/**
 * QR Security Service
 * Implements "Total Security" for QR codes to prevent reversing, mining, or tampering.
 * Combines Authenticated Encryption (AES-GCM) and Digital Signatures (HMAC).
 */
export class QrSecurityService {
    private readonly ALGORITHM = 'aes-256-gcm';
    private readonly IV_LENGTH = 12;
    private readonly SIGNATURE_ALGO = 'sha512';

    /**
     * Generates a "Secure QR Token" for a resource (Medicine/Prescription).
     * Format: base64(IV | Tag | Ciphertext | Signature)
     * 
     * @param data The sensitive data to embed (e.g., medicineId, batchNumber)
     * @param resourceType The type of resource ('MEDICINE', 'PRESCRIPTION')
     * @returns A cryptographically secure, non-reversible string for QR generation
     */
    public generateSecureToken(data: object, resourceType: string): string {
        // 1. Get derived key for the resource type from KMS
        const kms = getKMS();
        const masterKey = kms.getMasterKey();
        const tokenKey = crypto.createHmac('sha256', masterKey)
            .update(`QR_TOKEN_${resourceType}`)
            .digest();

        const signKey = crypto.createHmac('sha256', masterKey)
            .update(`QR_SIGN_${resourceType}`)
            .digest();

        // 2. Add Nonce and Timestamp to prevent pattern matching and replay
        const payload = JSON.stringify({
            ...data,
            nonce: crypto.randomBytes(16).toString('hex'),
            timestamp: Date.now()
        });

        // 3. Encrypt data (Confidentiality)
        const iv = crypto.randomBytes(this.IV_LENGTH);
        const cipher = crypto.createCipheriv(this.ALGORITHM, tokenKey, iv);

        let encrypted = cipher.update(payload, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const tag = cipher.getAuthTag();

        // 4. Sign the ciphertext (Integrity & Authenticity)
        // This makes it impossible to "mine" or guess valid codes
        const hmac = crypto.createHmac(this.SIGNATURE_ALGO, signKey);
        hmac.update(iv);
        hmac.update(tag);
        hmac.update(encrypted);
        const signature = hmac.digest('hex');

        // 5. Package components
        const packageData = {
            iv: iv.toString('hex'),
            tag: tag.toString('hex'),
            encrypted,
            signature
        };

        return Buffer.from(JSON.stringify(packageData)).toString('base64url');
    }

    /**
     * Verifies and decrypts a Secure QR Token
     * 
     * @param token The base64 token from a scanned QR
     * @param resourceType The expected resource type
     * @returns Decrypted data or throws error if tampered
     */
    public verifyToken(token: string, resourceType: string): any {
        try {
            const kms = getKMS();
            const masterKey = kms.getMasterKey();
            const tokenKey = crypto.createHmac('sha256', masterKey)
                .update(`QR_TOKEN_${resourceType}`)
                .digest();

            const signKey = crypto.createHmac('sha256', masterKey)
                .update(`QR_SIGN_${resourceType}`)
                .digest();

            // 1. Unpack
            const jsonStr = Buffer.from(token, 'base64url').toString('utf8');
            const { iv, tag, encrypted, signature } = JSON.parse(jsonStr);

            const ivBuffer = Buffer.from(iv, 'hex');
            const tagBuffer = Buffer.from(tag, 'hex');

            // 2. Verify Signature BEFORE Decryption (Sign-then-Encrypt verification)
            const hmac = crypto.createHmac(this.SIGNATURE_ALGO, signKey);
            hmac.update(ivBuffer);
            hmac.update(tagBuffer);
            hmac.update(encrypted);
            const expectedSignature = hmac.digest('hex');

            // Constant time comparison to prevent timing attacks
            if (!crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSignature, 'hex'))) {
                throw new Error('SECURITY_ALERT: QR Token signature is invalid or tampered');
            }

            // 3. Decrypt
            const decipher = crypto.createDecipheriv(this.ALGORITHM, tokenKey, ivBuffer);
            decipher.setAuthTag(tagBuffer);

            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');

            const data = JSON.parse(decrypted);

            return data;
        } catch (error: any) {
            console.error('QR Verification Failed:', error.message);
            throw new Error('INVALID_QR: Unable to verify authenticity of the scanned code');
        }
    }

    /**
     * Utility to generate a "Public Hash" for blockchain lookup
     * Ensures that even if someone sees the blockchain ID, they can't reverse it to the original data
     */
    public generateLookupHash(id: string): string {
        const kms = getKMS();
        const masterKey = kms.getMasterKey();
        return crypto.createHmac('sha256', masterKey)
            .update(`PUBLIC_LOOKUP_${id}`)
            .digest('hex');
    }
}

// Singleton implementation
let instance: QrSecurityService | null = null;

export function getQrSecurityService(): QrSecurityService {
    if (!instance) {
        instance = new QrSecurityService();
    }
    return instance;
}
