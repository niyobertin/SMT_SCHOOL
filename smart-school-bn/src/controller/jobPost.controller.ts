import { PrismaClient, Prisma } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import CronJob from "node-cron";
import { uploadBufferToCloudinary } from "../config/cloudinary";
const prisma = new PrismaClient();

// ================== CRUD CONTROLLERS ==================

// Create a new job post
export const createJobPost = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const jobPostData = req.body;
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const companylogoFile = files?.["companyLogo"]?.[0];
        const companylogo = await uploadBufferToCloudinary(companylogoFile.buffer, companylogoFile.mimetype, companylogoFile.originalname);

        const jobPost = await prisma.jobPost.create({
            data: {
                ...jobPostData,
                companylogo: companylogo || null,
                slug: jobPostData.title.toLowerCase().replace(/\s/g, "-"),
                isActive: true,
            },
        });

        res.status(201).json({
            status: "success",
            data: jobPost,
        });
    } catch (error) {
        logger.error("Error creating job post:", error);
        next(error);
    }
};

// Get all active job posts
export const getAllJobPosts = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const query = req.query.q as string || "";
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const jobPosts = await prisma.jobPost.findMany({
            where: { isActive: true, title: { contains: query, mode: "insensitive" } },
            orderBy: { createdAt: "desc" },
            take: limit,
            skip: startIndex,
        });

        const total = await prisma.jobPost.count({
            where: { isActive: true, title: { contains: query, mode: "insensitive" } },
        });
        const totalPages = Math.ceil(total / limit);
        res.status(200).json({
            status: "success",
            pagination: {
                page,
                limit,
                total,
                totalPages,
            },
            data: jobPosts,
        });
    } catch (error) {
        logger.error("Error fetching job posts:", error);
        next(error);
    }
};

// Get job post by ID
export const getJobPostById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { slug } = req.params;

        const jobPost = await prisma.jobPost.findUnique({
            where: { slug },
        });

        if (!jobPost || !jobPost.isActive) {
            res.status(404).json({
                status: "error",
                message: "Job post not found",
            });
            return;
        }

        res.status(200).json({
            status: "success",
            data: jobPost,
        });
    } catch (error) {
        logger.error("Error fetching job post:", error);
        next(error);
    }
};

// Update job post
export const updateJobPost = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { slug } = req.params;
        const updateData = req.body;
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const companylogoFile = files?.["companylogo"]?.[0];
        const companylogo = await uploadBufferToCloudinary(companylogoFile.buffer, companylogoFile.mimetype, companylogoFile.originalname);
        const existingJobPost = await prisma.jobPost.findUnique({ where: { slug } });
        if (!existingJobPost) {
            res.status(404).json({
                status: "error",
                message: "Job post not found",
            });
            return;
        }
        // Prevent certain fields from being updated
        const { id: _, createdAt, updatedAt, ...safeUpdateData } = updateData;

        const updatedJobPost = await prisma.jobPost.update({
            where: { slug },
            data: {
                ...safeUpdateData,
                slug: updateData.title.toLowerCase().replace(/\s/g, "-"),
                companylogo: companylogo || null,
                updatedAt: new Date(),
            },
        });

        res.status(200).json({
            status: "success",
            data: updatedJobPost,
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                res.status(404).json({
                    status: "error",
                    message: "Job post not found",
                });
                return;
            }
        }
        logger.error("Error updating job post:", error);
        next(error);
    }
};

// Soft delete (deactivate) or hard delete
export const deleteJobPost = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { slug } = req.params;
        const { hardDelete } = req.query;

        if (hardDelete === "true") {
            await prisma.jobPost.delete({
                where: { slug },
            });
        } else {
            await prisma.jobPost.update({
                where: { slug },
                data: {
                    isActive: false,
                    updatedAt: new Date(),
                },
            });
        }

        res.status(204).json({
            status: "success",
            data: null,
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                res.status(404).json({
                    status: "error",
                    message: "Job post not found",
                });
                return;
            }
        }
        logger.error("Error deleting job post:", error);
        next(error);
    }
};

// Deactivate expired job posts
export const getExpiredJobPosts = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const now = new Date();
        const result = await prisma.jobPost.updateMany({
            where: {
                dueDate: { lt: now },
                isActive: true,
            },
            data: {
                isActive: false,
                updatedAt: now,
            },
        });

        res.status(200).json({
            status: "success",
            message: `Successfully deactivated ${result.count} expired job posts`,
        });
    } catch (error) {
        logger.error("Error cleaning up expired job posts:", error);
        next(error);
    }
};

// ================== CRON JOB ==================
export const jobPostCronJob = CronJob.schedule(
    "0 0 * * *", // Midnight daily
    async () => {
        logger.info("Cron job: Running job post cleanup");
        try {
            const now = new Date();
            const result = await prisma.jobPost.deleteMany({
                where: {
                    dueDate: { lt: now },
                    isActive: true,
                },
            });
            logger.info(`Cron job: Deleted ${result.count} expired job posts`);
        } catch (error) {
            console.error("Error in job post cleanup cron job:", error);
        }
    },
    { timezone: "Africa/Kigali" }
);
