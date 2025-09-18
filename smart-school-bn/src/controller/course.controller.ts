import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { uploadBufferToCloudinary } from "../config/cloudinary";
const prisma = new PrismaClient();

export const createCourse = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const courseData = req.body;
        //@ts-ignore
        const userId = req.user?.id;
        const categoryId = req.params.categoryId;
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };

        const category = await prisma.category.findUnique({
            where: { id: categoryId },
        });
        if (!category) {
            res.status(404).json({
                status: "error",
                message: "Category not found",
            });
            return;
        }
        const existingCourse = await prisma.course.findUnique({
            where: { slug: courseData.title.toLowerCase().replace(/\s/g, "-") },
        });
        if (existingCourse) {
            res.status(409).json({
                status: "error",
                message: "Course already exists",
            });
            return;
        }
        const thumbnailFile = files?.["thumbnail"]?.[0];
        const thumbnail = await uploadBufferToCloudinary(thumbnailFile.buffer, thumbnailFile.mimetype, thumbnailFile.originalname);
        const course = await prisma.course.create({
            data: {
                ...courseData,
                id: uuidv4(),
                slug: courseData.title.toLowerCase().replace(/\s/g, "-"),
                instructor: {
                    connect: {
                        id: userId,
                    },
                },
                category: {
                    connect: {
                        id: categoryId,
                    },
                },
                thumbnail,
                status: courseData.status,
                isPublished: Boolean(courseData.isPublished),
                isFeatured: Boolean(courseData.isFeatured),
                tags: courseData.tags,
                requirements: courseData.requirements,
                objectives: courseData.objectives,
            },
            include: {
                instructor: true,
                category: true,
            },
        });
        logger.info("Course created successfully", { courseId: course.id });
        res.status(201).json({
            status: "success",
            message: "Course created successfully",
            data: course,
        });
    } catch (error) {
        next(error);
    }
};
export const getCouses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const query = req.query.q as string || "";
        const courses = await prisma.course.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                instructor: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true,
                        role: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phoneNumber: true
                    },
                },
                category: true,
                lessons: true,
                enrollments: true,
                reviews: true,
                tests: true,
                certificates: true,
            },
            take: limit,
            skip: startIndex,
            where: {
                title: {
                    contains: query,
                    mode: "insensitive",
                },
                category: {
                    id: req.query.categoryId as string,
                },
            },
        });
        const total = await prisma.course.count({
            where: {
                title: {
                    contains: query,
                    mode: "insensitive",
                },
            },
        });
        const totalPages = Math.ceil(total / limit);
        res.status(200).json({
            status: "success",
            message: "Courses retrieved successfully",
            data: {
                courses: courses,
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

export const getCourseById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const id = req.params.id;
        const course = await prisma.course.findUnique({
            where: { id },
            include: {
                instructor: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true,
                        role: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phoneNumber: true
                    },
                },
                category: true,
                lessons: true,
                enrollments: true,
                reviews: true,
                tests: true,
                certificates: true,
            },
        });
        if (!course) {
            res.status(404).json({
                status: "error",
                message: "Course not found",
            });
            return;
        }
        res.status(200).json({
            status: "success",
            message: "Course retrieved successfully",
            data: course,
        });
    } catch (error) {
        next(error);
    }
};

export const getCourseByCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const categoryId = req.params.categoryId;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const query = req.query.q as string || "";
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const courses = await prisma.course.findMany({
            where: { category: { id: categoryId }, title: { contains: query, mode: "insensitive" } },
            take: limit,
            skip: startIndex,
            include: {
                instructor: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true,
                        role: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phoneNumber: true
                    },
                },
                category: true,
                lessons: true,
                enrollments: true,
                reviews: true,
                tests: true,
                certificates: true,
            },
        });
        const total = courses.length;
        const totalPages = Math.ceil(total / limit);
        if (!courses) {
            res.status(404).json({
                status: "error",
                message: "Courses not found",
            });
            return;
        }
        res.status(200).json({
            status: "success",
            message: "Courses retrieved successfully",
            data: {
                courses,
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

export const updateCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const id = req.params.id;
        const courseData = req.body;
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const course = await prisma.course.findUnique({
            where: { id },
        });
        if (!course) {
            res.status(404).json({
                status: "error",
                message: "Course not found",
            });
            return;
        }
        let thumbnail: string | undefined;
        const thumbnailFile = files?.thumbnail?.[0];
        if (thumbnailFile) {
            thumbnail = await uploadBufferToCloudinary(
                thumbnailFile.buffer,
                thumbnailFile.mimetype,
                thumbnailFile.originalname
            );
        }

        const updatedCourse = await prisma.course.update({
            where: { id },
            data: {
                ...courseData,
                isPublished: Boolean(courseData.isPublished),
                isFeatured: Boolean(courseData.isFeatured),
                ...(thumbnail && { thumbnail })
            },
        });
        res.status(200).json({
            status: "success",
            message: "Course updated successfully",
            data: updatedCourse,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const id = req.params.id;
        const course = await prisma.course.findUnique({
            where: { id },
        });
        if (!course) {
            res.status(404).json({
                status: "error",
                message: "Course not found",
            });
            return;
        }
        await prisma.course.delete({
            where: { id },
        });
        logger.info("Course deleted successfully", { courseId: id });
        res.status(200).json({
            status: "success",
            message: "Course deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};