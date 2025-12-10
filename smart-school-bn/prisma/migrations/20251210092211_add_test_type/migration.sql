-- CreateEnum
CREATE TYPE "public"."TestType" AS ENUM ('PSYCHOMETRIC', 'OPENENDED', 'INTERVIEW', 'GENERAL');

-- AlterEnum
ALTER TYPE "public"."EnrollmentStatus" ADD VALUE 'EXPIRED';

-- AlterTable
ALTER TABLE "public"."tests" ADD COLUMN     "type" "public"."TestType" NOT NULL DEFAULT 'GENERAL';
