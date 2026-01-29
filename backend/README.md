# PharmaLync Backend

Secure healthcare platform backend with comprehensive encryption, blockchain integration, and RBAC.

## Features

- ✅ **Three-Layer Aadhaar Encryption**: Tokenization (HMAC-SHA256) → AES-256-GCM → SHA-256 hashing
- ✅ **PII Encryption**: AES-256-GCM with per-user key derivation (HKDF-SHA256)
- ✅ **Password Security**: PBKDF2-SHA512 with 10,000 iterations
- ✅ **JWT Authentication**: Access tokens (15 min) + Refresh tokens (7 days)
- ✅ **RBAC**: 4 roles (ADMIN, NURSE, STAFF, PHARMACY)
- ✅ **Consent Management**: Time-bound, scope-limited JWT tokens
- ✅ **Two-Tier Audit Logging**: Local database + Blockchain (Sepolia)
- ✅ **Blockchain Integration**: Medicine registry with double-dispensing prevention
- ✅ **Security Middleware**: Helmet, CORS, rate limiting, input validation

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL + Prisma ORM
- **Blockchain**: Ethereum (Sepolia) + ethers.js
- **Encryption**: Node.js crypto module
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Joi

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Generate Encryption Keys

```bash
npm run generate:keys
```

Copy the generated keys to your `.env` file.

### 3. Configure Environment

Update `.env` with:
- Database connection string
- Generated encryption keys
- Blockchain RPC URL (Infura/Alchemy)
- Blockchain private key
- Contract addresses (after deployment)

### 4. Setup Database

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio
npm run prisma:studio
```

### 5. Deploy Smart Contracts

**Note**: Requires Hardhat or Foundry for Solidity compilation.

```bash
# Install Hardhat
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @openzeppelin/contracts

# Initialize Hardhat
npx hardhat init

# Copy contracts to Hardhat contracts folder
# Compile contracts
npx hardhat compile

# Deploy (update script with compiled bytecode first)
npm run deploy:contracts
```

Update `.env` with deployed contract addresses.

### 6. Start Server

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout

### Patients
- `POST /api/patients` - Create patient (ADMIN)
- `GET /api/patients` - List patients (ADMIN, NURSE)
- `GET /api/patients/:id` - Get patient (ADMIN, NURSE)
- `GET /api/patients/:id/aadhaar` - View Aadhaar (requires consent)
- `PUT /api/patients/:id` - Update patient (ADMIN)
- `DELETE /api/patients/:id` - Delete patient (ADMIN)

### Consent
- `POST /api/consent/grant` - Grant consent
- `POST /api/consent/revoke` - Revoke consent
- `GET /api/consent/:patientId` - Get active consents

### Audit
- `GET /api/audit/logs` - Query audit logs (ADMIN)
- `GET /api/audit/logs/:id` - Get audit log (ADMIN)
- `GET /api/audit/verify/:id` - Verify audit integrity (ADMIN)

### Medicines
- `POST /api/medicines` - Register medicine (PHARMACY, ADMIN)
- `GET /api/medicines` - List medicines
- `GET /api/medicines/:id` - Get medicine
- `POST /api/medicines/:id/dispense` - Dispense medicine (PHARMACY)

## Security Features

### Aadhaar Protection
1. **Tokenization**: HMAC-SHA256 with master key
2. **Encryption**: AES-256-GCM with random IV and auth tag
3. **Hashing**: SHA-256 for database lookups
4. **Storage**: `[IV(16) | AuthTag(16) | Ciphertext]`

### PII Encryption
- Algorithm: AES-256-GCM
- Key derivation: HKDF-SHA256 per user
- Random IV per encryption
- Auth tag verification

### Password Security
- Algorithm: PBKDF2-SHA512
- Iterations: 10,000
- Salt: 16 bytes (random)
- Output: 64 bytes
- Comparison: Constant-time

### JWT Tokens
- Access: 15 min expiry, HS256
- Refresh: 7 day expiry, HS256
- Consent: 60 min expiry, HS256
- Separate secrets for each type

### Audit Logging
- **Tier 1**: PostgreSQL with indexed queries
- **Tier 2**: Blockchain for critical actions
- **Critical Actions**: VIEW_AADHAAR, CREATE_PATIENT, UPDATE_PATIENT, MEDICINE_DISPENSE, PRESCRIPTION_CREATE
- **Blockchain Storage**: Hash-only (no PII)

## Compliance

- ✅ **UIDAI**: Encrypted Aadhaar, tokenized, consent-based access
- ✅ **DPDP Act**: Least privilege, data minimization, encryption at rest
- ✅ **HIPAA-like**: Encryption, RBAC, audit trails, integrity checks

## Development

```bash
# Run in development mode
npm run dev

# Build for production
npm run build

# Run tests (when implemented)
npm test

# Prisma commands
npm run prisma:generate  # Generate client
npm run prisma:migrate   # Run migrations
npm run prisma:studio    # Open Prisma Studio
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Use production database
3. Deploy smart contracts to mainnet (or keep on Sepolia for testing)
4. Use AWS KMS or similar for key management
5. Enable HTTPS
6. Configure proper CORS origins
7. Set up monitoring and logging
8. Implement token blacklisting for logout
9. Regular security audits

## License

MIT
