import { Router, Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
    createAcademicYear,
    getAcademicYears,
    createGrade,
    getGrades,
    createClassRoom,
    bulkAssignToClass,
    createSubject,
    getSubjects,
    updateSubject,
    deleteSubject,
    assignTeacher,
    getTeacherAssignments,
    removeTeacherAssignment,
    createTerm,
    getTerms
} from '../controller/academic.controller';
import { authenticate, authorize } from '../middleware/auth';
import { tenantContext, requireTenant } from '../middleware/tenant.middleware';

const router = Router();

// Apply tenant context to all academic routes
router.use(authenticate, tenantContext, requireTenant);

// Academic Years
router.post('/years', authorize('ADMIN', 'SUPER_ADMIN'), createAcademicYear);
router.get('/years', getAcademicYears);
router.get('/years/organization/:organizationId', getAcademicYears);

// Terms
router.post('/terms', authorize('ADMIN', 'SUPER_ADMIN'), createTerm);
router.get('/terms/:yearId', getTerms);

// Grades
router.post('/grades', authorize('ADMIN', 'SUPER_ADMIN'), createGrade);
router.get('/grades', getGrades);
router.get('/grades/organization/:organizationId', getGrades);

// ClassRoom
router.post('/classrooms', authorize('ADMIN', 'SUPER_ADMIN'), createClassRoom);

// Subjects
router.post('/subjects', authorize('ADMIN', 'SUPER_ADMIN'), createSubject);
router.get('/subjects', getSubjects);
router.put('/subjects/:id', authorize('ADMIN', 'SUPER_ADMIN'), updateSubject);
router.delete('/subjects/:id', authorize('ADMIN', 'SUPER_ADMIN'), deleteSubject);

// Teacher Assignments
router.post('/teacher-assignments', authorize('ADMIN', 'SUPER_ADMIN'), assignTeacher);
router.get('/teacher-assignments', getTeacherAssignments);
router.delete('/teacher-assignments/:id', authorize('ADMIN', 'SUPER_ADMIN'), removeTeacherAssignment);

// Assignments
router.post('/bulk-assign', authorize('ADMIN', 'SUPER_ADMIN'), bulkAssignToClass);

export default router;
