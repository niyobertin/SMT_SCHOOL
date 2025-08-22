
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      res.status(401).json({
        status: 'error',
        message: 'Access denied. No token provided.',
        timestamp: new Date().toISOString()
      });
      return;
    }
  
    try {
      // Here you would verify the JWT token
      // For demo purposes, we'll just check if it's not empty
      if (token === 'demo-token') {
        (req as any).user = { id: 1, email: 'demo@example.com' };
        next();
      } else {
        throw new Error('Invalid token');
      }
    } catch (error) {
      logger.warn('Authentication failed:', {
        error: (error as Error).message,
        ip: req.ip,
        url: req.originalUrl
      });
      
      res.status(401).json({
        status: 'error',
        message: 'Invalid token.',
        timestamp: new Date().toISOString()
      });
    }
  };