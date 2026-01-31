import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
    authenticateCandidate,
    validateExamAccess,
    checkExamAvailability,
    validateAttemptOwnership,
} from '../middleware/examAuth.middleware';
import { catchAsync } from '../utils/errors';
import {
    // Organization Management
    createOrganization,
    getOrganizations,
    getOrganizationById,
    updateOrganization,
    deleteOrganization,
    // Candidate Management
    createCandidate,
    createCandidatesBulk,
    getCandidates,
    updateCandidate,
    deleteCandidate,
    // Exam Management
    createExam,
    getExams,
    getExamById,
    updateExam,
    deleteExam,
    // Question Management
    addQuestionToExam,
    addQuestionsBulk,
    updateExamQuestion,
    deleteExamQuestion,
    // Exam Assignment
    getExamAssignedCandidates,
    assignExamToCandidate,
    unassignExamFromCandidate,
    bulkAssignExamToCandidates,
    // Candidate Portal
    candidateLogin,
    startExamAttempt,
    submitExamAnswer,
    submitExam,
    getExamResult,
    // Analytics
    getExamResults,
    getExamAnalytics,
    getExamDashboardStats,
    getGlobalExamResults,
    getAllExams,
    getAllCandidates,
    authorizeRetake,
    // New Feature Imports
    uploadOrganizationLogo,
    archiveCandidate,
    unarchiveCandidate,
    archiveExam,
    unarchiveExam,
    getOpenEndedResponses,
    markAnswer,
    exportOpenEndedResponsesPDF,
    exportDetailedResultsPDF
} from '../controller/exam.controller';
import { upload, uploadFile } from '../middleware/uploadFile';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Exam Organizations
 *     description: Organization management for examinations
 *   - name: Exam Candidates
 *     description: Candidate management
 *   - name: Exams
 *     description: Exam management and administration
 *   - name: Exam Questions
 *     description: Question management for exams
 *   - name: Exam Portal
 *     description: Candidate portal for taking exams
 *   - name: Exam Analytics
 *     description: Results and analytics
 */

// ============================================
// ORGANIZATION MANAGEMENT ROUTES (Admin only)
// ============================================

/**
 * @swagger
 * /api/exams/organizations:
 *   post:
 *     summary: Create a new organization
 *     tags: [Exam Organizations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               logo:
 *                 type: string
 *               contactEmail:
 *                 type: string
 *               contactPhone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Organization created successfully
 */
router.post(
    '/organizations',
    authenticate,
    authorize('SUPER_ADMIN', 'ADMIN'),
    catchAsync(createOrganization)
);

router.get(
    '/organizations',
    authenticate,
    authorize('SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR', 'EXAMINER'),
    catchAsync(getOrganizations)
);

router.get(
    '/organizations/:id',
    authenticate,
    authorize('SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR', 'EXAMINER'),
    catchAsync(getOrganizationById)
);

router.patch(
    '/organizations/:id',
    authenticate,
    authorize('SUPER_ADMIN', 'ADMIN'),
    catchAsync(updateOrganization)
);

router.delete(
    '/organizations/:id',
    authenticate,
    authorize('SUPER_ADMIN', 'ADMIN'),
    catchAsync(deleteOrganization)
);

// ============================================
// CANDIDATE MANAGEMENT ROUTES
// ============================================

router.post(
    '/organizations/:orgId/candidates',
    authenticate,
    authorize('SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR', 'EXAMINER'),
    catchAsync(createCandidate)
);

router.post(
    '/organizations/:orgId/candidates/bulk',
    authenticate,
    authorize('SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR', 'EXAMINER'),
    catchAsync(createCandidatesBulk)
);

router.get(
    '/organizations/:orgId/candidates',
    authenticate,
    authorize('SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR', 'EXAMINER'),
    catchAsync(getCandidates)
);

router.get(
    '/candidates/all',
    authenticate,
    authorize('SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR', 'EXAMINER'),
    catchAsync(getAllCandidates)
);

router.patch(
    '/candidates/:candidateId',
    authenticate,
    authorize('SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR', 'EXAMINER'),
    catchAsync(updateCandidate)
);

router.delete(
    '/candidates/:candidateId',
    authenticate,
    authorize('SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR', 'EXAMINER'),
    catchAsync(deleteCandidate)
);

// ============================================
// EXAM MANAGEMENT ROUTES
// ============================================

router.post(
    '/organizations/:orgId/exams',
    authenticate,
    authorize('SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR', 'EXAMINER'),
    catchAsync(createExam)
);

router.get(
    '/organizations/:orgId/exams',
    authenticate,
    authorize('SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR', 'EXAMINER'),
    catchAsync(getExams)
);

router.get(
    '/all',
    authenticate,
    authorize('SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR', 'EXAMINER'),
    catchAsync(getAllExams)
);

router.get(
    '/:examId',
    authenticate,
    authorize('SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR', 'EXAMINER'),
    catchAsync(getExamById)
);

router.patch(
    '/:examId',
    authenticate,
    authorize('SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR', 'EXAMINER'),
    catchAsync(updateExam)
);

router.delete(
    '/:examId',
    authenticate,
    authorize('SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR', 'EXAMINER'),
    catchAsync(deleteExam)
);

// ============================================
// QUESTION MANAGEMENT ROUTES
// ============================================

router.post(
    '/:examId/questions',
    authenticate,
    authorize('SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR', 'EXAMINER'),
    uploadFile,
    catchAsync(addQuestionToExam)
);

router.post(
    '/:examId/questions/bulk',
    authenticate,
    authorize('SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR', 'EXAMINER'),
    catchAsync(addQuestionsBulk)
);

router.patch(
    '/questions/:questionId',
    authenticate,
    authorize('SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR', 'EXAMINER'),
    uploadFile,
    catchAsync(updateExamQuestion)
);

router.delete(
    '/questions/:questionId',
    authenticate,
    authorize('SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR', 'EXAMINER'),
    catchAsync(deleteExamQuestion)
);

// ============================================
// EXAM ASSIGNMENT ROUTES
// ============================================

router.get(
    '/:examId/assigned-candidates',
    authenticate,
    authorize('SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR', 'EXAMINER'),
    catchAsync(getExamAssignedCandidates)
);

router.post(
    '/:examId/assign/:candidateId',
    authenticate,
    authorize('SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR', 'EXAMINER'),
    catchAsync(assignExamToCandidate)
);

router.delete(
    '/:examId/assign/:candidateId',
    authenticate,
    authorize('SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR', 'EXAMINER'),
    catchAsync(unassignExamFromCandidate)
);

router.post(
    '/:examId/assign-bulk',
    authenticate,
    authorize('SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR', 'EXAMINER'),
    catchAsync(bulkAssignExamToCandidates)
);

router.post(
    '/assignments/:assignmentId/authorize-retake',
    authenticate,
    authorize('SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR', 'EXAMINER'),
    catchAsync(authorizeRetake)
);

// ============================================
// CANDIDATE PORTAL ROUTES (Public/Candidate Auth)
// ============================================

/**
 * @swagger
 * /api/exams/portal/login:
 *   post:
 *     summary: Candidate login with ID and exam code
 *     tags: [Exam Portal]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - candidateId
 *               - examCode
 *             properties:
 *               candidateId:
 *                 type: string
 *               examCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/portal/login', catchAsync(candidateLogin));

router.post(
    '/portal/:examId/start',
    authenticateCandidate,
    validateExamAccess,
    checkExamAvailability,
    catchAsync(startExamAttempt)
);

router.put(
    '/portal/attempts/:attemptId/answer',
    authenticateCandidate,
    validateAttemptOwnership,
    catchAsync(submitExamAnswer)
);

router.post(
    '/portal/attempts/:attemptId/submit',
    authenticateCandidate,
    validateAttemptOwnership,
    catchAsync(submitExam)
);

router.get(
    '/portal/attempts/:attemptId/result',
    authenticateCandidate,
    validateAttemptOwnership,
    catchAsync(getExamResult)
);

// ============================================
// ANALYTICS & REPORTS ROUTES
// ============================================

router.get(
    '/stats/dashboard',
    authenticate,
    authorize('SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR', 'EXAMINER'),
    getExamDashboardStats
);

router.get(
    '/results/all',
    authenticate,
    authorize('SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR', 'EXAMINER'),
    getGlobalExamResults
);

router.get(
    '/:examId/results',
    authenticate,
    authorize('SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR', 'EXAMINER'),
    catchAsync(getExamResults)
);

router.get(
    '/:examId/analytics',
    authenticate,
    authorize('SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR', 'EXAMINER'),
    catchAsync(getExamAnalytics)
);

router.get(
    '/:examId/results/detailed',
    authenticate,
    authorize('SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR', 'EXAMINER'),
    catchAsync(exportDetailedResultsPDF)
);

// ============================================
// NEW FEATURE ROUTES
// ============================================

router.post(
    '/organizations/:id/logo',
    authenticate,
    authorize('SUPER_ADMIN', 'ADMIN'),
    upload.single('logo'),
    catchAsync(uploadOrganizationLogo)
);

router.get(
    '/all/open-ended-responses/export',
    authenticate,
    authorize('SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR', 'EXAMINER'),
    catchAsync(exportOpenEndedResponsesPDF)
);

router.get(
    '/:examId/open-ended-responses/export',
    authenticate,
    authorize('SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR', 'EXAMINER'),
    catchAsync(exportOpenEndedResponsesPDF)
);

router.patch(
    '/candidates/:id/archive',
    authenticate,
    authorize('SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR', 'EXAMINER'),
    catchAsync(archiveCandidate)
);

router.patch(
    '/candidates/:id/unarchive',
    authenticate,
    authorize('SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR', 'EXAMINER'),
    catchAsync(unarchiveCandidate)
);

router.patch(
    '/:id/archive', // exam id
    authenticate,
    authorize('SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR', 'EXAMINER'),
    catchAsync(archiveExam)
);

router.patch(
    '/:id/unarchive',
    authenticate,
    authorize('SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR', 'EXAMINER'),
    catchAsync(unarchiveExam)
);

// Marking
router.get(
    '/all/open-ended-responses',
    authenticate,
    authorize('SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR', 'EXAMINER'),
    catchAsync(getOpenEndedResponses)
);

router.get(
    '/:examId/open-ended-responses',
    authenticate,
    authorize('SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR', 'EXAMINER'),
    catchAsync(getOpenEndedResponses)
);

router.post(
    '/answers/:answerId/mark',
    authenticate,
    authorize('SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR', 'EXAMINER'),
    catchAsync(markAnswer)
);

export default router;
