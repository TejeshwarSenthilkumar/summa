import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env vars from backend/.env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

const PBKDF2_ITERATIONS = 10000;
const SALT_LENGTH = 16;
const HASH_LENGTH = 64;

async function hashPassword(password: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const salt = crypto.randomBytes(SALT_LENGTH);
        crypto.pbkdf2(
            password,
            salt,
            PBKDF2_ITERATIONS,
            HASH_LENGTH,
            'sha512',
            (err, derivedKey) => {
                if (err) reject(err);
                const hash = derivedKey.toString('hex');
                const saltHex = salt.toString('hex');
                resolve(`${saltHex}:${hash}`);
            }
        );
    });
}

async function main() {
    const email = 'doctor@pharmalync.com';
    const password = 'Doctor@123';
    const phoneNumber = '9876543210';

    console.log(`Creating doctor account for ${email}...`);

    try {
        const passwordHash = await hashPassword(password);

        const user = await prisma.user.upsert({
            where: { email },
            update: {
                role: 'DOCTOR' as any,
                passwordHash,
                phoneNumber
            },
            create: {
                email,
                passwordHash,
                phoneNumber,
                role: 'DOCTOR' as any,
                isActive: true
            }
        });

        console.log('Successfully created/updated doctor account:');
        console.log(`Email: ${user.email}`);
        console.log(`Phone: ${user.phoneNumber}`);
        console.log(`Role: ${user.role}`);
        console.log(`Login Password: ${password}`);
    } catch (error) {
        console.error('Error creating doctor account:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
