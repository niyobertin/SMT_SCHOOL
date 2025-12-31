import jwt, { JwtPayload } from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import { hasRemainingAttempts } from '../services/exam.service';

const prisma = new PrismaClient();

/**
 * Authenticate candidate using JWT token
 * Token contains candidateId and examId
 */
export const authenticateCandidate = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Please provide a valid token.',
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload & {
            candidateId: string;
            examId: string;
        };

        // Validate candidate exists and is active
        const candidate = await prisma.candidate.findUnique({
            where: { id: decoded.candidateId },
            select: {
                id: true,
                candidateId: true,
                firstName: true,
                lastName: true,
                email: true,
                isActive: true,
                organizationId: true,
            },
        });

        if (!candidate || !candidate.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token or candidate not active',
            });
        }

        // Attach candidate and examId to request
        // @ts-ignore
        req.candidate = candidate;
        // @ts-ignore
        req.examId = decoded.examId;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid or expired token',
        });
    }
};

/**
 * Validate that candidate has access to the exam
 */
export const validateExamAccess = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // @ts-ignore
        const candidateId = req.candidate?.id;
        const { examId } = req.params;

        if (!candidateId) {
            return res.status(401).json({
                success: false,
                message: 'Candidate not authenticated',
            });
        }

        // Check if exam is assigned to candidate
        const assignment = await prisma.examAssignment.findUnique({
            where: {
                candidateId_examId: {
                    candidateId,
                    examId,
                },
            },
        });

        if (!assignment || !assignment.isActive) {
            return res.status(403).json({
                success: false,
                message: 'You are not assigned to this exam',
            });
        }

        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error validating exam access',
        });
    }
};

/**
 * Check if exam is available for taking
 */
export const checkExamAvailability = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { examId } = req.params;

        const exam = await prisma.exam.findUnique({
            where: { id: examId },
        });

        if (!exam) {
            return res.status(404).json({
                success: false,
                message: 'Exam not found',
            });
        }

        // Check if exam is active
        if (!exam.isActive) {
            return res.status(403).json({
                success: false,
                message: 'This exam is not currently active',
            });
        }

        // Check if exam is published
        if (exam.status !== 'PUBLISHED') {
            return res.status(403).json({
                success: false,
                message: 'This exam is not yet available',
            });
        }

        // Check start date
        if (exam.startDate && new Date(exam.startDate) > new Date()) {
            return res.status(403).json({
                success: false,
                message: 'This exam has not started yet',
                startDate: exam.startDate,
            });
        }

        // Check end date
        if (exam.endDate && new Date(exam.endDate) < new Date()) {
            return res.status(403).json({
                success: false,
                message: 'This exam has ended',
                endDate: exam.endDate,
            });
        }

        // Check remaining attempts
        // @ts-ignore
        const candidateId = req.candidate?.id;
        if (candidateId) {
            const attemptInfo = await hasRemainingAttempts(
                candidateId,
                examId,
                exam.maxAttempts
            );

            if (!attemptInfo.hasAttempts) {
                return res.status(403).json({
                    success: false,
                    message: `You have reached the maximum number of attempts (${exam.maxAttempts})`,
                    attemptsUsed: attemptInfo.attemptsUsed,
                    maxAttempts: exam.maxAttempts,
                });
            }
        }

        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error checking exam availability',
        });
    }
};

/**
 * Validate exam attempt ownership
 */
export const validateAttemptOwnership = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // @ts-ignore
        const candidateId = req.candidate?.id;
        const { attemptId } = req.params;

        if (!candidateId) {
            return res.status(401).json({
                success: false,
                message: 'Candidate not authenticated',
            });
        }

        const attempt = await prisma.examAttempt.findFirst({
            where: {
                id: attemptId,
                candidateId,
            },
        });

        if (!attempt) {
            return res.status(404).json({
                success: false,
                message: 'Exam attempt not found or you do not have access',
            });
        }

        // @ts-ignore
        req.examAttempt = attempt;
        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error validating attempt ownership',
        });
    }
};

export default {
    authenticateCandidate,
    validateExamAccess,
    checkExamAvailability,
    validateAttemptOwnership,
};
