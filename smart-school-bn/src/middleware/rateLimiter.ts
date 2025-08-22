// Rate Limiter Middleware
import { logger } from '../utils/logger';
import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,       
  max: 100, 
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again later.',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn('Rate limit exceeded:', {
      ip: req.ip,
      url: req.originalUrl,
      userAgent: req.get('User-Agent')
    });
    res.status(429).json({
      status: 'error',
      message: 'Too many requests from this IP, please try again later.',
      timestamp: new Date().toISOString()
    });
  }
});