import { Request, Response, NextFunction } from "express";
import { assessmentService } from "../services/assessment.service";
import { PermissionService, Action } from "../services/permission.service";

// Extend Request to include `user` which is set by the auth middleware
interface AuthRequest extends Request {
    user?: any;
}

export const assessmentController = {
    // Teacher: Create Assessment
    async createAssessment(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { schoolId, classId, subjectId, type, term, maxScore, date } = req.body;
            const userId = req.user!.id;

            const canEnter = await PermissionService.can(userId, Action.ENTER_MARKS, { schoolId, classId, subjectId });
            if (!canEnter) return res.status(403).json({ status: "error", message: "Forbidden: Not assigned to this class/subject." });

            const assessment = await assessmentService.createAssessment(req.body);
            return res.status(201).json({ status: "success", data: assessment });
        } catch (error) { next(error); }
    },

    // Get Assessments Filter
    async getAssessments(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { schoolId } = req.params;
            const { classId, subjectId, term } = req.query;

            const whereClause: any = { schoolId };
            if (classId) whereClause.classId = classId;
            if (subjectId) whereClause.subjectId = subjectId;
            if (term) whereClause.term = term;

            const assessments = await assessmentService.getAssessments(whereClause);
            return res.status(200).json({ status: "success", data: assessments });
        } catch (error) { next(error); }
    },

    // Teacher: Save Scores
    async saveScores(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { assessmentId } = req.params;
            const { scores, schoolId, classId, subjectId } = req.body; // Frontend should attach these for auth
            const userId = req.user!.id;

            const canEnter = await PermissionService.can(userId, Action.ENTER_MARKS, { schoolId, classId, subjectId });
            if (!canEnter) return res.status(403).json({ status: "error", message: "Forbidden: Not assigned to this class/subject." });

            const result = await assessmentService.saveScores(assessmentId, scores, userId);
            return res.status(200).json({ status: "success", data: result });
        } catch (error) { next(error); }
    },

    // Teacher: Submit Results for Approval
    async submitResults(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { schoolId, classId, term, subjectId } = req.body;
            const userId = req.user!.id;

            // Notice we pass subjectId if required by the teacher assignment logic
            const canSubmit = await PermissionService.can(userId, Action.SUBMIT_MARKS, { schoolId, classId, subjectId });
            if (!canSubmit) return res.status(403).json({ status: "error", message: "Forbidden: Not assigned to this class/subject." });

            const submission = await assessmentService.submitResults(schoolId, classId, term, userId);
            return res.status(200).json({ status: "success", data: submission });
        } catch (error) { next(error); }
    },

    // Admin: Process Approval
    async processApproval(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { submissionId } = req.params;
            const { status } = req.body; // APPROVED or REJECTED
            const userId = req.user!.id;

            const canApprove = await PermissionService.can(userId, Action.APPROVE_MARKS, {});
            if (!canApprove) return res.status(403).json({ status: "error", message: "Forbidden: Only School Admins can approve results." });

            const result = await assessmentService.processApproval(submissionId, status, userId);
            return res.status(200).json({ status: "success", data: result });
        } catch (error) { next(error); }
    },

    // View Submission Status
    async getSubmissions(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { schoolId } = req.params;
            const { classId, term } = req.query;

            const submissions = await assessmentService.getSubmissions(schoolId, classId as string, term as string);
            return res.status(200).json({ status: "success", data: submissions });
        } catch (error) { next(error); }
    },

    // View Results (Students & Admins)
    async getStudentResults(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { studentId, schoolId } = req.params;
            const userId = req.user!.id;

            const canView = await PermissionService.can(userId, Action.VIEW_RESULTS, { schoolId });
            if (!canView) return res.status(403).json({ status: "error", message: "Forbidden." });

            const results = await assessmentService.getStudentResults(studentId, schoolId);
            return res.status(200).json({ status: "success", data: results });
        } catch (error) { next(error); }
    }
};
