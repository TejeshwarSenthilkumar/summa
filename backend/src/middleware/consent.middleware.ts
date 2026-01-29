import { Request, Response, NextFunction } from 'express';
import { getConsentService, ConsentScope } from '../services/consent.service';

const consentService = getConsentService();

/**
 * Consent Verification Middleware
 * Requires valid consent token with specified scopes
 */
export function requireConsent(...requiredScopes: ConsentScope[]) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Extract consent token from header
            const consentToken = req.headers['x-consent-token'] as string;

            if (!consentToken) {
                res.status(403).json({
                    error: 'Consent required',
                    message: 'This action requires patient consent. Please provide a valid consent token.'
                });
                return;
            }

            // Verify consent token
            const verification = await consentService.verifyConsentToken(
                consentToken,
                requiredScopes
            );

            if (!verification.valid) {
                res.status(403).json({
                    error: 'Invalid consent',
                    message: verification.error
                });
                return;
            }

            // Attach consent info to request
            (req as any).consent = {
                consentId: verification.consentId,
                patientId: verification.patientId,
                grantedTo: verification.grantedTo,
                scopes: verification.scopes
            };

            next();
        } catch (error) {
            res.status(500).json({ error: 'Consent verification failed' });
        }
    };
}

/**
 * Check if user has consent for patient
 * Alternative to token-based consent (checks database directly)
 */
export function requirePatientConsent(...requiredScopes: ConsentScope[]) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Not authenticated' });
                return;
            }

            const patientId = req.params.patientId || req.params.id;

            if (!patientId) {
                res.status(400).json({ error: 'Patient ID required' });
                return;
            }

            // Check if user has active consent
            const hasConsent = await consentService.checkConsent(
                patientId,
                req.user.userId,
                requiredScopes
            );

            if (!hasConsent) {
                res.status(403).json({
                    error: 'Consent required',
                    message: `You do not have consent to perform this action on this patient. Required scopes: ${requiredScopes.join(', ')}`
                });
                return;
            }

            next();
        } catch (error) {
            res.status(500).json({ error: 'Consent check failed' });
        }
    };
}
