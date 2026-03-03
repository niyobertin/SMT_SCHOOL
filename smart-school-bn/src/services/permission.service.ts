import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export enum Action {
    ENTER_MARKS = "ENTER_MARKS",
    SUBMIT_MARKS = "SUBMIT_MARKS",
    APPROVE_MARKS = "APPROVE_MARKS",
    VIEW_RESULTS = "VIEW_RESULTS",
    VIEW_ASSIGNED_COURSES = "VIEW_ASSIGNED_COURSES",
    TAKE_TEST = "TAKE_TEST",
    UPLOAD_RESOURCES = "UPLOAD_RESOURCES",
    MANAGE_ATTENDANCE = "MANAGE_ATTENDANCE",
}

export class PermissionService {
    /**
     * Centralized RBAC check
     * @param userId The ID of the authenticated user
     * @param action The intended action
     * @param resource Additional context required (e.g. schoolId, classId, subjectId)
     * @returns Boolean indicating if the user has permission
     */
    static async can(userId: string, action: Action, resource: any): Promise<boolean> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                schoolStaff: true,
            },
        });

        if (!user) return false;

        // Global super admin bypass
        if (user.role === "SUPER_ADMIN" || user.role === "ADMIN") return true;

        const isSchoolAdmin = user.schoolStaff?.some(s => s.roleInSchool === "SCHOOL_ADMIN");
        const isSchoolTeacher = user.schoolStaff?.some(s => s.roleInSchool === "TEACHER");
        const isUnifiedTeacher = isSchoolTeacher || user.role === "INSTRUCTOR" || user.role === "EXAMINER";

        switch (action) {
            case Action.ENTER_MARKS:
            case Action.SUBMIT_MARKS:
            case Action.UPLOAD_RESOURCES:
            case Action.MANAGE_ATTENDANCE:
                if (isSchoolAdmin) return true;
                if (!isUnifiedTeacher) return false;

                // If schoolId is provided, check if they belong to that school
                if (resource.schoolId && !user.schoolStaff?.some(s => s.schoolId === resource.schoolId)) {
                    return false;
                }

                // Granular check for subject/class assignment
                return this.isTeacherAssigned(
                    userId,
                    resource.schoolId,
                    resource.classId,
                    resource.subjectId
                );

            case Action.APPROVE_MARKS:
                return isSchoolAdmin;

            case Action.VIEW_RESULTS:
            case Action.VIEW_ASSIGNED_COURSES:
            case Action.TAKE_TEST:
                // If it's the student themselves, let them see it
                if (user.role === "STUDENT") {
                    return true;
                }

                // Teachers and admins can view results
                if (isSchoolAdmin) return true;
                if (isUnifiedTeacher) {
                    if (resource.schoolId && resource.classId && resource.subjectId) {
                        return this.isTeacherAssigned(
                            userId,
                            resource.schoolId,
                            resource.classId,
                            resource.subjectId
                        );
                    }
                    return true; // General view if no specific resource
                }

                return false;

            default:
                return false;
        }
    }

    private static async isTeacherAssigned(
        userId: string,
        schoolId: string,
        classId: string,
        subjectId: string
    ): Promise<boolean> {
        if (!schoolId || !classId || !subjectId) return false;

        const assignment = await prisma.teacherSubjectAssignment.findFirst({
            where: {
                schoolId,
                classId,
                subjectId,
                teacherStaff: {
                    userId: userId,
                },
            },
        });
        return !!assignment;
    }
}
