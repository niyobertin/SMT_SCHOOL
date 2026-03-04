import { Request, Response, NextFunction } from "express";
import { courseAssignmentService } from "../services/courseAssignment.service";
import { logger } from "../utils/logger";

export const courseAssignmentController = {
    async assignCourse(req: Request, res: Response, next: NextFunction) {
        try {
            const { schoolId } = req.params;
            const { courseId, classId, studentId, subjectId } = req.body;

            if (!courseId || (!classId && !studentId && !subjectId)) {
                return res.status(400).json({
                    status: "error",
                    message: "courseId and at least one assignment target (classId, studentId, or subjectId) are required",
                });
            }

            const assignment = await courseAssignmentService.assignCourse({
                schoolId,
                courseId,
                classId,
                studentId,
                subjectId,
            });

            return res.status(201).json({
                status: "success",
                message: "Course assigned successfully",
                data: assignment,
            });
        } catch (error: any) {
            if (error.code === "P2002") {
                return res.status(409).json({
                    status: "error",
                    message: "This assignment already exists",
                });
            }
            next(error);
        }
    },

    async removeAssignment(req: Request, res: Response, next: NextFunction) {
        try {
            const { assignmentId } = req.params;
            await courseAssignmentService.removeAssignment(assignmentId);

            return res.status(200).json({
                status: "success",
                message: "Assignment removed successfully",
            });
        } catch (error) {
            next(error);
        }
    },

    async listSchoolAssignments(req: Request, res: Response, next: NextFunction) {
        try {
            const { schoolId } = req.params;
            const assignments = await courseAssignmentService.listSchoolAssignments(schoolId);

            return res.status(200).json({
                status: "success",
                data: assignments,
            });
        } catch (error) {
            next(error);
        }
    },
};
