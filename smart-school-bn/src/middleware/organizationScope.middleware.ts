import { User } from '../types';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to ensure user has access to a specific organization
 * Used when organization ID is in route params (e.g., /organizations/:orgId/...)
 */
export const requireOrganizationAccess = (orgIdParam: string = 'orgId') => {
    return (req: Request, res: Response, next: NextFunction) => {
        // @ts-ignore
        const user = req.user as User;
        const requestedOrgId = req.params[orgIdParam];

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Admin users have access to all organizations
        if (user.role === 'ADMIN') {
            return next();
        }

        // For EXAMINER and INSTRUCTOR roles, check organization assignment
        if (user.role === 'EXAMINER' || user.role === 'INSTRUCTOR') {
            const userOrgIds = user.userOrganizations?.map((uo: any) => uo.organizationId) || [];

            if (!userOrgIds.includes(requestedOrgId)) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. You do not have access to this organization.'
                });
            }

            return next();
        }

        // Other roles don't have organization access
        return res.status(403).json({
            success: false,
            message: 'Access denied. Insufficient permissions.'
        });
    };
};

/**
 * Get organization IDs that the current user has access to
 * Returns all organization IDs for admins, assigned organizations for examiners
 */
export const getUserOrganizationIds = (req: Request): string[] | null => {
    // @ts-ignore
    const user = req.user as User;

    if (!user) {
        return null;
    }

    // Admin users have access to all organizations (return null to indicate "all")
    if (user.role === 'ADMIN') {
        return null;
    }

    // For EXAMINER and INSTRUCTOR roles, return their assigned organizations
    if (user.role === 'EXAMINER' || user.role === 'INSTRUCTOR') {
        return user.userOrganizations?.map((uo: any) => uo.organizationId) || [];
    }

    return [];
};

/**
 * Apply organization filter to Prisma query
 * Usage: const where = applyOrganizationFilter(req, { /* other conditions */ ;
export const applyOrganizationFilter = (req: Request, baseWhere: any = {}) => {
    const orgIds = getUserOrganizationIds(req);

    // If null (admin), no filter needed
    if (orgIds === null) {
        return baseWhere;
    }

    // If empty array, user has no organizations (shouldn't see anything)
    if (orgIds.length === 0) {
        return {
            ...baseWhere,
            organizationId: 'NONE' // This will match nothing
        };
    }

    // Filter to user's organizations
    return {
        ...baseWhere,
        organizationId: {
            in: orgIds
        }
    };
};
