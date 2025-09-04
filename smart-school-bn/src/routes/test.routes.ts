import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { catchAsync } from '../utils/errors';
import { 
  createTest, 
  addQuestionToTest, 
  startTestAttempt, 
  submitAnswer, 
  submitTest,
  getTestById,
  getTestQuestions,
  getTestByCourseId
} from '../controller/test.controller';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Tests
 *     description: Test management and taking endpoints
 */

// Test Management Routes (Instructor only)
/**
 * @swagger
 * /api/tests/{courseId}/tests:
 *   post:
 *     summary: Create a new test for a course
 *     tags: [Tests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the course to add the test to
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 description: Test title
 *               description:
 *                 type: string
 *                 description: Test description
 *               instructions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Test instructions
 *               duration:
 *                 type: number
 *                 description: Test duration in minutes
 *               passingScore:
 *                 type: number
 *                 description: Minimum score required to pass (0-100)
 *               maxAttempts:
 *                 type: number
 *                 description: Maximum number of attempts allowed
 *               randomizeQuestions:
 *                 type: boolean
 *                 description: Whether to randomize question order
 *               randomizeOptions:
 *                 type: boolean
 *                 description: Whether to randomize answer options
 *               showResults:
 *                 type: string
 *                 enum: [AFTER_COMPLETION, AFTER_GRADING, NEVER]
 *                 description: When to show test results to students
 *     responses:
 *       201:
 *         description: Test created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User is not the course instructor
 *       404:
 *         description: Course not found
 */
router.post(
  '/:courseId/tests',
  authenticate,
  authorize('INSTRUCTOR',"ADMIN"),
  catchAsync(createTest)
);

/**
 * @swagger
 * /api/tests/{courseId}/tests:
 *   get:
 *     summary: Get tests by course ID
 *     tags: [Tests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the course to get tests for
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Tests retrieved successfully
 *       404:
 *         description: Course not found
 *       500:
 *         description: Internal server error
 */
router.get(
  '/:courseId/tests',
  authenticate,
  catchAsync(getTestByCourseId)
);

/**
 * @swagger
 * /api/tests/{testId}/questions:
 *   post:
 *     summary: Add a question to a test
 *     tags: [Tests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: testId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the test to add the question to
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - question
 *               - type
 *             properties:
 *               question:
 *                 type: string
 *                 description: The question text
 *               type:
 *                 type: string
 *                 enum: [MULTIPLE_CHOICE, TRUE_FALSE, SHORT_ANSWER, ESSAY, FILL_BLANK]
 *                 description: Type of the question
 *               points:
 *                 type: number
 *                 description: Points awarded for correct answer
 *               explanation:
 *                 type: string
 *                 description: Explanation of the correct answer
 *               options:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     option:
 *                       type: string
 *                     isCorrect:
 *                       type: boolean
 *                 description: Answer options (required for multiple choice/true-false)
 *               correctAnswer:
 *                 type: string
 *                 description: Correct answer (for short answer/essay questions)
 *     responses:
 *       201:
 *         description: Question added successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User is not the test owner
 *       404:
 *         description: Test not found
 */
router.post(
  '/:testId/questions',
  authenticate,
  authorize('INSTRUCTOR',"ADMIN"),
  catchAsync(addQuestionToTest)
);

// Get test by ID
/**
 * @swagger
 * /api/tests/{testId}:
 *   get:
 *     summary: Get test details by ID
 *     tags: [Tests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: testId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Test details retrieved successfully
 *       404:
 *         description: Test not found
 */
router.get(
  '/:testId',
  authenticate,
  catchAsync(getTestById)
);

// Get test questions
/**
 * @swagger
 * /api/tests/{testId}/questions:
 *   get:
 *     summary: Get questions for a test
 *     tags: [Tests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: testId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Questions retrieved successfully
 *       404:
 *         description: Test not found
 */
router.get(
  '/:testId/questions',
  authenticate,
  catchAsync(getTestQuestions)
);

// Test Taking Routes (Students)
/**
 * @swagger
 * /api/tests/{testId}/start:
 *   post:
 *     summary: Start a new test attempt
 *     tags: [Tests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: testId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the test to start
 *     responses:
 *       200:
 *         description: Test started successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 attemptId:
 *                   type: string
 *                 test:
 *                   $ref: '#/components/schemas/Test'
 *                 questions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Question'
 *                 startTime:
 *                   type: string
 *                   format: date-time
 *                 endTime:
 *                   type: string
 *                   format: date-time
 *                 timeRemaining:
 *                   type: number
 *                   description: Time remaining in seconds
 *       400:
 *         description: Invalid request or test not available
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User is not enrolled in the course
 *       404:
 *         description: Test not found
 */
router.post(
  '/:testId/start',
  authenticate,
  authorize('STUDENT',"ADMIN"),
  catchAsync(startTestAttempt)
);

/**
 * @swagger
 * /api/tests/test-attempts/{attemptId}/answer:
 *   put:
 *     summary: Submit an answer to a test question
 *     tags: [Tests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: attemptId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the test attempt
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - questionId
 *             properties:
 *               questionId:
 *                 type: string
 *                 description: ID of the question being answered
 *               answerText:
 *                 type: string
 *                 description: Text answer (for short answer/essay questions)
 *               selectedOptions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Selected option IDs (for multiple choice/true-false)
 *     responses:
 *       200:
 *         description: Answer submitted successfully
 *       400:
 *         description: Invalid input data or test attempt not in progress
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User does not own this test attempt
 *       404:
 *         description: Test attempt or question not found
 */
router.put(
  '/test-attempts/:attemptId/answer',
  authenticate,
  authorize('STUDENT',"ADMIN","INSTRUCTOR"),
  catchAsync(submitAnswer)
);

/**
 * @swagger
 * /api/tests/test-attempts/{attemptId}/submit:
 *   post:
 *     summary: Submit a completed test for grading
 *     tags: [Tests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: attemptId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the test attempt to submit
 *     responses:
 *       200:
 *         description: Test submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     attemptId:
 *                       type: string
 *                     score:
 *                       type: number
 *                     isPassed:
 *                       type: boolean
 *                     passingScore:
 *                       type: number
 *                     totalQuestions:
 *                       type: number
 *                     answeredQuestions:
 *                       type: number
 *                     correctAnswers:
 *                       type: number
 *                     pointsEarned:
 *                       type: number
 *                     totalPoints:
 *                       type: number
 *                     timeSpent:
 *                       type: number
 *                       description: Time spent in minutes
 *                     submittedAt:
 *                       type: string
 *                       format: date-time
 *                     details:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/QuestionResult'
 *       400:
 *         description: Invalid request or test already submitted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User does not own this test attempt
 *       404:
 *         description: Test attempt not found
 */
router.post(
  '/test-attempts/:attemptId/submit',
  authenticate,
  authorize('STUDENT',"ADMIN","INSTRUCTOR"),
  catchAsync(submitTest)
);

export default router;
