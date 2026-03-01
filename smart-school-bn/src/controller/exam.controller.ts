import { Request, Response, NextFunction } from 'express';
import { ExamQuestionType, Prisma } from '@prisma/client';
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
import { uploadBufferToCloudinary } from '../config/cloudinary';
import { AssessmentService } from '../services/assessment.service';
import { QuestionService } from '../services/question.service';
import { AttemptService } from '../services/attempt.service';
import { getTenantFilter } from '../middleware/tenant.middleware';
import prisma from '../services/prisma.singleton';

// Local organization filter functions removed (Unified filter used instead)

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
        const {
            firstName,
            lastName,
            email,
            phoneNumber,
            candidateId,
            batch,
            grade,
            department
        } = req.body;
        const user = req.user as any;

        if (!candidateId) {
            res.status(400).json({ status: 'error', message: 'Candidate ID is required' });
            return;
        }

        const orgWhere = getTenantFilter(req, { id: orgId });
        const organization = await prisma.organization.findFirst({
            where: orgWhere
        });

        if (!organization) {
            res.status(403).json({
                success: false,
                error: {
                    message: 'You do not have access to this organization',
                    code: 'ORG_ACCESS_DENIED'
                }
            });
            return;
            return;
        }

        // Check if manually provided candidateId already exists
        const existing = await prisma.candidate.findUnique({
            where: { candidateId: candidateId }
        });
        if (existing) {
            res.status(400).json({ status: 'error', message: 'Candidate ID already exists' });
            return;
        }

        const candidate = await prisma.candidate.create({
            data: {
                id: uuidv4(),
                candidateId: candidateId,
                firstName,
                lastName,
                email,
                phoneNumber,
                organizationId: orgId,
                batch: batch || null,
                grade: grade !== undefined ? String(grade) : null,
                department: department || null,
            },
        });

        res.status(201).json({
            success: true,
            data: candidate,
            message: 'Candidate created successfully',
        });
    } catch (error) {
        logger.error(error);
        next(error);
    }
};

export const createCandidatesBulk = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { orgId } = req.params;
        const { candidates } = req.body; // Array of { firstName, lastName, email, phoneNumber }
        const user = req.user as any;

        const orgWhere = getTenantFilter(req, { id: orgId });
        const organization = await prisma.organization.findFirst({
            where: orgWhere
        });

        if (!organization) {
            res.status(403).json({
                success: false,
                error: {
                    message: 'You do not have access to this organization',
                    code: 'ORG_ACCESS_DENIED'
                }
            });
            return;
            return;
        }

        if (!Array.isArray(candidates) || candidates.length === 0) {
            res.status(400).json({
                status: 'error',
                message: 'Please provide an array of candidates',
            });
            return;
        }

        const createdCandidates = [];
        const errors = [];

        for (const cand of candidates) {
            try {
                // Use provided candidateId or generate one
                let finalCandidateId = cand.candidateId || cand.customCandidateId;

                if (!finalCandidateId) {
                    finalCandidateId = await generateCandidateId(orgId);
                } else {
                    // Check if provided candidateId already exists
                    const existing = await prisma.candidate.findUnique({
                        where: { candidateId: String(finalCandidateId) }
                    });
                    if (existing) {
                        errors.push({ candidate: cand, error: `Candidate ID ${finalCandidateId} already exists` });
                        continue;
                    }
                }

                const newCandidate = await prisma.candidate.create({
                    data: {
                        id: uuidv4(),
                        candidateId: String(finalCandidateId),
                        customCandidateId: cand.customCandidateId ? String(cand.customCandidateId) : null,
                        firstName: cand.firstName,
                        lastName: cand.lastName,
                        email: cand.email,
                        phoneNumber: cand.phoneNumber ? String(cand.phoneNumber) : null,
                        organizationId: orgId,
                        batch: cand.batch || null,
                        grade: cand.grade !== undefined ? String(cand.grade) : null,
                        department: cand.department || null,
                    },
                });
                createdCandidates.push(newCandidate);
            } catch (err) {
                logger.error(`Failed to create candidate ${cand.email || cand.firstName}`, err);
                errors.push({ candidate: cand, error: 'Failed to create' });
            }
        }

        res.status(201).json({
            success: true,
            data: createdCandidates,
            message: `Successfully created ${createdCandidates.length} candidates`,
            errors: errors.length > 0 ? errors : undefined,
        });
    } catch (error) {
        logger.error(error);
        next(error);
    }
};

export const getAllCandidates = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { organizationId, search, page = 1, limit = 50, showArchived } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const user = req.user as any;
        let where: any = {};

        if (organizationId) {
            const orgWhere = getTenantFilter(req, { id: String(organizationId) });
            const organization = await prisma.organization.findFirst({
                where: orgWhere
            });

            if (!organization) {
                res.status(403).json({
                    status: 'fail',
                    message: 'You do not have access to this organization'
                });
                return;
            }
            where.organizationId = String(organizationId);
        } else {
            const tenantFilter = getTenantFilter(req);
            where.organizationId = tenantFilter.organizationId || { in: [] };
        }

        if (search) {
            where.OR = [
                { firstName: { contains: String(search), mode: 'insensitive' } },
                { lastName: { contains: String(search), mode: 'insensitive' } },
                { candidateId: { contains: String(search), mode: 'insensitive' } },
                { email: { contains: String(search), mode: 'insensitive' } },
            ];
        }

        if (showArchived !== 'true') {
            where.archived = false;
        }

        const [candidates, total] = await Promise.all([
            prisma.candidate.findMany({
                where,
                skip,
                take: Number(limit),
                orderBy: { createdAt: 'desc' },
                include: {
                    organization: {
                        select: { name: true }
                    },
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
            success: true,
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

export const getCandidates = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { orgId } = req.params;
        const user = req.user as any;
        const orgWhere = getTenantFilter(req, { id: orgId });
        const organization = await prisma.organization.findFirst({
            where: orgWhere
        });

        if (!organization) {
            res.status(403).json({
                success: false,
                error: {
                    message: 'You do not have access to this organization',
                    code: 'ORG_ACCESS_DENIED'
                }
            });
            return;
            return;
        }

        const { page = 1, limit = 10, search, batch, grade, department, showArchived } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const where: any = { organizationId: orgId };

        // Search filter
        if (search) {
            where.OR = [
                { firstName: { contains: search as string, mode: 'insensitive' as const } },
                { lastName: { contains: search as string, mode: 'insensitive' as const } },
                { candidateId: { contains: search as string, mode: 'insensitive' as const } },
                { customCandidateId: { contains: search as string, mode: 'insensitive' as const } },
                { email: { contains: search as string, mode: 'insensitive' as const } },
            ];
        }

        // Additional filters
        if (batch) where.batch = batch;
        if (grade) where.grade = grade;
        if (department) where.department = department;

        // Archive status
        if (showArchived !== 'true') {
            where.archived = false;
        }

        const [candidates, total] = await Promise.all([
            prisma.candidate.findMany({
                where,
                skip: Number(limit) === -1 ? undefined : skip,
                take: Number(limit) === -1 ? undefined : Number(limit),
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
            success: true,
            data: candidates,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Number(limit) === -1 ? 1 : Math.ceil(total / Number(limit)),
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
        const {
            firstName,
            lastName,
            email,
            phoneNumber,
            isActive,
            batch,
            grade,
            department
        } = req.body;
        const user = req.user as any;

        // Get candidate to check organization
        const existingCandidate = await prisma.candidate.findUnique({
            where: { id: candidateId }
        });

        if (!existingCandidate) {
            res.status(404).json({ status: 'error', message: 'Candidate not found' });
            return;
        }

        const orgWhere = getTenantFilter(req, { id: existingCandidate.organizationId });
        const organization = await prisma.organization.findFirst({
            where: orgWhere
        });

        if (!organization) {
            res.status(403).json({
                status: 'fail',
                message: 'You do not have access to this candidate'
            });
            return;
        }

        const candidate = await prisma.candidate.update({
            where: { id: candidateId },
            data: {
                firstName,
                lastName,
                email,
                phoneNumber,
                isActive,
                batch: batch !== undefined ? batch : existingCandidate.batch,
                grade: grade !== undefined ? String(grade) : existingCandidate.grade,
                department: department !== undefined ? department : existingCandidate.department,
            },
        });

        res.status(200).json({
            success: true,
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
        const user = req.user as any;

        // Get candidate to check organization
        const existingCandidate = await prisma.candidate.findUnique({
            where: { id: candidateId }
        });

        if (!existingCandidate) {
            res.status(404).json({ status: 'error', message: 'Candidate not found' });
            return;
        }

        const orgWhere = getTenantFilter(req, { id: existingCandidate.organizationId });
        const organization = await prisma.organization.findFirst({
            where: orgWhere
        });

        if (!organization) {
            res.status(403).json({
                status: 'fail',
                message: 'You do not have access to this candidate'
            });
            return;
        }

        await prisma.candidate.delete({
            where: { id: candidateId },
        });

        res.status(200).json({
            success: true,
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
        const user = req.user as any;
        const orgWhere = getTenantFilter(req, { id: orgId });
        const organization = await prisma.organization.findFirst({
            where: orgWhere
        });

        if (!organization) {
            res.status(403).json({
                success: false,
                error: {
                    message: 'You do not have access to this organization',
                    code: 'ORG_ACCESS_DENIED'
                }
            });
            return;
            return;
        }

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
            success: true,
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
        const { showArchived } = req.query;
        const user = req.user as any;
        if (orgId !== 'all') {
            const orgWhere = getTenantFilter(req, { id: orgId });
            const organization = await prisma.organization.findFirst({
                where: orgWhere
            });

            if (!organization) {
                res.status(403).json({
                    success: false,
                    error: {
                        message: 'You do not have access to this organization',
                        code: 'ORG_ACCESS_DENIED'
                    }
                });
                return;
            }
        }

        const tenantFilter = getTenantFilter(req);
        const where: any = orgId === 'all'
            ? {
                organizationId: tenantFilter.organizationId || { not: undefined },
            }
            : { organizationId: orgId };

        // Include archived exams by default, only exclude if explicitly requested
        if (showArchived === 'false') {
            where.status = { not: 'ARCHIVED' };
        }
        // Otherwise, show all exams including archived ones with their status

        const exams = await prisma.exam.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                organization: {
                    select: { name: true }
                },
                _count: {
                    select: { questions: true, attempts: true }
                }
            }
        });

        res.status(200).json({
            success: true,
            data: exams,
        });
    } catch (error) {
        logger.error(error);
        next(error);
    }
};

export const getAllExams = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { organizationId, status, search, date, showArchived } = req.query;

        const where: any = {};
        const user = req.user as any;
        if (organizationId) {
            const orgWhere = getTenantFilter(req, { id: String(organizationId) });
            const organization = await prisma.organization.findFirst({
                where: orgWhere
            });

            if (!organization) {
                res.status(403).json({
                    status: 'fail',
                    message: 'You do not have access to this organization'
                });
                return;
            }
            where.organizationId = String(organizationId);
        } else {
            const tenantFilter = getTenantFilter(req);
            if (tenantFilter.organizationId) {
                where.organizationId = tenantFilter.organizationId;
            }
        }

        if (status && status !== 'ALL') {
            where.status = status;
        }

        if (search) {
            where.OR = [
                { title: { contains: String(search), mode: 'insensitive' } },
                { examCode: { contains: String(search), mode: 'insensitive' } },
            ];
        }

        if (date) {
            const filterDate = new Date(String(date));
            const nextDay = new Date(filterDate);
            nextDay.setDate(filterDate.getDate() + 1);

            where.createdAt = {
                gte: filterDate,
                lt: nextDay
            };
        }

        // Include archived exams by default, only exclude if explicitly requested
        if (showArchived === 'false' && !status) {
            where.status = { not: 'ARCHIVED' };
        }
        // Otherwise, show all exams including archived ones with their status

        const exams = await prisma.exam.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                organization: {
                    select: { name: true }
                },
                _count: {
                    select: { questions: true, attempts: true }
                }
            }
        });

        res.status(200).json({
            success: true,
            data: exams,
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
        const user = req.user as any;

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

        const orgWhere = getTenantFilter(req, { id: exam.organizationId });
        const organization = await prisma.organization.findFirst({
            where: orgWhere
        });

        if (!organization) {
            res.status(403).json({
                status: 'fail',
                message: 'You do not have access to this exam'
            });
            return;
        }

        res.status(200).json({
            success: true,
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
        const user = req.user as any;

        // Get existing exam to check organization and archive status
        const existingExam = await prisma.exam.findUnique({
            where: { id: examId }
        });

        if (!existingExam) {
            res.status(404).json({ status: 'error', message: 'Exam not found' });
            return;
        }

        // Check archive status
        if (existingExam.status === 'ARCHIVED') {
            res.status(403).json({
                status: 'fail',
                message: 'This exam is archived and cannot be updated'
            });
            return;
        }

        const orgWhere = getTenantFilter(req, { id: existingExam.organizationId });
        const organization = await prisma.organization.findFirst({
            where: orgWhere
        });

        if (!organization) {
            res.status(403).json({
                status: 'fail',
                message: 'You do not have access to this exam'
            });
            return;
        }

        const exam = await prisma.exam.update({
            where: { id: examId },
            data: {
                title,
                description,
                instructions,
                duration,
                passingScore,
                startDate: startDate === '' || startDate === null ? null : (startDate ? new Date(startDate) : undefined),
                endDate: endDate === '' || endDate === null ? null : (endDate ? new Date(endDate) : undefined),
                maxAttempts,
                randomizeQuestions,
                showResults,
                allowReview,
                status,
                isActive,
            },
        });

        res.status(200).json({
            success: true,
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
        const user = req.user as any;

        // Get existing exam to check organization and archive status
        const existingExam = await prisma.exam.findUnique({
            where: { id: examId }
        });

        if (!existingExam) {
            res.status(404).json({ status: 'error', message: 'Exam not found' });
            return;
        }

        // Check archive status
        if (existingExam.status === 'ARCHIVED') {
            res.status(403).json({
                status: 'fail',
                message: 'This exam is archived and cannot be deleted'
            });
            return;
        }

        const orgWhere = getTenantFilter(req, { id: existingExam.organizationId });
        const organization = await prisma.organization.findFirst({
            where: orgWhere
        });

        if (!organization) {
            res.status(403).json({
                status: 'fail',
                message: 'You do not have access to this exam'
            });
            return;
        }

        await prisma.exam.delete({
            where: { id: examId },
        });

        res.status(200).json({
            success: true,
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
        let { question, type, points, explanation, options } = req.body;
        const user = req.user as any;
        const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
        const imageFile = files?.fileImage?.[0];
        if (typeof options === 'string') {
            try { options = JSON.parse(options); } catch { options = []; }
        }

        let imageUrl: string | null = null;
        if (imageFile) {
            imageUrl = await uploadBufferToCloudinary(imageFile.buffer, imageFile.mimetype, imageFile.originalname);
        }

        const exam = await prisma.exam.findUnique({ where: { id: examId } });
        if (!exam) {
            res.status(404).json({ status: 'error', message: 'Exam not found' });
            return;
        }

        if (exam.status === 'ARCHIVED') {
            res.status(403).json({ status: 'fail', message: 'Exam is archived' });
            return;
        }

        if (user.role === 'EXAMINER') {
            const examinerOrgIds = user.userOrganizations?.map((uo: any) => uo.organizationId) || [];
            if (!examinerOrgIds.includes(exam.organizationId)) {
                res.status(403).json({ status: 'fail', message: 'No access to this exam' });
                return;
            }
        }

        const lastQuestion = await prisma.examQuestion.findFirst({
            where: { examId },
            orderBy: { order: 'desc' },
        });

        const createdQuestion = await QuestionService.createQuestion(examId, {
            question,
            type,
            points: Number(points || 1),
            explanation,
            order: lastQuestion ? lastQuestion.order + 1 : 0,
            image: imageUrl,
            options: options ? options.map((opt: any, index: number) => ({
                option: opt.option,
                isCorrect: opt.isCorrect === true || opt.isCorrect === 'true',
                order: index
            })) : undefined
        }, 'exam');

        res.status(201).json({
            success: true,
            data: createdQuestion,
            message: 'Question added successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const addQuestionsBulk = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { examId } = req.params;
        const { questions } = req.body; // Array of { question, type, points, explanation, options }

        if (!Array.isArray(questions) || questions.length === 0) {
            res.status(400).json({
                status: 'error',
                message: 'Please provide an array of questions',
            });
            return;
        }

        // Get current max order
        const lastQuestion = await prisma.examQuestion.findFirst({
            where: { examId },
            orderBy: { order: 'desc' },
        });

        let currentOrder = lastQuestion ? lastQuestion.order + 1 : 0;

        const results = await prisma.$transaction(async (tx) => {
            const created = [];
            for (const q of questions) {
                const newQuestion = await tx.examQuestion.create({
                    data: {
                        id: uuidv4(),
                        question: q.question,
                        type: q.type,
                        points: Number(q.points || 1),
                        explanation: q.explanation || null,
                        order: currentOrder++,
                        examId,
                    },
                });

                if (q.options && q.options.length > 0 && (q.type === 'MULTIPLE_CHOICE' || q.type === 'TRUE_FALSE')) {
                    await Promise.all(
                        q.options.map((opt: { option: string; isCorrect: any }, index: number) =>
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

                const fullQuestion = await tx.examQuestion.findUnique({
                    where: { id: newQuestion.id },
                    include: { options: true },
                });
                created.push(fullQuestion);
            }
            return created;
        });

        res.status(201).json({
            success: true,
            data: results,
            message: `Successfully added ${results.length} questions`,
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
        let { question, type, points, explanation, options, clearImage } = req.body;
        const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
        const imageFile = files?.fileImage?.[0];
        if (typeof options === 'string') {
            try { options = JSON.parse(options); } catch { options = undefined; }
        }

        let imageUrl: string | null | undefined = undefined;
        if (clearImage === 'true' || clearImage === true) {
            imageUrl = null;
        } else if (imageFile) {
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(imageFile.mimetype)) {
                res.status(400).json({ status: 'error', message: 'Invalid image type. Allowed: JPEG, PNG, GIF, WebP' });
                return;
            }
            imageUrl = await uploadBufferToCloudinary(imageFile.buffer, imageFile.mimetype, imageFile.originalname);
        }

        const result = await prisma.$transaction(async (tx) => {
            const updateData: Prisma.ExamQuestionUpdateInput = {
                question,
                type: type as ExamQuestionType,
                points: points ? Number(points) : undefined,
                explanation,
            };
            if (imageUrl !== undefined) updateData.image = imageUrl;

            const updatedQuestion = await tx.examQuestion.update({
                where: { id: questionId },
                data: updateData,
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
            success: true,
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
        await QuestionService.deleteQuestion(questionId, 'exam');
        res.status(200).json({ success: true, message: 'Question deleted successfully' });
    } catch (error) {
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
            success: true,
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
        const { notify } = req.query;
        if (assignment.candidate.email && notify !== 'false') {
            try {
                const examLink = `${process.env.CLIENT_URL} || 'https://smartschool.rw/exam-portal/login`;
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
            success: true,
            data: assignment,
            message: notify !== 'false'
                ? 'Exam assigned to candidate successfully and email sent'
                : 'Exam assigned to candidate successfully (No email sent)',
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
        const { notify } = req.query;

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
                if (assignment.candidate.email && notify !== 'false') {
                    const examLink = `${process.env.CLIENT_URL || 'https://smartschool.rw'}/exam-portal/login`;
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
            success: true,
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
            success: true,
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
                _count: {
                    select: { questions: true }
                }
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
        let isWaiting = false;
        if (!availability.available) {
            if (availability.reason === 'Exam has not started yet') {
                isWaiting = true;
            } else {
                res.status(403).json({
                    status: 'error',
                    message: availability.reason,
                });
                return;
            }
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
            success: true,
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
                    passingScore: exam.passingScore,
                    instructions: exam.instructions,
                    _count: exam._count,
                    startDate: exam.startDate,
                    endDate: exam.endDate,
                    organization: exam.organization,
                },
                attemptsUsed,
                attemptsRemaining,
                isWaiting,
            },
            message: isWaiting ? 'Redirecting to waiting room' : 'Login successful',
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

        // Reset allowRetake flag on assignment if it was used
        await prisma.examAssignment.update({
            where: {
                candidateId_examId: {
                    candidateId,
                    examId,
                },
            },
            data: { allowRetake: false },
        });

        // Calculate end time
        const endTime = exam.duration
            ? new Date(Date.now() + exam.duration * 60 * 1000)
            : null;

        res.status(200).json({
            success: true,
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

        const examAttempt = await prisma.examAttempt.findUnique({
            where: { id: attemptId }
        });

        if (!examAttempt || examAttempt.candidateId !== candidateId) {
            res.status(404).json({ status: 'error', message: 'Exam attempt not found' });
            return;
        }

        if (examAttempt.status === 'COMPLETED') {
            res.status(400).json({ status: 'error', message: 'Exam attempt already completed' });
            return;
        }

        const { isCorrect, points } = await AttemptService.submitAnswer(attemptId, {
            questionId,
            answerText,
            selectedOptions,
            timeSpent
        }, 'exam');

        const stats = await prisma.examAttempt.findUnique({ where: { id: attemptId } });

        res.status(200).json({
            success: true,
            data: {
                isCorrect,
                points,
                correctAnswers: stats?.correctAnswers,
                totalQuestions: stats?.totalQuestions,
            },
        });
    } catch (error) {
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

        const examAttempt = await prisma.examAttempt.findUnique({
            where: { id: attemptId },
            include: { exam: true }
        });

        if (!examAttempt || examAttempt.candidateId !== candidateId) {
            throw new NotFoundError('Exam attempt not found');
        }

        const updatedAttempt = await AttemptService.finalizeAttempt(attemptId, 'exam');

        res.status(200).json({
            success: true,
            data: {
                attemptId: updatedAttempt.id,
                score: updatedAttempt.score,
                isPassed: updatedAttempt.isPassed,
                passingScore: examAttempt.exam.passingScore,
                totalQuestions: updatedAttempt.totalQuestions,
                answeredQuestions: updatedAttempt.totalQuestions,
                correctAnswers: updatedAttempt.correctAnswers,
                timeSpent: updatedAttempt.timeSpent,
                submittedAt: updatedAttempt.endTime?.toISOString(),
            },
            message: 'Exam submitted successfully',
        });
    } catch (error) {
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
            success: true,
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
        const user = req.user as any;

        const exam = await prisma.exam.findUnique({
            where: { id: examId },
            select: { organizationId: true }
        });

        if (!exam) {
            res.status(404).json({ status: 'error', message: 'Exam not found' });
            return;
        }

        const orgWhere = getTenantFilter(req, { id: exam.organizationId });
        const organization = await prisma.organization.findFirst({
            where: orgWhere
        });

        if (!organization) {
            res.status(403).json({
                status: 'fail',
                message: 'You do not have access to this exam results'
            });
            return;
        }

        const where: any = { examId };
        if (status) {
            where.status = status;
        }

        const [attempts, total] = await Promise.all([
            prisma.examAttempt.findMany({
                where,
                skip,
                take: Number(limit),
                orderBy: { score: 'desc' }, // Updated to sort by score (rank)
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
            success: true,
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

export const getGlobalExamResults = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { organizationId, examId, startDate, endDate, status, page, limit, batch } = req.query;
        const user = req.user as any;

        const where: any = { status: 'COMPLETED' }; // Default to completed exams usually

        if (organizationId) {
            const orgWhere = getTenantFilter(req, { id: String(organizationId) });
            const organization = await prisma.organization.findFirst({
                where: orgWhere
            });

            if (!organization) {
                res.status(403).json({
                    success: false,
                    error: {
                        message: 'You do not have access to this organization\'s results',
                        code: 'ORG_ACCESS_DENIED'
                    }
                });
                return;
            }
            where.exam = { organizationId: String(organizationId) };
        } else {
            const tenantFilter = getTenantFilter(req);
            where.exam = { organizationId: tenantFilter.organizationId || { not: undefined } };
        }

        if (batch) {
            // Merge with existing candidate where or create new
            where.candidate = { ...where.candidate, batch: { contains: String(batch) } };
        }

        if (examId) {
            where.examId = String(examId);
            // If we have exam object constraint already, merge it
            if (where.exam) {
                // keep organization check implicit or explicit
            }
        }

        if (startDate && endDate) {
            where.endTime = {
                gte: new Date(String(startDate)),
                lte: new Date(String(endDate)),
            };
        }

        if (status && status !== 'ALL') {
            // Pass/Fail status
            if (status === 'PASSED') where.isPassed = true;
            if (status === 'FAILED') where.isPassed = false;
        }

        // Pagination
        const isPaginationEnabled = page && limit;
        const skip = isPaginationEnabled ? (Number(page) - 1) * Number(limit) : undefined;
        const take = isPaginationEnabled ? Number(limit) : undefined;

        const [attempts, total] = await Promise.all([
            prisma.examAttempt.findMany({
                where,
                skip,
                take,
                orderBy: { startTime: 'desc' }, // Usually show most recent first
                include: {
                    candidate: {
                        select: {
                            id: true, // Need UUID for assignment lookup
                            candidateId: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            phoneNumber: true,
                        },
                    },
                    exam: {
                        select: {
                            id: true, // Need UUID for assignment lookup
                            title: true,
                            passingScore: true,
                        }
                    }
                },
            }),
            prisma.examAttempt.count({ where }),
        ]);

        // Attach assignments and marking status to each attempt
        const attemptsWithAssignments = await Promise.all(attempts.map(async (attempt) => {
            const [assignment, unmarkedCount] = await Promise.all([
                prisma.examAssignment.findUnique({
                    where: {
                        candidateId_examId: {
                            candidateId: attempt.candidateId,
                            examId: attempt.examId,
                        }
                    }
                }),
                prisma.examAnswer.count({
                    where: {
                        examAttemptId: attempt.id,
                        manualScore: null,
                        examQuestion: {
                            type: { in: ['ESSAY', 'SHORT_ANSWER'] }
                        }
                    }
                })
            ]);

            return {
                ...attempt,
                assignment,
                isMarkingPending: unmarkedCount > 0
            };
        }));

        // Calculate Average Score for the set
        const totalScore = await prisma.examAttempt.aggregate({
            where,
            _avg: { score: true }
        });
        const averageScore = totalScore._avg.score || 0;

        res.status(200).json({
            success: true,
            data: attemptsWithAssignments,
            meta: {
                total,
                averageScore,
            },
            pagination: isPaginationEnabled ? {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            } : undefined,
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
        const user = req.user as any;

        const exam = await prisma.exam.findUnique({
            where: { id: examId },
            select: { organizationId: true }
        });

        if (!exam) {
            res.status(404).json({ status: 'error', message: 'Exam not found' });
            return;
        }

        const orgWhere = getTenantFilter(req, { id: exam.organizationId });
        const organization = await prisma.organization.findFirst({
            where: orgWhere
        });

        if (!organization) {
            res.status(403).json({
                status: 'fail',
                message: 'You do not have access to this exam analytics'
            });
            return;
        }

        const stats = await calculateExamStatistics(examId);
        const questionStats = await calculateQuestionStatistics(examId);

        res.status(200).json({
            success: true,
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
        const { organizationId, startDate, endDate } = req.query;
        const user = req.user as any;

        const dateFilter: any = {};
        if (startDate && endDate) {
            dateFilter.createdAt = {
                gte: new Date(String(startDate)),
                lte: new Date(String(endDate)),
            };
        }

        let whereOrg: any = {};
        if (organizationId) {
            const orgWhere = getTenantFilter(req, { id: String(organizationId) });
            const organization = await prisma.organization.findFirst({
                where: orgWhere
            });

            if (!organization) {
                res.status(403).json({
                    status: 'fail',
                    message: 'You do not have access to this organization\'s statistics'
                });
                return;
            }
            whereOrg = { organizationId: String(organizationId) };
        } else {
            const tenantFilter = getTenantFilter(req);
            if (tenantFilter.organizationId) {
                whereOrg = { organizationId: tenantFilter.organizationId };
            }
        }
        const whereOrgWithDate = { ...whereOrg, ...dateFilter };

        // 1. Exam Counts
        const [totalExams, publishedExams, draftExams] = await Promise.all([
            prisma.exam.count({ where: whereOrgWithDate }),
            prisma.exam.count({ where: { ...whereOrgWithDate, status: 'PUBLISHED' } }),
            prisma.exam.count({ where: { ...whereOrgWithDate, status: 'DRAFT' } }),
        ]);

        // 2. Candidate Counts
        const totalCandidates = await prisma.candidate.count({ where: whereOrgWithDate });

        // 3. Organization Count (Global Only - For authorized ones)
        let totalOrganizations = 0;
        if (!organizationId) {
            const tenantFilter = getTenantFilter(req, dateFilter);
            totalOrganizations = await prisma.organization.count({
                where: tenantFilter
            });
        }

        // 4. Question Count (Global or Org)
        let totalQuestions = 0;
        if (organizationId) {
            const exams = await prisma.exam.findMany({
                where: whereOrg,
                select: { id: true }
            });
            const examIds = exams.map(e => e.id);
            totalQuestions = await prisma.examQuestion.count({
                where: { examId: { in: examIds } } // Note: Questions don't have createdAt usually, so tough to filter by date
            });
        } else {
            totalQuestions = await prisma.examQuestion.count();
        }

        // 5. Attempt Stats
        let attemptWhere: any = {};

        // Date filter for attempts applies to startTime
        if (startDate && endDate) {
            attemptWhere.startTime = {
                gte: new Date(String(startDate)),
                lte: new Date(String(endDate)),
            };
        }

        if (whereOrg.organizationId) {
            attemptWhere.exam = {
                organizationId: whereOrg.organizationId
            };
        }

        const totalAttempts = await prisma.examAttempt.count({ where: attemptWhere });
        const passedAttempts = await prisma.examAttempt.count({
            where: { ...attemptWhere, isPassed: true }
        });

        // 6. Recent Activity
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

        // 7. Avg Score
        const completedAttempts = await prisma.examAttempt.findMany({
            where: { ...attemptWhere, status: 'COMPLETED' },
            select: { score: true }
        });

        const avgScore = completedAttempts.length > 0
            ? completedAttempts.reduce((acc, curr) => acc + (curr.score || 0), 0) / completedAttempts.length
            : 0;

        // 8. Exam Duration Stats (Avg Time Spent per Exam) - Top 5 by attempts
        // This is complex, we need to group by exam
        // We will fetch all completed attempts with their exam titles and durations (endTime - startTime)
        const durationAttempts = await prisma.examAttempt.findMany({
            where: {
                ...attemptWhere,
                status: 'COMPLETED',
                endTime: { not: null },
            },
            select: {
                exam: { select: { title: true } },
                startTime: true,
                endTime: true
            }
        });

        const examDurations: Record<string, { totalTime: number, count: number }> = {};

        durationAttempts.forEach(attempt => {
            const title = attempt.exam.title;
            const start = new Date(attempt.startTime!).getTime();
            const end = new Date(attempt.endTime!).getTime();
            const durationMinutes = (end - start) / (1000 * 60);

            if (!examDurations[title]) {
                examDurations[title] = { totalTime: 0, count: 0 };
            }
            examDurations[title].totalTime += durationMinutes;
            examDurations[title].count += 1;
        });

        const examDurationStats = Object.keys(examDurations).map(title => ({
            examTitle: title,
            avgTimeMinutes: Math.round(examDurations[title].totalTime / examDurations[title].count)
        })).sort((a, b) => b.avgTimeMinutes - a.avgTimeMinutes).slice(0, 10); // Top 10 longest interactions

        res.status(200).json({
            success: true,
            data: {
                organizations: {
                    total: totalOrganizations
                },
                questions: {
                    total: totalQuestions
                },
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
                    avgScore: Math.round(avgScore * 10) / 10,
                    passRate: totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0
                },
                examDurationStats,
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

export const authorizeRetake = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { assignmentId } = req.params;
        const { allowRetake } = req.body;

        const assignment = await prisma.examAssignment.update({
            where: { id: assignmentId },
            data: { allowRetake: allowRetake !== false },
            include: {
                candidate: true,
                exam: true,
            },
        });

        res.status(200).json({
            success: true,
            data: assignment,
            message: `Retake ${assignment.allowRetake ? 'authorized' : 'deauthorized'} for ${assignment.candidate.firstName}`,
        });
    } catch (error) {
        logger.error(error);
        next(error);
    }
};

// ============================================
// NEW FEATURE ENDPOINTS
// ============================================

// --- Organization Management ---

export const uploadOrganizationLogo = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;
        // @ts-ignore
        const file = req.file;

        if (!file) {
            res.status(400).json({
                status: 'error',
                message: 'No file uploaded'
            });
            return;
        }

        const organization = await prisma.organization.findUnique({
            where: { id }
        });

        if (!organization) {
            res.status(404).json({
                status: 'error',
                message: 'Organization not found'
            });
            return;
        }

        // In a real implementation, you would upload to S3/Cloudinary here
        // For now, we'll assume the file path/url is available from the upload middleware
        // This depends on how the upload middleware is configured. 
        // Assuming it sets file.path or file.location
        const logoUrl = file.path || (file as any).location || file.filename;

        const updatedOrg = await prisma.organization.update({
            where: { id },
            data: { logo: logoUrl }
        });

        res.status(200).json({
            success: true,
            message: 'Organization logo uploaded successfully',
            data: updatedOrg
        });
    } catch (error) {
        logger.error(error);
        next(error);
    }
};

// --- Candidate Management ---

export const archiveCandidate = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;
        const user = req.user as any;

        const candidate = await prisma.candidate.findUnique({
            where: { id }
        });

        if (!candidate) {
            res.status(404).json({
                status: 'error',
                message: 'Candidate not found'
            });
            return;
        }

        const orgWhere = getTenantFilter(req, { id: candidate.organizationId });
        const organization = await prisma.organization.findFirst({
            where: orgWhere
        });

        if (!organization) {
            res.status(403).json({
                status: 'fail',
                message: 'You do not have access to this candidate'
            });
            return;
        }

        const updatedCandidate = await prisma.candidate.update({
            where: { id },
            data: { archived: true }
        });

        res.status(200).json({
            success: true,
            message: 'Candidate archived successfully',
            data: updatedCandidate
        });
    } catch (error) {
        logger.error(error);
        next(error);
    }
};

export const unarchiveCandidate = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;
        const user = req.user as any;

        const candidate = await prisma.candidate.findUnique({
            where: { id }
        });

        if (!candidate) {
            res.status(404).json({
                status: 'error',
                message: 'Candidate not found'
            });
            return;
        }

        const orgWhere = getTenantFilter(req, { id: candidate.organizationId });
        const organization = await prisma.organization.findFirst({
            where: orgWhere
        });

        if (!organization) {
            res.status(403).json({
                status: 'fail',
                message: 'You do not have access to this candidate'
            });
            return;
        }

        const updatedCandidate = await prisma.candidate.update({
            where: { id },
            data: { archived: false }
        });

        res.status(200).json({
            success: true,
            message: 'Candidate unarchived successfully',
            data: updatedCandidate
        });
    } catch (error) {
        logger.error(error);
        next(error);
    }
};

// --- Exam Management ---

export const archiveExam = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;
        const user = req.user as any;

        const exam = await prisma.exam.findUnique({
            where: { id }
        });

        if (!exam) {
            res.status(404).json({
                status: 'error',
                message: 'Exam not found'
            });
            return;
        }

        const orgWhere = getTenantFilter(req, { id: exam.organizationId });
        const organization = await prisma.organization.findFirst({
            where: orgWhere
        });

        if (!organization) {
            res.status(403).json({
                success: false,
                error: {
                    message: 'You do not have access to this exam',
                    code: 'ORG_ACCESS_DENIED'
                }
            });
            return;
        }

        const updatedExam = await prisma.exam.update({
            where: { id },
            data: { status: 'ARCHIVED' }
        });

        res.status(200).json({
            success: true,
            message: 'Exam archived successfully',
            data: updatedExam
        });
    } catch (error) {
        logger.error(error);
        next(error);
    }
};

export const unarchiveExam = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;
        const user = req.user as any;

        const exam = await prisma.exam.findUnique({
            where: { id }
        });

        if (!exam) {
            res.status(404).json({
                status: 'error',
                message: 'Exam not found'
            });
            return;
        }

        const orgWhere = getTenantFilter(req, { id: exam.organizationId });
        const organization = await prisma.organization.findFirst({
            where: orgWhere
        });

        if (!organization) {
            res.status(403).json({
                success: false,
                error: {
                    message: 'You do not have access to this exam',
                    code: 'ORG_ACCESS_DENIED'
                }
            });
            return;
        }

        const updatedExam = await prisma.exam.update({
            where: { id },
            data: { status: 'DRAFT' } // Reset to draft or previous status
        });

        res.status(200).json({
            success: true,
            message: 'Exam unarchived successfully',
            data: updatedExam
        });
    } catch (error) {
        logger.error(error);
        next(error);
    }
};

// --- Manual Marking ---

export const getOpenEndedResponses = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { examId } = req.params;
        const { organizationId } = req.query;
        const user = req.user as any;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const skip = (page - 1) * limit;

        const whereQuestion: any = {
            type: { in: ['ESSAY', 'SHORT_ANSWER'] }
        };

        if (organizationId) {
            const orgWhere = getTenantFilter(req, { id: String(organizationId) });
            const organization = await prisma.organization.findFirst({
                where: orgWhere
            });

            if (!organization) {
                res.status(403).json({
                    status: 'fail',
                    message: 'You do not have access to this organization'
                });
                return;
            }
            whereQuestion.exam = { organizationId: String(organizationId) };
        } else {
            const tenantFilter = getTenantFilter(req);
            if (tenantFilter.organizationId) {
                whereQuestion.exam = { organizationId: tenantFilter.organizationId };
            }
        }

        if (examId && examId !== 'all') {
            whereQuestion.examId = examId;
        }

        // Fetch questions first to filter by type
        const openEndedQuestions = await prisma.examQuestion.findMany({
            where: whereQuestion,
            select: { id: true }
        });

        const questionIds = openEndedQuestions.map(q => q.id);

        if (questionIds.length === 0) {
            res.status(200).json({
                success: true,
                data: {
                    responses: [],
                    pagination: {
                        page,
                        limit,
                        total: 0,
                        totalPages: 0
                    }
                }
            });
            return;
        }

        const [responses, total] = await Promise.all([
            prisma.examAnswer.findMany({
                where: {
                    examQuestionId: { in: questionIds }
                },
                include: {
                    examQuestion: true,
                    examAttempt: {
                        include: {
                            candidate: true
                        }
                    },
                    marker: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.examAnswer.count({
                where: {
                    examQuestionId: { in: questionIds }
                }
            })
        ]);

        res.status(200).json({
            success: true,
            message: 'Open-ended responses retrieved successfully',
            data: {
                responses,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        logger.error(error);
        next(error);
    }
};

export const markAnswer = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { answerId } = req.params;
        const { manualScore, feedback } = req.body;
        const user = req.user as any;

        const answer = await prisma.examAnswer.findUnique({
            where: { id: answerId },
            include: {
                examQuestion: true,
                examAttempt: {
                    include: {
                        exam: { select: { organizationId: true } }
                    }
                }
            }
        });

        if (!answer) {
            throw new NotFoundError('Answer not found');
        }

        // Check if the attempt is still mutable
        const isMutable = await AssessmentService.isMutable(answer.examAttemptId, 'EXAM');
        if (!isMutable) {
            res.status(403).json({
                status: 'fail',
                message: 'This exam result has already been approved and cannot be modified.',
            });
            return;
        }

        if (!answer) {
            res.status(404).json({ status: 'error', message: 'Answer not found' });
            return;
        }

        const orgWhere = getTenantFilter(req, { id: answer.examAttempt.exam.organizationId });
        const organization = await prisma.organization.findFirst({
            where: orgWhere
        });

        if (!organization) {
            res.status(403).json({
                status: 'fail',
                message: 'You do not have access to mark this answer'
            });
            return;
        }

        if (manualScore > answer.examQuestion.points) {
            res.status(400).json({
                status: 'error',
                message: `Score cannot exceed maximum points (${answer.examQuestion.points})`
            });
            return;
        }

        const updatedAnswer = await prisma.examAnswer.update({
            where: { id: answerId },
            data: {
                manualScore,
                feedback,
                markedBy: user.id,
                markedAt: new Date(),
                points: manualScore
            }
        });

        // Recalculate Exam Attempt Score
        const attemptAnswers = await prisma.examAnswer.findMany({
            where: { examAttemptId: answer.examAttemptId }
        });

        const totalScore = attemptAnswers.reduce((sum, a) => sum + (a.points || 0), 0);

        const attempt = await prisma.examAttempt.findUnique({
            where: { id: answer.examAttemptId },
            include: {
                exam: {
                    include: {
                        questions: true
                    }
                }
            }
        });

        if (attempt) {
            const questions = attempt.exam.questions;
            const totalPossiblePoints = questions.reduce((sum, q) => sum + (q.points || 0), 0);

            const scorePercentage = calculateExamScore(totalPossiblePoints, totalScore);
            const isPassed = scorePercentage >= attempt.exam.passingScore;

            await prisma.examAttempt.update({
                where: { id: answer.examAttemptId },
                data: {
                    score: scorePercentage,
                    isPassed
                }
            });
        }

        res.status(200).json({
            success: true,
            message: 'Answer marked successfully',
            data: updatedAnswer
        });
    } catch (error) {
        logger.error(error);
        next(error);
    }
};

import { generateOpenEndedPDF } from '../utils/pdfGenerator';
import { generateDetailedResultsPDF } from '../utils/pdfGenerator';

export const exportDetailedResultsPDF = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { examId } = req.params;
        const user = req.user as any;

        const exam = await prisma.exam.findUnique({
            where: { id: examId }
        });

        if (!exam) {
            res.status(404).json({
                status: 'error',
                message: 'Exam not found'
            });
            return;
        }

        const orgWhere = getTenantFilter(req, { id: exam.organizationId });
        const organization = await prisma.organization.findFirst({
            where: orgWhere
        });

        if (!organization) {
            res.status(403).json({
                status: 'fail',
                message: 'You do not have access to this exam results'
            });
            return;
        }

        const attempts = await prisma.examAttempt.findMany({
            where: {
                examId,
                status: 'COMPLETED'
            },
            include: {
                candidate: true,
                answers: {
                    include: {
                        examQuestion: true
                    }
                }
            },
            orderBy: { score: 'desc' }
        });

        if (attempts.length === 0) {
            res.status(404).json({
                status: 'error',
                message: 'No completed attempts found for this exam'
            });
            return;
        }

        generateDetailedResultsPDF(attempts, exam.title, res);

    } catch (error) {
        logger.error(error);
        next(error);
    }
};

export const exportOpenEndedResponsesPDF = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { examId } = req.params;
        const { organizationId } = req.query;
        const user = req.user as any;

        let examTitle = 'All Exams';
        const whereQuestion: any = {
            type: { in: ['ESSAY', 'SHORT_ANSWER'] }
        };

        if (organizationId) {
            const orgWhere = getTenantFilter(req, { id: String(organizationId) });
            const organization = await prisma.organization.findFirst({
                where: orgWhere
            });

            if (!organization) {
                res.status(403).json({
                    status: 'fail',
                    message: 'You do not have access to this organization'
                });
                return;
            }
            whereQuestion.exam = { organizationId: String(organizationId) };
        } else {
            const tenantFilter = getTenantFilter(req);
            if (tenantFilter.organizationId) {
                whereQuestion.exam = { organizationId: tenantFilter.organizationId };
            }
        }

        if (examId && examId !== 'all') {
            const exam = await prisma.exam.findUnique({
                where: { id: examId }
            });
            if (!exam) {
                res.status(404).json({ status: 'error', message: 'Exam not found' });
                return;
            }
            examTitle = exam.title;
            whereQuestion.examId = examId;
        }

        const openEndedQuestions = await prisma.examQuestion.findMany({
            where: whereQuestion,
            select: { id: true }
        });

        const questionIds = openEndedQuestions.map(q => q.id);

        if (questionIds.length === 0) {
            res.status(404).json({
                status: 'error',
                message: 'No open-ended questions found'
            });
            return;
        }

        const responses = await prisma.examAnswer.findMany({
            where: {
                examQuestionId: { in: questionIds }
            },
            include: {
                examQuestion: true,
                examAttempt: {
                    include: {
                        candidate: true
                    }
                }
            },
            orderBy: [
                { examQuestionId: 'asc' }, // Group by question
                { createdAt: 'desc' }
            ]
        });

        // Map to flat structure expected by generator
        const flatResponses = responses.map(r => ({
            ...r,
            question: r.examQuestion,
            candidate: r.examAttempt.candidate
        }));

        generateOpenEndedPDF(flatResponses as any, examTitle, res);

    } catch (error) {
        logger.error(error);
        next(error);
    }
};

export const submitExamForApproval = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { attemptId } = req.params;
        const user = (req as any).user;

        await AssessmentService.submitForApproval(attemptId, 'EXAM', user.id);

        res.status(200).json({
            success: true,
            message: 'Exam result submitted for approval successfully',
        });
    } catch (error) {
        logger.error(error);
        next(error);
    }
};

export const approveExamResult = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { attemptId } = req.params;
        const user = (req as any).user;

        await AssessmentService.approveResult(attemptId, 'EXAM', user.id);

        res.status(200).json({
            success: true,
            message: 'Exam result approved successfully. It is now immutable.',
        });
    } catch (error) {
        logger.error(error);
        next(error);
    }
};



