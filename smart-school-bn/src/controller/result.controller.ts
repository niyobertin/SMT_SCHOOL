import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getTenantFilter } from '../middleware/tenant.middleware';
import prisma from '../services/prisma.singleton';

export const recordMarks = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { academicRecordId, subjectId, termId, marks, maxMarks, remarks } = req.body;
        const teacherId = (req.user as any)?.id;

        // Implementation Note: In a real flow, we would validate if these marks are within the GradingPolicy scale
        const result = await prisma.assessmentResult.upsert({
            where: {
                academicRecordId_subjectId_termId: {
                    academicRecordId,
                    subjectId,
                    termId
                }
            },
            update: {
                marks,
                maxMarks,
                remarks,
                teacherId
            },
            create: {
                id: uuidv4(),
                academicRecordId,
                subjectId,
                termId,
                marks,
                maxMarks,
                remarks,
                teacherId
            }
        });

        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const getResultsByClass = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { classId, termId, subjectId } = req.query;

        const results = await prisma.assessmentResult.findMany({
            where: {
                termId: termId as string,
                subjectId: subjectId as string,
                academicRecord: {
                    classId: classId as string
                }
            },
            include: {
                academicRecord: {
                    include: {
                        student: {
                            select: { firstName: true, lastName: true, email: true }
                        }
                    }
                }
            }
        });

        res.status(200).json({ success: true, data: results });
    } catch (error) {
        next(error);
    }
};
