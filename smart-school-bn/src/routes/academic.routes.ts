import { Router } from "express";
import { academicController } from "../controller/academic.controller";
import { authenticate, authorize } from "../middleware/auth";
import { requireSchoolAccess } from "../middleware/schoolScope.middleware";

const router = Router();

// Academic Years
router.post(
    "/schools/:schoolId/academic-years",
    authenticate,
    authorize("ADMIN", "SCHOOL_ADMIN"),
    requireSchoolAccess(),
    academicController.createAcademicYear
);

router.get(
    "/schools/:schoolId/academic-years",
    authenticate,
    requireSchoolAccess(),
    academicController.listAcademicYears
);

// Classes
router.post(
    "/schools/:schoolId/classes",
    authenticate,
    authorize("ADMIN", "SCHOOL_ADMIN"),
    requireSchoolAccess(),
    academicController.createClass
);

router.get(
    "/schools/:schoolId/classes",
    authenticate,
    requireSchoolAccess(),
    academicController.listClasses
);

// Subjects
router.post(
    "/schools/:schoolId/subjects",
    authenticate,
    authorize("ADMIN", "SCHOOL_ADMIN"),
    requireSchoolAccess(),
    academicController.createSubject
);

router.get(
    "/schools/:schoolId/subjects",
    authenticate,
    requireSchoolAccess(),
    academicController.listSubjects
);

// Student Enrollment
router.post(
    "/schools/:schoolId/students/:studentId/enroll",
    authenticate,
    authorize("ADMIN", "SCHOOL_ADMIN", "TEACHER"),
    requireSchoolAccess(),
    academicController.enrollStudent
);

router.get(
    "/students/:studentId/enrollment-history",
    authenticate,
    academicController.getStudentEnrollmentHistory
);

router.get(
    "/schools/:schoolId/classes/:classId/students",
    authenticate,
    requireSchoolAccess(),
    academicController.getStudentsByClass
);

// Attendance
router.post(
    "/schools/:schoolId/attendance",
    authenticate,
    authorize("ADMIN", "SCHOOL_ADMIN", "TEACHER"),
    requireSchoolAccess(),
    academicController.recordAttendance
);

router.post(
    "/schools/:schoolId/attendance/bulk",
    authenticate,
    authorize("ADMIN", "SCHOOL_ADMIN", "TEACHER"),
    requireSchoolAccess(),
    academicController.bulkRecordAttendance
);

router.get(
    "/schools/:schoolId/attendance",
    authenticate,
    requireSchoolAccess(),
    academicController.getAttendance
);

router.post(
    "/schools/:schoolId/students/bulk",
    authenticate,
    authorize("ADMIN", "SCHOOL_ADMIN"),
    requireSchoolAccess(),
    academicController.bulkImportStudents
);

export default router;

