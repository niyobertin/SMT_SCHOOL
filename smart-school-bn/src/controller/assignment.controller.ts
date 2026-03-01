import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import prisma from "../services/prisma.singleton";

export const createAssignment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { lessonId } = req.params;
        const { title, description, maxPoints, dueDate } = req.body;
        const organizationId = (req as any).organizationId!;

        const lesson = await prisma.lesson.findFirst({
            where: {
                id: lessonId,
                course: { organizationId }
            }
        });

        if (!lesson) {
            return res.status(404).json({
                success: false,
                error: { message: "Lesson not found or access denied" }
            });
        }

        const assignment = await prisma.assignment.create({
            data: {
                id: uuidv4(),
                title,
                description,
                maxPoints: maxPoints ? Number(maxPoints) : 100,
                dueDate: dueDate ? new Date(dueDate) : null,
                lessonId,
                organizationId
            }
        });

        res.status(201).json({ success: true, data: assignment });
    } catch (error) {
        next(error);
    }
};

export const getAssignmentsByLesson = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { lessonId } = req.params;
        const organizationId = (req as any).organizationId!;

        const assignments = await prisma.assignment.findMany({
            where: { lessonId, organizationId },
            include: { _count: { select: { submissions: true } } }
        });

        res.status(200).json({ success: true, data: assignments });
    } catch (error) {
        next(error);
    }
};

export const updateAssignment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { title, description, maxPoints, dueDate } = req.body;
        const organizationId = (req as any).organizationId!;

        const assignment = await prisma.assignment.findFirst({
            where: { id, organizationId }
        });

        if (!assignment) {
            return res.status(404).json({
                success: false,
                error: { message: "Assignment not found or access denied" }
            });
        }

        const updatedAssignment = await prisma.assignment.update({
            where: { id },
            data: {
                title,
                description,
                maxPoints: maxPoints ? Number(maxPoints) : undefined,
                dueDate: dueDate ? new Date(dueDate) : undefined
            }
        });

        res.status(200).json({ success: true, data: updatedAssignment });
    } catch (error) {
        next(error);
    }
};

export const deleteAssignment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const organizationId = (req as any).organizationId!;

        const assignment = await prisma.assignment.findFirst({
            where: { id, organizationId }
        });

        if (!assignment) {
            return res.status(404).json({
                success: false,
                error: { message: "Assignment not found or access denied" }
            });
        }

        await prisma.assignment.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
