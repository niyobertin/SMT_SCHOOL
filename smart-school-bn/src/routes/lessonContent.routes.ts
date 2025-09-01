import { Router } from "express";
import { createLessonContent, deleteLessonContent, getLessonContent, getLessonContentById, updateLessonContent } from "../controller/lessonContent.controller";
import { uploadFile } from "../middleware/uploadFile";
import { authenticate, authorize } from "../middleware/auth";


const lessonContentRouter = Router();

/**
 * @swagger
 * /api/lesson-content/{lessonId}:
 *   post:
 *     summary: Create lesson content
 *     tags: [Lesson Content]
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         description: ID of the lesson
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               fileVideo:
 *                 type: file
 *                 format: binary
 *               fileAudio:
 *                 type: file
 *                 format: binary
 *               filePDF:
 *                 type: file
 *                 format: binary
 *               fileImage:
 *                 type: file
 *                 format: binary
 *               title:
 *                 type: string
 *                 example: "Lesson Content"
 *               textBody:
 *                 type: string
 *                 example: "Lesson Content"
 *               order:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Lesson content created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 textBody:
 *                   type: string
 *                 order:
 *                   type: integer
 *                 lessonId:
 *                   type: string
 *                 videoUrl:
 *                   type: string
 *                 audioUrl:
 *                   type: string
 *                 pdfUrl:
 *                   type: string
 *                 imageUrl:
 *                   type: string
 *                 fileName:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                 updatedAt:
 *                   type: string
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       message:
 *                         type: string
 *       404:
 *         description: Lesson not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       message:
 *                         type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       message:
 *                         type: string
 */

/**
 * @swagger
 * /api/lesson-content/{lessonId}:
 *   get:
 *     summary: Get lesson content
 *     tags: [Lesson Content]
 *     parameters:
 *      - in: path
 *        name: lessonId
 *        required: true
 *        description: ID of the lesson
 *        schema:
 *          type: string
 *      - in: query
 *        name: page
 *        required: false
 *        description: Page number
 *        schema:
 *          type: integer
 *      - in: query
 *        name: limit
 *        required: false
 *        description: Number of items per page
 *        schema:
 *          type: integer
 *      - in: query
 *        name: q
 *        required: false
 *        description: Search query
 *        schema:
 *          type: string
 *     responses:
 *       200:
 *         description: Lesson content retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       textBody:
 *                         type: string
 *                       order:
 *                         type: integer
 *                       lessonId:
 *                         type: string
 *                       videoUrl:
 *                         type: string
 *                       audioUrl:
 *                         type: string
 *                       pdfUrl:
 *                         type: string
 *                       imageUrl:
 *                         type: string
 *                       fileName:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                       updatedAt:
 *                         type: string
 *       404:
 *         description: Lesson not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 */

/**
 * @swagger
 * /api/lesson-content/get-lesson-content-by-id/{lessonContentId}:
 *   get:
 *     summary: Get lesson content by id
 *     tags: [Lesson Content]
 *     parameters:
 *       - in: path
 *         name: lessonContentId
 *         required: true
 *         description: ID of the lesson content
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lesson content retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     textBody:
 *                       type: string
 *                     order:
 *                       type: integer
 *                     lessonId:
 *                       type: string
 *                     videoUrl:
 *                       type: string
 *                     audioUrl:
 *                       type: string
 *                     pdfUrl:
 *                       type: string
 *                     imageUrl:
 *                       type: string
 *                     fileName:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *       404:
 *         description: Lesson content not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 */

/**
 * @swagger
 * /api/lesson-content/{lessonId}:
 *  patch:
 *    summary: Update lesson content
 *    tags: [Lesson Content]
 *    parameters:
 *      - in: path
 *        name: lessonId
 *        required: true
 *        description: ID of the lesson content
 *        schema:
 *          type: string
 *    requestBody:
 *      required: true
 *      content:
 *        multipart/form-data:
 *          schema:
 *            type: object
 *            properties:
 *              title:
 *                type: string
 *              textBody:
 *                type: string
 *              order:
 *                type: integer
 *              fileName:
 *                type: string
 *              videoUrl:
 *                type: string
 *              audioUrl:
 *                type: string
 *              pdfUrl:
 *                type: string
 *              imageUrl:
 *                type: string
 *    responses:
 *      200:
 *        description: Lesson content updated successfully
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                id:
 *                  type: string
 *                title:
 *                  type: string
 *                textBody:
 *                  type: string
 *                order:
 *                  type: integer
 *                lessonId:
 *                  type: string
 *                videoUrl:
 *                  type: string
 *                audioUrl:
 *                  type: string
 *                pdfUrl:
 *                  type: string
 *                imageUrl:
 *                  type: string
 *                fileName:
 *                  type: string
 *                createdAt:
 *                  type: string
 *                updatedAt:
 *                  type: string
 *      404:
 *        description: Lesson content not found
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *      500:
 *        description: Internal server error
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 */

/**
 * @swagger
 * /api/lesson-content/{lessonContentId}:
 *   delete:
 *     summary: Delete lesson content
 *     tags: [Lesson Content]
 *     parameters:
 *       - in: path
 *         name: lessonContentId
 *         required: true
 *         description: ID of the lesson content
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lesson content deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *       404:
 *         description: Lesson content not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
lessonContentRouter.post("/:lessonId",authenticate, authorize("ADMIN","INSTRUCTOR"), uploadFile, createLessonContent);
lessonContentRouter.get("/:lessonId", getLessonContent);
lessonContentRouter.get("/get-lesson-content-by-id/:lessonContentId", getLessonContentById);
lessonContentRouter.patch ("/:lessonContentId",authenticate, authorize("ADMIN","INSTRUCTOR"), uploadFile, updateLessonContent);
lessonContentRouter.delete("/:lessonContentId",authenticate, authorize("ADMIN","INSTRUCTOR"), deleteLessonContent);

export default lessonContentRouter;