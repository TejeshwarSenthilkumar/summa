import { Router, Request, Response } from 'express';
import { ConsentScope } from '../services/consent.service';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/security.middleware';
import { getConsentService } from '../services/consent.service';
import Joi from 'joi';

const router = Router();
const consentService = getConsentService();

/**
 * Validation schemas
 */
const grantConsentSchema = {
    body: Joi.object({
        patientId: Joi.string().uuid().required(),
        grantedTo: Joi.string().uuid().required(),
        scopes: Joi.array().items(
            Joi.string().valid(...Object.values(ConsentScope))
        ).min(1).required(),
        expiryMinutes: Joi.number().min(1).max(1440).optional() // Max 24 hours
    })
};

const revokeConsentSchema = {
    body: Joi.object({
        consentId: Joi.string().uuid().required()
    })
};

/**
 * POST /api/consent/grant
 * Grant consent to a user for a patient
 * Requires: Authentication
 */
router.post(
    '/grant',
    authenticate,
    validateRequest(grantConsentSchema),
    async (req: Request, res: Response) => {
        try {
            const { patientId, grantedTo, scopes, expiryMinutes = 60 } = req.body;

            // Generate consent token
            const { token, consentId } = await consentService.generateConsentToken(
                patientId,
                grantedTo,
                scopes,
                expiryMinutes
            );

            res.status(201).json({
                message: 'Consent granted successfully',
                consentId,
                token,
                expiresIn: `${expiryMinutes} minutes`,
                scopes
            });
        } catch (error) {
            console.error('Grant consent error:', error);
            res.status(500).json({ error: 'Failed to grant consent' });
        }
    }
);

/**
 * POST /api/consent/revoke
 * Revoke a consent
 * Requires: Authentication
 */
router.post(
    '/revoke',
    authenticate,
    validateRequest(revokeConsentSchema),
    async (req: Request, res: Response) => {
        try {
            const { consentId } = req.body;

            await consentService.revokeConsent(consentId);

            res.json({ message: 'Consent revoked successfully' });
        } catch (error) {
            console.error('Revoke consent error:', error);
            res.status(500).json({ error: 'Failed to revoke consent' });
        }
    }
);

/**
 * GET /api/consent/:patientId
 * Get active consents for a patient
 * Requires: Authentication
 */
router.get(
    '/:patientId',
    authenticate,
    async (req: Request, res: Response) => {
        try {
            const { patientId } = req.params;

            const consents = await consentService.getActiveConsents(patientId);

            res.json({ consents });
        } catch (error) {
            console.error('Get consents error:', error);
            res.status(500).json({ error: 'Failed to retrieve consents' });
        }
    }
);

export default router;
