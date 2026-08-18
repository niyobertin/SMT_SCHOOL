-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'LEVEL_UNLOCKED';
ALTER TYPE "NotificationType" ADD VALUE 'LEVEL_CONTENT_COMPLETE';

-- AlterTable
ALTER TABLE "certificates" ADD COLUMN     "courseId" TEXT,
ADD COLUMN     "levelId" TEXT,
ADD COLUMN     "testId" TEXT;

-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "enforceSequentialLevels" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "hasLevels" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "lessons" ADD COLUMN     "levelId" TEXT;

-- AlterTable
ALTER TABLE "tests" ADD COLUMN     "levelId" TEXT;

-- CreateTable
CREATE TABLE "levels" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'RWF',
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "certificateEnabled" BOOLEAN NOT NULL DEFAULT false,
    "certificateTitle" TEXT,
    "certificateOrgName" TEXT,
    "certificateDescription" TEXT,
    "certificatePassingScoreOverride" DOUBLE PRECISION,
    "certificateSignatureName" TEXT,
    "certificateSignatureImageUrl" TEXT,
    "certificateLogoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "level_enrollments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "levelId" TEXT NOT NULL,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "enrollmentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "enrollementPeriod" INTEGER NOT NULL DEFAULT 30,
    "contentCompletedAt" TIMESTAMP(3),
    "examPassedAt" TIMESTAMP(3),
    "certificateIssuedAt" TIMESTAMP(3),
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "bypassSequenceCheck" BOOLEAN NOT NULL DEFAULT false,
    "grantedByAdminId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "level_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_levels" (
    "paymentId" TEXT NOT NULL,
    "levelId" TEXT NOT NULL,

    CONSTRAINT "payment_levels_pkey" PRIMARY KEY ("paymentId","levelId")
);

-- CreateIndex
CREATE INDEX "levels_courseId_idx" ON "levels"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "levels_courseId_order_key" ON "levels"("courseId", "order");

-- CreateIndex
CREATE INDEX "level_enrollments_userId_idx" ON "level_enrollments"("userId");

-- CreateIndex
CREATE INDEX "level_enrollments_levelId_idx" ON "level_enrollments"("levelId");

-- CreateIndex
CREATE UNIQUE INDEX "level_enrollments_userId_levelId_key" ON "level_enrollments"("userId", "levelId");

-- CreateIndex
CREATE INDEX "certificates_testId_idx" ON "certificates"("testId");

-- CreateIndex
CREATE INDEX "certificates_levelId_idx" ON "certificates"("levelId");

-- CreateIndex
CREATE INDEX "lessons_levelId_idx" ON "lessons"("levelId");

-- CreateIndex
CREATE UNIQUE INDEX "tests_levelId_key" ON "tests"("levelId");

-- AddForeignKey
ALTER TABLE "levels" ADD CONSTRAINT "levels_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "levels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "level_enrollments" ADD CONSTRAINT "level_enrollments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "level_enrollments" ADD CONSTRAINT "level_enrollments_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "levels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_levels" ADD CONSTRAINT "payment_levels_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_levels" ADD CONSTRAINT "payment_levels_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "levels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tests" ADD CONSTRAINT "tests_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "levels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_testId_fkey" FOREIGN KEY ("testId") REFERENCES "tests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "levels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- DataMigration
-- Backfill the new typed testId column from the legacy untyped certificationId
-- string, for existing Certificate rows that were issued from the course-linked
-- Test/TestAttempt flow (issueCertificateForTest). Rows whose certificationId
-- points at a standalone Exam (the separate Organization/Candidate exam portal)
-- will not match any tests.id and correctly stay NULL.
UPDATE "certificates" SET "testId" = "certificationId" WHERE "certificationId" IN (SELECT "id" FROM "tests");
