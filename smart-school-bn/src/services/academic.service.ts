import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../utils/logger";

const prisma = new PrismaClient();

export const academicService = {
    // Academic Years
    async createAcademicYear(data: {
        schoolId: string;
        year: string;
        startDate?: Date;
        endDate?: Date;
        isActive?: boolean;
    }) {
        if (!data.schoolId || data.schoolId === "undefined") {
            const error = new Error("Invalid schoolId provided");
            logger.error("Failed to create academic year: schoolId is missing or undefined");
            throw error;
        }
        try {
            const academicYear = await prisma.academicYear.create({
                data: {
                    id: uuidv4(),
                    year: data.year,
                    startDate: data.startDate,
                    endDate: data.endDate,
                    isActive: data.isActive !== undefined ? data.isActive : true,
                    school: {
                        connect: { id: data.schoolId }
                    }
                },
            });
            logger.info("Academic year created", { id: academicYear.id, year: academicYear.year });
            return academicYear;
        } catch (error) {
            logger.error("Failed to create academic year", error);
            throw error;
        }
    },

    async listAcademicYears(schoolId: string) {
        return prisma.academicYear.findMany({
            where: { schoolId },
            orderBy: { startDate: "desc" },
        });
    },

    // School Classes
    async createClass(data: {
        schoolId: string;
        name: string;
        level?: string;
        stream?: string;
        academicYearId?: string;
    }) {
        if (!data.schoolId || data.schoolId === "undefined") {
            const error = new Error("Invalid schoolId provided");
            logger.error("Failed to create school class: schoolId is missing or undefined");
            throw error;
        }
        try {
            const schoolClass = await prisma.schoolClass.create({
                data: {
                    id: uuidv4(),
                    name: data.name,
                    level: data.level,
                    stream: data.stream,
                    academicYear: data.academicYearId ? {
                        connect: { id: data.academicYearId }
                    } : undefined,
                    school: {
                        connect: { id: data.schoolId }
                    }
                },
            });
            logger.info("School class created", { id: schoolClass.id, name: schoolClass.name });
            return schoolClass;
        } catch (error) {
            logger.error("Failed to create school class", error);
            throw error;
        }
    },

    async listClasses(schoolId: string, academicYearId?: string) {
        const where: any = { schoolId };
        if (academicYearId) where.academicYearId = academicYearId;

        return prisma.schoolClass.findMany({
            where,
            include: {
                academicYear: true,
                _count: { select: { students: true } },
            },
            orderBy: { name: "asc" },
        });
    },

    // Subjects
    async createSubject(data: {
        schoolId: string;
        name: string;
        code?: string;
    }) {
        if (!data.schoolId || data.schoolId === "undefined") {
            const error = new Error("Invalid schoolId provided");
            logger.error("Failed to create subject: schoolId is missing or undefined");
            throw error;
        }
        try {
            const subject = await prisma.subject.create({
                data: {
                    id: uuidv4(),
                    name: data.name,
                    code: data.code,
                    school: {
                        connect: { id: data.schoolId }
                    }
                },
            });
            logger.info("Subject created", { id: subject.id, name: subject.name });
            return subject;
        } catch (error) {
            logger.error("Failed to create subject", error);
            throw error;
        }
    },

    async listSubjects(schoolId: string) {
        return prisma.subject.findMany({
            where: { schoolId },
            orderBy: { name: "asc" },
        });
    },

    // Student Enrollment
    async enrollStudentInClass(data: {
        studentId: string;
        classId: string;
        academicYearId: string;
    }) {
        try {
            // Use a transaction to update both the history and the current class on student record
            const result = await prisma.$transaction([
                prisma.studentClassEnrollment.create({
                    data: {
                        id: uuidv4(),
                        ...data,
                    },
                }),
                prisma.student.update({
                    where: { id: data.studentId },
                    data: {
                        classId: data.classId,
                        academicYearId: data.academicYearId,
                    },
                }),
            ]);

            logger.info("Student enrolled in class", {
                studentId: data.studentId,
                classId: data.classId
            });

            return result[0];
        } catch (error) {
            logger.error("Failed to enroll student in class", error);
            throw error;
        }
    },

    async getStudentEnrollmentHistory(studentId: string) {
        return prisma.studentClassEnrollment.findMany({
            where: { studentId },
            include: {
                class: true,
                academicYear: true,
            },
            orderBy: { enrolledAt: "desc" },
        });
    },

    async getStudentsByClass(schoolId: string, classId: string) {
        // Find students assigned to this class
        return prisma.student.findMany({
            where: {
                schoolId: schoolId,
                classId: classId,
                status: "ACTIVE",
            }
        });
    },
};
