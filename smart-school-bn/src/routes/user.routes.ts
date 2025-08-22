import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validation';
import { performanceMonitor } from '../middleware/performance';
import { createUser, deleteUser, getUserById, getUsers, updateUser } from '@/controller/user.controller';


const router = Router();
router.use(performanceMonitor);
const createUserValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number')
];

const updateUserValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
];

const userIdValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer')
];

const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// Routes
router.get('/', 
  paginationValidation, 
  validateRequest, 
  getUsers
);

router.get('/:id', 
  userIdValidation, 
  validateRequest, 
  getUserById
);

router.post('/', 
  createUserValidation, 
  validateRequest, 
  createUser
);

router.put('/:id', 
  updateUserValidation, 
  validateRequest, 
  updateUser
);

router.delete('/:id', 
  userIdValidation, 
  validateRequest, 
  deleteUser
);

export { router as userRoutes };