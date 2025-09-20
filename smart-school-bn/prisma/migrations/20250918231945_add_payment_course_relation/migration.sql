/*
  Warnings:

  - You are about to drop the column `subscribedCourseId` on the `payments` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."payments" DROP COLUMN "subscribedCourseId";

-- CreateTable
CREATE TABLE "public"."PaymentCourse" (
    "paymentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,

    CONSTRAINT "PaymentCourse_pkey" PRIMARY KEY ("paymentId","courseId")
);

-- AddForeignKey
ALTER TABLE "public"."PaymentCourse" ADD CONSTRAINT "PaymentCourse_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "public"."payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PaymentCourse" ADD CONSTRAINT "PaymentCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
