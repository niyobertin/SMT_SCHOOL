-- CreateEnum
CREATE TYPE "public"."TestType" AS ENUM ('STANDARD', 'PSYCHOMETRIC', 'INTERVIEW');

-- AlterEnum
ALTER TYPE "public"."EnrollmentStatus" ADD VALUE 'EXPIRED';

-- AlterTable
ALTER TABLE "public"."answers" ADD COLUMN     "openEndedResponse" TEXT,
ADD COLUMN     "questionTimeSpent" INTEGER;

-- AlterTable
ALTER TABLE "public"."questions" ADD COLUMN     "solution" TEXT,
ADD COLUMN     "solutionImage" TEXT,
ADD COLUMN     "timePerQuestion" INTEGER;

-- AlterTable
ALTER TABLE "public"."tests" ADD COLUMN     "testType" "public"."TestType" NOT NULL DEFAULT 'STANDARD';
