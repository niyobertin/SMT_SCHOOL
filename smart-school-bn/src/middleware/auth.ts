import jwt, { JwtPayload } from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';

const prisma = new PrismaClient();

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. please provide a valid token or login.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload & { userId?: string; actorType?: string; studentId?: string; schoolId?: string };

    if (decoded.actorType === 'STUDENT') {
      const student = await prisma.student.findUnique({
        where: { id: decoded.studentId },
        include: { school: true }
      });

      if (!student || student.status !== 'ACTIVE') {
        return res.status(401).json({
          success: false,
          message: 'Student account is inactive or not found'
        });
      }

      //@ts-ignore
      req.student = student;
      //@ts-ignore
      req.studentId = student.id;
      //@ts-ignore
      req.schoolId = student.schoolId;
      //@ts-ignore
      req.user = {
        id: student.id,
        role: 'STUDENT',
        firstName: student.firstName,
        lastName: student.lastName
      };

      return next();
    }

    if (!decoded.userId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token payload: userId missing'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      // ... (rest of the select remains same)
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
            organization: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        schoolStaff: {
          select: {
            schoolId: true,
            roleInSchool: true,
            school: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or user not active'
      });
    }
    //@ts-ignore
    req.user = user;
    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: error.message || 'Invalid token'
    });
  }
};

export const optionalAuthenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      // no token, guest user
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload & { userId?: string; actorType?: string; studentId?: string };

    if (decoded.actorType === 'STUDENT') {
      const student = await prisma.student.findUnique({
        where: { id: decoded.studentId }
      });

      if (student && student.status === 'ACTIVE') {
        //@ts-ignore
        req.student = student;
        //@ts-ignore
        req.studentId = student.id;
        //@ts-ignore
        req.user = { id: student.id, role: 'STUDENT' };
      }
      return next();
    }

    if (!decoded.userId) return next();

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
        isActive: true
      }
    });

    if (user && user.isActive) {
      //@ts-ignore
      req.user = user;
    }
    next();
  } catch (err) {
    // token invalid, just treat as guest
    next();
  }
};
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    if (user && user.role !== 'SUPER_ADMIN' && !roles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permissions to perform this action.'
      });
    }
    next();
  };
};
