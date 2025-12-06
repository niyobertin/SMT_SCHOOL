-- DropForeignKey
ALTER TABLE "public"."tests" DROP CONSTRAINT "tests_courseId_fkey";

-- AlterTable
ALTER TABLE "public"."tests" ALTER COLUMN "courseId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."tests" ADD CONSTRAINT "tests_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
