import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import prisma from '../services/prisma.singleton';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. Please provide a valid token or login.',
        code: 'TOKEN_MISSING',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload & {
      userId: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        phoneNumber: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        userOrganizations: {
          select: {
            organizationId: true,
            organization: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token or user not active',
        code: 'TOKEN_INVALID',
      });
    }

    req.user = user;
    next();
  } catch (error: any) {
    res.status(401).json({
      status: 'error',
      message: error.message || 'Invalid token',
      code: 'TOKEN_INVALID',
    });
  }
};

export const optionalAuthenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return next();

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload & {
      userId: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        phoneNumber: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        userOrganizations: {
          select: {
            organizationId: true,
            organization: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (user?.isActive) {
      req.user = user;
    }
    next();
  } catch {
    // Invalid token — treat as guest
    next();
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
        code: 'UNAUTHENTICATED',
      });
    }
    if ((req.user as any).role !== 'SUPER_ADMIN' && !roles.includes((req.user as any).role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. You do not have permission to perform this action.',
        code: 'FORBIDDEN',
      });
    }
    next();
  };
};
