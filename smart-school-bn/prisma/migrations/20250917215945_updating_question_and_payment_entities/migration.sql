/*
  Warnings:

  - You are about to drop the column `paymentMethod` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `paypalPaymentId` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `stripePaymentId` on the `payments` table. All the data in the column will be lost.
  - Added the required column `channel` to the `payments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."payments" DROP COLUMN "paymentMethod",
DROP COLUMN "paypalPaymentId",
DROP COLUMN "stripePaymentId",
ADD COLUMN     "channel" TEXT NOT NULL,
ADD COLUMN     "subscribedCourseId" TEXT[],
ALTER COLUMN "currency" SET DEFAULT 'RWF';

-- AlterTable
ALTER TABLE "public"."questions" ADD COLUMN     "image" TEXT;

-- CreateTable
CREATE TABLE "public"."_CourseToPayment" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CourseToPayment_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CourseToPayment_B_index" ON "public"."_CourseToPayment"("B");

-- AddForeignKey
ALTER TABLE "public"."_CourseToPayment" ADD CONSTRAINT "_CourseToPayment_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_CourseToPayment" ADD CONSTRAINT "_CourseToPayment_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
