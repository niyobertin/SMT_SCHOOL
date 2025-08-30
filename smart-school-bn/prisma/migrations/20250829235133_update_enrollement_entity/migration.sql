/*
  Warnings:

  - You are about to drop the column `certificateIssued` on the `enrollments` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."enrollments" DROP COLUMN "certificateIssued",
ADD COLUMN     "enrollementPeriod" INTEGER NOT NULL DEFAULT 30;
