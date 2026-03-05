import { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma";
import { logger } from "../utils/logger";

export const studentPortalController = {
    async listAvailableTests(req: Request, res: Response, next: NextFunction) {
        try {
            const studentId = req.studentId!;
            const { academicYearId } = req.query;
            logger.info(">>>> AvailableTests API HIT <<<<", { studentId, academicYearId });

            if (!academicYearId) {
                logger.warn("AvailableTests: Missing academicYearId");
                return res.status(400).json({
                    status: "error",
                    message: "academicYearId is required",
                });
            }

            // 1. Find the student's class for THIS specific academic year
            const classEnrollment = await prisma.studentClassEnrollment.findUnique({
                where: {
                    studentId_academicYearId: {
                        studentId: studentId,
                        academicYearId: academicYearId as string,
                    }
                }
            });

            const effectiveClassId = classEnrollment?.classId;
            logger.info("AvailableTests: Class found", { effectiveClassId });

            // 2. Find all courses assigned to this student or their class
            const assignments = await prisma.courseAssignment.findMany({
                where: {
                    OR: [
                        { studentId: studentId },
                        effectiveClassId ? { classId: effectiveClassId } : null,
                    ].filter((item): item is any => item !== null),
                },
                select: { courseId: true },
            });

            logger.info(`AvailableTests: Assignments found: ${assignments.length}`, {
                courseIds: assignments.map(a => a.courseId)
            });

            // 3. Find all courses the student is explicitly enrolled in
            const enrollments = await prisma.studentEnrollment.findMany({
                where: { studentId: studentId },
                select: { courseId: true },
            });

            logger.info(`AvailableTests: Enrollments found: ${enrollments.length}`, {
                courseIds: enrollments.map(e => e.courseId)
            });

            const courseIds = Array.from(new Set([
                ...assignments.map(a => a.courseId),
                ...enrollments.map(e => e.courseId)
            ]));

            logger.info("AvailableTests: Final Course IDs for tests:", { courseIds });

            // 4. Fetch active tests for these courses
            const tests = await prisma.test.findMany({
                where: {
                    courseId: { in: courseIds },
                    isActive: true,
                },
                include: {
                    course: {
                        select: {
                            id: true,
                            title: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
            });

            logger.info(`AvailableTests: Tests found in DB: ${tests.length}`);

            // 5. Get academic year details for the response
            const academicYear = await prisma.academicYear.findUnique({
                where: { id: academicYearId as string },
                select: { id: true, year: true },
            });

            // Format for frontend
            const formattedTests = tests.map(test => ({
                id: test.id,
                title: test.title,
                description: test.description,
                duration: test.duration || 0,
                totalQuestions: 0, // We could count questions if needed
                type: test.type,
                course: {
                    id: test.course.id,
                    name: test.course.title,
                },
                academicYear: academicYear || { id: academicYearId as string, year: "Unknown" },
            }));

            // Optional: Count questions for each test
            const testsWithCounts = await Promise.all(formattedTests.map(async (test) => {
                const count = await prisma.question.count({
                    where: { testId: test.id, isActive: true }
                });
                return { ...test, totalQuestions: count };
            }));

            return res.status(200).json({
                status: "success",
                data: testsWithCounts,
            });
        } catch (error) {
            logger.error("Error listing available tests", error);
            next(error);
        }
    }
};
