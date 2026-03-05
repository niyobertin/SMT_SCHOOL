import { Request, Response, NextFunction } from 'express';
import { User } from '../types';

/**
 * Middleware to ensure user has access to a specific school
 * Used when school ID is in route params (e.g., /schools/:schoolId/...)
 */
export const requireSchoolAccess = (schoolIdParam: string = 'schoolId') => {
    return (req: Request, res: Response, next: NextFunction) => {
        // @ts-ignore
        const user = req.user as any; // Using any for now to avoid complexity with custom types
        const requestedSchoolId = req.params[schoolIdParam];

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Super Admin and Admin users have access to all schools
        if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') {
            return next();
        }

        // For INSTRUCTOR and other roles, check school assignment
        const userSchoolIds = user.schoolStaff?.map((ss: any) => ss.schoolId) || [];

        // Add student's own school ID if applicable
        const studentSchoolId = (req as any).schoolId;
        if (studentSchoolId) {
            userSchoolIds.push(studentSchoolId);
        }

        if (!userSchoolIds.includes(requestedSchoolId)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You do not have access to this school.'
            });
        }

        return next();
    };
};

/**
 * Get school IDs that the current user has access to
 * Returns all school IDs for admins, assigned schools for staff
 */
export const getUserSchoolIds = (req: Request): string[] | null => {
    // @ts-ignore
    const user = req.user as any;

    if (!user) {
        return null;
    }

    // Super Admin and Admin users have access to all schools (return null to indicate "all")
    if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') {
        return null;
    }

    // Return assigned schools
    const schoolIds = user.schoolStaff?.map((ss: any) => ss.schoolId) || [];

    // Include student's school if applicable
    const studentSchoolId = (req as any).schoolId;
    if (studentSchoolId) {
        schoolIds.push(studentSchoolId);
    }

    return schoolIds;
};

/**
 * Apply school filter to Prisma query
 * Usage: const where = applySchoolFilter(req, { ... });
 */
export const applySchoolFilter = (req: Request, baseWhere: any = {}) => {
    const schoolIds = getUserSchoolIds(req);

    // If null (admin), no filter needed
    if (schoolIds === null) {
        return baseWhere;
    }

    // If empty array, user has no schools (shouldn't see anything)
    if (schoolIds.length === 0) {
        return {
            ...baseWhere,
            schoolId: 'NONE' // This will match nothing
        };
    }

    // Filter to user's schools
    return {
        ...baseWhere,
        schoolId: {
            in: schoolIds
        }
    };
};
