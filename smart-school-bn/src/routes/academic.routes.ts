import { Router } from "express";
import { academicController } from "../controller/academic.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

// Academic Years
router.post(
    "/schools/:schoolId/academic-years",
    authenticate,
    authorize("ADMIN", "SCHOOL_ADMIN"),
    academicController.createAcademicYear
);

router.get(
    "/schools/:schoolId/academic-years",
    authenticate,
    academicController.listAcademicYears
);

// Classes
router.post(
    "/schools/:schoolId/classes",
    authenticate,
    authorize("ADMIN", "SCHOOL_ADMIN"),
    academicController.createClass
);

router.get(
    "/schools/:schoolId/classes",
    authenticate,
    academicController.listClasses
);

// Subjects
router.post(
    "/schools/:schoolId/subjects",
    authenticate,
    authorize("ADMIN", "SCHOOL_ADMIN"),
    academicController.createSubject
);

router.get(
    "/schools/:schoolId/subjects",
    authenticate,
    academicController.listSubjects
);

// Student Enrollment
router.post(
    "/schools/:schoolId/students/:studentId/enroll",
    authenticate,
    authorize("ADMIN", "SCHOOL_ADMIN", "TEACHER"),
    academicController.enrollStudent
);

router.get(
    "/students/:studentId/enrollment-history",
    authenticate,
    academicController.getStudentEnrollmentHistory
);

export default router;
