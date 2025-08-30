/*
  Warnings:

  - You are about to drop the column `discountPrice` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `lesson_content` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `lessons` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `payments` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.

*/
-- AlterTable
ALTER TABLE "public"."courses" DROP COLUMN "discountPrice",
DROP COLUMN "duration",
DROP COLUMN "price";

-- AlterTable
ALTER TABLE "public"."lesson_content" DROP COLUMN "duration";

-- AlterTable
ALTER TABLE "public"."lessons" DROP COLUMN "duration";

-- AlterTable
ALTER TABLE "public"."payments" ALTER COLUMN "amount" SET DATA TYPE DOUBLE PRECISION;
