import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { authenticateStudent, requireStudentSchoolScope } from "../middleware/studentAuth";
import { schoolAdminController, studentManagementController } from "../controller/school.controller";
import { studentAuthController } from "../controller/studentAuth.controller";

const router = Router();

// ============================================
// SCHOOL MANAGEMENT ROUTES (ADMIN ONLY)
// ============================================

router.post(
  "/",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  schoolAdminController.createSchool
);

router.get(
  "/",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  schoolAdminController.listSchools
);

router.get(
  "/:schoolId",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  schoolAdminController.getSchoolById
);

router.patch(
  "/:schoolId/activate",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  schoolAdminController.activateSchool
);

router.post(
  "/:schoolId/staff",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  schoolAdminController.assignStaffToSchool
);

router.get(
  "/:schoolId/staff",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  schoolAdminController.getSchoolStaff
);

// ============================================
// STUDENT MANAGEMENT ROUTES (SCHOOL ADMIN)
// ============================================

router.post(
  "/:schoolId/students",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN", "INSTRUCTOR"),
  studentManagementController.createStudent
);

router.get(
  "/:schoolId/students",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN", "INSTRUCTOR"),
  studentManagementController.listStudents
);

router.get(
  "/:schoolId/students/:studentId",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN", "INSTRUCTOR"),
  studentManagementController.getStudent
);

router.post(
  "/students/:studentId/enroll",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN", "INSTRUCTOR"),
  studentManagementController.enrollStudent
);

router.get(
  "/students/:studentId/enrollments",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN", "INSTRUCTOR"),
  studentManagementController.getStudentEnrollments
);

export default router;
