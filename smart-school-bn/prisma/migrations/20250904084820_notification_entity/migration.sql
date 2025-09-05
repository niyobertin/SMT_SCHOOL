/*
  Warnings:

  - The `instructions` column on the `tests` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('COURSE_ENROLLMENT', 'COURSE_COMPLETION', 'TEST_GRADED', 'TEST_REMINDER', 'PAYMENT_RECEIVED', 'PAYMENT_FAILED', 'SYSTEM_ALERT', 'COURSE_UPDATE', 'NEW_COURSE', 'PROMOTIONAL');

-- CreateEnum
CREATE TYPE "public"."NotificationStatus" AS ENUM ('UNREAD', 'READ', 'ARCHIVED', 'DELETED');

-- AlterTable
ALTER TABLE "public"."tests" DROP COLUMN "instructions",
ADD COLUMN     "instructions" TEXT[],
ALTER COLUMN "maxAttempts" DROP NOT NULL,
ALTER COLUMN "maxAttempts" SET DEFAULT 10,
ALTER COLUMN "randomizeQuestions" SET DEFAULT true;

-- CreateTable
CREATE TABLE "public"."notifications" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "public"."NotificationType" NOT NULL,
    "status" "public"."NotificationStatus" NOT NULL DEFAULT 'UNREAD',
    "metadata" JSONB,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT,
    "testId" TEXT,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_NotificationToTestAttempt" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_NotificationToTestAttempt_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "notifications_userId_status_idx" ON "public"."notifications"("userId", "status");

-- CreateIndex
CREATE INDEX "_NotificationToTestAttempt_B_index" ON "public"."_NotificationToTestAttempt"("B");

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_testId_fkey" FOREIGN KEY ("testId") REFERENCES "public"."tests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_NotificationToTestAttempt" ADD CONSTRAINT "_NotificationToTestAttempt_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."notifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_NotificationToTestAttempt" ADD CONSTRAINT "_NotificationToTestAttempt_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."test_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
