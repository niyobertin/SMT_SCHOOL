import { Router } from "express";
import {
    createJobCategory,
    createJobPost,
    deleteJobCategory,
    deleteJobPost,
    getAllJobPosts,
    getExpiredJobPosts,
    getJobCategories,
    getJobPostByCategory,
    getJobPostById,
    updateJobCategory,
    updateJobPost,
} from "../controller/jobPost.controller";
import { authenticate, authorize } from "../middleware/auth";
import { uploadFile } from "../middleware/uploadFile";


const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Job Posts
 *     description: Job post management endpoints
 */

/**
 * @swagger
 * /api/job-posts:
 *   post:
 *     tags: [Job Posts]
 *     summary: Create a new job post
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Job post title
 *               description:
 *                 type: string
 *                 description: Job post description
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 description: Job post due date
 *               companyname:
 *                 type: string
 *                 description: Job post company name
 *               companyLogo:
 *                 type: string
 *                 format: binary
 *                 description: Upload company logo
 *               companywebsite:
 *                 type: string
 *                 description: Job post company website
 *               applicationLink:
 *                 type: string
 *                 description: Job post application link
 *     responses:
 *       201:
 *         description: Job post created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post("/", authenticate, authorize("ADMIN"), uploadFile, createJobPost);

/**
 * @swagger
 * /api/job-posts:
 *   get:
 *     tags: [Job Posts]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query for job posts
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     summary: Get all active job posts
 *     responses:
 *       200:
 *         description: List of job posts
 */
router.get("/", getAllJobPosts);

/**
 * @swagger
 * /api/job-posts/{slug}:
 *   get:
 *     tags: [Job Posts]
 *     summary: Get a job post by slug
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job post details
 *       404:
 *         description: Job post not found
 */
router.get("/:slug", getJobPostById);

/**
 * @swagger
 * /api/job-posts/{slug}:
 *   patch:
 *     tags: [Job Posts]
 *     summary: Update a job post
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
*     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Job post title
 *               description:
 *                 type: string
 *                 description: Job post description
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 description: Job post due date
 *               companyname:
 *                 type: string
 *                 description: Job post company name
 *               companyLogo:
 *                 type: string
 *                 format: binary
 *                 description: Upload company logo
 *               companywebsite:
 *                 type: string
 *                 description: Job post company website
 *               applicationLink:
 *                 type: string
 *                 description: Job post application link
 *     responses:
 *       200:
 *         description: Job post updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Job post not found
 */
router.patch("/:slug", authenticate, authorize("ADMIN"), uploadFile, updateJobPost);

/**
 * @swagger
 * /api/job-posts/{slug}:
 *   delete:
 *     tags: [Job Posts]
 *     summary: Delete a job post
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: hardDelete
 *         schema:
 *           type: boolean
 *         description: Set to true to permanently delete the job post
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Job post title
 *               description:
 *                 type: string
 *                 description: Job post description
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 description: Job post due date
 *               companyname:
 *                 type: string
 *                 description: Job post company name
 *               companyLogo:
 *                 type: string
 *                 format: binary
 *                 description: Upload company logo
 *               companywebsite:
 *                 type: string
 *                 description: Job post company website
 *               applicationLink:
 *                 type: string
 *                 description: Job post application link
 *     responses:
 *       204:
 *         description: Job post deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Job post not found
 */
router.delete("/:slug", authenticate, authorize("ADMIN"), deleteJobPost);

/**
 * @swagger
 * /api/job-posts/cleanup/expired:
 *   post:
 *     tags: [Job Posts]
 *     parameters:
 *      - in: query
 *        name: hardDelete
 *        schema:
 *          type: boolean
 *        description: Set to true to permanently delete expired job posts
 *     summary: Clean up expired job posts (admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Expired job posts cleaned up successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post("/cleanup/expired", authenticate, authorize("ADMIN"), getExpiredJobPosts);
export default router;
