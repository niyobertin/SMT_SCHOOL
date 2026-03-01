import { Router } from "express";
import {
    getSubmissionsByAssignment,
    gradeSubmission,
    submitAssignment
} from "../controller/submission.controller";
import { authenticate, authorize } from "../middleware/auth";
import { tenantContext, requireTenant } from "../middleware/tenant.middleware";

const router = Router();

router.use(authenticate, tenantContext, requireTenant);

router.post("/:assignmentId", authorize("STUDENT"), submitAssignment);
router.get("/:assignmentId", authorize("ADMIN", "INSTRUCTOR", "SUPER_ADMIN"), getSubmissionsByAssignment);
router.patch("/grade/:submissionId", authorize("ADMIN", "INSTRUCTOR", "SUPER_ADMIN"), gradeSubmission);

export default router;
