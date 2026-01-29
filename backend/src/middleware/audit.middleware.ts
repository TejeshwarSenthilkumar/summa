import { Request, Response, NextFunction } from 'express';
import { getAuditService } from '../services/audit.service';

const auditService = getAuditService();

/**
 * Audit Logging Middleware
 * Automatically logs actions to audit trail
 */
export function auditLog(action: string, resourceType?: string) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        // Store original json method
        const originalJson = res.json.bind(res);

        // Override json method to log after successful response
        res.json = function (body: any) {
            // Only log on successful responses (2xx status codes)
            if (res.statusCode >= 200 && res.statusCode < 300) {
                // Log audit asynchronously (non-blocking)
                const userId = req.user?.userId || 'anonymous';
                const resourceId = req.params.id || req.params.patientId || body?.id;
                const detectedResourceType = resourceType || req.baseUrl.split('/').pop() || 'unknown';

                auditService.logAudit({
                    userId,
                    action,
                    resourceType: detectedResourceType,
                    resourceId,
                    metadata: {
                        method: req.method,
                        path: req.path,
                        ip: req.ip,
                        userAgent: req.headers['user-agent']
                    }
                }).catch(error => {
                    console.error('Audit logging failed:', error);
                });
            }

            return originalJson(body);
        };

        next();
    };
}

/**
 * Audit middleware that logs before the action
 * Useful for actions that might fail
 */
export function auditLogBefore(action: string, resourceType?: string) {
    return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.userId || 'anonymous';
            const resourceId = req.params.id || req.params.patientId;
            const detectedResourceType = resourceType || req.baseUrl.split('/').pop() || 'unknown';

            await auditService.logAudit({
                userId,
                action,
                resourceType: detectedResourceType,
                resourceId,
                metadata: {
                    method: req.method,
                    path: req.path,
                    ip: req.ip,
                    userAgent: req.headers['user-agent']
                }
            });

            next();
        } catch (error) {
            console.error('Audit logging failed:', error);
            // Don't block the request if audit logging fails
            next();
        }
    };
}
