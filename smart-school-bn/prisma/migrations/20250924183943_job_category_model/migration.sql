-- CreateTable
CREATE TABLE "public"."job_categories" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "job_categories_slug_key" ON "public"."job_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "job_categories_name_key" ON "public"."job_categories"("name");
