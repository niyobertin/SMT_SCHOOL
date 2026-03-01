import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getTenantFilter } from '../middleware/tenant.middleware';
import prisma from '../services/prisma.singleton';

export const createGradingPolicy = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, description, pointsJson } = req.body;
        const organizationId = req.organizationId!;

        const policy = await prisma.gradingPolicy.create({
            data: {
                id: uuidv4(),
                name,
                description,
                pointsJson,
                organizationId
            }
        });
        res.status(201).json({ success: true, data: policy });
    } catch (error) {
        next(error);
    }
};

export const getGradingPolicies = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const where = getTenantFilter(req);
        const policies = await prisma.gradingPolicy.findMany({
            where
        });
        res.status(200).json({ success: true, data: policies });
    } catch (error) {
        next(error);
    }
};

export const updateGradingPolicy = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { name, description, pointsJson, isActive } = req.body;
        const organizationId = req.organizationId!;

        const policy = await prisma.gradingPolicy.update({
            where: { id, organizationId },
            data: { name, description, pointsJson, isActive }
        });
        res.status(200).json({ success: true, data: policy });
    } catch (error) {
        next(error);
    }
};

export const deleteGradingPolicy = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const organizationId = req.organizationId!;

        await prisma.gradingPolicy.delete({
            where: { id, organizationId }
        });
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
