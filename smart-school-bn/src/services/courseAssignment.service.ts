import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../utils/logger";

const prisma = new PrismaClient();

export const courseAssignmentService = {
    async assignCourse(data: {
        schoolId: string;
        courseId: string;
        classId?: string;
        studentId?: string;
        subjectId?: string;
    }) {
        try {
            const assignment = await prisma.courseAssignment.create({
                data: {
                    id: uuidv4(),
                    ...data,
                },
            });
            logger.info("Course assigned", {
                schoolId: data.schoolId,
                courseId: data.courseId,
                target: data.classId || data.studentId || data.subjectId
            });
            return assignment;
        } catch (error) {
            logger.error("Failed to assign course", error);
            throw error;
        }
    },

    async removeAssignment(assignmentId: string) {
        return prisma.courseAssignment.delete({
            where: { id: assignmentId },
        });
    },

    async listSchoolAssignments(schoolId: string) {
        return prisma.courseAssignment.findMany({
            where: { schoolId },
            include: {
                course: { select: { title: true, slug: true } },
                class: { select: { name: true } },
                student: { select: { firstName: true, lastName: true, studentId: true } },
                subject: { select: { name: true } },
            },
            orderBy: { createdAt: "desc" },
        });
    },

    async getStudentAssignedCourses(studentId: string, schoolId: string, classId?: string) {
        // A student sees courses assigned to:
        // 1. Them specifically (studentId)
        // 2. Their class (classId)
        // 3. (Optional) Subjects they are enrolled in - but let's stick to student/class for now

        const assignments = await prisma.courseAssignment.findMany({
            where: {
                schoolId,
                OR: [
                    { studentId },
                    { classId: classId || undefined },
                ],
            },
            include: {
                course: {
                    include: {
                        instructor: { select: { firstName: true, lastName: true } },
                        category: true,
                    }
                }
            }
        });

        // Extract unique courses from assignments
        const courses = assignments.map(a => a.course);
        const uniqueCourses = Array.from(new Map(courses.map(c => [c.id, c])).values());

        return uniqueCourses;
    }
};
