/*
  Warnings:

  - You are about to drop the column `fileSize` on the `lesson_content` table. All the data in the column will be lost.
  - You are about to drop the column `fileUrl` on the `lesson_content` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."lesson_content" DROP COLUMN "fileSize",
DROP COLUMN "fileUrl",
ADD COLUMN     "audioUrl" TEXT,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "pdfUrl" TEXT,
ADD COLUMN     "textBody" TEXT,
ADD COLUMN     "videoUrl" TEXT;
