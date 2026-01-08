/*
  Warnings:

  - A unique constraint covering the columns `[customCandidateId,organizationId]` on the table `candidates` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "public"."UserRole" ADD VALUE 'EXAMINER';

-- AlterTable
ALTER TABLE "public"."candidates" ADD COLUMN     "archived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "batch" TEXT,
ADD COLUMN     "customCandidateId" TEXT,
ADD COLUMN     "department" TEXT,
ADD COLUMN     "grade" TEXT;

-- AlterTable
ALTER TABLE "public"."exam_answers" ADD COLUMN     "feedback" TEXT,
ADD COLUMN     "manualScore" DOUBLE PRECISION,
ADD COLUMN     "markedAt" TIMESTAMP(3),
ADD COLUMN     "markedBy" TEXT,
ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "public"."exam_assignments" ADD COLUMN     "allowRetake" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "public"."user_organizations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT,

    CONSTRAINT "user_organizations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_organizations_userId_idx" ON "public"."user_organizations"("userId");

-- CreateIndex
CREATE INDEX "user_organizations_organizationId_idx" ON "public"."user_organizations"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "user_organizations_userId_organizationId_key" ON "public"."user_organizations"("userId", "organizationId");

-- CreateIndex
CREATE INDEX "candidates_batch_idx" ON "public"."candidates"("batch");

-- CreateIndex
CREATE INDEX "candidates_archived_idx" ON "public"."candidates"("archived");

-- CreateIndex
CREATE UNIQUE INDEX "candidates_customCandidateId_organizationId_key" ON "public"."candidates"("customCandidateId", "organizationId");

-- AddForeignKey
ALTER TABLE "public"."user_organizations" ADD CONSTRAINT "user_organizations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_organizations" ADD CONSTRAINT "user_organizations_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."exam_answers" ADD CONSTRAINT "exam_answers_markedBy_fkey" FOREIGN KEY ("markedBy") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."exam_answers" ADD CONSTRAINT "exam_answers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
