import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getTenantFilter } from '../middleware/tenant.middleware';
import prisma from '../services/prisma.singleton';

// ============================================
// ACADEMIC YEAR MANAGEMENT
// ============================================

export const createAcademicYear = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, startDate, endDate } = req.body;
        const organizationId = req.organizationId!;

        const academicYear = await prisma.academicYear.create({
            data: {
                id: uuidv4(),
                name,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                organizationId
            }
        });
        res.status(201).json({ success: true, data: academicYear });
    } catch (error) {
        next(error);
    }
};

export const getAcademicYears = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const where = getTenantFilter(req);
        const years = await prisma.academicYear.findMany({
            where
        });
        res.status(200).json({ success: true, data: years });
    } catch (error) {
        next(error);
    }
};

// ============================================
// GRADE MANAGEMENT
// ============================================

export const createGrade = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, description } = req.body;
        const organizationId = req.organizationId!;
        const grade = await prisma.grade.create({
            data: {
                id: uuidv4(),
                name,
                description,
                organizationId
            }
        });
        res.status(201).json({ success: true, data: grade });
    } catch (error) {
        next(error);
    }
};

export const getGrades = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const where = getTenantFilter(req);
        const grades = await prisma.grade.findMany({
            where,
            include: { classRooms: true }
        });
        res.status(200).json({ success: true, data: grades });
    } catch (error) {
        next(error);
    }
};

// ============================================
// CLASSROOM MANAGEMENT
// ============================================

export const createClassRoom = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, gradeId } = req.body;
        const organizationId = req.organizationId!;
        const classRoom = await prisma.classRoom.create({
            data: {
                id: uuidv4(),
                name,
                gradeId,
                organizationId
            }
        });
        res.status(201).json({ success: true, data: classRoom });
    } catch (error) {
        next(error);
    }
};

// ============================================
// ACADEMIC RECORD MANAGEMENT (Placement)
// ============================================

export const bulkAssignToClass = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { classId, yearId, studentAssignments } = req.body; // Array of { studentId, studentCode }
        const organizationId = req.organizationId!;

        const records = await prisma.$transaction(
            studentAssignments.map((assign: any) =>
                prisma.academicRecord.upsert({
                    where: {
                        studentId_classId_yearId: {
                            studentId: assign.studentId,
                            classId,
                            yearId
                        }
                    },
                    update: {
                        studentCode: assign.studentCode
                    },
                    create: {
                        id: uuidv4(),
                        studentId: assign.studentId,
                        studentCode: assign.studentCode,
                        classId,
                        yearId
                    }
                })
            )
        );

        res.status(200).json({ success: true, data: records, message: 'Students assigned to class successfully' });
    } catch (error) {
        next(error);
    }
};

// ============================================
// SUBJECT MANAGEMENT
// ============================================

export const createSubject = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, code, description, gradeId } = req.body;
        const organizationId = req.organizationId!;

        const subject = await prisma.subject.create({
            data: {
                id: uuidv4(),
                name,
                code,
                description,
                gradeId,
                organizationId
            }
        });
        res.status(201).json({ success: true, data: subject });
    } catch (error) {
        next(error);
    }
};

export const getSubjects = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const where = getTenantFilter(req);
        const subjects = await prisma.subject.findMany({
            where,
            include: { grade: true }
        });
        res.status(200).json({ success: true, data: subjects });
    } catch (error) {
        next(error);
    }
};

export const updateSubject = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { name, code, description, gradeId, isActive } = req.body;
        const organizationId = req.organizationId!;

        const subject = await prisma.subject.update({
            where: { id, organizationId },
            data: { name, code, description, gradeId, isActive }
        });
        res.status(200).json({ success: true, data: subject });
    } catch (error) {
        next(error);
    }
};

export const deleteSubject = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const organizationId = req.organizationId!;

        await prisma.subject.delete({
            where: { id, organizationId }
        });
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

// ============================================
// TEACHER ASSIGNMENT MANAGEMENT
// ============================================

export const assignTeacher = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { teacherId, classId, subjectId, yearId } = req.body;
        const organizationId = req.organizationId!;

        const assignment = await prisma.teacherAssignment.create({
            data: {
                id: uuidv4(),
                teacherId,
                classId,
                subjectId,
                yearId,
                organizationId
            }
        });
        res.status(201).json({ success: true, data: assignment });
    } catch (error) {
        next(error);
    }
};

export const getTeacherAssignments = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const where = getTenantFilter(req);

        const assignments = await prisma.teacherAssignment.findMany({
            where,
            include: {
                teacher: { select: { firstName: true, lastName: true, email: true } },
                class: true,
                subject: true,
                academicYear: true
            }
        });
        res.status(200).json({ success: true, data: assignments });
    } catch (error) {
        next(error);
    }
};

export const removeTeacherAssignment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const organizationId = req.organizationId!;

        await prisma.teacherAssignment.delete({
            where: { id, organizationId }
        });
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

// ============================================
// TERM MANAGEMENT
// ============================================

export const createTerm = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, startDate, endDate, yearId } = req.body;
        const organizationId = req.organizationId!;

        const term = await prisma.term.create({
            data: {
                id: uuidv4(),
                name,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                yearId
            }
        });
        res.status(201).json({ success: true, data: term });
    } catch (error) {
        next(error);
    }
};

export const getTerms = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { yearId } = req.params;
        const terms = await prisma.term.findMany({
            where: { yearId }
        });
        res.status(200).json({ success: true, data: terms });
    } catch (error) {
        next(error);
    }
};
