import crypto from 'crypto';

/**
 * Generate secure encryption keys for PharmaLync
 */
function generateKeys(): void {
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║   PharmaLync Security Key Generator       ║');
    console.log('╚════════════════════════════════════════════╝\n');

    // Generate 256-bit (32-byte) encryption key
    const encryptionKey = crypto.randomBytes(32).toString('hex');
    console.log('🔐 ENCRYPTION_KEY (256-bit):');
    console.log(encryptionKey);
    console.log('');

    // Generate JWT secrets (64 bytes for extra security)
    const jwtAccessSecret = crypto.randomBytes(64).toString('hex');
    console.log('🔑 JWT_ACCESS_SECRET:');
    console.log(jwtAccessSecret);
    console.log('');

    const jwtRefreshSecret = crypto.randomBytes(64).toString('hex');
    console.log('🔑 JWT_REFRESH_SECRET:');
    console.log(jwtRefreshSecret);
    console.log('');

    const consentTokenSecret = crypto.randomBytes(64).toString('hex');
    console.log('🔑 CONSENT_TOKEN_SECRET:');
    console.log(consentTokenSecret);
    console.log('');

    console.log('✓ Keys generated successfully!');
    console.log('\n⚠️  IMPORTANT: Store these keys securely in your .env file');
    console.log('⚠️  NEVER commit these keys to version control');
    console.log('⚠️  Use different keys for production and development\n');

    // Generate .env template
    console.log('📄 Copy this to your .env file:\n');
    console.log('# Encryption Keys');
    console.log(`ENCRYPTION_KEY="${encryptionKey}"`);
    console.log('');
    console.log('# JWT Secrets');
    console.log(`JWT_ACCESS_SECRET="${jwtAccessSecret}"`);
    console.log(`JWT_REFRESH_SECRET="${jwtRefreshSecret}"`);
    console.log(`CONSENT_TOKEN_SECRET="${consentTokenSecret}"`);
    console.log('');
}

// Run the generator
generateKeys();
