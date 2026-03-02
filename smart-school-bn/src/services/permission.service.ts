import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export enum Action {
    ENTER_MARKS = "ENTER_MARKS",
    SUBMIT_MARKS = "SUBMIT_MARKS",
    APPROVE_MARKS = "APPROVE_MARKS",
    VIEW_RESULTS = "VIEW_RESULTS",
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

        switch (action) {
            case Action.ENTER_MARKS:
            case Action.SUBMIT_MARKS:
                if (isSchoolAdmin) return true; // Admins can also enter marks if needed
                return this.isTeacherAssigned(
                    userId,
                    resource.schoolId,
                    resource.classId,
                    resource.subjectId
                );

            case Action.APPROVE_MARKS:
                return isSchoolAdmin;

            case Action.VIEW_RESULTS:
                // If it's the student themselves, let them see it
                // (Assuming controller ensures they only see approved results, or we check it here: but result status is better checked in queries)
                if (user.role === "STUDENT") {
                    return true;
                }

                // Teachers and admins can view results
                if (isSchoolAdmin) return true;
                if (resource.schoolId && resource.classId && resource.subjectId) {
                    return this.isTeacherAssigned(
                        userId,
                        resource.schoolId,
                        resource.classId,
                        resource.subjectId
                    );
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
