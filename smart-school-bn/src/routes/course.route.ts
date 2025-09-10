import { Router } from "express";
import { createCourse, deleteCourse, getCouses, getCourseById, updateCourse, getCourseByCategory } from "../controller/course.controller";
import { authenticate, authorize } from "../middleware/auth";
import { courseValidation, updateCourseValidation } from "../schema/courseSchema";
import { validateRequest } from "../middleware/validation";
import { uploadFile } from "../middleware/uploadFile";

const courseRouters = Router();

/**
 * @swagger
 * /api/courses/{categoryId}:
 *   post:
 *     summary: Create a new course
 *     description: Create a new course in the system.
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Introduction to Web Development"
 *               slug:
 *                 type: string
 *                 example: "introduction-to-web-development"
 *               description:
 *                 type: string
 *                 example: "Learn the basics of web development"
 *               shortDescription:
 *                 type: string
 *                 example: "Beginner web development course"
 *               thumbnail:
 *                 type: string
 *                 example: "https://example.com/web-dev-thumbnail.jpg"
 *               language:
 *                 type: string
 *                 example: "English"
 *               level:
 *                 type: string
 *                 example: "Beginner"
 *               status:
 *                 type: string
 *                 example: "Published"
 *               isPublished:
 *                 type: boolean
 *                 example: true
 *               isFeatured:
 *                 type: boolean
 *                 example: true
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                   example: "web"
 *               requirements:
 *                 type: array
 *                 items:
 *                   type: string
 *                   example: "Basic computer skills"
 *               objectives:
 *                 type: array
 *                 items:
 *                   type: string
 *                   example: "Learn HTML, CSS, and JavaScript"
 *     responses:
 *       201:
 *         description: Course created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Course created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     course:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "507f1f77bcf86cd799439011"
 *                         title:
 *                           type: string
 *                           example: "Introduction to Web Development"
 *                         slug:
 *                           type: string
 *                           example: "introduction-to-web-development"
 *                         description:
 *                           type: string
 *                           example: "Learn the basics of web development"
 *                         shortDescription:
 *                           type: string
 *                           example: "Beginner web development course"
 *                         thumbnail:
 *                           type: string
 *                           example: "https://example.com/web-dev-thumbnail.jpg"
 *                         language:
 *                           type: string
 *                           example: "English"
 *                         level:
 *                           type: string
 *                           example: "Beginner"
 *                         status:
 *                           type: string
 *                           example: "Published"
 *                         isPublished:
 *                           type: boolean
 *                           example: true
 *                         isFeatured:
 *                           type: boolean
 *                           example: true
 *                         tags:
 *                           type: array
 *                           items:
 *                             type: string
 *                             example: "web"
 *                         requirements:
 *                           type: array
 *                           items:
 *                             type: string
 *                             example: "Basic computer skills"
 *                         objectives:
 *                           type: array
 *                           items:
 *                             type: string
 *                             example: "Learn HTML, CSS, and JavaScript"
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Invalid input data provided"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Authentication required"
 *       404:
 *         description: Course not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "The requested course was not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "An unexpected error occurred"
 */

/**
 * @swagger
 * /api/courses/:
 *   get:
 *     summary: Get all courses
 *     description: Retrieve a list of all courses.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Courses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Courses retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "507f1f77bcf86cd799439011"
 *                       title:
 *                         type: string
 *                         example: "Introduction to Web Development"
 *                       slug:
 *                         type: string
 *                         example: "introduction-to-web-development"
 *                       description:
 *                         type: string
 *                         example: "Learn the basics of web development"
 *                       shortDescription:
 *                         type: string
 *                         example: "Beginner web development course"
 *                       thumbnail:
 *                         type: string
 *                         example: "https://example.com/web-dev-thumbnail.jpg"
 *                       language:
 *                         type: string
 *                         example: "English"
 *                       level:
 *                         type: string
 *                         example: "Beginner"
 *                       status:
 *                         type: string
 *                         example: "Published"
 *                       isPublished:
 *                         type: boolean
 *                         example: true
 *                       isFeatured:
 *                         type: boolean
 *                         example: true
 *                       tags:
 *                         type: array
 *                         items:
 *                           type: string
 *                           example: "web"
 *                       requirements:
 *                         type: array
 *                         items:
 *                           type: string
 *                           example: "Basic computer skills"
 *                       objectives:
 *                         type: array
 *                         items:
 *                           type: string
 *                           example: "Learn HTML, CSS, and JavaScript"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Authentication required"
 *       404:
 *         description: Course not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "The requested course was not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "An unexpected error occurred"
 */

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     summary: Get a course by ID
 *     description: Retrieve a specific course by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Course ID
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Course retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Course retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     course:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "507f1f77bcf86cd799439011"
 *                         title:
 *                           type: string
 *                           example: "Introduction to Web Development"
 *                         slug:
 *                           type: string
 *                           example: "introduction-to-web-development"
 *                         description:
 *                           type: string
 *                           example: "Learn the basics of web development"
 *                         shortDescription:
 *                           type: string
 *                           example: "Beginner web development course"
 *                         thumbnail:
 *                           type: string
 *                           example: "https://example.com/web-dev-thumbnail.jpg"
 *                         language:
 *                           type: string
 *                           example: "English"
 *                         level:
 *                           type: string
 *                           example: "Beginner"
 *                         status:
 *                           type: string
 *                           example: "Published"
 *                         isPublished:
 *                           type: boolean
 *                           example: true
 *                         isFeatured:
 *                           type: boolean
 *                           example: true
 *                         tags:
 *                           type: array
 *                           items:
 *                             type: string
 *                             example: "web"
 *                         requirements:
 *                           type: array
 *                           items:
 *                             type: string
 *                             example: "Basic computer skills"
 *                         objectives:
 *                           type: array
 *                           items:
 *                             type: string
 *                             example: "Learn HTML, CSS, and JavaScript"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Authentication required"
 *       404:
 *         description: Course not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "The requested course was not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "An unexpected error occurred"
 */

/**
 * @swagger
 * /api/courses/category/{categoryId}:
 *   get:
 *     summary: Get courses by category ID
 *     description: Retrieve a list of courses filtered by category ID.
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query
 *     tags: [Courses]
 *     responses:
 *       200:
 *         description: Courses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Courses retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     courses:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "507f1f77bcf86cd799439011"
 *                           title:
 *                             type: string
 *                             example: "Introduction to Web Development"
 *                           slug:
 *                             type: string
 *                             example: "introduction-to-web-development"
 *                           description:
 *                             type: string
 *                             example: "Learn the basics of web development"
 *                           shortDescription:
 *                             type: string
 *                             example: "Beginner web development course"
 *                           thumbnail:
 *                             type: string
 *                             example: "https://example.com/web-dev-thumbnail.jpg"
 *                           language:
 *                             type: string
 *                             example: "English"
 *                           level:
 *                             type: string
 *                             example: "BEGINNER"
 *                           status:
 *                             type: string
 *                             example: "PUBLISHED"
 *                           isPublished:
 *                             type: boolean
 *                             example: true
 *                           isFeatured:
 *                             type: boolean
 *                             example: true
 *                           tags:
 *                             type: array
 *                             items:
 *                               type: string
 *                               example: "web"
 *                           requirements:
 *                             type: array
 *                             items:
 *                               type: string
 *                               example: "Basic computer skills"
 *                           objectives:
 *                             type: array
 *                             items:
 *                               type: string
 *                               example: "Learn HTML, CSS, and JavaScript"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Authentication required"
 *       404:
 *         description: Courses not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Courses not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "An unexpected error occurred"
 */

/**
 * @swagger
 * /api/courses/{id}:
 *   patch:
 *     summary: Update a course by ID
 *     description: Update a specific course by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Course ID
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Introduction to Web Development"
 *               slug:
 *                 type: string
 *                 example: "introduction-to-web-development"
 *               description:
 *                 type: string
 *                 example: "Learn the basics of web development"
 *               shortDescription:
 *                 type: string
 *                 example: "Beginner web development course"
 *               thumbnail:
 *                 type: string
 *                 example: "https://example.com/web-dev-thumbnail.jpg"
 *               language:
 *                 type: string
 *                 example: "English"
 *               level:
 *                 type: string
 *                 example: "BEGINNER"
 *               status:
 *                 type: string
 *                 example: "PUBLISHED"
 *               isPublished:
 *                 type: boolean
 *                 example: true
 *               isFeatured:
 *                 type: boolean
 *                 example: true
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["web"]
 *               requirements:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Basic computer skills"]
 *               objectives:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Learn HTML, CSS, and JavaScript"]
 *     responses:
 *       200:
 *         description: Course updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Course updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     course:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "507f1f77bcf86cd799439011"
 *                         title:
 *                           type: string
 *                           example: "Introduction to Web Development"
 *                         slug:
 *                           type: string
 *                           example: "introduction-to-web-development"
 *                         description:
 *                           type: string
 *                           example: "Learn the basics of web development"
 *                         shortDescription:
 *                           type: string
 *                           example: "Beginner web development course"
 *                         thumbnail:
 *                           type: string
 *                           example: "https://example.com/web-dev-thumbnail.jpg"
 *                         language:
 *                           type: string
 *                           example: "English"
 *                         level:
 *                           type: string
 *                           example: "BEGINNER"
 *                         status:
 *                           type: string
 *                           example: "PUBLISHED"
 *                         isPublished:
 *                           type: boolean
 *                           example: true
 *                         isFeatured:
 *                           type: boolean
 *                           example: true
 *                         tags:
 *                           type: array
 *                           items:
 *                             type: string
 *                             example: "web"
 *                         requirements:
 *                           type: array
 *                           items:
 *                             type: string
 *                             example: "Basic computer skills"
 *                         objectives:
 *                           type: array
 *                           items:
 *                             type: string
 *                             example: "Learn HTML, CSS, and JavaScript"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Authentication required"
 *       404:
 *         description: Course not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "The requested course was not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "An unexpected error occurred"
 */

/**
 * @swagger
 * /api/courses/{id}:
 *   delete:
 *     summary: Delete a course by ID
 *     description: Delete a specific course by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Course ID
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Course deleted successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Authentication required"
 *       404:
 *         description: Course not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "The requested course was not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "An unexpected error occurred"
 */
courseRouters.post("/:categoryId",authenticate, authorize("ADMIN","INSTRUCTOR"),uploadFile,courseValidation, validateRequest, createCourse);
courseRouters.get("/", getCouses);
courseRouters.get("/:id", getCourseById);
courseRouters.get("/category/:categoryId", getCourseByCategory);
courseRouters.patch("/:id", authenticate, authorize("ADMIN","INSTRUCTOR"), updateCourseValidation, validateRequest, updateCourse);
courseRouters.delete("/:id", authenticate, authorize("ADMIN","INSTRUCTOR"), deleteCourse);

export default courseRouters;