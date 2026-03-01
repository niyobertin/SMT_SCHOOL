import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import { getTenantFilter } from "../middleware/tenant.middleware";
import prisma from "../services/prisma.singleton";
import { logger } from "../utils/logger";

export const createLesson = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const courseId = req.params.courseId;
        const { title, description, order } = req.body;
        const organizationId = req.organizationId!;

        const course = await prisma.course.findFirst({
            where: { id: courseId, organizationId },
        });

        if (!course) {
            res.status(404).json({
                success: false,
                error: { message: "Course not found or access denied" }
            });
            return;
        }
        const lesson = await prisma.lesson.create({
            data: {
                id: uuidv4(),
                title,
                description,
                courseId,
                order,
            },
            include: {
                course: true,
                content: true,
                userProgress: true,
            },
        });
        logger.info("Lesson created successfully", { lessonId: lesson.id });
        res.status(201).json({
            success: true,
            data: lesson,
        });
    } catch (error) {
        next(error);
    }
};
export const getLessons = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const courseId = req.params.courseId;
        const organizationId = req.organizationId!;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const course = await prisma.course.findFirst({
            where: { id: courseId, organizationId },
        });
        if (!course) {
            res.status(404).json({
                success: false,
                error: { message: "Course not found or access denied" }
            });
            return;
        }
        const lessons = await prisma.lesson.findMany({
            where: { courseId: course.id },
            include: {
                course: true,
                content: true,
                userProgress: true,
            },
            skip,
            take: limit,
            orderBy: { order: "asc" },
        });
        const total = await prisma.lesson.count({
            where: { courseId: course.id },
        });
        const totalPages = Math.ceil(total / limit);
        logger.info("Lessons retrieved successfully", { courseId });
        res.status(200).json({
            success: true,
            data: {
                lessons,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

export const getSingleLesson = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        console.log("This is the testing and why the function is not being called");
        const lessonId = req.params.id;
        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
            include: {
                course: true,
                content: true,
                userProgress: true,
            },
        });
        if (!lesson) {
            res.status(404).json({
                success: false,
                error: { message: "Lesson not found or access denied" }
            });
            return;
        }
        logger.info("Lesson retrieved successfully", { lessonId });
        res.status(200).json({
            success: true,
            data: lesson,
        });
    } catch (error) {
        next(error);
    }
};

export const updateLesson = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const lessonId = req.params.lessonId;
        const lessonData = req.body;
        const organizationId = req.organizationId!;

        const lesson = await prisma.lesson.findFirst({
            where: {
                id: lessonId,
                course: { organizationId }
            },
        });
        if (!lesson) {
            res.status(404).json({
                success: false,
                error: { message: "Lesson not found or access denied" }
            });
            return;
        }
        const updatedLesson = await prisma.lesson.update({
            where: { id: lessonId },
            data: lessonData,
        });
        logger.info("Lesson updated successfully", { lessonId });
        res.status(200).json({
            success: true,
            data: updatedLesson,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteLesson = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const lessonId = req.params.lessonId;
        const organizationId = req.organizationId!;

        const lesson = await prisma.lesson.findFirst({
            where: {
                id: lessonId,
                course: { organizationId }
            },
        });
        if (!lesson) {
            res.status(404).json({
                success: false,
                error: { message: "Lesson not found or access denied" }
            });
            return;
        }
        const deletedLesson = await prisma.lesson.delete({
            where: { id: lessonId },
        });
        logger.info("Lesson deleted successfully", { lessonId });
        res.status(200).json({
            success: true,
            data: deletedLesson,
        });
    } catch (error) {
        next(error);
    }
};

