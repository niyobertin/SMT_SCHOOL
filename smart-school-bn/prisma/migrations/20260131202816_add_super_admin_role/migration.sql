/*
  Warnings:

  - You are about to drop the column `creatorId` on the `organizations` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "public"."UserRole" ADD VALUE 'SUPER_ADMIN';

-- DropForeignKey
ALTER TABLE "public"."organizations" DROP CONSTRAINT "organizations_creatorId_fkey";

-- AlterTable
ALTER TABLE "public"."organizations" DROP COLUMN "creatorId";
