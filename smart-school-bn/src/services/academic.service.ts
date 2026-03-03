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
                prisma.studentClassEnrollment.upsert({
                    where: {
                        studentId_academicYearId: {
                            studentId: data.studentId,
                            academicYearId: data.academicYearId
                        }
                    },
                    update: {
                        classId: data.classId,
                        status: "ACTIVE"
                    },
                    create: {
                        id: uuidv4(),
                        ...data,
                        status: "ACTIVE"
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

    // Attendance
    async recordAttendance(data: {
        schoolId: string;
        studentId: string;
        classId?: string;
        subjectId?: string;
        date: Date;
        status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
        remarks?: string;
        recordedBy: string;
    }) {
        try {
            const attendance = await prisma.attendance.upsert({
                where: {
                    // We need a unique constraint or just use create if we want history
                    // The schema doesn't have a unique constraint on [studentId, date, subjectId] yet
                    // Let's just use create for now to keep a history, or find and update
                    id: uuidv4(), // Placeholder or we could search for existing record for that day/subject
                },
                update: {
                    status: data.status,
                    remarks: data.remarks,
                    recordedBy: data.recordedBy,
                },
                create: {
                    id: uuidv4(),
                    ...data,
                }
            });
            return attendance;
        } catch (error) {
            logger.error("Failed to record attendance", error);
            throw error;
        }
    },

    // Better attendance recording: Bulk for a class/subject
    async bulkRecordAttendance(data: {
        schoolId: string;
        classId: string;
        subjectId?: string;
        date: Date;
        records: Array<{ studentId: string; status: any; remarks?: string }>;
        recordedBy: string;
    }) {
        const results = [];
        for (const record of data.records) {
            const res = await prisma.attendance.create({
                data: {
                    id: uuidv4(),
                    schoolId: data.schoolId,
                    classId: data.classId,
                    subjectId: data.subjectId,
                    date: data.date,
                    studentId: record.studentId,
                    status: record.status,
                    remarks: record.remarks,
                    recordedBy: data.recordedBy,
                }
            });
            results.push(res);
        }
        return results;
    },

    async getAttendance(filters: {
        schoolId: string;
        classId?: string;
        subjectId?: string;
        studentId?: string;
        startDate?: Date;
        endDate?: Date;
    }) {
        const where: any = { schoolId: filters.schoolId };
        if (filters.classId) where.classId = filters.classId;
        if (filters.subjectId) where.subjectId = filters.subjectId;
        if (filters.studentId) where.studentId = filters.studentId;
        if (filters.startDate || filters.endDate) {
            where.date = {};
            if (filters.startDate) where.date.gte = filters.startDate;
            if (filters.endDate) where.date.lte = filters.endDate;
        }

        return prisma.attendance.findMany({
            where,
            include: {
                student: { select: { firstName: true, lastName: true, studentId: true } },
                subject: { select: { name: true } },
                class: { select: { name: true } },
            },
            orderBy: { date: "desc" },
        });
    },
};
