import Router from "express";
import { deleteUser, getProfile, getUserById, getUsers, updateUserPassword, updateUserProfile } from "../controller/user.controller";
import { authenticate, authorize } from "../middleware/auth";

const userRouter = Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *       - in: query
 *         name: q
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   email:
 *                     type: string
 *                   phoneNumber:
 *                     type: string
 *                   username:
 *                     type: string
 *                   firstName:
 *                     type: string
 *                   lastName:
 *                     type: string
 *                   role:
 *                     type: string
 *                   isActive:
 *                     type: boolean
 *                   isVerified:
 *                     type: boolean
 *                   verificationCode:
 *                     type: number
 *                   resetPasswordToken:
 *                     type: string
 *                   resetPasswordExpires:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                   updatedAt:
 *                     type: string
 *                   lastLogin:
 *                     type: string
 */
userRouter.get("/",
    authenticate,
    authorize("ADMIN"),
    getUsers
);
/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get the currently logged-in user's profile
 *     description: Returns the authenticated user's info with related data (courses, enrollments, reviews, test attempts, certificates, user progress).
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The profile of the logged-in user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 email:
 *                   type: string
 *                 phoneNumber:
 *                   type: string
 *                 username:
 *                   type: string
 *                 firstName:
 *                   type: string
 *                 lastName:
 *                   type: string
 *                 role:
 *                   type: string
 *                 isActive:
 *                   type: boolean
 *                 isVerified:
 *                   type: boolean
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                 lastLogin:
 *                   type: string
 *                   format: date-time
 *                 courses:
 *                   type: array
 *                   items:
 *                     type: object
 *                     additionalProperties: true
 *                 enrollments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     additionalProperties: true
 *                 reviews:
 *                   type: array
 *                   items:
 *                     type: object
 *                     additionalProperties: true
 *                 testAttempts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     additionalProperties: true
 *                 certificates:
 *                   type: array
 *                   items:
 *                     type: object
 *                     additionalProperties: true
 *                 userProgress:
 *                   type: array
 *                   items:
 *                     type: object
 *                     additionalProperties: true
 *       401:
 *         description: Unauthorized – missing or invalid token
 *       404:
 *         description: User not found
 */
userRouter.get("/profile",
    authenticate,
    getProfile);
/**
 * @swagger
 * /api/users/{id}:
 *   patch:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               username:
 *                 type: string
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User is not the course instructor
 *       500:
 *         description: Internal server error
 */
userRouter.patch("/:id",
    authenticate,
    updateUserProfile
);
/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to delete
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User is not the course instructor
 *       500:
 *         description: Internal server error
 */
userRouter.delete("/:id",
    authenticate,
    deleteUser
);
/**
 * @swagger
 * /api/users/{id}/password:
 *   patch:
 *     summary: Update user password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *               password:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: User password updated successfully
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User is not the course instructor
 *       500:
 *         description: Internal server error
 */
userRouter.patch("/:id/password",
    authenticate,
    updateUserPassword
);
export default userRouter;