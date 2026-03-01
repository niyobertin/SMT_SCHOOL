import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { getTenantFilter } from "../middleware/tenant.middleware";
import prisma from "../services/prisma.singleton";
import YouTubeUploader from "../helper/youtubeUploader";
import { uploadBufferToCloudinary } from "../config/cloudinary";
import { logger } from "../utils/logger";

// Ensure tmp directory exists
const tmpDir = path.join(process.cwd(), "tmp");
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

// Helper to check enrollment validity
const checkEnrollmentValidity = async (userId: string, lessonId: string) => {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { courseId: true }
  });

  if (!lesson) return false;

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: userId,
        courseId: lesson.courseId
      }
    }
  });

  if (!enrollment) return false;
  if (enrollment.status !== 'ACTIVE') return false;

  const enrollmentDate = new Date(enrollment.enrollmentDate);
  const expirationDate = new Date(enrollmentDate);
  expirationDate.setDate(expirationDate.getDate() + enrollment.enrollementPeriod);

  return new Date() < expirationDate;
};

export const createLessonContent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { lessonId } = req.params;
    const { title, textBody, order, fileName } = req.body;
    const organizationId = req.organizationId!;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        course: { organizationId }
      }
    });
    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: { message: "Lesson not found or access denied" }
      });
    }

    const uploader = new YouTubeUploader();

    let videoUrl: string | null = null;
    let audioUrl: string | null = null;
    let pdfUrl: string | null = null;
    let imageUrl: string | null = null;

    const videoFile = files?.["fileVideo"]?.[0];
    if (videoFile) {
      const tempPath = path.join(tmpDir, `${Date.now()}-${videoFile.originalname}`);
      fs.writeFileSync(tempPath, videoFile.buffer);
      logger.info(`Uploading video ${videoFile.originalname} to YouTube...`);
      videoUrl = await uploader.uploadVideo({
        title: videoFile.originalname,
        description: textBody || "",
        filePath: tempPath,
      });
      fs.unlinkSync(tempPath);
    }

    const audioFile = files?.["fileAudio"]?.[0];
    if (audioFile) {
      audioUrl = await uploadBufferToCloudinary(audioFile.buffer, audioFile.mimetype, audioFile.originalname);
    }
    const pdfFile = files?.["filePDF"]?.[0];
    if (pdfFile) {
      pdfUrl = await uploadBufferToCloudinary(pdfFile.buffer, pdfFile.mimetype, pdfFile.originalname);
    }

    const imageFile = files?.["fileImage"]?.[0];
    if (imageFile) {
      imageUrl = await uploadBufferToCloudinary(imageFile.buffer, imageFile.mimetype);
    }
    const lessonContent = await prisma.lessonContent.create({
      data: {
        id: uuidv4(),
        title,
        textBody,
        videoUrl,
        audioUrl,
        pdfUrl,
        imageUrl,
        fileName: fileName || null,
        order: order ? Number(order) : 0,
        lesson: { connect: { id: lessonId } },
      },
    });

    res.status(201).json({ success: true, data: lessonContent });
  } catch (error) {
    logger.error("Error creating lesson content:", error);
    next(error);
  }
};

export const getLessonContent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { lessonId } = req.params;
    const organizationId = req.organizationId!;
    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        course: { organizationId }
      }
    });
    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: { message: "Lesson not found or access denied" }
      });
    }

    // Check enrollment validity
    const userId = (req.user as any)?.id;
    if (userId) {
      const isValid = await checkEnrollmentValidity(userId, lessonId);
      const user = await prisma.user.findUnique({ where: { id: userId } });

      if (user?.role === 'STUDENT' && !isValid) {
        return res.status(403).json({
          success: false,
          error: { message: "Access denied. Active enrollment required." }
        });
      }
    } else {
      // Unauthenticated access? authenticate middleware should handle this.
      // If public route, this logic might block public content. 
      // Assuming secure route.
    }
    // const page = req.query.page ? Number(req.query.page) : 1;
    // const limit = req.query.limit ? Number(req.query.limit) : 10;
    const query = req.query.q as string || "";
    // const skip = (page - 1) * limit;
    const lessonContent = await prisma.lessonContent.findMany({
      where: { lesson: { id: lessonId }, title: { contains: query, mode: "insensitive" } },
      include: {
        lesson: {
          select: {
            course: {
              select: {
                requirements: true,
                objectives: true,
              },
            },
          },
        },
      },
      // skip, take: limit,
      orderBy: { createdAt: "asc" }
    });
    const total = await prisma.lessonContent.count({ where: { lesson: { id: lessonId }, title: { contains: query, mode: "insensitive" } } });
    res.status(200).json({
      success: true,
      data: {
        lessonContent,
        pagination: {
          total,
        },
      },
    });
  } catch (error) {
    logger.error("Error getting lesson content:", error);
    next(error);
  }
};

export const getLessonContentById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { lessonContentId } = req.params;
    const lessonContent = await prisma.lessonContent.findFirst({
      where: { id: lessonContentId },
      orderBy: { createdAt: "asc" }
    });
    if (!lessonContent) {
      return res.status(404).json({
        success: false,
        error: { message: "Lesson content not found" }
      });
    }
    res.status(200).json({ success: true, data: lessonContent });
  } catch (error) {
    logger.error("Error getting lesson content by id:", error);
    next(error);
  }
};

export const updateLessonContent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { lessonContentId } = req.params;
    const { title, textBody, order, fileName } = req.body;
    const organizationId = req.organizationId!;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const existingContent = await prisma.lessonContent.findFirst({
      where: {
        id: lessonContentId,
        lesson: { course: { organizationId } }
      }
    });
    if (!existingContent) {
      return res.status(404).json({
        success: false,
        error: { message: "Lesson content not found or access denied" }
      });
    }
    let updateData: any = { title, textBody, order: order ? Number(order) : 0, fileName };
    const uploader = new YouTubeUploader();
    const videoFile = files?.["fileVideo"]?.[0];
    if (videoFile) {
      const tempPath = path.join(tmpDir, `${Date.now()}-${videoFile.originalname}`);
      fs.writeFileSync(tempPath, videoFile.buffer);
      updateData.videoUrl = await uploader.uploadVideo({
        title: videoFile.originalname,
        description: textBody || "",
        filePath: tempPath,
      });
      fs.unlinkSync(tempPath);
    }
    const fileHandlers = {
      fileAudio: 'audioUrl',
      filePDF: 'pdfUrl',
      fileImage: 'imageUrl'
    };

    for (const [field, urlField] of Object.entries(fileHandlers)) {
      const file = files?.[field]?.[0];
      if (file) {
        updateData[urlField] = await uploadBufferToCloudinary(file.buffer, file.mimetype, file.originalname);
      }
    }
    const updatedLessonContent = await prisma.lessonContent.update({
      where: { id: lessonContentId },
      data: updateData,
    });

    res.status(200).json({
      success: true,
      data: updatedLessonContent
    });
  } catch (error) {
    logger.error("Error updating lesson content:", error);
    next(error);
  }
};

export const deleteLessonContent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { lessonContentId } = req.params;
    const organizationId = req.organizationId!;
    const lessonContent = await prisma.lessonContent.findFirst({
      where: {
        id: lessonContentId,
        lesson: { course: { organizationId } }
      }
    });
    if (!lessonContent) {
      return res.status(404).json({
        success: false,
        error: { message: "Lesson content not found or access denied" }
      });
    }
    const deletedLessonContent = await prisma.lessonContent.delete({ where: { id: lessonContentId } });
    res.status(200).json({
      success: true,
      data: deletedLessonContent
    });
  } catch (error) {
    logger.error("Error deleting lesson content:", error);
    next(error);
  }
};
