import { QuestionType, ExamQuestionType } from "@prisma/client";
import prisma from "./prisma.singleton";
import { v4 as uuidv4 } from 'uuid';

export type QuestionContext = 'test' | 'exam';

export interface QuestionData {
    question: string;
    type: string;
    points?: number;
    explanation?: string;
    order: number;
    image?: string | null;
    options?: { id?: string; option: string; isCorrect: boolean; order: number }[];
}

export class QuestionService {
    /**
     * Creates a new question within a test or exam.
     */
    static async createQuestion(parentId: string, data: QuestionData, context: QuestionContext) {
        const { question, type, points, explanation, order, image, options } = data;

        return prisma.$transaction(async (tx) => {
            if (context === 'test') {
                return tx.question.create({
                    data: {
                        id: uuidv4(),
                        question,
                        type: type as QuestionType,
                        points: points || 1,
                        explanation: explanation || null,
                        order,
                        image: image || null,
                        test: { connect: { id: parentId } },
                        options: options ? {
                            create: options.map(opt => ({
                                id: uuidv4(),
                                option: opt.option,
                                isCorrect: opt.isCorrect,
                                order: opt.order
                            }))
                        } : undefined
                    },
                    include: { options: true }
                });
            } else {
                return tx.examQuestion.create({
                    data: {
                        id: uuidv4(),
                        question,
                        type: type as ExamQuestionType,
                        points: points || 1,
                        explanation: explanation || null,
                        order,
                        image: image || null,
                        exam: { connect: { id: parentId } },
                        options: options ? {
                            create: options.map(opt => ({
                                id: uuidv4(),
                                option: opt.option,
                                isCorrect: opt.isCorrect,
                                order: opt.order
                            }))
                        } : undefined
                    },
                    include: { options: true }
                });
            }
        });
    }

    /**
     * Updates an existing question.
     */
    static async updateQuestion(id: string, data: Partial<QuestionData>, context: QuestionContext) {
        const { question, type, points, explanation, order, image, options } = data;

        return prisma.$transaction(async (tx) => {
            if (context === 'test') {
                // If options are provided, we replace the entire set to ensure consistency
                if (options !== undefined) {
                    await tx.questionOption.deleteMany({ where: { questionId: id } });
                }

                return tx.question.update({
                    where: { id },
                    data: {
                        question,
                        type: type as QuestionType,
                        points,
                        explanation,
                        order,
                        image,
                        options: options ? {
                            create: options.map(opt => ({
                                id: uuidv4(),
                                option: opt.option,
                                isCorrect: opt.isCorrect,
                                order: opt.order
                            }))
                        } : undefined
                    },
                    include: { options: true }
                });
            } else {
                if (options !== undefined) {
                    await tx.examQuestionOption.deleteMany({ where: { examQuestionId: id } });
                }

                return tx.examQuestion.update({
                    where: { id },
                    data: {
                        question,
                        type: type as ExamQuestionType,
                        points,
                        explanation,
                        order,
                        image,
                        options: options ? {
                            create: options.map(opt => ({
                                id: uuidv4(),
                                option: opt.option,
                                isCorrect: opt.isCorrect,
                                order: opt.order
                            }))
                        } : undefined
                    },
                    include: { options: true }
                });
            }
        });
    }

    /**
     * Deletes a question and its options.
     */
    static async deleteQuestion(id: string, context: QuestionContext) {
        if (context === 'test') {
            return prisma.question.delete({ where: { id } });
        } else {
            return prisma.examQuestion.delete({ where: { id } });
        }
    }

    /**
     * Fetches a single question with its options.
     */
    static async getQuestion(id: string, context: QuestionContext) {
        if (context === 'test') {
            return prisma.question.findUnique({
                where: { id },
                include: { options: { orderBy: { order: 'asc' } } }
            });
        } else {
            return prisma.examQuestion.findUnique({
                where: { id },
                include: { options: { orderBy: { order: 'asc' } } }
            });
        }
    }
}
