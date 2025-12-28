import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

/**
 * Generate a unique exam code
 * Format: XXXX-XXXX (8 characters)
 */
export const generateExamCode = async (): Promise<string> => {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude similar-looking characters
    let examCode = '';
    let isUnique = false;

    while (!isUnique) {
        examCode = '';
        for (let i = 0; i < 8; i++) {
            if (i === 4) examCode += '-';
            examCode += characters.charAt(Math.floor(Math.random() * characters.length));
        }

        // Check if exam code already exists
        const existingExam = await prisma.exam.findUnique({
            where: { examCode },
        });

        if (!existingExam) {
            isUnique = true;
        }
    }

    return examCode;
};

/**
 * Generate a unique candidate ID
 * Format: CAND-XXXXXX
 */
export const generateCandidateId = async (organizationId: string): Promise<string> => {
    const characters = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let candidateId = '';
    let isUnique = false;

    while (!isUnique) {
        candidateId = 'CAND-';
        for (let i = 0; i < 6; i++) {
            candidateId += characters.charAt(Math.floor(Math.random() * characters.length));
        }

        // Check if candidate ID already exists
        const existingCandidate = await prisma.candidate.findUnique({
            where: { candidateId },
        });

        if (!existingCandidate) {
            isUnique = true;
        }
    }

    return candidateId;
};

/**
 * Check if exam is available for taking
 */
export const isExamAvailable = (exam: any): { available: boolean; reason?: string } => {
    if (!exam.isActive) {
        return { available: false, reason: 'Exam is not active' };
    }

    if (exam.status !== 'PUBLISHED') {
        return { available: false, reason: 'Exam is not published' };
    }

    const now = new Date();

    if (exam.startDate && new Date(exam.startDate) > now) {
        return { available: false, reason: 'Exam has not started yet' };
    }

    if (exam.endDate && new Date(exam.endDate) < now) {
        return { available: false, reason: 'Exam has ended' };
    }

    return { available: true };
};

/**
 * Check if candidate has remaining attempts
 */
export const hasRemainingAttempts = async (
    candidateId: string,
    examId: string,
    maxAttempts: number | null
): Promise<{ hasAttempts: boolean; attemptsUsed: number; attemptsRemaining: number | null }> => {
    const attempts = await prisma.examAttempt.findMany({
        where: {
            candidateId,
            examId,
        },
    });

    const attemptsUsed = attempts.length;

    if (maxAttempts === null) {
        return { hasAttempts: true, attemptsUsed, attemptsRemaining: null };
    }

    const attemptsRemaining = maxAttempts - attemptsUsed;

    return {
        hasAttempts: attemptsRemaining > 0,
        attemptsUsed,
        attemptsRemaining,
    };
};

/**
 * Auto-grade multiple choice and true/false questions
 */
export const autoGradeAnswer = (
    question: any,
    selectedOptions: string[]
): { isCorrect: boolean; points: number } => {
    if (question.type !== 'MULTIPLE_CHOICE' && question.type !== 'TRUE_FALSE') {
        return { isCorrect: false, points: 0 };
    }

    const correctOptions = question.options
        .filter((opt: any) => opt.isCorrect)
        .map((opt: any) => opt.id);

    const selected = Array.isArray(selectedOptions) ? selectedOptions : [];

    // Check if all correct options are selected and no incorrect ones
    const isCorrect =
        correctOptions.length === selected.length &&
        correctOptions.every((optId: string) => selected.includes(optId));

    const points = isCorrect ? question.points : 0;

    return { isCorrect, points };
};

/**
 * Calculate final exam score
 */
export const calculateExamScore = (
    totalPoints: number,
    earnedPoints: number
): number => {
    if (totalPoints === 0) return 0;
    return (earnedPoints / totalPoints) * 100;
};

/**
 * Calculate exam statistics
 */
export const calculateExamStatistics = async (examId: string) => {
    const attempts = await prisma.examAttempt.findMany({
        where: {
            examId,
            status: 'COMPLETED',
        },
        include: {
            candidate: true,
            answers: true,
        },
    });

    if (attempts.length === 0) {
        return {
            totalAttempts: 0,
            averageScore: 0,
            passRate: 0,
            averageTimeSpent: 0,
            highestScore: 0,
            lowestScore: 0,
        };
    }

    const scores = attempts.map((a) => a.score || 0);
    const timeSpents = attempts.filter((a) => a.timeSpent).map((a) => a.timeSpent || 0);
    const passedCount = attempts.filter((a) => a.isPassed).length;

    return {
        totalAttempts: attempts.length,
        averageScore: scores.reduce((sum, s) => sum + s, 0) / scores.length,
        passRate: (passedCount / attempts.length) * 100,
        averageTimeSpent: timeSpents.length > 0
            ? timeSpents.reduce((sum, t) => sum + t, 0) / timeSpents.length
            : 0,
        highestScore: Math.max(...scores),
        lowestScore: Math.min(...scores),
    };
};

/**
 * Calculate question-level statistics
 */
export const calculateQuestionStatistics = async (examId: string) => {
    const questions = await prisma.examQuestion.findMany({
        where: { examId },
        include: {
            answers: {
                where: {
                    examAttempt: {
                        status: 'COMPLETED',
                    },
                },
            },
        },
    });

    return questions.map((question) => {
        const totalAnswers = question.answers.length;
        const correctAnswers = question.answers.filter((a) => a.isCorrect).length;
        const averageTimeSpent =
            question.answers.filter((a) => a.timeSpent).length > 0
                ? question.answers
                    .filter((a) => a.timeSpent)
                    .reduce((sum, a) => sum + (a.timeSpent || 0), 0) / totalAnswers
                : 0;

        return {
            questionId: question.id,
            question: question.question,
            type: question.type,
            points: question.points,
            totalAnswers,
            correctAnswers,
            incorrectAnswers: totalAnswers - correctAnswers,
            successRate: totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0,
            averageTimeSpent,
            difficulty: totalAnswers > 0 ? 100 - (correctAnswers / totalAnswers) * 100 : 0, // Higher % = harder
        };
    });
};

export default {
    generateExamCode,
    generateCandidateId,
    isExamAvailable,
    hasRemainingAttempts,
    autoGradeAnswer,
    calculateExamScore,
    calculateExamStatistics,
    calculateQuestionStatistics,
};
