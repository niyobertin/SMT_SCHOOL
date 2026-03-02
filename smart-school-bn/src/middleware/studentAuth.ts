import { Request, Response, NextFunction } from "express";
import { studentAuthService } from "../services/studentAuth.service";
import { logger } from "../utils/logger";

export const authenticateStudent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Please provide a valid student token.",
      });
    }

    const decoded = studentAuthService.verifyStudentToken(token);

    if (!decoded || decoded.actorType !== "STUDENT") {
      return res.status(401).json({
        success: false,
        message: "Invalid student token.",
      });
    }

    (req as any).student = decoded;
    (req as any).studentId = decoded.studentId;
    (req as any).schoolId = decoded.schoolId;

    next();
  } catch (error: any) {
    logger.error("Student authentication error", error);
    res.status(401).json({
      success: false,
      message: error.message || "Invalid token",
    });
  }
};

export const requireStudentSchoolScope = (paramName = "schoolId") => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const student = (req as any).student;
      const paramSchoolId = req.params[paramName];

      if (!student || student.schoolId !== paramSchoolId) {
        return res.status(403).json({
          success: false,
          message: "Access denied. Cannot access other schools.",
        });
      }

      next();
    } catch (error) {
      logger.error("School scope check error", error);
      res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }
  };
};

export const optionalStudentAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return next();
    }

    const decoded = studentAuthService.verifyStudentToken(token);

    if (decoded && decoded.actorType === "STUDENT") {
      (req as any).student = decoded;
      (req as any).studentId = decoded.studentId;
      (req as any).schoolId = decoded.schoolId;
    }

    next();
  } catch (error) {
    next();
  }
};
