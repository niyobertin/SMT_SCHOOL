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
} from '../controller/exam.controller';

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
    authorize('ADMIN'),
    catchAsync(createOrganization)
);

router.get(
    '/organizations',
    authenticate,
    authorize('ADMIN', 'INSTRUCTOR'),
    catchAsync(getOrganizations)
);

router.get(
    '/organizations/:id',
    authenticate,
    authorize('ADMIN', 'INSTRUCTOR'),
    catchAsync(getOrganizationById)
);

router.patch(
    '/organizations/:id',
    authenticate,
    authorize('ADMIN'),
    catchAsync(updateOrganization)
);

router.delete(
    '/organizations/:id',
    authenticate,
    authorize('ADMIN'),
    catchAsync(deleteOrganization)
);

// ============================================
// CANDIDATE MANAGEMENT ROUTES
// ============================================

router.post(
    '/organizations/:orgId/candidates',
    authenticate,
    authorize('ADMIN', 'INSTRUCTOR'),
    catchAsync(createCandidate)
);

router.post(
    '/organizations/:orgId/candidates/bulk',
    authenticate,
    authorize('ADMIN', 'INSTRUCTOR'),
    catchAsync(createCandidatesBulk)
);

router.get(
    '/organizations/:orgId/candidates',
    authenticate,
    authorize('ADMIN', 'INSTRUCTOR'),
    catchAsync(getCandidates)
);

router.get(
    '/candidates/all',
    authenticate,
    authorize('ADMIN', 'INSTRUCTOR'),
    catchAsync(getAllCandidates)
);

router.patch(
    '/candidates/:candidateId',
    authenticate,
    authorize('ADMIN', 'INSTRUCTOR'),
    catchAsync(updateCandidate)
);

router.delete(
    '/candidates/:candidateId',
    authenticate,
    authorize('ADMIN', 'INSTRUCTOR'),
    catchAsync(deleteCandidate)
);

// ============================================
// EXAM MANAGEMENT ROUTES
// ============================================

router.post(
    '/organizations/:orgId/exams',
    authenticate,
    authorize('ADMIN', 'INSTRUCTOR'),
    catchAsync(createExam)
);

router.get(
    '/organizations/:orgId/exams',
    authenticate,
    authorize('ADMIN', 'INSTRUCTOR'),
    catchAsync(getExams)
);

router.get(
    '/all',
    authenticate,
    authorize('ADMIN', 'INSTRUCTOR'),
    catchAsync(getAllExams)
);

router.get(
    '/:examId',
    authenticate,
    authorize('ADMIN', 'INSTRUCTOR'),
    catchAsync(getExamById)
);

router.patch(
    '/:examId',
    authenticate,
    authorize('ADMIN', 'INSTRUCTOR'),
    catchAsync(updateExam)
);

router.delete(
    '/:examId',
    authenticate,
    authorize('ADMIN', 'INSTRUCTOR'),
    catchAsync(deleteExam)
);

// ============================================
// QUESTION MANAGEMENT ROUTES
// ============================================

router.post(
    '/:examId/questions',
    authenticate,
    authorize('ADMIN', 'INSTRUCTOR'),
    catchAsync(addQuestionToExam)
);

router.post(
    '/:examId/questions/bulk',
    authenticate,
    authorize('ADMIN', 'INSTRUCTOR'),
    catchAsync(addQuestionsBulk)
);

router.patch(
    '/questions/:questionId',
    authenticate,
    authorize('ADMIN', 'INSTRUCTOR'),
    catchAsync(updateExamQuestion)
);

router.delete(
    '/questions/:questionId',
    authenticate,
    authorize('ADMIN', 'INSTRUCTOR'),
    catchAsync(deleteExamQuestion)
);

// ============================================
// EXAM ASSIGNMENT ROUTES
// ============================================

router.get(
    '/:examId/assigned-candidates',
    authenticate,
    authorize('ADMIN', 'INSTRUCTOR'),
    catchAsync(getExamAssignedCandidates)
);

router.post(
    '/:examId/assign/:candidateId',
    authenticate,
    authorize('ADMIN', 'INSTRUCTOR'),
    catchAsync(assignExamToCandidate)
);

router.delete(
    '/:examId/assign/:candidateId',
    authenticate,
    authorize('ADMIN', 'INSTRUCTOR'),
    catchAsync(unassignExamFromCandidate)
);

router.post(
    '/:examId/assign-bulk',
    authenticate,
    authorize('ADMIN', 'INSTRUCTOR'),
    catchAsync(bulkAssignExamToCandidates)
);

router.post(
    '/assignments/:assignmentId/authorize-retake',
    authenticate,
    authorize('ADMIN', 'INSTRUCTOR'),
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
    authorize('ADMIN', 'INSTRUCTOR'),
    getExamDashboardStats
);

router.get(
    '/results/all',
    authenticate,
    authorize('ADMIN', 'INSTRUCTOR'),
    getGlobalExamResults
);

router.get(
    '/:examId/results',
    authenticate,
    authorize('ADMIN', 'INSTRUCTOR'),
    catchAsync(getExamResults)
);

router.get(
    '/:examId/analytics',
    authenticate,
    authorize('ADMIN', 'INSTRUCTOR'),
    catchAsync(getExamAnalytics)
);

export default router;
