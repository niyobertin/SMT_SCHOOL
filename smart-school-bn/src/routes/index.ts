import { Router } from "express";
import authRoutes from "./auth.routes";
import { Request, Response } from "express";
import categoryRoutes from "./category.routes";
import courseRouters from "./course.route";
import lessonRoutes from "./lesson.routes";
import lessonContentRoutes from "./lessonContent.routes";
import testRoutes from "./test.routes";
import userRouter from "./users.routes";
import paymentRouter from "./payment.route";
import jobPostRoutes from "./jobPost.routes";
import jobCategoriesRouter from "./jobCategories";
import examRoutes from "./exam.routes";
import schoolRoutes from "./school.routes";
import studentAuthRoutes from "./studentAuth.routes";
import academicRoutes from "./academic.routes";
import courseAssignmentRoutes from "./courseAssignment.routes";
import assessmentRoutes from "./assessment.routes";
import studentPortalRoutes from "./studentPortal.routes";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: User management endpoints
 *   - name: Auth
 *     description: Authentication endpoints
 *   - name: Health
 *     description: Health check endpoints
 *   - name: Tests
 *     description: Test management and taking endpoints
 *   - name: Job Posts
 *     description: Job post management endpoints
 *   - name: Exams
 *     description: Examination system endpoints
 */

// Health check route (already handled in main app)
/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthCheck'
 */

// Mount route modules
router.use("/auth", authRoutes);
router.use("/student-auth", studentAuthRoutes);
router.use("/categories", categoryRoutes);
router.use("/courses", courseRouters);
router.use("/lessons", lessonRoutes);
router.use("/lesson-content", lessonContentRoutes);
router.use("/tests", testRoutes);
router.use("/users", userRouter);
router.use("/payments", paymentRouter);
router.use("/job-posts", jobPostRoutes);
router.use("/job-categories", jobCategoriesRouter);
router.use("/exams", examRoutes);
router.use("/schools", schoolRoutes);
router.use("/academic", academicRoutes);
router.use("/assignments", courseAssignmentRoutes);
router.use("/student-portal", studentPortalRoutes);
router.use("/", assessmentRoutes); // Note: paths in assessmentRoutes handle /assessments and /schools/:id/assessments

// API info endpoint
/**
 * @swagger
 * /api:
 *   get:
 *     summary: Get API information
 *     tags: [General]
 *     responses:
 *       200:
 *         description: API information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: "Express TypeScript API"
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 description:
 *                   type: string
 *                   example: "A well-structured Express.js API with TypeScript"
 *                 documentation:
 *                   type: string
 *                   example: "/api-docs"
 *                 health:
 *                   type: string
 *                   example: "/health"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get("/", (req: Request, res: Response) => {
  res.json({
    name: "Smart school API",
    description:
      "This is the API documentation for the Smart school application.",
    documentation: "/api-docs",
    health: "/health",
    timestamp: new Date().toISOString(),
  });
});

export default router;
