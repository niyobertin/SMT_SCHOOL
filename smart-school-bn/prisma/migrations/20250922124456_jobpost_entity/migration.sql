-- CreateTable
CREATE TABLE "public"."job_posts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tateDue" TIMESTAMP(3) NOT NULL,
    "companyname" TEXT,
    "companylogo" TEXT,
    "companywebsite" TEXT,
    "applicationLink" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_posts_pkey" PRIMARY KEY ("id")
);
