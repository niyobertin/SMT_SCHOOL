import { NextFunction, Request, Response } from 'express';
import { logger } from '../utils/logger';
export const performanceMonitor = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = process.hrtime.bigint();
  
  res.on('finish', () => {
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1000000; 
    
    const logData = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration.toFixed(2)}ms`,
      contentLength: res.get('content-length'),
      userAgent: req.get('User-Agent'),
      ip: req.ip
    };
    
    if (duration > 1000) {
      logger.warn('Slow request detected', logData);
    } else if (duration > 500) {
      logger.info('Request completed', logData);
    }
  });
  
  next();
};