/*
  Warnings:

  - You are about to drop the column `tateDue` on the `job_posts` table. All the data in the column will be lost.
  - Added the required column `dueDate` to the `job_posts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."job_posts" DROP COLUMN "tateDue",
ADD COLUMN     "dueDate" TIMESTAMP(3) NOT NULL;
