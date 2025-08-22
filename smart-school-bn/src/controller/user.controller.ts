import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

// Mock user data for demonstration
interface User {
  id: number;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

let users: User[] = [
  {
    id: 1,
    email: 'john@example.com',
    name: 'John Doe',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  },
  {
    id: 2,
    email: 'jane@example.com',
    name: 'Jane Smith',
    createdAt: new Date('2023-01-02'),
    updatedAt: new Date('2023-01-02')
  }
];

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of users per page
 *     responses:
 *       200:
 *         description: Successfully retrieved users
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
 *                         users:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/User'
 *                         pagination:
 *                           type: object
 *                           properties:
 *                             page:
 *                               type: integer
 *                             limit:
 *                               type: integer
 *                             total:
 *                               type: integer
 *                             totalPages:
 *                               type: integer
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedUsers = users.slice(startIndex, endIndex);
    const total = users.length;
    const totalPages = Math.ceil(total / limit);

    logger.info('Users retrieved successfully', {
      page,
      limit,
      total,
      resultCount: paginatedUsers.length
    });

    res.status(200).json({
      status: 'success',
      message: 'Users retrieved successfully',
      data: {
        users: paginatedUsers,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: Successfully retrieved user
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const user = users.find(u => u.id === id);

    if (!user) {
      logger.warn('User not found', { userId: id });
      res.status(404).json({
        status: 'error',
        message: 'User not found',
        timestamp: new Date().toISOString()
      });
      return;
    }

    logger.info('User retrieved successfully', { userId: id });

    res.status(200).json({
      status: 'success',
      message: 'User retrieved successfully',
      data: user,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserRequest'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request - validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Conflict - user already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, name, password } = req.body;

    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      logger.warn('User creation failed - email already exists', { email });
      res.status(409).json({
        status: 'error',
        message: 'User with this email already exists',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Create new user
    const newUser: User = {
      id: users.length + 1,
      email,
      name,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    users.push(newUser);

    logger.info('User created successfully', { userId: newUser.id, email: newUser.email });

    res.status(201).json({
      status: 'success',
      message: 'User created successfully',
      data: newUser,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Updated"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.updated@example.com"
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const { name, email } = req.body;

    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      logger.warn('User update failed - user not found', { userId: id });
      res.status(404).json({
        status: 'error',
        message: 'User not found',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Update user
    users[userIndex] = {
      ...users[userIndex],
      ...(name && { name }),
      ...(email && { email }),
      updatedAt: new Date()
    };

    logger.info('User updated successfully', { userId: id });

    res.status(200).json({
      status: 'success',
      message: 'User updated successfully',
      data: users[userIndex],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const userIndex = users.findIndex(u => u.id === id);

    if (userIndex === -1) {
      logger.warn('User deletion failed - user not found', { userId: id });
      res.status(404).json({
        status: 'error',
        message: 'User not found',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Delete user
    users.splice(userIndex, 1);

    logger.info('User deleted successfully', { userId: id });

    res.status(200).json({
      status: 'success',
      message: 'User deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};