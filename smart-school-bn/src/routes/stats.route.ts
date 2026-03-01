import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { tenantContext } from "../middleware/tenant.middleware";
import { getUnifiedDashboardStats } from "../controller/stats.controller";
import { catchAsync } from "../utils/errors";

const router = Router();

/**
 * @swagger
 * /api/stats/dashboard:
 *   get:
 *     summary: Get unified dashboard statistics
 *     tags: [Stats]
 *     parameters:
 *       - in: query
 *         name: context
 *         schema:
 *           type: string
 *           enum: [lms, exam, all]
 *         description: The scope of statistics to return
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 */
router.get("/dashboard", authenticate, tenantContext, catchAsync(getUnifiedDashboardStats));

export default router;
