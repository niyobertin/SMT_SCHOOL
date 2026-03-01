import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import { NotFoundError } from '../utils/errors';
import { uploadBufferToCloudinary } from '../config/cloudinary';
import { getTenantFilter } from '../middleware/tenant.middleware';
import prisma from '../services/prisma.singleton';

// ============================================
// ORGANIZATION MANAGEMENT
// Extracted from exam.controller.ts — now lives
// at /organizations (not /exams/organizations).
// ============================================

export const createOrganization = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { name, description, logo, contactEmail, contactPhone, location, schoolCode } = req.body;

        const organization = await prisma.organization.create({
            data: {
                id: uuidv4(),
                name,
                description,
                logo,
                contactEmail,
                contactPhone,
                location,
                schoolCode,
                creatorId: req.user.id,
            },
        });

        res.status(201).json({
            status: 'success',
            data: organization,
            message: 'Organization created successfully',
        });
    } catch (error) {
        logger.error(error);
        next(error);
    }
};

export const getOrganizations = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { page = 1, limit = 10, search } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const where: any = getTenantFilter(req);

        if (search) {
            where.AND = where.AND || [];
            where.AND.push({
                OR: [
                    { name: { contains: search as string, mode: 'insensitive' as const } },
                    { description: { contains: search as string, mode: 'insensitive' as const } },
                ],
            });
        }

        const [organizations, total] = await Promise.all([
            prisma.organization.findMany({
                where,
                skip,
                take: Number(limit),
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: { select: { exams: true, candidates: true } },
                },
            }),
            prisma.organization.count({ where }),
        ]);

        res.status(200).json({
            status: 'success',
            data: organizations,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error) {
        logger.error(error);
        next(error);
    }
};

export const getOrganizationById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;
        const orgWhere = getTenantFilter(req, { id });

        const organization = await prisma.organization.findFirst({
            where: orgWhere,
            include: {
                _count: { select: { exams: true, candidates: true } },
            },
        });

        if (!organization) throw new NotFoundError('Organization not found');

        res.status(200).json({ status: 'success', data: organization });
    } catch (error) {
        next(error);
    }
};

export const updateOrganization = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, description, logo, contactEmail, contactPhone, isActive } = req.body;

        const existing = await prisma.organization.findFirst({
            where: getTenantFilter(req, { id }),
        });

        if (!existing) {
            res.status(403).json({
                status: 'error',
                message: 'You do not have access to this organization',
                code: 'ORG_ACCESS_DENIED',
            });
            return;
        }

        const organization = await prisma.organization.update({
            where: { id },
            data: { name, description, logo, contactEmail, contactPhone, isActive },
        });

        res.status(200).json({
            status: 'success',
            data: organization,
            message: 'Organization updated successfully',
        });
    } catch (error) {
        logger.error(error);
        next(error);
    }
};

export const deleteOrganization = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;

        const existing = await prisma.organization.findFirst({
            where: getTenantFilter(req, { id }),
        });

        if (!existing) {
            res.status(403).json({
                status: 'error',
                message: 'You do not have access to this organization',
                code: 'ORG_ACCESS_DENIED',
            });
            return;
        }

        await prisma.organization.delete({ where: { id } });

        res.status(200).json({ status: 'success', message: 'Organization deleted successfully' });
    } catch (error) {
        logger.error(error);
        next(error);
    }
};

export const uploadOrganizationLogo = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;

        const existing = await prisma.organization.findFirst({
            where: getTenantFilter(req, { id }),
        });

        if (!existing) {
            res.status(403).json({
                status: 'error',
                message: 'You do not have access to this organization',
                code: 'ORG_ACCESS_DENIED',
            });
            return;
        }

        if (!req.file) {
            res.status(400).json({ status: 'error', message: 'No file uploaded' });
            return;
        }

        const result = await uploadBufferToCloudinary(
            req.file.buffer,
            req.file.mimetype,
            `org-${id}-logo`
        );

        const organization = await prisma.organization.update({
            where: { id },
            data: { logo: result },
        });

        res.status(200).json({
            status: 'success',
            data: organization,
            message: 'Logo uploaded successfully',
        });
    } catch (error) {
        logger.error(error);
        next(error);
    }
};
