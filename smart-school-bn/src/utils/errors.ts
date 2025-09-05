// Base error class
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  
  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
    
    // Set the prototype explicitly (needed for instanceof checks in TypeScript)
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// 400 Bad Request
export class ValidationError extends AppError {
  constructor(message = 'Validation error') {
    super(message, 400);
  }
}

// 401 Unauthorized
export class UnauthorizedError extends AppError {
  constructor(message = 'Not authorized') {
    super(message, 401);
  }
}

// 403 Forbidden
export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

// 404 Not Found
export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

// 409 Conflict
export class ConflictError extends AppError {
  constructor(message = 'Conflict occurred') {
    super(message, 409);
  }
}

// 422 Unprocessable Entity
export class UnprocessableEntityError extends AppError {
  constructor(message = 'Unprocessable entity') {
    super(message, 422);
  }
}

// 429 Too Many Requests
export class RateLimitExceededError extends AppError {
  constructor(message = 'Too many requests, please try again later') {
    super(message, 429);
  }
}

// 500 Internal Server Error
export class InternalServerError extends AppError {
  constructor(message = 'Internal server error') {
    super(message, 500);
  }
}

// 503 Service Unavailable
export class ServiceUnavailableError extends AppError {
  constructor(message = 'Service temporarily unavailable') {
    super(message, 503);
  }
}

// Error handler middleware
export const errorHandler = (err: any, req: any, res: any, next: any) => {
  // Default to 500 if status code not set
  err.statusCode = err.statusCode || 500;
  
  // Handle duplicate key errors (MongoDB)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate field value: ${field}. Please use another value.`;
    err = new ValidationError(message);
  }
  
  // Handle validation errors (Mongoose)
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val: any) => val.message);
    err = new ValidationError(messages.join('. '));
  }
  
  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    err = new UnauthorizedError('Invalid token. Please log in again.');
  }
  
  if (err.name === 'TokenExpiredError') {
    err = new UnauthorizedError('Your token has expired. Please log in again.');
  }
  
  // Handle CastError (Mongoose)
  if (err.name === 'CastError') {
    const message = `Resource not found. Invalid: ${err.path}`;
    err = new NotFoundError(message);
  }
  
  // Log the error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error 💥:', {
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  
  // Send response to client
  res.status(err.statusCode).json({
    status: err.status || 'error',
    message: err.isOperational ? err.message : 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// Async error handling wrapper (for async/await)
export const catchAsync = (fn: Function) => {
  return (req: any, res: any, next: any) => {
    fn(req, res, next).catch(next);
  };
};

// 404 handler
export const notFound = (req: any, res: any, next: any) => {
  next(new NotFoundError(`Can't find ${req.originalUrl} on this server!`));
};
