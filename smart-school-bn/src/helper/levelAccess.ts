import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

export const checkLevelEnrollmentValidity = (
  enrollment: { status: string; enrollmentDate: Date; enrollementPeriod: number } | null
): boolean => {
  if (!enrollment) return false;
  if (enrollment.status !== "ACTIVE") return false;

  const expirationDate = new Date(enrollment.enrollmentDate);
  expirationDate.setDate(expirationDate.getDate() + enrollment.enrollementPeriod);

  return new Date() < expirationDate;
};

export type LevelAccessReason = "not_paid" | "sequential_locked" | null;

export interface LevelAccessStatus {
  isPaid: boolean;
  isSequentialOk: boolean;
  canAccess: boolean;
  reason: LevelAccessReason;
}

// Single choke point for level access enforcement. Every controller that
// gates level-scoped content or exams must go through this.
export const getLevelAccessStatus = async (
  userId: string,
  levelId: string
): Promise<LevelAccessStatus> => {
  const level = await prisma.level.findUnique({
    where: { id: levelId },
    include: { course: { select: { enforceSequentialLevels: true } } },
  });

  if (!level) {
    return { isPaid: false, isSequentialOk: false, canAccess: false, reason: "not_paid" };
  }

  const enrollment = await prisma.levelEnrollment.findUnique({
    where: { userId_levelId: { userId, levelId } },
  });

  const isPaid = checkLevelEnrollmentValidity(enrollment);

  let isSequentialOk = true;
  if (level.course.enforceSequentialLevels && !enrollment?.bypassSequenceCheck) {
    const priorLevels = await prisma.level.findMany({
      where: { courseId: level.courseId, order: { lt: level.order } },
      select: { id: true, test: { select: { id: true } } },
    });

    if (priorLevels.length > 0) {
      const priorEnrollments = await prisma.levelEnrollment.findMany({
        where: { userId, levelId: { in: priorLevels.map((l) => l.id) } },
      });

      isSequentialOk = priorLevels.every((priorLevel) => {
        const priorEnrollment = priorEnrollments.find((e) => e.levelId === priorLevel.id);
        if (!priorEnrollment || !priorEnrollment.contentCompletedAt) return false;
        if (priorLevel.test && !priorEnrollment.examPassedAt) return false;
        return true;
      });
    }
  }

  const canAccess = isPaid && isSequentialOk;
  const reason: LevelAccessReason = canAccess ? null : !isPaid ? "not_paid" : "sequential_locked";

  return { isPaid, isSequentialOk, canAccess, reason };
};

// Recomputes a user's content-completion progress for a level from UserProgress
// rows, and marks contentCompletedAt the first time every lesson in the level
// has been opened. Called after a lesson's content is successfully fetched.
export const recomputeLevelContentProgress = async (
  userId: string,
  levelId: string
): Promise<void> => {
  const lessons = await prisma.lesson.findMany({
    where: { levelId },
    select: { id: true },
  });
  if (lessons.length === 0) return;

  const enrollment = await prisma.levelEnrollment.findUnique({
    where: { userId_levelId: { userId, levelId } },
  });
  if (!enrollment) return;

  const completedCount = await prisma.userProgress.count({
    where: {
      userId,
      lessonId: { in: lessons.map((l) => l.id) },
      isCompleted: true,
    },
  });

  const progress = (completedCount / lessons.length) * 100;
  const justCompleted = completedCount === lessons.length && !enrollment.contentCompletedAt;

  await prisma.levelEnrollment.update({
    where: { userId_levelId: { userId, levelId } },
    data: {
      progress,
      ...(justCompleted ? { contentCompletedAt: new Date() } : {}),
    },
  });

  if (justCompleted) {
    await prisma.notification.create({
      data: {
        id: uuidv4(),
        userId,
        type: "LEVEL_CONTENT_COMPLETE",
        title: "Level content complete",
        message: "You've completed all lessons for this level. You can now take the level exam.",
        metadata: { levelId },
      },
    });
  }
};
