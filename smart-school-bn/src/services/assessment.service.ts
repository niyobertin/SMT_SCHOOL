import { QuestionType, ExamQuestionType, ApprovalStatus } from "@prisma/client";
import prisma from "../services/prisma.singleton";

export class AssessmentService {
    /**
     * Common grading logic for both Test and Exam questions
     */
    static autoGrade(type: string, userAnswer: string[], correctOptions: string[]): { isCorrect: boolean, points: number, calculatedPoints: number } {
        // Handle variations in QuestionType vs ExamQuestionType
        const isCorrect = this.compareAnswers(userAnswer, correctOptions);
        return {
            isCorrect,
            points: isCorrect ? 1 : 0, // Base points, usually overwritten by question weight
            calculatedPoints: isCorrect ? 1 : 0
        };
    }

    private static compareAnswers(userAnswer: string[], correctOptions: string[]): boolean {
        if (!userAnswer || !correctOptions) return false;
        if (userAnswer.length !== correctOptions.length) return false;

        const sortedUser = [...userAnswer].sort();
        const sortedCorrect = [...correctOptions].sort();

        return sortedUser.every((val, index) => val === sortedCorrect[index]);
    }

    /**
     * Submit an attempt for approval
     */
    static async submitForApproval(attemptId: string, type: 'TEST' | 'EXAM', examinerId: string) {
        if (type === 'TEST') {
            return prisma.testAttempt.update({
                where: { id: attemptId },
                data: { approvalStatus: 'PENDING' }
            });
        } else {
            return prisma.examAttempt.update({
                where: { id: attemptId },
                data: { approvalStatus: 'PENDING' }
            });
        }
    }

    /**
     * Final approval of a result (Makes it immutable)
     */
    static async approveResult(attemptId: string, type: 'TEST' | 'EXAM', adminId: string) {
        const data = {
            approvalStatus: 'APPROVED' as ApprovalStatus,
            approvedById: adminId,
            approvedAt: new Date()
        };

        if (type === 'TEST') {
            return prisma.testAttempt.update({
                where: { id: attemptId },
                data
            });
        } else {
            return prisma.examAttempt.update({
                where: { id: attemptId },
                data
            });
        }
    }

    /**
     * Check if an attempt is mutable
     */
    static async isMutable(attemptId: string, type: 'TEST' | 'EXAM'): Promise<boolean> {
        const attempt = type === 'TEST'
            ? await prisma.testAttempt.findUnique({ where: { id: attemptId } })
            : await prisma.examAttempt.findUnique({ where: { id: attemptId } });

        return attempt?.approvalStatus !== 'APPROVED';
    }
}
