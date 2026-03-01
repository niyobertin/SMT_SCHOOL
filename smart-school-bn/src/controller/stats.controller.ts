import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import prisma from "../services/prisma.singleton";
import { getTenantFilter } from '../middleware/tenant.middleware';

/**
 * Unified Stats Controller
 * Consolidates metrics from LMS and Exam modules.
 */

export const getUnifiedDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { context, organizationId } = req.query;
        const ctx = String(context || 'all').toLowerCase();

        const [lms, exams] = await Promise.all([
            getLMSStats(req),
            getExamStats(req, String(organizationId))
        ]);

        let data: any = {};
        if (ctx === 'lms') data = { lms: lms.lms };
        else if (ctx === 'exam') data = { exams: exams.exams };
        else {
            data = {
                summary: {
                    totalUsers: lms.lms.counters.users,
                    totalCandidates: exams.exams.counters.candidates,
                    totalAssessments: lms.lms.counters.tests + exams.exams.counters.total,
                    totalAttempts: lms.lms.counters.testAttempts + exams.exams.counters.attempts,
                },
                lms: lms.lms,
                exams: exams.exams
            };
        }

        res.json({ status: "success", context: ctx, data });
    } catch (error) {
        next(error);
    }
};

async function getLMSStats(req: Request) {
    const [stats, logs] = await Promise.all([
        prisma.$transaction([
            prisma.user.count(),
            prisma.course.count(),
            prisma.lesson.count(),
            prisma.enrollment.count(),
            prisma.test.count(),
            prisma.testAttempt.count(),
        ]),
        prisma.activityLog.findMany({
            orderBy: { createdAt: "desc" },
            take: 5,
            include: { user: { select: { username: true, role: true } } },
        })
    ]);

    return {
        lms: {
            counters: {
                users: stats[0],
                courses: stats[1],
                lessons: stats[2],
                enrollments: stats[3],
                tests: stats[4],
                testAttempts: stats[5],
            },
            recentLogs: logs
        }
    };
}

async function getExamStats(req: Request, organizationId?: string) {
    let whereOrg: any = {};
    if (organizationId && organizationId !== 'undefined') {
        whereOrg = { organizationId: organizationId };
    } else {
        const tenantFilter = getTenantFilter(req);
        if (tenantFilter.organizationId) {
            whereOrg = { organizationId: tenantFilter.organizationId };
        }
    }

    const [totalExams, totalCandidates, totalAttempts, recentActivity] = await Promise.all([
        prisma.exam.count({ where: whereOrg }),
        prisma.candidate.count({ where: whereOrg }),
        prisma.examAttempt.count({ where: whereOrg }),
        prisma.examAttempt.findMany({
            where: whereOrg,
            take: 5,
            orderBy: { startTime: 'desc' },
            include: {
                candidate: { select: { firstName: true, lastName: true } },
                exam: { select: { title: true } }
            }
        })
    ]);

    return {
        exams: {
            counters: {
                total: totalExams,
                candidates: totalCandidates,
                attempts: totalAttempts
            },
            recentActivity
        }
    };
}
