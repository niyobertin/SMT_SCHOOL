import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import YouTubeUploader from "../helper/youtubeUploader";
import { uploadBufferToCloudinary } from "../config/cloudinary";

const prisma = new PrismaClient();

// Ensure tmp directory exists
const tmpDir = path.join(process.cwd(), "tmp");
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

export const createLessonContent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { lessonId } = req.params;
    const { title, textBody, order, fileName } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) {
      return res.status(404).json({ status: "error", message: "Lesson not found" });
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

    res.status(201).json(lessonContent);
  } catch (error) {
    logger.error("Error creating lesson content:", error);
    next(error);
  }
};

export const getLessonContent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { lessonId } = req.params;
    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) {
      return res.status(404).json({ status: "error", message: "Lesson not found" });
    }
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const query = req.query.q as string || "";
    const skip = (page - 1) * limit;
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
      skip, take: limit
    });
    const total = await prisma.lessonContent.count({ where: { lesson: { id: lessonId }, title: { contains: query, mode: "insensitive" } } });
    const totalPages = Math.ceil(total / limit);
    res.status(200).json({
      status: "success",
      message: "Lesson content retrieved successfully",
      data: {
        lessonContent,
        pagination: {
          page,
          limit,
          total,
          totalPages,
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
    const lessonContent = await prisma.lessonContent.findUnique({ where: { id: lessonContentId } });
    if (!lessonContent) {
      return res.status(404).json({ status: "error", message: "Lesson content not found" });
    }
    res.status(200).json(lessonContent);
  } catch (error) {
    logger.error("Error getting lesson content by id:", error);
    next(error);
  }
};

export const updateLessonContent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { lessonContentId } = req.params;
    const { title, textBody, order, fileName } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const existingContent = await prisma.lessonContent.findUnique({
      where: { id: lessonContentId }
    });
    if (!existingContent) {
      return res.status(404).json({ status: "error", message: "Lesson content not found" });
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
      status: "success",
      message: "Lesson content updated successfully",
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
    const lessonContent = await prisma.lessonContent.findUnique({ where: { id: lessonContentId } });
    if (!lessonContent) {
      return res.status(404).json({ status: "error", message: "Lesson content not found" });
    }
    const deletedLessonContent = await prisma.lessonContent.delete({ where: { id: lessonContentId } });
    res.status(200).json({
      status: "success",
      message: "Lesson content deleted successfully",
      data: deletedLessonContent
    });
  } catch (error) {
    logger.error("Error deleting lesson content:", error);
    next(error);
  }
};
