import { Request, Response, NextFunction } from 'express';

/**
 * Unified Middleware to extract and validate the organization context (multi-tenancy).
 * Attaches req.organizationId to the request.
 */
export const tenantContext = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user as any;

        // Resolve org ID from header, params, or user assignment
        let orgId =
            (req.header('x-organization-id') as string | undefined) ||
            req.params.organizationId ||
            req.params.orgId;

        // Guest access (optional auth routes)
        if (!user) {
            if (orgId) req.organizationId = orgId;
            return next();
        }

        // Super Admin: can see everything or switch to a specific org
        if (user.role === 'SUPER_ADMIN') {
            if (orgId) req.organizationId = orgId;
            return next();
        }

        // All other roles: must belong to an org
        const userOrgIds = user.userOrganizations?.map((uo) => uo.organizationId) ?? [];

        if (userOrgIds.length === 0) {
            return res.status(403).json({
                status: 'error',
                message: 'Access denied. User is not assigned to any organization.',
                code: 'USER_NOT_ASSIGNED_TO_ORG',
            });
        }

        // Validate the requested org against the user's assigned orgs
        if (orgId) {
            if (!userOrgIds.includes(orgId)) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Access denied. You do not have access to this organization.',
                    code: 'ORG_ACCESS_DENIED',
                });
            }
        } else {
            // Default to the first assigned organization
            orgId = userOrgIds[0];
        }

        req.organizationId = orgId;
        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Ensures organizationId is present — use after tenantContext when org context is mandatory.
 */
export const requireTenant = (req: Request, res: Response, next: NextFunction) => {
    if (!req.organizationId) {
        return res.status(400).json({
            status: 'error',
            message: 'Organization context is missing. Please provide x-organization-id header.',
            code: 'TENANT_CONTEXT_MISSING',
        });
    }
    next();
};

/**
 * Helper to apply organization filtering to Prisma queries.
 * SUPER_ADMIN: no filter (accesses all).
 * Others: restricted to req.organizationId.
 */
export const getTenantFilter = (req: Request, baseWhere: Record<string, any> = {}) => {
    const user = req.user as any;
    const orgId = req.organizationId;

    if (!user || user.role === 'SUPER_ADMIN') return baseWhere;

    return { ...baseWhere, organizationId: orgId };
};
