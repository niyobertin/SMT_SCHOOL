/*
  Warnings:

  - You are about to drop the column `type` on the `lesson_content` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."lesson_content" DROP COLUMN "type";

-- DropEnum
DROP TYPE "public"."ContentType";
