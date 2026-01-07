-- AlterEnum
BEGIN;
CREATE TYPE "public"."UserRole_new" AS ENUM ('ADMIN', 'INSTRUCTOR', 'STUDENT');
ALTER TABLE "public"."users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "public"."users" ALTER COLUMN "role" TYPE "public"."UserRole_new" USING ("role"::text::"public"."UserRole_new");
ALTER TYPE "public"."UserRole" RENAME TO "UserRole_old";
ALTER TYPE "public"."UserRole_new" RENAME TO "UserRole";
DROP TYPE "public"."UserRole_old";
ALTER TABLE "public"."users" ALTER COLUMN "role" SET DEFAULT 'STUDENT';
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."user_organizations" DROP CONSTRAINT "user_organizations_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_organizations" DROP CONSTRAINT "user_organizations_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."exam_answers" DROP CONSTRAINT "exam_answers_markedBy_fkey";

-- DropForeignKey
ALTER TABLE "public"."exam_answers" DROP CONSTRAINT "exam_answers_userId_fkey";

-- DropIndex
DROP INDEX "public"."candidates_batch_idx";

-- DropIndex
DROP INDEX "public"."candidates_archived_idx";

-- DropIndex
DROP INDEX "public"."candidates_customCandidateId_organizationId_key";

-- AlterTable
ALTER TABLE "public"."candidates" DROP COLUMN "archived",
DROP COLUMN "batch",
DROP COLUMN "customCandidateId",
DROP COLUMN "department",
DROP COLUMN "grade";

-- AlterTable
ALTER TABLE "public"."exams" ALTER COLUMN "examCode" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."exam_answers" DROP COLUMN "feedback",
DROP COLUMN "manualScore",
DROP COLUMN "markedAt",
DROP COLUMN "markedBy",
DROP COLUMN "userId";

-- DropTable
DROP TABLE "public"."user_organizations";

