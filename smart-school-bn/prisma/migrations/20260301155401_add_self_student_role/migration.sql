-- CreateEnum
CREATE TYPE "public"."AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED');

-- AlterEnum
ALTER TYPE "public"."UserRole" ADD VALUE 'SELF_STUDENT';

-- CreateTable
CREATE TABLE "public"."terms" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "yearId" TEXT NOT NULL,

    CONSTRAINT "terms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."subjects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "gradeId" TEXT NOT NULL,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."teacher_assignments" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "teacherId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "yearId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "teacher_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."attendances" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "public"."AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "academicRecordId" TEXT NOT NULL,

    CONSTRAINT "attendances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."grading_policies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "pointsJson" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "grading_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."assessment_results" (
    "id" TEXT NOT NULL,
    "marks" DOUBLE PRECISION NOT NULL,
    "maxMarks" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "grade" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "academicRecordId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "termId" TEXT NOT NULL,
    "teacherId" TEXT,

    CONSTRAINT "assessment_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."assignments" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "maxPoints" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lessonId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."assignment_submissions" (
    "id" TEXT NOT NULL,
    "content" TEXT,
    "fileUrl" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "points" DOUBLE PRECISION,
    "feedback" TEXT,
    "gradedAt" TIMESTAMP(3),
    "studentId" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "gradedById" TEXT,

    CONSTRAINT "assignment_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "terms_name_yearId_key" ON "public"."terms"("name", "yearId");

-- CreateIndex
CREATE UNIQUE INDEX "subjects_name_gradeId_organizationId_key" ON "public"."subjects"("name", "gradeId", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "subjects_code_organizationId_key" ON "public"."subjects"("code", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_assignments_teacherId_classId_subjectId_yearId_key" ON "public"."teacher_assignments"("teacherId", "classId", "subjectId", "yearId");

-- CreateIndex
CREATE UNIQUE INDEX "attendances_academicRecordId_date_key" ON "public"."attendances"("academicRecordId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "grading_policies_name_organizationId_key" ON "public"."grading_policies"("name", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "assessment_results_academicRecordId_subjectId_termId_key" ON "public"."assessment_results"("academicRecordId", "subjectId", "termId");

-- CreateIndex
CREATE UNIQUE INDEX "assignment_submissions_studentId_assignmentId_key" ON "public"."assignment_submissions"("studentId", "assignmentId");

-- AddForeignKey
ALTER TABLE "public"."terms" ADD CONSTRAINT "terms_yearId_fkey" FOREIGN KEY ("yearId") REFERENCES "public"."academic_years"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subjects" ADD CONSTRAINT "subjects_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subjects" ADD CONSTRAINT "subjects_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "public"."grades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."teacher_assignments" ADD CONSTRAINT "teacher_assignments_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."teacher_assignments" ADD CONSTRAINT "teacher_assignments_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."class_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."teacher_assignments" ADD CONSTRAINT "teacher_assignments_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."teacher_assignments" ADD CONSTRAINT "teacher_assignments_yearId_fkey" FOREIGN KEY ("yearId") REFERENCES "public"."academic_years"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."teacher_assignments" ADD CONSTRAINT "teacher_assignments_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attendances" ADD CONSTRAINT "attendances_academicRecordId_fkey" FOREIGN KEY ("academicRecordId") REFERENCES "public"."academic_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."grading_policies" ADD CONSTRAINT "grading_policies_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."assessment_results" ADD CONSTRAINT "assessment_results_academicRecordId_fkey" FOREIGN KEY ("academicRecordId") REFERENCES "public"."academic_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."assessment_results" ADD CONSTRAINT "assessment_results_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."assessment_results" ADD CONSTRAINT "assessment_results_termId_fkey" FOREIGN KEY ("termId") REFERENCES "public"."terms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."assignments" ADD CONSTRAINT "assignments_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "public"."lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."assignments" ADD CONSTRAINT "assignments_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."assignment_submissions" ADD CONSTRAINT "assignment_submissions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."assignment_submissions" ADD CONSTRAINT "assignment_submissions_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "public"."assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."assignment_submissions" ADD CONSTRAINT "assignment_submissions_gradedById_fkey" FOREIGN KEY ("gradedById") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
