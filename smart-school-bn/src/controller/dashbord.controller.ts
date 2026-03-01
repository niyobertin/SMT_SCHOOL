import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import prisma from "../services/prisma.singleton";

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const stats = await prisma.$transaction([
            prisma.user.count(),
            prisma.course.count(),
            prisma.lesson.count(),
            prisma.enrollment.count(),
            prisma.payment.count(),
            prisma.test.count(),
            prisma.question.count(),
            prisma.testAttempt.count(),
        ]);
        const logs = await prisma.activityLog.findMany({
            orderBy: {
                createdAt: "desc",
            },
            include: {
                user: {
                    select: {
                        username: true,
                        role: true,
                    },
                },
            },
        });
        const revenueTrend = await prisma.payment.findMany({
            where: {
                createdAt: {
                    gte: new Date(new Date().setDate(new Date().getDate() - 7)),
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        res.json({
            status: "success",
            data: {
                users: stats[0],
                courses: stats[1],
                lessons: stats[2],
                enrollments: stats[3],
                payments: stats[4],
                tests: stats[5],
                questions: stats[6],
                testAttempts: stats[7],
                logs,
                revenueTrend,
            },
        });
    } catch (error) {
        logger.error("Failed to get dashboard stats", error);
        next(error);
    }
};
