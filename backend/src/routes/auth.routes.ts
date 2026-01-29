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

const loginSchema = {
    body: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
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
 * POST /api/auth/login
 * Login user
 */
router.post('/login', validateRequest(loginSchema), async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        // Check if user is active
        if (!user.isActive) {
            res.status(403).json({ error: 'Account is deactivated' });
            return;
        }

        // Verify password
        const isValid = await authService.verifyPassword(password, user.passwordHash);

        if (!isValid) {
            res.status(401).json({ error: 'Invalid credentials' });
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
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
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
