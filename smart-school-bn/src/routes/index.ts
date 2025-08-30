import { Router } from "express";
import authRoutes from "./auth.routes";
import { Request, Response } from "express";
import categoryRoutes from "./category.routes";
import courseRouters from "./course.route";
import lessonRoutes from "./lesson.routes";
import lessonContentRoutes from "./lessonContent.routes";
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
router.use("/categories", categoryRoutes);
router.use("/courses", courseRouters);
router.use("/lessons", lessonRoutes);
router.use("/lesson-content", lessonContentRoutes);

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
