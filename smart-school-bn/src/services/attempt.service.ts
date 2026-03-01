import { TestAttemptStatus, ExamAttemptStatus, QuestionType, ExamQuestionType } from "@prisma/client";
import prisma from "./prisma.singleton";
import { v4 as uuidv4 } from 'uuid';
import { AssessmentService } from "./assessment.service";

export type AttemptContext = 'test' | 'exam';

export interface AnswerData {
    questionId: string;
    answerText?: string;
    selectedOptions?: string[];
    timeSpent?: number; // In seconds
}

export class AttemptService {
    /**
     * Starts a new attempt for a test or exam.
     */
    static async startAttempt(parentId: string, participantId: string, context: AttemptContext) {
        return prisma.$transaction(async (tx) => {
            if (context === 'test') {
                const test = await tx.test.findUnique({
                    where: { id: parentId },
                    include: { questions: { where: { isActive: true } } }
                });
                if (!test) throw new Error("Test not found");

                return tx.testAttempt.create({
                    data: {
                        id: uuidv4(),
                        test: { connect: { id: parentId } },
                        user: { connect: { id: participantId } },
                        totalQuestions: test.questions.length,
                        status: 'IN_PROGRESS'
                    }
                });
            } else {
                const exam = await tx.exam.findUnique({
                    where: { id: parentId },
                    include: { questions: { where: { isActive: true } } }
                });
                if (!exam) throw new Error("Exam not found");

                return tx.examAttempt.create({
                    data: {
                        id: uuidv4(),
                        exam: { connect: { id: parentId } },
                        candidate: { connect: { id: participantId } },
                        totalQuestions: exam.questions.length,
                        status: 'IN_PROGRESS'
                    }
                });
            }
        });
    }

    /**
     * Submits or updates an answer within an attempt.
     */
    static async submitAnswer(attemptId: string, data: AnswerData, context: AttemptContext) {
        const { questionId, answerText, selectedOptions, timeSpent } = data;

        return prisma.$transaction(async (tx) => {
            let isCorrect = false;
            let points = 0;
            let selectedOptionTexts: string[] = [];

            if (context === 'test') {
                const question = await tx.question.findUnique({ where: { id: questionId }, include: { options: true } });
                if (!question) throw new Error("Question not found");

                // Auto-grading for objective questions
                if (question.type === 'MULTIPLE_CHOICE' || question.type === 'TRUE_FALSE') {
                    const correctOptions = question.options.filter(o => o.isCorrect).map(o => o.id);
                    const gradeResult = AssessmentService.autoGrade(question.type, selectedOptions || [], correctOptions);
                    isCorrect = gradeResult.isCorrect;
                    points = isCorrect ? question.points : 0;
                }

                selectedOptionTexts = question.options
                    .filter(opt => selectedOptions?.includes(opt.id))
                    .map(opt => opt.option);

                const existingAnswer = await tx.answer.findFirst({ where: { testAttemptId: attemptId, questionId } });

                await tx.answer.upsert({
                    where: { id: existingAnswer?.id || uuidv4() },
                    create: {
                        id: uuidv4(),
                        testAttemptId: attemptId,
                        questionId,
                        answerText,
                        selectedOptions: selectedOptions || [],
                        userAnswer: selectedOptionTexts,
                        isCorrect,
                        points
                    },
                    update: {
                        answerText,
                        selectedOptions: selectedOptions || [],
                        userAnswer: selectedOptionTexts,
                        isCorrect,
                        points
                    }
                });
            } else {
                const question = await tx.examQuestion.findUnique({ where: { id: questionId }, include: { options: true } });
                if (!question) throw new Error("Question not found");

                if (question.type === 'MULTIPLE_CHOICE' || question.type === 'TRUE_FALSE') {
                    const correctOptions = question.options.filter(o => o.isCorrect).map(o => o.id);
                    const gradeResult = AssessmentService.autoGrade(question.type, selectedOptions || [], correctOptions);
                    isCorrect = gradeResult.isCorrect;
                    points = isCorrect ? question.points : 0;
                }

                selectedOptionTexts = question.options
                    .filter(opt => selectedOptions?.includes(opt.id))
                    .map(opt => opt.option);

                const existingAnswer = await tx.examAnswer.findFirst({ where: { examAttemptId: attemptId, examQuestionId: questionId } });

                await tx.examAnswer.upsert({
                    where: { id: existingAnswer?.id || uuidv4() },
                    create: {
                        id: uuidv4(),
                        examAttemptId: attemptId,
                        examQuestionId: questionId,
                        answerText,
                        selectedOptions: selectedOptions || [],
                        userAnswer: selectedOptionTexts,
                        isCorrect,
                        points,
                        timeSpent
                    },
                    update: {
                        answerText,
                        selectedOptions: selectedOptions || [],
                        userAnswer: selectedOptionTexts,
                        isCorrect,
                        points,
                        timeSpent
                    }
                });
            }

            // Update intermediate attempt stats
            await this.calculateAttemptStats(attemptId, context, tx);

            return { isCorrect, points };
        });
    }

    /**
     * Finalizes the attempt and records the end time and final score.
     */
    static async finalizeAttempt(attemptId: string, context: AttemptContext) {
        return prisma.$transaction(async (tx) => {
            const now = new Date();
            const stats = await this.calculateAttemptStats(attemptId, context, tx);

            if (context === 'test') {
                const attempt = await tx.testAttempt.findUnique({ where: { id: attemptId } });
                const timeSpent = attempt ? Math.floor((now.getTime() - attempt.startTime.getTime()) / 1000 / 60) : 0;

                return tx.testAttempt.update({
                    where: { id: attemptId },
                    data: {
                        endTime: now,
                        status: 'COMPLETED',
                        timeSpent,
                        score: stats.score,
                        isPassed: stats.isPassed
                    }
                });
            } else {
                const attempt = await tx.examAttempt.findUnique({ where: { id: attemptId } });
                const timeSpent = attempt ? Math.floor((now.getTime() - attempt.startTime.getTime()) / 1000) : 0;

                return tx.examAttempt.update({
                    where: { id: attemptId },
                    data: {
                        endTime: now,
                        status: 'COMPLETED',
                        timeSpent,
                        score: stats.score,
                        isPassed: stats.isPassed
                    }
                });
            }
        });
    }

    /**
     * Internal helper to calculate scores and passing status.
     */
    private static async calculateAttemptStats(attemptId: string, context: AttemptContext, tx: any) {
        if (context === 'test') {
            const attempt = await tx.testAttempt.findUnique({
                where: { id: attemptId },
                include: { test: { include: { questions: { where: { isActive: true } } } }, answers: true }
            });

            const totalMaxPoints = attempt.test.questions.reduce((sum: number, q: any) => sum + (q.points || 0), 0);
            const totalEarnedPoints = attempt.answers.reduce((sum: number, a: any) => sum + (a.points || 0), 0);
            const correctAnswers = attempt.answers.filter((a: any) => a.isCorrect).length;

            const score = totalMaxPoints > 0 ? (totalEarnedPoints / totalMaxPoints) * 100 : 0;
            const isPassed = score >= attempt.test.passingScore;

            await tx.testAttempt.update({
                where: { id: attemptId },
                data: { score, isPassed, correctAnswers }
            });

            return { score, isPassed, correctAnswers };
        } else {
            const attempt = await tx.examAttempt.findUnique({
                where: { id: attemptId },
                include: { exam: { include: { questions: { where: { isActive: true } } } }, answers: true }
            });

            const totalMaxPoints = attempt.exam.questions.reduce((sum: number, q: any) => sum + (q.points || 0), 0);
            const totalEarnedPoints = attempt.answers.reduce((sum: number, a: any) => sum + (a.points || 0), 0);
            const correctAnswers = attempt.answers.filter((a: any) => a.isCorrect).length;

            const score = totalMaxPoints > 0 ? (totalEarnedPoints / totalMaxPoints) * 100 : 0;
            const isPassed = score >= attempt.exam.passingScore;

            await tx.examAttempt.update({
                where: { id: attemptId },
                data: { score, isPassed, correctAnswers }
            });

            return { score, isPassed, correctAnswers };
        }
    }
}
