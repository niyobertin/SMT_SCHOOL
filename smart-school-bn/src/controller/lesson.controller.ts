import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();
export const createLesson = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const courseId = req.params.courseId;
        const { title, description, order } = req.body;
        const course = await prisma.course.findUnique({
            where: { id: courseId },
        });
        if (!course) {
            res.status(404).json({
                status: "error",
                message: "Course not found",
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
            status: "success",
            message: "Lesson created successfully",
            data: lesson,
        });
    } catch (error) {
        next(error);
    }
};
export const getLessons = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const courseId = req.params.courseId;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;
        const course = await prisma.course.findUnique({
            where: { id: courseId },
        });
        if (!course) {
            res.status(404).json({
                status: "error",
                message: "Course not found",
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
            status: "success",
            message: "Lessons retrieved successfully",
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
                status: "error",
                message: "Lesson not found",
            });
            return;
        }
        logger.info("Lesson retrieved successfully", { lessonId });
        res.status(200).json({
            status: "success",
            message: "Lesson retrieved successfully",
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
        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
        });
        if (!lesson) {
            res.status(404).json({
                status: "error",
                message: "Lesson not found",
            });
            return;
        }
        const updatedLesson = await prisma.lesson.update({
            where: { id: lessonId },
            data: lessonData,
        });
        logger.info("Lesson updated successfully", { lessonId });
        res.status(200).json({
            status: "success",
            message: "Lesson updated successfully",
            data: updatedLesson,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteLesson = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const lessonId = req.params.lessonId;
        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
        });
        if (!lesson) {
            res.status(404).json({
                status: "error",
                message: "Lesson not found",
            });
            return;
        }
        const deletedLesson = await prisma.lesson.delete({
            where: { id: lessonId },
        });
        logger.info("Lesson deleted successfully", { lessonId });
        res.status(200).json({
            status: "success",
            message: "Lesson deleted successfully",
            data: deletedLesson,
        });
    } catch (error) {
        next(error);
    }
};

