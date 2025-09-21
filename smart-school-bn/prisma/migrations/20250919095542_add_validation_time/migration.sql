/*
  Warnings:

  - You are about to drop the `system_settings` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "public"."payments" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "remainingPeriod" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "subscriptionPeriod" INTEGER NOT NULL DEFAULT 30;

-- DropTable
DROP TABLE "public"."system_settings";
