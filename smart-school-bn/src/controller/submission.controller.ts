import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import prisma from "../services/prisma.singleton";

export const submitAssignment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { assignmentId } = req.params;
        const { content, fileUrl } = req.body;
        const studentId = (req.user as any)?.id;

        if (!studentId) {
            return res.status(401).json({ success: false, error: { message: "Unauthorized" } });
        }

        const assignment = await prisma.assignment.findUnique({
            where: { id: assignmentId },
            include: { lesson: { select: { courseId: true } } }
        });

        if (!assignment) {
            return res.status(404).json({ success: false, error: { message: "Assignment not found" } });
        }

        const enrollment = await prisma.enrollment.findUnique({
            where: { userId_courseId: { userId: studentId, courseId: assignment.lesson.courseId } }
        });

        if (!enrollment) {
            return res.status(403).json({ success: false, error: { message: "Not enrolled in this course" } });
        }

        const submission = await prisma.assignmentSubmission.upsert({
            where: {
                studentId_assignmentId: {
                    studentId,
                    assignmentId
                }
            },
            update: {
                content,
                fileUrl,
                submittedAt: new Date()
            },
            create: {
                id: uuidv4(),
                studentId,
                assignmentId,
                content,
                fileUrl
            }
        });

        res.status(200).json({ success: true, data: submission });
    } catch (error) {
        next(error);
    }
};

export const getSubmissionsByAssignment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { assignmentId } = req.params;
        const organizationId = (req as any).organizationId!;

        const assignment = await prisma.assignment.findFirst({
            where: { id: assignmentId, organizationId }
        });

        if (!assignment) {
            return res.status(404).json({
                success: false,
                error: { message: "Assignment not found or access denied" }
            });
        }

        const submissions = await prisma.assignmentSubmission.findMany({
            where: { assignmentId },
            include: {
                student: { select: { firstName: true, lastName: true, email: true } }
            }
        });

        res.status(200).json({ success: true, data: submissions });
    } catch (error) {
        next(error);
    }
};

export const gradeSubmission = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { submissionId } = req.params;
        const { points, feedback } = req.body;
        const gradedById = (req.user as any)?.id;

        const submission = await prisma.assignmentSubmission.findUnique({
            where: { id: submissionId },
            include: { assignment: true }
        });

        if (!submission) {
            return res.status(404).json({ success: false, error: { message: "Submission not found" } });
        }

        // Verify gradedBy has access to the organization
        const organizationId = (req as any).organizationId!;
        if (submission.assignment.organizationId !== organizationId) {
            return res.status(403).json({ success: false, error: { message: "Access denied" } });
        }

        const updatedSubmission = await prisma.assignmentSubmission.update({
            where: { id: submissionId },
            data: {
                points: points ? Number(points) : undefined,
                feedback,
                gradedById,
                gradedAt: new Date()
            }
        });

        res.status(200).json({ success: true, data: updatedSubmission });
    } catch (error) {
        next(error);
    }
};
