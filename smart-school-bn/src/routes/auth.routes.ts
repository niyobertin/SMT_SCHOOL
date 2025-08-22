import { Router } from "express";
import { body } from "express-validator";
import { validateRequest } from "../middleware/validation";
import { authenticate } from "../middleware/auth";
import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

const authRoutes = Router();

// Login validation
const loginValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  body("password").notEmpty().withMessage("Password is required"),
];

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         token:
 *                           type: string
 *                           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *                         expiresIn:
 *                           type: string
 *                           example: "24h"
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Mock authentication logic - replace with your actual auth implementation
    if (email === "demo@example.com" && password === "password123") {
      const mockUser = {
        id: 1,
        email: "demo@example.com",
        name: "Demo User",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const token = "demo-token"; // In real app, generate JWT here

      logger.info("User login successful", {
        userId: mockUser.id,
        email: mockUser.email,
      });

      res.status(200).json({
        status: "success",
        message: "Login successful",
        data: {
          token,
          user: mockUser,
          expiresIn: "24h",
        },
        timestamp: new Date().toISOString(),
      });
    } else {
      logger.warn("Login attempt failed", { email, ip: req.ip });

      res.status(401).json({
        status: "error",
        message: "Invalid email or password",
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: User registration
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserRequest'
 *     responses:
 *       201:
 *         description: Registration successful
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         token:
 *                           type: string
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *                         expiresIn:
 *                           type: string
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: User already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, name, password } = req.body;

    // Mock registration logic
    const mockUser = {
      id: Date.now(), // Simple ID generation for demo
      email,
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const token = "demo-token"; // In real app, generate JWT here

    logger.info("User registration successful", {
      userId: mockUser.id,
      email: mockUser.email,
    });

    res.status(201).json({
      status: "success",
      message: "Registration successful",
      data: {
        token,
        user: mockUser,
        expiresIn: "24h",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = (req as any).user; // Set by authenticate middleware

    logger.info("User profile retrieved", { userId: user.id });

    res.status(200).json({
      status: "success",
      message: "Profile retrieved successfully",
      data: user,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: User logout
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = (req as any).user;

    logger.info("User logout successful", { userId: user.id });

    res.status(200).json({
      status: "success",
      message: "Logout successful",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

// Routes
authRoutes.post("/login", loginValidation, validateRequest, login);
authRoutes.post("/register", loginValidation, validateRequest, register);
authRoutes.get("/profile", authenticate, getProfile);
authRoutes.post("/logout", authenticate, logout);

export default authRoutes;
