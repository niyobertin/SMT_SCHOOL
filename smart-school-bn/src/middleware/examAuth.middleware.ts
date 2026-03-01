import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import prisma from '../services/prisma.singleton';
import { hasRemainingAttempts } from '../services/exam.service';

/**
 * Authenticate candidate using JWT token.
 * Token contains candidateId and examId.
 * Sets req.candidate (typed via express.d.ts — no @ts-ignore needed).
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
                status: 'error',
                message: 'Access denied. Please provide a valid token.',
                code: 'TOKEN_MISSING',
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload & {
            candidateId: string;
            examId: string;
        };

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
                status: 'error',
                message: 'Invalid token or candidate not active',
                code: 'TOKEN_INVALID',
            });
        }

        req.candidate = candidate;
        req.examId = decoded.examId;
        next();
    } catch {
        res.status(401).json({
            status: 'error',
            message: 'Invalid or expired token',
            code: 'TOKEN_EXPIRED',
        });
    }
};

/**
 * Validate that candidate has access to the exam.
 */
export const validateExamAccess = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const candidateId = req.candidate?.id;
        const { examId } = req.params;

        if (!candidateId) {
            return res.status(401).json({
                status: 'error',
                message: 'Candidate not authenticated',
                code: 'UNAUTHENTICATED',
            });
        }

        const assignment = await prisma.examAssignment.findUnique({
            where: { candidateId_examId: { candidateId, examId } },
        });

        if (!assignment || !assignment.isActive) {
            return res.status(403).json({
                status: 'error',
                message: 'You are not assigned to this exam',
                code: 'EXAM_ACCESS_DENIED',
            });
        }

        next();
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error validating exam access',
            code: 'INTERNAL_ERROR',
        });
    }
};

/**
 * Check if exam is available (active, published, within date range, has remaining attempts).
 */
export const checkExamAvailability = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { examId } = req.params;

        const exam = await prisma.exam.findUnique({ where: { id: examId } });

        if (!exam) {
            return res.status(404).json({
                status: 'error',
                message: 'Exam not found',
                code: 'NOT_FOUND',
            });
        }

        if (!exam.isActive) {
            return res.status(403).json({
                status: 'error',
                message: 'This exam is not currently active',
                code: 'EXAM_INACTIVE',
            });
        }

        if (exam.status !== 'PUBLISHED') {
            return res.status(403).json({
                status: 'error',
                message: 'This exam is not yet available',
                code: 'EXAM_NOT_PUBLISHED',
            });
        }

        if (exam.startDate && new Date(exam.startDate) > new Date()) {
            return res.status(403).json({
                status: 'error',
                message: 'This exam has not started yet',
                code: 'EXAM_NOT_STARTED',
                startDate: exam.startDate,
            });
        }

        if (exam.endDate && new Date(exam.endDate) < new Date()) {
            return res.status(403).json({
                status: 'error',
                message: 'This exam has ended',
                code: 'EXAM_ENDED',
                endDate: exam.endDate,
            });
        }

        const candidateId = req.candidate?.id;
        if (candidateId) {
            const attemptInfo = await hasRemainingAttempts(candidateId, examId, exam.maxAttempts);
            if (!attemptInfo.hasAttempts) {
                return res.status(403).json({
                    status: 'error',
                    message: `You have reached the maximum number of attempts (${exam.maxAttempts})`,
                    code: 'MAX_ATTEMPTS_REACHED',
                    attemptsUsed: attemptInfo.attemptsUsed,
                    maxAttempts: exam.maxAttempts,
                });
            }
        }

        next();
    } catch {
        res.status(500).json({
            status: 'error',
            message: 'Error checking exam availability',
            code: 'INTERNAL_ERROR',
        });
    }
};

/**
 * Validate exam attempt ownership.
 */
export const validateAttemptOwnership = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const candidateId = req.candidate?.id;
        const { attemptId } = req.params;

        if (!candidateId) {
            return res.status(401).json({
                status: 'error',
                message: 'Candidate not authenticated',
                code: 'UNAUTHENTICATED',
            });
        }

        const attempt = await prisma.examAttempt.findFirst({
            where: { id: attemptId, candidateId },
        });

        if (!attempt) {
            return res.status(404).json({
                status: 'error',
                message: 'Exam attempt not found or you do not have access',
                code: 'NOT_FOUND',
            });
        }

        req.examAttempt = attempt;
        next();
    } catch {
        res.status(500).json({
            status: 'error',
            message: 'Error validating attempt ownership',
            code: 'INTERNAL_ERROR',
        });
    }
};

export default {
    authenticateCandidate,
    validateExamAccess,
    checkExamAvailability,
    validateAttemptOwnership,
};
