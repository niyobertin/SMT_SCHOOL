import { Request, Response, NextFunction } from "express";
import { academicService } from "../services/academic.service";
import { logger } from "../utils/logger";

export const academicController = {
    // Academic Years
    async createAcademicYear(req: Request, res: Response, next: NextFunction) {
        try {
            const { schoolId } = req.params;
            const { year, startDate, endDate, isActive } = req.body;

            if (!year) {
                return res.status(400).json({
                    status: "error",
                    message: "Academic year name is required",
                });
            }

            const academicYear = await academicService.createAcademicYear({
                schoolId,
                year,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                isActive,
            });

            return res.status(201).json({
                status: "success",
                message: "Academic year created successfully",
                data: academicYear,
            });
        } catch (error) {
            next(error);
        }
    },

    async listAcademicYears(req: Request, res: Response, next: NextFunction) {
        try {
            const { schoolId } = req.params;
            const years = await academicService.listAcademicYears(schoolId);

            return res.status(200).json({
                status: "success",
                data: years,
            });
        } catch (error) {
            next(error);
        }
    },

    // Classes
    async createClass(req: Request, res: Response, next: NextFunction) {
        try {
            const { schoolId } = req.params;
            const { name, level, stream, academicYearId } = req.body;

            if (!name) {
                return res.status(400).json({
                    status: "error",
                    message: "Class name is required",
                });
            }

            const schoolClass = await academicService.createClass({
                schoolId,
                name,
                level,
                stream,
                academicYearId,
            });

            return res.status(201).json({
                status: "success",
                message: "Class created successfully",
                data: schoolClass,
            });
        } catch (error) {
            next(error);
        }
    },

    async listClasses(req: Request, res: Response, next: NextFunction) {
        try {
            const { schoolId } = req.params;
            const { academicYearId } = req.query;

            const classes = await academicService.listClasses(
                schoolId,
                academicYearId as string
            );

            return res.status(200).json({
                status: "success",
                data: classes,
            });
        } catch (error) {
            next(error);
        }
    },

    // Subjects
    async createSubject(req: Request, res: Response, next: NextFunction) {
        try {
            const { schoolId } = req.params;
            const { name, code } = req.body;

            if (!name) {
                return res.status(400).json({
                    status: "error",
                    message: "Subject name is required",
                });
            }

            const subject = await academicService.createSubject({
                schoolId,
                name,
                code,
            });

            return res.status(201).json({
                status: "success",
                message: "Subject created successfully",
                data: subject,
            });
        } catch (error) {
            next(error);
        }
    },

    async listSubjects(req: Request, res: Response, next: NextFunction) {
        try {
            const { schoolId } = req.params;
            const subjects = await academicService.listSubjects(schoolId);

            return res.status(200).json({
                status: "success",
                data: subjects,
            });
        } catch (error) {
            next(error);
        }
    },

    // Student Enrollment
    async enrollStudent(req: Request, res: Response, next: NextFunction) {
        try {
            const { schoolId, studentId } = req.params;
            const { classId, academicYearId } = req.body;

            if (!classId || !academicYearId) {
                return res.status(400).json({
                    status: "error",
                    message: "classId and academicYearId are required",
                });
            }

            const enrollment = await academicService.enrollStudentInClass({
                studentId,
                classId,
                academicYearId,
            });

            return res.status(201).json({
                status: "success",
                message: "Student enrolled in class successfully",
                data: enrollment,
            });
        } catch (error) {
            next(error);
        }
    },

    async getStudentEnrollmentHistory(req: Request, res: Response, next: NextFunction) {
        try {
            const { studentId } = req.params;
            const history = await academicService.getStudentEnrollmentHistory(studentId);

            return res.status(200).json({
                status: "success",
                data: history,
            });
        } catch (error) {
            next(error);
        }
    },

    async getStudentsByClass(req: Request, res: Response, next: NextFunction) {
        try {
            const { schoolId, classId } = req.params;
            const students = await academicService.getStudentsByClass(schoolId, classId);

            return res.status(200).json({
                status: "success",
                data: students,
            });
        } catch (error) {
            next(error);
        }
    },

    // Attendance
    async recordAttendance(req: Request, res: Response, next: NextFunction) {
        try {
            const { schoolId } = req.params;
            const { studentId, classId, subjectId, date, status, remarks } = req.body;
            // @ts-ignore
            const userId = req.user.id;

            const attendance = await academicService.recordAttendance({
                schoolId,
                studentId,
                classId,
                subjectId,
                date: new Date(date),
                status,
                remarks,
                recordedBy: userId,
            });

            return res.status(201).json({
                status: "success",
                message: "Attendance recorded successfully",
                data: attendance,
            });
        } catch (error) {
            next(error);
        }
    },

    async bulkRecordAttendance(req: Request, res: Response, next: NextFunction) {
        try {
            const { schoolId } = req.params;
            const { classId, subjectId, date, records } = req.body;
            // @ts-ignore
            const userId = req.user.id;

            const results = await academicService.bulkRecordAttendance({
                schoolId,
                classId,
                subjectId,
                date: new Date(date),
                records,
                recordedBy: userId,
            });

            return res.status(201).json({
                status: "success",
                message: `${results.length} attendance records created`,
                data: results,
            });
        } catch (error) {
            next(error);
        }
    },

    async getAttendance(req: Request, res: Response, next: NextFunction) {
        try {
            const { schoolId } = req.params;
            const { classId, subjectId, studentId, startDate, endDate } = req.query;

            const attendance = await academicService.getAttendance({
                schoolId,
                classId: classId as string,
                subjectId: subjectId as string,
                studentId: studentId as string,
                startDate: startDate ? new Date(startDate as string) : undefined,
                endDate: endDate ? new Date(endDate as string) : undefined,
            });

            return res.status(200).json({
                status: "success",
                data: attendance,
            });
        } catch (error) {
            next(error);
        }
    },

    async bulkImportStudents(req: Request, res: Response, next: NextFunction) {
        try {
            const { schoolId } = req.params;
            const { students } = req.body;

            if (!students || !Array.isArray(students)) {
                return res.status(400).json({
                    status: "error",
                    message: "students array is required",
                });
            }

            // We use studentService for this as it already has the logic
            const { studentService } = require("../services/student.service");
            const result = await studentService.bulkImportStudents(schoolId, students);

            return res.status(201).json({
                status: "success",
                message: "Bulk import completed",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    },
};
