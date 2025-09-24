-- AlterTable
ALTER TABLE "public"."courses" ADD COLUMN     "type" TEXT DEFAULT 'free';

-- AlterTable
ALTER TABLE "public"."job_posts" ADD COLUMN     "attachments" TEXT;
