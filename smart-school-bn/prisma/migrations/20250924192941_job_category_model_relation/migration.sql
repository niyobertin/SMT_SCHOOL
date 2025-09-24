-- AlterTable
ALTER TABLE "public"."job_posts" ADD COLUMN     "jobCategoryId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."job_posts" ADD CONSTRAINT "job_posts_jobCategoryId_fkey" FOREIGN KEY ("jobCategoryId") REFERENCES "public"."job_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
