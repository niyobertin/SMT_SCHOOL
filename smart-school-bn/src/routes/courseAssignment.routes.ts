import { Router } from "express";
import { courseAssignmentController } from "../controller/courseAssignment.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.post(
    "/schools/:schoolId/course-assignments",
    authenticate,
    authorize("ADMIN", "SCHOOL_ADMIN"),
    courseAssignmentController.assignCourse
);

router.delete(
    "/assignments/:assignmentId",
    authenticate,
    authorize("ADMIN", "SCHOOL_ADMIN"),
    courseAssignmentController.removeAssignment
);

router.get(
    "/schools/:schoolId/course-assignments",
    authenticate,
    courseAssignmentController.listSchoolAssignments
);

export default router;
