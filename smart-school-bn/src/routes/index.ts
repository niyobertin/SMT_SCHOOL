import { Router } from 'express';
import { userRoutes } from './user.routes';
import { authRoutes } from './auth.routes';

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
router.use('/users', userRoutes);
router.use('/auth', authRoutes);

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
router.get('/', (req, res) => {
  res.json({
    name: 'Express TypeScript API',
    version: process.env.npm_package_version || '1.0.0',
    description: 'A well-structured Express.js API with TypeScript, Swagger documentation, and monitoring',
    documentation: '/api-docs',
    health: '/health',
    timestamp: new Date().toISOString()
  });
});

export { router as routes };