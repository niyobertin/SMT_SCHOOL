import { Router } from "express";
import {
    createAssignment,
    deleteAssignment,
    getAssignmentsByLesson,
    updateAssignment
} from "../controller/assignment.controller";
import { authenticate, authorize } from "../middleware/auth";
import { tenantContext, requireTenant } from "../middleware/tenant.middleware";

const router = Router();

router.use(authenticate, tenantContext, requireTenant);

router.post("/:lessonId", authorize("ADMIN", "INSTRUCTOR", "SUPER_ADMIN"), createAssignment);
router.get("/:lessonId", getAssignmentsByLesson);
router.patch("/:id", authorize("ADMIN", "INSTRUCTOR", "SUPER_ADMIN"), updateAssignment);
router.delete("/:id", authorize("ADMIN", "INSTRUCTOR", "SUPER_ADMIN"), deleteAssignment);

export default router;
