import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { NotFoundError } from "../utils/errors";
import { uploadBufferToCloudinary } from "../config/cloudinary";
import { getLevelAccessStatus } from "../helper/levelAccess";

const prisma = new PrismaClient();

const toBool = (val: unknown, fallback = false): boolean => {
  if (val === undefined) return fallback;
  return val === true || val === "true";
};

const canManageCourseLevels = (userRole: string, course: { instructorId: string }, userId: string) =>
  userRole === "SUPER_ADMIN" || userRole === "ADMIN" || course.instructorId === userId;

export const createLevel = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { courseId } = req.params;
    const userId = (req.user as any)?.id;
    const userRole = (req.user as any)?.role;
    const {
      title,
      description,
      order,
      price,
      currency,
      isPublished,
      certificateEnabled,
      certificateTitle,
      certificateOrgName,
      certificateDescription,
      certificatePassingScoreOverride,
      certificateSignatureName,
    } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      res.status(404).json({ status: "error", message: "Course not found" });
      return;
    }

    if (!canManageCourseLevels(userRole, course, userId)) {
      res.status(403).json({
        status: "error",
        message: "You do not have permission to manage levels for this course",
      });
      return;
    }

    let certificateLogoUrl: string | undefined;
    const logoFile = files?.certificateLogo?.[0];
    if (logoFile) {
      certificateLogoUrl = await uploadBufferToCloudinary(
        logoFile.buffer,
        logoFile.mimetype,
        logoFile.originalname
      );
    }

    let certificateSignatureImageUrl: string | undefined;
    const signatureFile = files?.certificateSignatureImage?.[0];
    if (signatureFile) {
      certificateSignatureImageUrl = await uploadBufferToCloudinary(
        signatureFile.buffer,
        signatureFile.mimetype,
        signatureFile.originalname
      );
    }

    const isCertEnabled = toBool(certificateEnabled);

    const level = await prisma.$transaction(async (tx) => {
      const created = await tx.level.create({
        data: {
          id: uuidv4(),
          courseId,
          title,
          description: description || null,
          order: Number(order),
          price: price !== undefined ? Number(price) : 0,
          currency: currency || "RWF",
          isPublished: toBool(isPublished, true),
          certificateEnabled: isCertEnabled,
          certificateTitle: isCertEnabled ? certificateTitle || null : null,
          certificateOrgName: isCertEnabled ? certificateOrgName || null : null,
          certificateDescription: isCertEnabled ? certificateDescription || null : null,
          certificatePassingScoreOverride:
            isCertEnabled && certificatePassingScoreOverride
              ? Number(certificatePassingScoreOverride)
              : null,
          certificateSignatureName: isCertEnabled ? certificateSignatureName || null : null,
          ...(certificateLogoUrl && { certificateLogoUrl }),
          ...(certificateSignatureImageUrl && { certificateSignatureImageUrl }),
        },
      });

      if (!course.hasLevels) {
        await tx.course.update({ where: { id: courseId }, data: { hasLevels: true } });
      }

      return created;
    });

    res.status(201).json({
      status: "success",
      message: "Level created successfully",
      data: level,
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      res.status(409).json({
        status: "error",
        message: "A level with this order already exists for this course",
      });
      return;
    }
    next(error);
  }
};

export const getLevelsByCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { courseId } = req.params;
    const userId = (req.user as any)?.id;

    const levels = await prisma.level.findMany({
      where: { courseId },
      orderBy: { order: "asc" },
      include: {
        test: { select: { id: true, title: true, passingScore: true } },
      },
    });

    const data = await Promise.all(
      levels.map(async (level) => ({
        ...level,
        access: userId ? await getLevelAccessStatus(userId, level.id) : null,
      }))
    );

    res.status(200).json({ status: "success", data });
  } catch (error) {
    next(error);
  }
};

export const getLevelById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { levelId } = req.params;
    const level = await prisma.level.findUnique({
      where: { id: levelId },
      include: {
        test: { select: { id: true, title: true, passingScore: true } },
        course: { select: { id: true, title: true } },
      },
    });

    if (!level) throw new NotFoundError("Level not found");

    res.status(200).json({ status: "success", data: level });
  } catch (error) {
    next(error);
  }
};

// Dashboard aggregation endpoint: payment/access/content/exam/certificate
// status for every level of a course, for the current user.
export const getCourseLevelProgress = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { courseId } = req.params;
    const userId = (req.user as any)?.id;

    if (!userId) {
      res.status(401).json({ status: "error", message: "Unauthorized" });
      return;
    }

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundError("Course not found");

    const levels = await prisma.level.findMany({
      where: { courseId },
      orderBy: { order: "asc" },
      include: {
        lessons: { select: { id: true } },
        test: true,
      },
    });

    const data = await Promise.all(
      levels.map(async (level) => {
        const [access, enrollment] = await Promise.all([
          getLevelAccessStatus(userId, level.id),
          prisma.levelEnrollment.findUnique({
            where: { userId_levelId: { userId, levelId: level.id } },
          }),
        ]);

        const totalLessons = level.lessons.length;
        const completedLessons = totalLessons
          ? await prisma.userProgress.count({
              where: {
                userId,
                lessonId: { in: level.lessons.map((l) => l.id) },
                isCompleted: true,
              },
            })
          : 0;

        let exam: any = null;
        if (level.test) {
          const attempts = await prisma.testAttempt.findMany({
            where: { userId, testId: level.test.id },
            orderBy: { startTime: "desc" },
          });
          const bestScore = attempts.reduce((max, a) => Math.max(max, a.score || 0), 0);
          exam = {
            testId: level.test.id,
            attemptsUsed: attempts.length,
            maxAttempts: level.test.maxAttempts,
            bestScore: attempts.length ? bestScore : null,
            isPassed: !!enrollment?.examPassedAt,
            passingScore: level.test.passingScore,
          };
        }

        let certificate: any = { issued: false };
        if (level.certificateEnabled) {
          const cert = await prisma.certificate.findFirst({
            where: { userId, levelId: level.id, status: "ACTIVE" },
          });
          if (cert) {
            certificate = {
              issued: true,
              certificateId: cert.id,
              certificateNumber: cert.certificateNumber,
              pdfUrl: cert.pdfUrl,
              issuedAt: cert.issuedAt,
            };
          }
        }

        return {
          id: level.id,
          title: level.title,
          description: level.description,
          order: level.order,
          price: level.price,
          currency: level.currency,
          certificateEnabled: level.certificateEnabled,
          access,
          content: {
            totalLessons,
            completedLessons,
            percent: totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0,
            contentComplete: !!enrollment?.contentCompletedAt,
          },
          exam,
          certificate,
        };
      })
    );

    res.status(200).json({
      status: "success",
      data: {
        courseId: course.id,
        courseTitle: course.title,
        hasLevels: course.hasLevels,
        enforceSequentialLevels: course.enforceSequentialLevels,
        levels: data,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateLevel = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { levelId } = req.params;
    const userId = (req.user as any)?.id;
    const userRole = (req.user as any)?.role;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const existing = await prisma.level.findUnique({
      where: { id: levelId },
      include: { course: true },
    });
    if (!existing) throw new NotFoundError("Level not found");

    if (!canManageCourseLevels(userRole, existing.course, userId)) {
      res.status(403).json({
        status: "error",
        message: "You do not have permission to manage this level",
      });
      return;
    }

    const {
      title,
      description,
      order,
      price,
      currency,
      isPublished,
      certificateEnabled,
      certificateTitle,
      certificateOrgName,
      certificateDescription,
      certificatePassingScoreOverride,
      certificateSignatureName,
    } = req.body;

    let certificateLogoUrl: string | undefined;
    const logoFile = files?.certificateLogo?.[0];
    if (logoFile) {
      certificateLogoUrl = await uploadBufferToCloudinary(
        logoFile.buffer,
        logoFile.mimetype,
        logoFile.originalname
      );
    }

    let certificateSignatureImageUrl: string | undefined;
    const signatureFile = files?.certificateSignatureImage?.[0];
    if (signatureFile) {
      certificateSignatureImageUrl = await uploadBufferToCloudinary(
        signatureFile.buffer,
        signatureFile.mimetype,
        signatureFile.originalname
      );
    }

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description || null;
    if (order !== undefined) updateData.order = Number(order);
    if (price !== undefined) updateData.price = Number(price);
    if (currency !== undefined) updateData.currency = currency;
    if (isPublished !== undefined) updateData.isPublished = toBool(isPublished, true);
    if (certificateEnabled !== undefined) updateData.certificateEnabled = toBool(certificateEnabled);
    if (certificateTitle !== undefined) updateData.certificateTitle = certificateTitle || null;
    if (certificateOrgName !== undefined) updateData.certificateOrgName = certificateOrgName || null;
    if (certificateDescription !== undefined)
      updateData.certificateDescription = certificateDescription || null;
    if (certificatePassingScoreOverride !== undefined) {
      updateData.certificatePassingScoreOverride =
        certificatePassingScoreOverride === "" || certificatePassingScoreOverride === null
          ? null
          : Number(certificatePassingScoreOverride);
    }
    if (certificateSignatureName !== undefined)
      updateData.certificateSignatureName = certificateSignatureName || null;
    if (certificateLogoUrl) updateData.certificateLogoUrl = certificateLogoUrl;
    if (certificateSignatureImageUrl) updateData.certificateSignatureImageUrl = certificateSignatureImageUrl;

    const level = await prisma.level.update({ where: { id: levelId }, data: updateData });

    res.status(200).json({
      status: "success",
      message: "Level updated successfully",
      data: level,
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      res.status(409).json({
        status: "error",
        message: "A level with this order already exists for this course",
      });
      return;
    }
    next(error);
  }
};

export const reorderLevels = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { courseId } = req.params;
    const { order } = req.body as { order: Array<{ levelId: string; order: number }> };

    if (!Array.isArray(order) || order.length === 0) {
      res.status(400).json({
        status: "error",
        message: "order must be a non-empty array of { levelId, order }",
      });
      return;
    }

    await prisma.$transaction(async (tx) => {
      // Move everything to a temporary negative range first so intermediate
      // writes never collide with the @@unique([courseId, order]) constraint.
      for (const item of order) {
        await tx.level.update({
          where: { id: item.levelId },
          data: { order: -Math.abs(Number(item.order)) - 1 },
        });
      }
      for (const item of order) {
        await tx.level.update({
          where: { id: item.levelId },
          data: { order: Number(item.order) },
        });
      }
    });

    const levels = await prisma.level.findMany({ where: { courseId }, orderBy: { order: "asc" } });

    res.status(200).json({
      status: "success",
      message: "Levels reordered successfully",
      data: levels,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteLevel = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { levelId } = req.params;
    const level = await prisma.level.findUnique({ where: { id: levelId } });
    if (!level) throw new NotFoundError("Level not found");

    const [enrollmentCount, paymentCount] = await Promise.all([
      prisma.levelEnrollment.count({ where: { levelId } }),
      prisma.paymentLevel.count({ where: { levelId } }),
    ]);

    if (enrollmentCount > 0 || paymentCount > 0) {
      res.status(409).json({
        status: "error",
        message: "Cannot delete a level that already has enrollments or payments",
      });
      return;
    }

    await prisma.level.delete({ where: { id: levelId } });

    res.status(200).json({ status: "success", message: "Level deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// Admin-explicit skip override: unlocks a level for one user regardless of
// payment/sequential order (the "unless explicitly configured by the
// administrator" mechanism).
export const unlockLevelForUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { levelId } = req.params;
    const { userId: targetUserId, reason } = req.body;
    const adminId = (req.user as any)?.id;

    if (!targetUserId) {
      res.status(400).json({ status: "error", message: "userId is required" });
      return;
    }

    const level = await prisma.level.findUnique({ where: { id: levelId } });
    if (!level) throw new NotFoundError("Level not found");

    const enrollment = await prisma.levelEnrollment.upsert({
      where: { userId_levelId: { userId: targetUserId, levelId } },
      update: { status: "ACTIVE", bypassSequenceCheck: true, grantedByAdminId: adminId },
      create: {
        userId: targetUserId,
        levelId,
        status: "ACTIVE",
        bypassSequenceCheck: true,
        grantedByAdminId: adminId,
        enrollementPeriod: 3650,
      },
    });

    await prisma.notification.create({
      data: {
        id: uuidv4(),
        userId: targetUserId,
        type: "LEVEL_UNLOCKED",
        title: "Level unlocked",
        message: reason || "An administrator has granted you access to this level.",
        metadata: { levelId },
      },
    });

    res.status(200).json({
      status: "success",
      message: "Level unlocked for user",
      data: enrollment,
    });
  } catch (error) {
    next(error);
  }
};
