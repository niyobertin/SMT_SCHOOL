/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `job_posts` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `job_posts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."job_posts" ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "job_posts_slug_key" ON "public"."job_posts"("slug");
