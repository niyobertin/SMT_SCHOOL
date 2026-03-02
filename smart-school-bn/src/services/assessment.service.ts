import { PrismaClient, SubmissionStatus, AssessmentType } from "@prisma/client";

const prisma = new PrismaClient();

export class AssessmentService {
    /**
     * Assessment Management
     */
    async createAssessment(data: any) {
        return prisma.assessment.create({ data });
    }

    async getAssessments(whereClause: any) {
        return prisma.assessment.findMany({
            where: whereClause,
            include: {
                subject: true,
                class: true,
                scores: true
            },
            orderBy: { date: 'desc' }
        });
    }

    /**
     * Score Management
     */
    async saveScores(assessmentId: string, scores: Array<{ studentId: string; score: number }>, userId: string) {
        // Validate if the submission is already locked
        const assessment = await prisma.assessment.findUnique({
            where: { id: assessmentId }
        });

        if (!assessment) throw new Error("Assessment not found");

        const submission = await prisma.resultSubmission.findUnique({
            where: {
                schoolId_classId_term: {
                    schoolId: assessment.schoolId,
                    classId: assessment.classId,
                    term: assessment.term
                }
            }
        });

        if (submission && (submission.status === "SUBMITTED" || submission.status === "APPROVED")) {
            throw new Error(`Results for ${assessment.term} are already ${submission.status.toLowerCase()} and cannot be edited.`);
        }

        // Upsert scores using a transaction for atomic writes
        const results = await prisma.$transaction(
            scores.map(s => prisma.assessmentScore.upsert({
                where: { assessmentId_studentId: { assessmentId, studentId: s.studentId } },
                update: { score: s.score, enteredBy: userId },
                create: {
                    assessmentId,
                    studentId: s.studentId,
                    score: s.score,
                    enteredBy: userId,
                }
            }))
        );

        // Ensure there is at least a DRAFT submission tracking this term
        if (!submission) {
            await prisma.resultSubmission.create({
                data: {
                    schoolId: assessment.schoolId,
                    classId: assessment.classId,
                    term: assessment.term,
                    status: "DRAFT",
                }
            });
        }

        // Audit log
        await prisma.activityLog.create({
            data: {
                userId,
                action: "SCORES_SAVED",
                details: JSON.stringify({ assessmentId, scoreCount: scores.length }),
            }
        });

        return results;
    }

    /**
     * Submission Workflow
     */
    async submitResults(schoolId: string, classId: string, term: string, userId: string) {
        const submission = await prisma.resultSubmission.upsert({
            where: {
                schoolId_classId_term: { schoolId, classId, term }
            },
            update: {
                status: "SUBMITTED",
                submittedBy: userId,
            },
            create: {
                schoolId, classId, term,
                status: "SUBMITTED",
                submittedBy: userId,
            }
        });

        await prisma.activityLog.create({
            data: {
                userId,
                action: "RESULTS_SUBMITTED",
                details: JSON.stringify({ schoolId, classId, term }),
            }
        });

        return submission;
    }

    async processApproval(submissionId: string, status: "APPROVED" | "REJECTED", userId: string) {
        const submission = await prisma.resultSubmission.update({
            where: { id: submissionId },
            data: {
                status,
                approvedBy: userId,
            }
        });

        await prisma.activityLog.create({
            data: {
                userId,
                action: `RESULTS_${status}`,
                details: JSON.stringify({ submissionId }),
            }
        });

        return submission;
    }

    async getSubmissions(schoolId: string, classId?: string, term?: string) {
        const where: any = { schoolId };
        if (classId) where.classId = classId;
        if (term) where.term = term;

        return prisma.resultSubmission.findMany({
            where,
            include: {
                class: true,
                submitter: { select: { firstName: true, lastName: true } },
                approver: { select: { firstName: true, lastName: true } }
            },
            orderBy: { updatedAt: 'desc' }
        });
    }

    /**
     * Results View
     */
    async getStudentResults(studentId: string, schoolId: string) {
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: { class: true }
        });

        if (!student || !student.classId) return [];

        // Find all APPROVED submissions for the student's class
        const approvedSubmissions = await prisma.resultSubmission.findMany({
            where: {
                schoolId,
                classId: student.classId,
                status: "APPROVED"
            }
        });

        const approvedTerms = approvedSubmissions.map(s => s.term);

        if (approvedTerms.length === 0) return [];

        return prisma.assessment.findMany({
            where: {
                schoolId,
                classId: student.classId,
                term: { in: approvedTerms }
            },
            include: {
                subject: true,
                scores: {
                    where: { studentId }
                }
            }
        });
    }
}

export const assessmentService = new AssessmentService();
