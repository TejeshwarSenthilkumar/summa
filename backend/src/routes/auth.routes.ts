import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { getAuthService } from '../services/auth.service';
import { validateRequest } from '../middleware/security.middleware';
import Joi from 'joi';

const router = Router();
const prisma = new PrismaClient();
const authService = getAuthService();

/**
 * Validation schemas
 */
const registerSchema = {
    body: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required(),
        role: Joi.string().valid('ADMIN', 'NURSE', 'STAFF', 'PHARMACY').required()
    })
};

const sendOtpSchema = {
    body: Joi.object({
        identifier: Joi.string().required(),
        role: Joi.string().valid('PATIENT', 'DOCTOR', 'PHARMACY', 'NURSE', 'STAFF').required()
    })
};

const verifyOtpSchema = {
    body: Joi.object({
        identifier: Joi.string().required(),
        otp: Joi.string().length(6).required(),
        role: Joi.string().valid('PATIENT', 'DOCTOR', 'PHARMACY', 'NURSE', 'STAFF').required()
    })
};

const refreshSchema = {
    body: Joi.object({
        refreshToken: Joi.string().required()
    })
};

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', validateRequest(registerSchema), async (req: Request, res: Response) => {
    try {
        const { email, password, role } = req.body;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            res.status(409).json({ error: 'User already exists' });
            return;
        }

        // Hash password
        const passwordHash = await authService.hashPassword(password);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                role
            }
        });

        // Generate tokens
        const tokens = authService.generateTokenPair({
            id: user.id,
            email: user.email,
            role: user.role
        });

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            },
            ...tokens
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

/**
 * POST /api/auth/send-otp
 * Send OTP to user (Mock)
 */
router.post('/send-otp', validateRequest(sendOtpSchema), async (req: Request, res: Response) => {
    try {
        const { identifier, role } = req.body;

        // Find user by email OR phone
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: identifier },
                    { phoneNumber: identifier }
                ],
                role: role as any
            }
        });

        // In a real system, we'd send an SMS/Email here.
        // If the user doesn't exist, we still return "success" to prevent user enumeration,
        // but for this MVP/Demo, we want to know if it works.
        if (!user && role !== 'PATIENT') {
            res.status(404).json({ error: 'User not found in registry' });
            return;
        }

        console.log(`[AUTH] OTP 123456 generated for ${identifier} (${role})`);

        res.json({
            message: 'OTP sent successfully',
            demoOtp: '123456'
        });
    } catch (error) {
        console.error('OTP Send error:', error);
        res.status(500).json({ error: 'Failed to send OTP' });
    }
});

/**
 * POST /api/auth/verify-otp
 * Verify OTP and login
 */
router.post('/verify-otp', validateRequest(verifyOtpSchema), async (req: Request, res: Response) => {
    try {
        const { identifier, otp, role } = req.body;

        // Mock OTP check
        if (otp !== '123456') {
            res.status(401).json({ error: 'Invalid OTP' });
            return;
        }

        // Find user
        let user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: identifier },
                    { phoneNumber: identifier }
                ],
                role: role as any
            }
        });

        // Auto-create patient if not exists (Lazy registration)
        if (!user && role === 'PATIENT') {
            user = await prisma.user.create({
                data: {
                    email: identifier.includes('@') ? identifier : `${identifier}@pharmalync.local`,
                    phoneNumber: identifier.includes('@') ? null : identifier,
                    role: 'PATIENT' as any,
                    passwordHash: 'otp-user', // Filler
                    isActive: true
                }
            });
        }

        if (!user) {
            res.status(401).json({ error: 'User not authorized for this role' });
            return;
        }

        // Generate tokens
        const tokens = authService.generateTokenPair({
            id: user.id,
            email: user.email,
            role: user.role
        });

        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            },
            ...tokens
        });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ error: 'Verification failed' });
    }
});

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
router.post('/refresh', validateRequest(refreshSchema), async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;

        // Verify refresh token
        const decoded = authService.verifyRefreshToken(refreshToken);

        // Get user
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId }
        });

        if (!user || !user.isActive) {
            res.status(401).json({ error: 'Invalid refresh token' });
            return;
        }

        // Generate new access token
        const accessToken = authService.generateAccessToken({
            userId: user.id,
            email: user.email,
            role: user.role
        });

        res.json({
            accessToken
        });
    } catch (error: any) {
        if (error.message === 'Refresh token expired') {
            res.status(401).json({ error: 'Refresh token expired. Please login again.' });
        } else {
            res.status(401).json({ error: 'Invalid refresh token' });
        }
    }
});

/**
 * POST /api/auth/logout
 * Logout user (client should delete tokens)
 */
router.post('/logout', (_req: Request, res: Response) => {
    // In a stateless JWT system, logout is handled client-side
    // For production, consider implementing token blacklisting
    res.json({ message: 'Logout successful' });
});

export default router;
