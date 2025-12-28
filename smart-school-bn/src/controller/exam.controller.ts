import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';
import { NotFoundError } from '../utils/errors';
import {
    generateExamCode,
    generateCandidateId,
    isExamAvailable,
    hasRemainingAttempts,
    autoGradeAnswer,
    calculateExamScore,
    calculateExamStatistics,
    calculateQuestionStatistics,
} from '../services/exam.service';

const prisma = new PrismaClient();

// ============================================
// ORGANIZATION MANAGEMENT
// ============================================

export const createOrganization = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { name, description, logo, contactEmail, contactPhone } = req.body;

        const organization = await prisma.organization.create({
            data: {
                id: uuidv4(),
                name,
                description,
                logo,
                contactEmail,
                contactPhone,
            },
        });

        res.status(201).json({
            status: 'success',
            data: organization,
            message: 'Organization created successfully',
        });
    } catch (error) {
        logger.error(error);
        next(error);
    }
};

export const getOrganizations = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { page = 1, limit = 10, search } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const where = search
            ? {
                OR: [
                    { name: { contains: search as string, mode: 'insensitive' as const } },
                    { description: { contains: search as string, mode: 'insensitive' as const } },
                ],
            }
            : {};

        const [organizations, total] = await Promise.all([
            prisma.organization.findMany({
                where,
                skip,
                take: Number(limit),
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: {
                            exams: true,
                            candidates: true,
                        },
                    },
                },
            }),
            prisma.organization.count({ where }),
        ]);

        res.status(200).json({
            status: 'success',
            data: organizations,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error) {
        logger.error(error);
        next(error);
    }
};

export const getOrganizationById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;

        const organization = await prisma.organization.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        exams: true,
                        candidates: true,
                    },
                },
            },
        });

        if (!organization) {
            throw new NotFoundError('Organization not found');
        }

        res.status(200).json({
            status: 'success',
            data: organization,
        });
    } catch (error) {
        next(error);
    }
};

export const updateOrganization = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, description, logo, contactEmail, contactPhone, isActive } = req.body;

        const organization = await prisma.organization.update({
            where: { id },
            data: {
                name,
                description,
                logo,
                contactEmail,
                contactPhone,
                isActive,
            },
        });

        res.status(200).json({
            status: 'success',
            data: organization,
            message: 'Organization updated successfully',
        });
    } catch (error) {
        logger.error(error);
        next(error);
    }
};

export const deleteOrganization = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;

        await prisma.organization.delete({
            where: { id },
        });

        res.status(200).json({
            status: 'success',
            message: 'Organization deleted successfully',
        });
    } catch (error) {
        logger.error(error);
        next(error);
    }
};

// ============================================
// CANDIDATE MANAGEMENT
// ============================================

export const createCandidate = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { orgId } = req.params;
        const { firstName, lastName, email, phoneNumber } = req.body;

        const candidateIdGenerated = await generateCandidateId(orgId);

        const candidate = await prisma.candidate.create({
            data: {
                id: uuidv4(),
                candidateId: candidateIdGenerated,
                firstName,
                lastName,
                email,
                phoneNumber,
                organizationId: orgId,
            },
        });

        res.status(201).json({
            status: 'success',
            data: candidate,
            message: 'Candidate created successfully',
        });
    } catch (error) {
        logger.error(error);
        next(error);
    }
};

export const getCandidates = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { orgId } = req.params;
        const { page = 1, limit = 10, search } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const where: any = { organizationId: orgId };

        if (search) {
            where.OR = [
                { firstName: { contains: search as string, mode: 'insensitive' as const } },
                { lastName: { contains: search as string, mode: 'insensitive' as const } },
                { candidateId: { contains: search as string, mode: 'insensitive' as const } },
                { email: { contains: search as string, mode: 'insensitive' as const } },
            ];
        }

        const [candidates, total] = await Promise.all([
            prisma.candidate.findMany({
                where,
                skip,
                take: Number(limit),
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: {
                            examAssignments: true,
                            examAttempts: true,
                        },
                    },
                },
            }),
            prisma.candidate.count({ where }),
        ]);

        res.status(200).json({
            status: 'success',
            data: candidates,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error) {
        logger.error(error);
        next(error);
    }
};

export const updateCandidate = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { candidateId } = req.params;
        const { firstName, lastName, email, phoneNumber, isActive } = req.body;

        const candidate = await prisma.candidate.update({
            where: { id: candidateId },
            data: {
                firstName,
                lastName,
                email,
                phoneNumber,
                isActive,
            },
        });

        res.status(200).json({
            status: 'success',
            data: candidate,
            message: 'Candidate updated successfully',
        });
    } catch (error) {
        logger.error(error);
        next(error);
    }
};

export const deleteCandidate = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { candidateId } = req.params;

        await prisma.candidate.delete({
            where: { id: candidateId },
        });

        res.status(200).json({
            status: 'success',
            message: 'Candidate deleted successfully',
        });
    } catch (error) {
        logger.error(error);
        next(error);
    }
};

// ============================================
// EXAM MANAGEMENT
// ============================================

export const createExam = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { orgId } = req.params;
        const {
            title,
            description,
            instructions,
            duration,
            passingScore,
            startDate,
            endDate,
            maxAttempts,
            randomizeQuestions,
            showResults,
            allowReview,
        } = req.body;

        const examCode = await generateExamCode();

        const exam = await prisma.exam.create({
            data: {
                id: uuidv4(),
                title,
                description,
                instructions: instructions || [],
                duration,
                passingScore: passingScore || 70,
                examCode,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                maxAttempts,
                randomizeQuestions: randomizeQuestions !== false,
                showResults: showResults !== false,
                allowReview: allowReview !== false,
                organizationId: orgId,
            },
        });

        res.status(201).json({
            status: 'success',
            data: exam,
            message: 'Exam created successfully',
        });
    } catch (error) {
        logger.error(error);
        next(error);
    }
};

export const getExams = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { orgId } = req.params;
        const { page = 1, limit = 10, search, status } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const where: any = { organizationId: orgId };

        if (search) {
            where.OR = [
                { title: { contains: search as string, mode: 'insensitive' as const } },
                { examCode: { contains: search as string, mode: 'insensitive' as const } },
            ];
        }

        if (status) {
            where.status = status;
        }

        const [exams, total] = await Promise.all([
            prisma.exam.findMany({
                where,
                skip,
                take: Number(limit),
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: {
                            questions: true,
                            assignments: true,
                            attempts: true,
                        },
                    },
                },
            }),
            prisma.exam.count({ where }),
        ]);

        res.status(200).json({
            status: 'success',
            data: exams,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error) {
        logger.error(error);
        next(error);
    }
};

export const getExamById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { examId } = req.params;

        const exam = await prisma.exam.findUnique({
            where: { id: examId },
            include: {
                organization: {
                    select: {
                        id: true,
                        name: true,
                        logo: true,
                    },
                },
                questions: {
                    include: {
                        options: true,
                    },
                    orderBy: { order: 'asc' },
                },
                _count: {
                    select: {
                        assignments: true,
                        attempts: true,
                    },
                },
            },
        });

        if (!exam) {
            throw new NotFoundError('Exam not found');
        }

        res.status(200).json({
            status: 'success',
            data: exam,
        });
    } catch (error) {
        next(error);
    }
};

export const updateExam = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { examId } = req.params;
        const {
            title,
            description,
            instructions,
            duration,
            passingScore,
            startDate,
            endDate,
            maxAttempts,
            randomizeQuestions,
            showResults,
            allowReview,
            status,
            isActive,
        } = req.body;

        const exam = await prisma.exam.update({
            where: { id: examId },
            data: {
                title,
                description,
                instructions,
                duration,
                passingScore,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                maxAttempts,
                randomizeQuestions,
                showResults,
                allowReview,
                status,
                isActive,
            },
        });

        res.status(200).json({
            status: 'success',
            data: exam,
            message: 'Exam updated successfully',
        });
    } catch (error) {
        logger.error(error);
        next(error);
    }
};

export const deleteExam = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { examId } = req.params;

        await prisma.exam.delete({
            where: { id: examId },
        });

        res.status(200).json({
            status: 'success',
            message: 'Exam deleted successfully',
        });
    } catch (error) {
        logger.error(error);
        next(error);
    }
};

// ============================================
// QUESTION MANAGEMENT
// ============================================

export const addQuestionToExam = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { examId } = req.params;
        const { question, type, points, explanation, options } = req.body;

        // Get current max order
        const lastQuestion = await prisma.examQuestion.findFirst({
            where: { examId },
            orderBy: { order: 'desc' },
        });

        const newOrder = lastQuestion ? lastQuestion.order + 1 : 0;

        const result = await prisma.$transaction(async (tx) => {
            const newQuestion = await tx.examQuestion.create({
                data: {
                    id: uuidv4(),
                    question,
                    type,
                    points: Number(points || 1),
                    explanation: explanation || null,
                    order: newOrder,
                    examId,
                },
            });

            // Add options for MCQ/True-False
            if (options && options.length > 0 && (type === 'MULTIPLE_CHOICE' || type === 'TRUE_FALSE')) {
                await Promise.all(
                    options.map((opt: { option: string; isCorrect: any }, index: number) =>
                        tx.examQuestionOption.create({
                            data: {
                                id: uuidv4(),
                                option: opt.option,
                                isCorrect: opt.isCorrect === true || opt.isCorrect === 'true',
                                order: index,
                                examQuestionId: newQuestion.id,
                            },
                        })
                    )
                );
            }

            return newQuestion;
        });

        const createdQuestion = await prisma.examQuestion.findUnique({
            where: { id: result.id },
            include: { options: true },
        });

        res.status(201).json({
            status: 'success',
            data: createdQuestion,
            message: 'Question added successfully',
        });
    } catch (error) {
        logger.error(error);
        next(error);
    }
};

export const updateExamQuestion = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { questionId } = req.params;
        const { question, type, points, explanation, options } = req.body;

        const result = await prisma.$transaction(async (tx) => {
            const updatedQuestion = await tx.examQuestion.update({
                where: { id: questionId },
                data: {
                    question,
                    type,
                    points: points ? Number(points) : undefined,
                    explanation,
                },
            });

            // Update options if provided
            if (options && (type === 'MULTIPLE_CHOICE' || type === 'TRUE_FALSE')) {
                // Delete existing options
                await tx.examQuestionOption.deleteMany({
                    where: { examQuestionId: questionId },
                });

                // Create new options
                await Promise.all(
                    options.map((opt: { option: string; isCorrect: any }, index: number) =>
                        tx.examQuestionOption.create({
                            data: {
                                id: uuidv4(),
                                option: opt.option,
                                isCorrect: opt.isCorrect === true || opt.isCorrect === 'true',
                                order: index,
                                examQuestionId: questionId,
                            },
                        })
                    )
                );
            }

            return updatedQuestion;
        });

        const updatedQuestionData = await prisma.examQuestion.findUnique({
            where: { id: questionId },
            include: { options: true },
        });

        res.status(200).json({
            status: 'success',
            data: updatedQuestionData,
            message: 'Question updated successfully',
        });
    } catch (error) {
        logger.error(error);
        next(error);
    }
};

export const deleteExamQuestion = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { questionId } = req.params;

        await prisma.examQuestion.delete({
            where: { id: questionId },
        });

        res.status(200).json({
            status: 'success',
            message: 'Question deleted successfully',
        });
    } catch (error) {
        logger.error(error);
        next(error);
    }
};

// ============================================
// EXAM ASSIGNMENT
// ============================================

import { sendEmail } from '../utils/sendEmail';

export const getExamAssignedCandidates = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { examId } = req.params;

        const assignments = await prisma.examAssignment.findMany({
            where: { examId },
            select: { candidateId: true }
        });

        const assignedCandidateIds = assignments.map(a => a.candidateId);

        res.status(200).json({
            status: 'success',
            data: assignedCandidateIds,
        });
    } catch (error) {
        logger.error(error);
        next(error);
    }
};

export const assignExamToCandidate = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { examId, candidateId } = req.params;

        // Check if already assigned
        const existingAssignment = await prisma.examAssignment.findUnique({
            where: {
                candidateId_examId: {
                    candidateId,
                    examId,
                },
            },
        });

        if (existingAssignment) {
            res.status(400).json({
                status: 'error',
                message: 'Candidate is already assigned to this exam',
            });
            return;
        }

        const assignment = await prisma.examAssignment.create({
            data: {
                id: uuidv4(),
                candidateId,
                examId,
            },
            include: {
                candidate: true,
                exam: true,
            },
        });

        // Send Email Notification
        if (assignment.candidate.email) {
            try {
                const examLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/exam-portal/login`;
                const startDate = assignment.exam.startDate
                    ? new Date(assignment.exam.startDate).toLocaleString()
                    : 'Flexible';
                const duration = assignment.exam.duration;

                await sendEmail({
                    to: assignment.candidate.email,
                    subject: `Exam Assignment: ${assignment.exam.title}`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #4F46E5;">You have been assigned a new exam!</h2>
                            <p>Hello <strong>${assignment.candidate.firstName}</strong>,</p>
                            <p>You have been assigned to take the following exam:</p>
                            
                            <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <h3 style="margin-top: 0;">${assignment.exam.title}</h3>
                                <p><strong>Duration:</strong> ${duration} minutes</p>
                                <p><strong>Date:</strong> ${startDate}</p>
                            </div>

                            <p>To access the exam, please use the following credentials:</p>
                            <div style="background-color: #EEF2FF; padding: 15px; border-left: 4px solid #4F46E5; margin-bottom: 20px;">
                                <p style="margin: 5px 0;"><strong>Candidate ID:</strong> ${assignment.candidate.candidateId}</p>
                                <p style="margin: 5px 0;"><strong>Exam Code:</strong> ${assignment.exam.examCode}</p>
                            </div>

                            <p>Click the button below to log in and start your exam:</p>
                            <a href="${examLink}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Go to Exam Portal</a>
                            
                            <p style="margin-top: 30px; font-size: 12px; color: #6B7280;">If the button doesn't work, copy and paste this link: ${examLink}</p>
                        </div>
                    `,
                    text: `You have been assigned to exam: ${assignment.exam.title}. Candidate ID: ${assignment.candidate.candidateId}, Exam Code: ${assignment.exam.examCode}. Login at: ${examLink}`
                });
            } catch (emailError) {
                logger.error(`Failed to send exam assignment email to ${assignment.candidate.email}`, emailError);
                // Don't fail the request if email fails, just log it
            }
        }

        res.status(201).json({
            status: 'success',
            data: assignment,
            message: 'Exam assigned to candidate successfully and email sent',
        });
    } catch (error) {
        logger.error(error);
        next(error);
    }
};

export const bulkAssignExamToCandidates = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { examId } = req.params;
        const { candidateIds } = req.body; // Array of string IDs

        if (!Array.isArray(candidateIds) || candidateIds.length === 0) {
            res.status(400).json({
                status: 'error',
                message: 'Please provide an array of candidate IDs',
            });
            return;
        }

        const exam = await prisma.exam.findUnique({ where: { id: examId } });
        if (!exam) {
            throw new NotFoundError('Exam not found');
        }

        const results = [];
        const errors = [];

        for (const candidateId of candidateIds) {
            try {
                // Check if exists
                const existing = await prisma.examAssignment.findUnique({
                    where: { candidateId_examId: { candidateId, examId } }
                });

                if (existing) {
                    continue; // Skip if already assigned
                }

                const assignment = await prisma.examAssignment.create({
                    data: {
                        id: uuidv4(),
                        candidateId,
                        examId,
                    },
                    include: {
                        candidate: true,
                        exam: true,
                    },
                });

                results.push(assignment);

                // Send Email
                if (assignment.candidate.email) {
                    const examLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/exam-portal/login`;
                    const startDate = assignment.exam.startDate
                        ? new Date(assignment.exam.startDate).toLocaleString()
                        : 'Flexible';

                    await sendEmail({
                        to: assignment.candidate.email,
                        subject: `Exam Assignment: ${assignment.exam.title}`,
                        html: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                <h2 style="color: #4F46E5;">You have been assigned a new exam!</h2>
                                <p>Hello <strong>${assignment.candidate.firstName}</strong>,</p>
                                <p>You have been assigned to take the following exam:</p>
                                
                                <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                    <h3 style="margin-top: 0;">${assignment.exam.title}</h3>
                                    <p><strong>Duration:</strong> ${assignment.exam.duration} minutes</p>
                                    <p><strong>Date:</strong> ${startDate}</p>
                                </div>

                                <p>To access the exam, please use the following credentials:</p>
                                <div style="background-color: #EEF2FF; padding: 15px; border-left: 4px solid #4F46E5; margin-bottom: 20px;">
                                    <p style="margin: 5px 0;"><strong>Candidate ID:</strong> ${assignment.candidate.candidateId}</p>
                                    <p style="margin: 5px 0;"><strong>Exam Code:</strong> ${assignment.exam.examCode}</p>
                                </div>

                                <p>Click the button below to log in and start your exam:</p>
                                <a href="${examLink}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Go to Exam Portal</a>
                            </div>
                        `,
                        text: `You have been assigned to exam: ${assignment.exam.title}. Candidate ID: ${assignment.candidate.candidateId}, Exam Code: ${assignment.exam.examCode}.`
                    }).catch(err => logger.error(`Failed to send email to ${assignment.candidate.email}`, err));
                }

            } catch (err) {
                logger.error(`Failed to assign candidate ${candidateId}`, err);
                errors.push({ candidateId, error: 'Failed to assign' });
            }
        }

        res.status(201).json({
            status: 'success',
            data: results,
            message: `Successfully assigned ${results.length} candidates`,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        logger.error(error);
        next(error);
    }
};

export const unassignExamFromCandidate = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { examId, candidateId } = req.params;

        await prisma.examAssignment.delete({
            where: {
                candidateId_examId: {
                    candidateId,
                    examId,
                },
            },
        });

        res.status(200).json({
            status: 'success',
            message: 'Exam unassigned from candidate successfully',
        });
    } catch (error) {
        logger.error(error);
        next(error);
    }
};

// ============================================
// CANDIDATE PORTAL
// ============================================

export const candidateLogin = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { candidateId, examCode } = req.body;

        // Find candidate
        const candidate = await prisma.candidate.findUnique({
            where: { candidateId },
            include: {
                organization: {
                    select: {
                        id: true,
                        name: true,
                        logo: true,
                    },
                },
            },
        });

        if (!candidate || !candidate.isActive) {
            res.status(401).json({
                status: 'error',
                message: 'Invalid candidate ID',
            });
            return;
        }

        // Find exam
        const exam = await prisma.exam.findUnique({
            where: { examCode },
            include: {
                organization: {
                    select: {
                        id: true,
                        name: true,
                        logo: true,
                    },
                },
            },
        });

        if (!exam) {
            res.status(404).json({
                status: 'error',
                message: 'Invalid exam code',
            });
            return;
        }

        // Check if candidate is assigned to exam
        const assignment = await prisma.examAssignment.findUnique({
            where: {
                candidateId_examId: {
                    candidateId: candidate.id,
                    examId: exam.id,
                },
            },
        });

        if (!assignment || !assignment.isActive) {
            res.status(403).json({
                status: 'error',
                message: 'You are not assigned to this exam',
            });
            return;
        }

        // Check exam availability
        const availability = isExamAvailable(exam);
        if (!availability.available) {
            res.status(403).json({
                status: 'error',
                message: availability.reason,
            });
            return;
        }

        // Check remaining attempts
        const { hasAttempts, attemptsUsed, attemptsRemaining } = await hasRemainingAttempts(
            candidate.id,
            exam.id,
            exam.maxAttempts
        );

        if (!hasAttempts) {
            res.status(403).json({
                status: 'error',
                message: `You have used all ${exam.maxAttempts} attempts for this exam`,
                attemptsUsed,
            });
            return;
        }

        // Create JWT token
        const token = jwt.sign(
            {
                candidateId: candidate.id,
                examId: exam.id,
            },
            process.env.JWT_SECRET as string,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            status: 'success',
            data: {
                token,
                candidate: {
                    id: candidate.id,
                    candidateId: candidate.candidateId,
                    firstName: candidate.firstName,
                    lastName: candidate.lastName,
                },
                exam: {
                    id: exam.id,
                    title: exam.title,
                    description: exam.description,
                    duration: exam.duration,
                    startDate: exam.startDate,
                    endDate: exam.endDate,
                    organization: exam.organization,
                },
                attemptsUsed,
                attemptsRemaining,
            },
            message: 'Login successful',
        });
    } catch (error) {
        logger.error(error);
        next(error);
    }
};

export const startExamAttempt = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { examId } = req.params;
        // @ts-ignore
        const candidateId = req.candidate?.id;

        const exam = await prisma.exam.findUnique({
            where: { id: examId },
            include: {
                questions: {
                    where: { isActive: true },
                    include: {
                        options: {
                            orderBy: { order: 'asc' },
                            select: {
                                id: true,
                                option: true,
                                order: true,
                            },
                        },
                    },
                    orderBy: { order: 'asc' },
                },
            },
        });

        if (!exam) {
            throw new NotFoundError('Exam not found');
        }

        if (exam.questions.length === 0) {
            res.status(400).json({
                status: 'error',
                message: 'No questions available for this exam',
            });
            return;
        }

        // Randomize questions if needed
        const questions = exam.randomizeQuestions
            ? exam.questions.sort(() => Math.random() - 0.5)
            : exam.questions;

        // Create exam attempt
        const examAttempt = await prisma.examAttempt.create({
            data: {
                id: uuidv4(),
                totalQuestions: questions.length,
                candidateId,
                examId,
            },
        });

        // Calculate end time
        const endTime = exam.duration
            ? new Date(Date.now() + exam.duration * 60 * 1000)
            : null;

        res.status(200).json({
            status: 'success',
            data: {
                attemptId: examAttempt.id,
                exam: {
                    id: exam.id,
                    title: exam.title,
                    description: exam.description,
                    instructions: exam.instructions,
                    duration: exam.duration,
                    passingScore: exam.passingScore,
                },
                questions: questions.map((q) => ({
                    id: q.id,
                    question: q.question,
                    image: q.image,
                    type: q.type,
                    points: q.points,
                    options: q.options,
                    order: q.order,
                })),
                startTime: examAttempt.startTime,
                endTime,
                timeRemaining: exam.duration ? exam.duration * 60 : null, // in seconds
            },
        });
    } catch (error) {
        logger.error(error);
        next(error);
    }
};

export const submitExamAnswer = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { attemptId } = req.params;
        const { questionId, answerText, selectedOptions, timeSpent } = req.body;
        // @ts-ignore
        const candidateId = req.candidate?.id;

        const examAttempt = await prisma.examAttempt.findFirst({
            where: {
                id: attemptId,
                candidateId,
            },
            include: {
                exam: {
                    include: {
                        questions: {
                            where: { id: questionId },
                            include: {
                                options: true,
                            },
                        },
                    },
                },
            },
        });

        if (!examAttempt) {
            res.status(404).json({
                status: 'error',
                message: 'Exam attempt not found',
            });
            return;
        }

        if (examAttempt.status === 'COMPLETED') {
            res.status(400).json({
                status: 'error',
                message: 'Exam attempt already completed',
            });
            return;
        }

        const question = examAttempt.exam.questions[0];
        if (!question) {
            res.status(404).json({
                status: 'error',
                message: 'Question not found in this exam',
            });
            return;
        }

        // Get selected option texts
        const selectedOptionTexts = question.options
            .filter((opt) => selectedOptions?.includes(opt.id))
            .map((opt) => opt.option);

        // Auto-grade
        const { isCorrect, points } = autoGradeAnswer(question, selectedOptions);

        // Check if answer exists
        const existingAnswer = await prisma.examAnswer.findFirst({
            where: {
                examAttemptId: attemptId,
                examQuestionId: questionId,
            },
        });

        // Create or update answer
        const answer = await prisma.examAnswer.upsert({
            where: {
                id: existingAnswer?.id || uuidv4(),
            },
            create: {
                id: uuidv4(),
                answerText: answerText || null,
                selectedOptions: selectedOptions || [],
                userAnswer: selectedOptionTexts || [],
                isCorrect,
                points,
                timeSpent: timeSpent || null,
                examAttemptId: attemptId,
                examQuestionId: questionId,
            },
            update: {
                answerText: answerText || null,
                selectedOptions: selectedOptions || [],
                userAnswer: selectedOptionTexts || [],
                isCorrect,
                points,
                timeSpent: timeSpent || null,
            },
        });

        // Update attempt stats
        const answers = await prisma.examAnswer.findMany({
            where: { examAttemptId: attemptId },
        });

        const correctAnswers = answers.filter((a) => a.isCorrect).length;
        const totalPoints = answers.reduce((sum, a) => sum + (a.points || 0), 0);

        res.status(200).json({
            status: 'success',
            data: {
                answer,
                correctAnswers,
                totalAnswered: answers.length,
                totalQuestions: examAttempt.totalQuestions,
            },
        });
    } catch (error) {
        logger.error(error);
        next(error);
    }
};

export const submitExam = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { attemptId } = req.params;
        // @ts-ignore
        const candidateId = req.candidate?.id;

        const examAttempt = await prisma.examAttempt.findFirst({
            where: {
                id: attemptId,
                candidateId,
            },
            include: {
                exam: {
                    include: {
                        questions: true,
                    },
                },
                candidate: true,
                answers: {
                    include: {
                        examQuestion: true,
                    },
                },
            },
        });

        if (!examAttempt) {
            throw new NotFoundError('Exam attempt not found');
        }

        // Calculate final score
        const questions = examAttempt.exam.questions;
        const totalPossiblePoints = questions.reduce((sum, q) => sum + (q.points || 0), 0);
        const earnedPoints = examAttempt.answers.reduce((sum, a) => sum + (a.points || 0), 0);
        const score = calculateExamScore(totalPossiblePoints, earnedPoints);
        const correctAnswers = examAttempt.answers.filter((a) => a.isCorrect).length;
        const isPassed = score >= examAttempt.exam.passingScore;

        // Calculate time spent
        const now = new Date();
        const timeSpentSeconds = Math.floor(
            (now.getTime() - examAttempt.startTime.getTime()) / 1000
        );

        // Update attempt
        await prisma.examAttempt.update({
            where: { id: attemptId },
            data: {
                endTime: now,
                score,
                correctAnswers,
                isPassed,
                status: 'COMPLETED',
                timeSpent: timeSpentSeconds,
            },
        });

        res.status(200).json({
            status: 'success',
            data: {
                attemptId: examAttempt.id,
                score,
                isPassed,
                passingScore: examAttempt.exam.passingScore,
                totalQuestions: examAttempt.totalQuestions,
                answeredQuestions: examAttempt.answers.length,
                correctAnswers,
                pointsEarned: earnedPoints,
                totalPoints: totalPossiblePoints,
                timeSpent: timeSpentSeconds,
                submittedAt: now.toISOString(),
            },
            message: 'Exam submitted successfully',
        });
    } catch (error) {
        logger.error(error);
        next(error);
    }
};

export const getExamResult = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { attemptId } = req.params;
        // @ts-ignore
        const candidateId = req.candidate?.id;

        const examAttempt = await prisma.examAttempt.findFirst({
            where: {
                id: attemptId,
                candidateId,
            },
            include: {
                exam: true,
                answers: {
                    include: {
                        examQuestion: {
                            include: {
                                options: {
                                    where: { isCorrect: true },
                                    select: { id: true, option: true },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!examAttempt) {
            throw new NotFoundError('Exam attempt not found');
        }

        const response: any = {
            status: 'success',
            data: {
                attemptId: examAttempt.id,
                examTitle: examAttempt.exam.title,
                score: examAttempt.score,
                isPassed: examAttempt.isPassed,
                passingScore: examAttempt.exam.passingScore,
                totalQuestions: examAttempt.totalQuestions,
                correctAnswers: examAttempt.correctAnswers,
                timeSpent: examAttempt.timeSpent,
                submittedAt: examAttempt.endTime,
            },
        };

        // Include detailed results if allowed
        if (examAttempt.exam.showResults && examAttempt.exam.allowReview) {
            response.data.details = examAttempt.answers.map((a) => ({
                questionId: a.examQuestionId,
                question: a.examQuestion.question,
                type: a.examQuestion.type,
                isCorrect: a.isCorrect,
                points: a.points,
                userAnswer: a.answerText || a.userAnswer,
                correctAnswers: a.examQuestion.options.map((opt) => ({
                    id: opt.id,
                    option: opt.option,
                })),
                explanation: a.examQuestion.explanation,
            }));
        }

        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

// ============================================
// ANALYTICS & REPORTS
// ============================================

export const getExamResults = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { examId } = req.params;
        const { page = 1, limit = 10, status } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const where: any = { examId };
        if (status) {
            where.status = status;
        }

        const [attempts, total] = await Promise.all([
            prisma.examAttempt.findMany({
                where,
                skip,
                take: Number(limit),
                orderBy: { startTime: 'desc' },
                include: {
                    candidate: {
                        select: {
                            candidateId: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                },
            }),
            prisma.examAttempt.count({ where }),
        ]);

        res.status(200).json({
            status: 'success',
            data: attempts,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error) {
        logger.error(error);
        next(error);
    }
};

export const getExamAnalytics = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { examId } = req.params;

        const stats = await calculateExamStatistics(examId);
        const questionStats = await calculateQuestionStatistics(examId);

        res.status(200).json({
            status: 'success',
            data: {
                examStatistics: stats,
                questionStatistics: questionStats,
            },
        });
    } catch (error) {
        logger.error(error);
        next(error);
    }
};

export const getExamDashboardStats = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { organizationId } = req.query;

        const whereOrg = organizationId ? { organizationId: String(organizationId) } : {};

        // 1. Exam Counts
        const [totalExams, publishedExams, draftExams] = await Promise.all([
            prisma.exam.count({ where: whereOrg }),
            prisma.exam.count({ where: { ...whereOrg, status: 'PUBLISHED' } }),
            prisma.exam.count({ where: { ...whereOrg, status: 'DRAFT' } }),
        ]);

        // 2. Candidate Counts (for the org)
        const totalCandidates = await prisma.candidate.count({ where: whereOrg });

        // 3. Attempt Stats (need to filter attempts by exams belonging to the org if orgId is present)
        let attemptWhere = {};
        if (organizationId) {
            attemptWhere = {
                exam: {
                    organizationId: String(organizationId)
                }
            };
        }

        const totalAttempts = await prisma.examAttempt.count({ where: attemptWhere });
        const passedAttempts = await prisma.examAttempt.count({
            where: { ...attemptWhere, isPassed: true }
        });

        // 4. Recent Activity (last 5 attempts)
        const recentActivity = await prisma.examAttempt.findMany({
            where: attemptWhere,
            take: 5,
            orderBy: { startTime: 'desc' },
            include: {
                candidate: {
                    select: { firstName: true, lastName: true }
                },
                exam: {
                    select: { title: true }
                }
            }
        });

        // 5. Avg Score (simple average of all completed attempts)
        const completedAttempts = await prisma.examAttempt.findMany({
            where: { ...attemptWhere, status: 'COMPLETED' },
            select: { score: true }
        });

        const avgScore = completedAttempts.length > 0
            ? completedAttempts.reduce((acc, curr) => acc + (curr.score || 0), 0) / completedAttempts.length
            : 0;


        res.status(200).json({
            status: 'success',
            data: {
                exams: {
                    total: totalExams,
                    published: publishedExams,
                    draft: draftExams,
                },
                candidates: {
                    total: totalCandidates
                },
                attempts: {
                    total: totalAttempts,
                    passed: passedAttempts,
                    avgScore: Math.round(avgScore * 10) / 10, // Round to 1 decimal
                    passRate: totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0
                },
                recentActivity: recentActivity.map(a => ({
                    id: a.id,
                    candidateName: `${a.candidate.firstName} ${a.candidate.lastName}`,
                    examTitle: a.exam.title,
                    score: a.score,
                    status: a.status,
                    date: a.startTime
                }))
            }
        });
    } catch (error) {
        logger.error(error);
        next(error);
    }
};

