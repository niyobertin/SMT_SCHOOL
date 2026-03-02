import { Request, Response, NextFunction } from "express";
import { schoolService } from "../services/school.service";
import { studentService } from "../services/student.service";
import { logger } from "../utils/logger";

export const schoolAdminController = {
  async createSchool(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, code, type, description, logo, contactEmail, contactPhone } = req.body;

      if (!name || !code) {
        return res.status(400).json({
          status: "error",
          message: "name and code are required",
        });
      }

      const school = await schoolService.createSchool({
        name,
        code,
        type,
        description,
        logo,
        contactEmail,
        contactPhone,
      });

      return res.status(201).json({
        status: "success",
        message: "School created successfully",
        data: school,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      if (error.code === "P2002") {
        return res.status(409).json({
          status: "error",
          message: "School code already exists",
        });
      }
      logger.error("Create school error", error);
      next(error);
    }
  },

  async listSchools(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const isActive = req.query.isActive === "true";

      const result = await schoolService.listSchools(
        page,
        limit,
        req.query.isActive ? isActive : undefined
      );

      return res.status(200).json({
        status: "success",
        message: "Schools retrieved successfully",
        data: result.data,
        pagination: result.pagination,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("List schools error", error);
      next(error);
    }
  },

  async getSchoolById(req: Request, res: Response, next: NextFunction) {
    try {
      const { schoolId } = req.params;

      const school = await schoolService.getSchoolById(schoolId);

      if (!school) {
        return res.status(404).json({
          status: "error",
          message: "School not found",
        });
      }

      const staff = await schoolService.getSchoolStaff(schoolId);

      return res.status(200).json({
        status: "success",
        message: "School retrieved successfully",
        data: { ...school, staff },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("Get school error", error);
      next(error);
    }
  },

  async activateSchool(req: Request, res: Response, next: NextFunction) {
    try {
      const { schoolId } = req.params;
      const { isActive } = req.body;

      if (typeof isActive !== "boolean") {
        return res.status(400).json({
          status: "error",
          message: "isActive must be a boolean",
        });
      }

      const school = await schoolService.activateSchool(schoolId, isActive);

      return res.status(200).json({
        status: "success",
        message: `School ${isActive ? "activated" : "deactivated"} successfully`,
        data: school,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("Activate school error", error);
      next(error);
    }
  },

  async assignStaffToSchool(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { schoolId } = req.params;
      const { userId, roleInSchool } = req.body;
      // @ts-ignore
      const assignedBy = req.user?.id;

      if (!userId || !roleInSchool) {
        return res.status(400).json({
          status: "error",
          message: "userId and roleInSchool are required",
        });
      }

      const schoolStaff = await schoolService.assignStaffToSchool({
        schoolId,
        userId,
        roleInSchool,
        assignedBy,
      });

      return res.status(201).json({
        status: "success",
        message: "Staff assigned to school successfully",
        data: schoolStaff,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      if (error.code === "P2002") {
        return res.status(409).json({
          status: "error",
          message: "User is already assigned to this school",
        });
      }
      logger.error("Assign staff error", error);
      next(error);
    }
  },

  async getSchoolStaff(req: Request, res: Response, next: NextFunction) {
    try {
      const { schoolId } = req.params;

      const staff = await schoolService.getSchoolStaff(schoolId);

      return res.status(200).json({
        status: "success",
        message: "School staff retrieved successfully",
        data: staff,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("Get school staff error", error);
      next(error);
    }
  },
};

export const studentManagementController = {
  async createStudent(req: Request, res: Response, next: NextFunction) {
    try {
      const { schoolId } = req.params;
      const {
        studentId,
        firstName,
        lastName,
        credentialHash,
        email,
        phoneNumber,
        dateOfBirth,
        gender,
        classId,
        academicYearId,
      } = req.body;

      if (!studentId || !firstName || !lastName || !credentialHash) {
        return res.status(400).json({
          status: "error",
          message:
            "studentId, firstName, lastName, and credentialHash are required",
        });
      }

      const student = await studentService.createStudent({
        schoolId,
        studentId,
        firstName,
        lastName,
        credentialHash,
        email,
        phoneNumber,
        dateOfBirth,
        gender,
        classId,
        academicYearId,
      });

      return res.status(201).json({
        status: "success",
        message: "Student created successfully",
        data: student,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      if (error.code === "P2002") {
        return res.status(409).json({
          status: "error",
          message: "Student ID already exists in this school",
        });
      }
      logger.error("Create student error", error);
      next(error);
    }
  },

  async listStudents(req: Request, res: Response, next: NextFunction) {
    try {
      const { schoolId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as any;

      const result = await studentService.listStudentsBySchool(
        schoolId,
        page,
        limit,
        status
      );

      return res.status(200).json({
        status: "success",
        message: "Students retrieved successfully",
        data: result.data,
        pagination: result.pagination,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("List students error", error);
      next(error);
    }
  },

  async getStudent(req: Request, res: Response, next: NextFunction) {
    try {
      const { schoolId, studentId } = req.params;

      const student = await studentService.getStudentBySchoolAndId(
        schoolId,
        studentId
      );

      if (!student) {
        return res.status(404).json({
          status: "error",
          message: "Student not found",
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Student retrieved successfully",
        data: student,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("Get student error", error);
      next(error);
    }
  },

  async enrollStudent(req: Request, res: Response, next: NextFunction) {
    try {
      const { studentId } = req.params;
      const { courseId } = req.body;

      if (!courseId) {
        return res.status(400).json({
          status: "error",
          message: "courseId is required",
        });
      }

      const enrollment = await studentService.enrollStudentInCourse(
        studentId,
        courseId
      );

      return res.status(201).json({
        status: "success",
        message: "Student enrolled in course successfully",
        data: enrollment,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      if (error.code === "P2002") {
        return res.status(409).json({
          status: "error",
          message: "Student is already enrolled in this course",
        });
      }
      logger.error("Enroll student error", error);
      next(error);
    }
  },

  async getStudentEnrollments(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { studentId } = req.params;

      const enrollments = await studentService.getStudentEnrollments(studentId);

      return res.status(200).json({
        status: "success",
        message: "Student enrollments retrieved successfully",
        data: enrollments,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("Get enrollments error", error);
      next(error);
    }
  },
};
