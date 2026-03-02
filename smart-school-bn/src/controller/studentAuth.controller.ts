import { Request, Response, NextFunction } from "express";
import { studentAuthService } from "../services/studentAuth.service";
import { logger } from "../utils/logger";

export const studentAuthController = {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { schoolCode, studentId } = req.body;

      if (!schoolCode || !studentId) {
        return res.status(400).json({
          status: "error",
          message: "schoolCode and studentId are required",
        });
      }

      const result = await studentAuthService.login(
        schoolCode,
        studentId
      );

      if ("error" in result) {
        return res.status(401).json({
          status: "error",
          message: result.error,
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Student login successful",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("Student login error", error);
      next(error);
    }
  },

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const studentId = (req as any).studentId;

      const profile = await studentAuthService.getStudentProfile(studentId);

      if (!profile) {
        return res.status(404).json({
          status: "error",
          message: "Student not found",
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Profile retrieved successfully",
        data: profile,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("Get student profile error", error);
      next(error);
    }
  },

  async getAssignedCourses(req: Request, res: Response, next: NextFunction) {
    try {
      const studentId = (req as any).studentId;
      const profile = await studentAuthService.getStudentProfile(studentId);

      if (!profile) {
        return res.status(404).json({
          status: "error",
          message: "Student not found",
        });
      }

      return res.status(200).json({
        status: "success",
        data: profile.assignedCourses,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  },

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const student = (req as any).student;

      if (!student) {
        return res.status(401).json({
          status: "error",
          message: "Unauthorized",
        });
      }

      const newToken = studentAuthService.generateStudentToken({
        actorType: "STUDENT",
        studentId: student.studentId,
        schoolId: student.schoolId,
        firstName: student.firstName,
        lastName: student.lastName,
      });

      return res.status(200).json({
        status: "success",
        message: "Token refreshed",
        data: {
          token: newToken,
          expiresIn: "24h",
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("Token refresh error", error);
      next(error);
    }
  },
};
