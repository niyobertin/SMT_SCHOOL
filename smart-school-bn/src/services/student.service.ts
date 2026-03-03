import { PrismaClient, StudentStatus } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import { logger } from "../utils/logger";

const prisma = new PrismaClient();

export const studentService = {
  async createStudent(data: {
    schoolId: string;
    studentId?: string;
    firstName: string;
    lastName?: string;
    password?: string;
    credentialHash?: string;
    email?: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    gender?: string;
    classId?: string;
    academicYearId?: string;
  }) {
    try {
      // Check for existing student ID in school if provided
      if (data.studentId) {
        const existing = await prisma.student.findUnique({
          where: {
            schoolId_studentId: {
              schoolId: data.schoolId,
              studentId: data.studentId
            },
          },
        });

        if (existing) {
          throw new Error(`Student with ID ${data.studentId} already exists in this school.`);
        }
      }

      // Strip out non-Prisma fields (e.g. className, academicYearName from Excel mapping)
      const {
        password,
        credentialHash: providedHash,
        studentId: providedId,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        className: _className,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        academicYearName: _academicYearName,
        ...rest
      } = data as any;

      let finalHash = providedHash;
      if (password) {
        finalHash = await bcrypt.hash(String(password), 10);
      } else if (!finalHash) {
        // Default password to studentId if nothing provided
        finalHash = await bcrypt.hash(String(providedId || data.firstName), 10);
      }

      // Auto-generate a studentId if not supplied
      let studentId = providedId;
      if (!studentId) {
        const count = await prisma.student.count({ where: { schoolId: data.schoolId } });
        const year = new Date().getFullYear();
        studentId = `STU-${year}-${String(count + 1).padStart(4, "0")}`;
      }

      const student = await prisma.student.create({
        data: {
          id: uuidv4(),
          ...rest,
          studentId: studentId!,
          lastName: data.lastName || "",
          credentialHash: finalHash!,
        },
        include: { school: true, class: true, academicYear: true },
      });
      logger.info("Student created", {
        schoolId: data.schoolId,
        studentId: student.studentId,
      });
      return student;
    } catch (error) {
      logger.error("Failed to create student", error);
      throw error;
    }
  },

  async getStudentBySchoolAndId(schoolId: string, studentId: string) {
    return prisma.student.findUnique({
      where: {
        schoolId_studentId: { schoolId, studentId },
      },
      include: {
        school: true,
        class: true,
        academicYear: true,
        enrollments: { include: { course: true } },
      },
    });
  },

  async getStudentById(id: string) {
    return prisma.student.findUnique({
      where: { id },
      include: {
        school: true,
        class: true,
        academicYear: true,
        enrollments: { include: { course: true } },
      },
    });
  },

  async listStudentsBySchool(
    schoolId: string,
    page = 1,
    limit = 10,
    status?: StudentStatus
  ) {
    const where: any = { schoolId };
    if (status) where.status = status;

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { class: true, academicYear: true },
      }),
      prisma.student.count({ where }),
    ]);

    return {
      data: students,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  },

  async verifyStudentCredential(studentId: string, password: string) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!student) return null;

    const isValid = await bcrypt.compare(password, student.credentialHash);
    return isValid ? student : null;
  },

  async updateStudentStatus(
    studentId: string,
    status: StudentStatus
  ) {
    return prisma.student.update({
      where: { id: studentId },
      data: { status },
    });
  },

  async bulkImportStudents(
    schoolId: string,
    students: Array<{
      studentId?: string;
      firstName: string;
      lastName?: string;
      password?: string;
      credentialHash?: string;
      email?: string;
      phoneNumber?: string;
      gender?: string;
      dateOfBirth?: string;
      classId?: string;
      academicYearId?: string;
    }>
  ) {
    const created = [];
    const errors = [];

    for (const studentData of students) {
      try {
        // Sanitize all string fields — Excel may parse numbers as JS numbers
        const sanitized = {
          ...studentData,
          firstName: String(studentData.firstName || "").trim(),
          lastName: studentData.lastName ? String(studentData.lastName).trim() : undefined,
          studentId: studentData.studentId ? String(studentData.studentId).trim() : undefined,
          email: studentData.email ? String(studentData.email).trim() : undefined,
          phoneNumber: studentData.phoneNumber ? String(studentData.phoneNumber).trim() : undefined,
          password: studentData.password ? String(studentData.password).trim() : undefined,
          gender: studentData.gender ? String(studentData.gender).trim().toUpperCase() : undefined,
        };

        const s = await this.createStudent({
          schoolId,
          ...sanitized,
        });
        created.push(s);
      } catch (error: any) {
        errors.push({ firstName: studentData.firstName, error: error.message || error });
      }
    }

    return { created, errors };
  },

  async enrollStudentInCourse(
    studentId: string,
    courseId: string
  ) {
    try {
      const enrollment = await prisma.studentEnrollment.create({
        data: {
          id: uuidv4(),
          studentId,
          courseId,
        },
        include: { student: true, course: true },
      });
      logger.info("Student enrolled in course", {
        studentId,
        courseId,
      });
      return enrollment;
    } catch (error) {
      logger.error("Failed to enroll student", error);
      throw error;
    }
  },

  async getStudentEnrollments(studentId: string) {
    return prisma.studentEnrollment.findMany({
      where: { studentId },
      include: {
        course: { include: { lessons: true } },
      },
      orderBy: { enrollmentDate: "desc" },
    });
  },

  async trackLessonProgress(
    studentId: string,
    lessonId: string,
    data: {
      isCompleted?: boolean;
      timeSpent?: number;
      bookmarkTime?: number;
    }
  ) {
    const progress = await prisma.studentProgress.upsert({
      where: {
        studentId_lessonId: { studentId, lessonId },
      },
      update: {
        ...data,
        lastAccessed: new Date(),
      },
      create: {
        id: uuidv4(),
        studentId,
        lessonId,
        ...data,
      },
    });
    return progress;
  },

  async getStudentProgress(studentId: string, courseId?: string) {
    let where: any = { studentId };

    if (courseId) {
      where = {
        ...where,
        lesson: {
          course: { id: courseId },
        },
      };
    }

    return prisma.studentProgress.findMany({
      where,
      include: { lesson: { include: { course: true } } },
      orderBy: { lastAccessed: "desc" },
    });
  },
};
