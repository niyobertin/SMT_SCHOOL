-- AlterTable
ALTER TABLE "public"."organizations" ADD COLUMN     "creatorId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."organizations" ADD CONSTRAINT "organizations_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
