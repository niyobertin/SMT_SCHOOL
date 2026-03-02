import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { logger } from "../utils/logger";
import { studentService } from "./student.service";
import { schoolService } from "./school.service";

const prisma = new PrismaClient();

interface StudentJWTPayload {
  actorType: "STUDENT";
  studentId: string;
  schoolId: string;
  firstName: string;
  lastName: string;
}

export const studentAuthService = {
  async login(schoolCode: string, studentId: string) {
    try {
      const school = await schoolService.getSchoolByCode(schoolCode);
      if (!school) {
        logger.warn("School not found", { schoolCode });
        return { error: "Invalid school code" };
      }

      if (!school.isActive) {
        logger.warn("School is inactive", { schoolId: school.id });
        return { error: "School is inactive" };
      }

      const student = await studentService.getStudentBySchoolAndId(
        school.id,
        studentId
      );
      if (!student) {
        logger.warn("Student not found", {
          schoolId: school.id,
          studentId,
        });
        return { error: "Invalid student ID" };
      }

      if (student.status !== "ACTIVE") {
        logger.warn("Student is not active", { studentId: student.id });
        return { error: "Student account is not active" };
      }

      const token = studentAuthService.generateStudentToken({
        actorType: "STUDENT",
        studentId: student.id,
        schoolId: school.id,
        firstName: student.firstName,
        lastName: student.lastName,
      });

      await prisma.student.update({
        where: { id: student.id },
        data: { updatedAt: new Date() },
      });

      logger.info("Student logged in", {
        studentId: student.id,
        schoolId: school.id,
      });

      return {
        token,
        student: {
          id: student.id,
          studentId: student.studentId,
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email,
          schoolId: school.id,
          schoolName: school.name,
        },
        expiresIn: "24h",
      };
    } catch (error) {
      logger.error("Student login error", error);
      throw error;
    }
  },

  generateStudentToken(payload: StudentJWTPayload) {
    return jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: "24h",
    });
  },

  verifyStudentToken(token: string): StudentJWTPayload | null {
    try {
      return jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as StudentJWTPayload;
    } catch (error) {
      return null;
    }
  },

  async verifyPassword(password: string, hash: string) {
    const bcrypt = require("bcryptjs");
    return bcrypt.compare(password, hash);
  },

  async getStudentProfile(studentId: string) {
    const student = await studentService.getStudentById(studentId);
    if (!student) return null;

    const enrollments = await studentService.getStudentEnrollments(studentId);
    const progress = await studentService.getStudentProgress(studentId);

    return {
      id: student.id,
      studentId: student.studentId,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      phoneNumber: student.phoneNumber,
      status: student.status,
      school: {
        id: student.school.id,
        name: student.school.name,
        code: student.school.code,
      },
      class: student.class,
      academicYear: student.academicYear,
      enrollments,
      progressCount: progress.length,
      createdAt: student.createdAt,
    };
  },
};
