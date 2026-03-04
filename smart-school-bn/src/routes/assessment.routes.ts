import { Router } from "express";
import { assessmentController } from "../controller/assessment.controller";
import { authenticate } from "../middleware/auth";
import { validateRequest } from "../middleware/validation";
import { requireSchoolAccess } from "../middleware/schoolScope.middleware";
import {
    createAssessmentSchema,
    saveScoresSchema,
    submitResultsSchema,
    processApprovalSchema
} from "../schema/assessment.schema";

const router = Router();

// Used by Teacher / Admin
router.post(
    "/assessments",
    authenticate,
    createAssessmentSchema,
    validateRequest,
    assessmentController.createAssessment
);

router.get(
    "/schools/:schoolId/assessments",
    authenticate,
    requireSchoolAccess(),
    assessmentController.getAssessments
);

router.post(
    "/assessments/:assessmentId/scores",
    authenticate,
    saveScoresSchema,
    validateRequest,
    assessmentController.saveScores
);

router.post(
    "/assessments/submit",
    authenticate,
    submitResultsSchema,
    validateRequest,
    assessmentController.submitResults
);

// Used by Admin
router.get(
    "/schools/:schoolId/submissions",
    authenticate,
    requireSchoolAccess(),
    assessmentController.getSubmissions
);

router.put(
    "/submissions/:submissionId/approve",
    authenticate,
    processApprovalSchema,
    validateRequest,
    assessmentController.processApproval
);

// Used by Student
router.get(
    "/schools/:schoolId/students/:studentId/results",
    authenticate,
    requireSchoolAccess(),
    assessmentController.getStudentResults
);

export default router;

