import { Request, Response, NextFunction } from 'express';
import { getAuthService } from '../services/auth.service';
import { UserRole } from '@prisma/client';

// Extend Express Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                email: string;
                role: UserRole;
            };
        }
    }
}

const authService = getAuthService();

/**
 * Authentication Middleware
 * Verifies JWT access token and attaches user to request
 */
export async function authenticate(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'No token provided' });
            return;
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token
        const decoded = authService.verifyAccessToken(token);

        // Attach user to request
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role as UserRole
        };

        next();
    } catch (error: any) {
        if (error.message === 'Token expired') {
            res.status(401).json({ error: 'Token expired' });
        } else if (error.message === 'Invalid token') {
            res.status(401).json({ error: 'Invalid token' });
        } else {
            res.status(401).json({ error: 'Authentication failed' });
        }
    }
}

/**
 * Authorization Middleware (RBAC)
 * Requires specific roles to access the route
 */
export function requireRole(...allowedRoles: UserRole[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({
                error: 'Forbidden',
                message: `This action requires one of the following roles: ${allowedRoles.join(', ')}`
            });
            return;
        }

        next();
    };
}

/**
 * Optional authentication middleware
 * Attaches user if token is present, but doesn't require it
 */
export function optionalAuth(
    req: Request,
    _res: Response,
    next: NextFunction
): void {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (token) {
            const decoded = authService.verifyAccessToken(token);

            req.user = {
                userId: decoded.userId,
                email: decoded.email,
                role: decoded.role as UserRole
            };
        }

        next();
    } catch (error) {
        // Ignore errors for optional auth
        next();
    }
}
