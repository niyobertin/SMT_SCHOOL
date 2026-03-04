-- CreateEnum
CREATE TYPE "SchoolType" AS ENUM ('PUBLIC', 'SUBSCRIPTION');

-- CreateEnum
CREATE TYPE "TenantType" AS ENUM ('SCHOOL', 'ORGANIZATION');

-- CreateEnum
CREATE TYPE "SchoolRoleType" AS ENUM ('SCHOOL_ADMIN', 'TEACHER', 'GUARDIAN', 'SUPPORT_STAFF');

-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'TRANSFERRED', 'GRADUATED');

-- CreateEnum
CREATE TYPE "AssessmentType" AS ENUM ('EXAM', 'TEST', 'QUIZ', 'ASSIGNMENT', 'PRACTICAL');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED');

-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "schoolId" TEXT;

-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "tenantType" "TenantType" NOT NULL DEFAULT 'ORGANIZATION',
ADD COLUMN     "type" "SchoolType" NOT NULL DEFAULT 'SUBSCRIPTION';

-- CreateTable
CREATE TABLE "schools" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "SchoolType" NOT NULL DEFAULT 'SUBSCRIPTION',
    "description" TEXT,
    "logo" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phoneNumber" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "gender" TEXT,
    "credentialHash" TEXT NOT NULL,
    "status" "StudentStatus" NOT NULL DEFAULT 'ACTIVE',
    "classId" TEXT,
    "academicYearId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_staff" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleInSchool" "SchoolRoleType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT,

    CONSTRAINT "school_staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_classes" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" TEXT,
    "stream" TEXT,
    "academicYearId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_years" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "academic_years_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_enrollments" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "enrollmentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_progress" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "bookmarkTime" INTEGER,
    "lastAccessed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_test_attempts" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "score" DOUBLE PRECISION,
    "totalQuestions" INTEGER NOT NULL,
    "correctAnswers" INTEGER NOT NULL DEFAULT 0,
    "timeSpent" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "isPassed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_test_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_answers" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answerText" TEXT,
    "selectedOptions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isCorrect" BOOLEAN,
    "points" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subjects" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_subject_assignments" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "teacherStaffId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teacher_subject_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_class_enrollments" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_class_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_assignments" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "classId" TEXT,
    "studentId" TEXT,
    "subjectId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "course_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessments" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "type" "AssessmentType" NOT NULL DEFAULT 'TEST',
    "term" TEXT NOT NULL,
    "maxScore" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_scores" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "enteredBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assessment_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "result_submissions" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'DRAFT',
    "submittedBy" TEXT,
    "approvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "result_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "classId" TEXT,
    "subjectId" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "remarks" TEXT,
    "recordedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "schools_code_key" ON "schools"("code");

-- CreateIndex
CREATE INDEX "students_schoolId_idx" ON "students"("schoolId");

-- CreateIndex
CREATE INDEX "students_status_idx" ON "students"("status");

-- CreateIndex
CREATE UNIQUE INDEX "students_schoolId_studentId_key" ON "students"("schoolId", "studentId");

-- CreateIndex
CREATE INDEX "school_staff_schoolId_idx" ON "school_staff"("schoolId");

-- CreateIndex
CREATE INDEX "school_staff_userId_idx" ON "school_staff"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "school_staff_schoolId_userId_key" ON "school_staff"("schoolId", "userId");

-- CreateIndex
CREATE INDEX "school_classes_schoolId_idx" ON "school_classes"("schoolId");

-- CreateIndex
CREATE INDEX "school_classes_academicYearId_idx" ON "school_classes"("academicYearId");

-- CreateIndex
CREATE UNIQUE INDEX "school_classes_schoolId_name_key" ON "school_classes"("schoolId", "name");

-- CreateIndex
CREATE INDEX "academic_years_schoolId_idx" ON "academic_years"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "academic_years_schoolId_year_key" ON "academic_years"("schoolId", "year");

-- CreateIndex
CREATE INDEX "student_enrollments_studentId_idx" ON "student_enrollments"("studentId");

-- CreateIndex
CREATE INDEX "student_enrollments_courseId_idx" ON "student_enrollments"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "student_enrollments_studentId_courseId_key" ON "student_enrollments"("studentId", "courseId");

-- CreateIndex
CREATE INDEX "student_progress_studentId_idx" ON "student_progress"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "student_progress_studentId_lessonId_key" ON "student_progress"("studentId", "lessonId");

-- CreateIndex
CREATE INDEX "student_test_attempts_studentId_idx" ON "student_test_attempts"("studentId");

-- CreateIndex
CREATE INDEX "student_test_attempts_testId_idx" ON "student_test_attempts"("testId");

-- CreateIndex
CREATE INDEX "student_answers_attemptId_idx" ON "student_answers"("attemptId");

-- CreateIndex
CREATE INDEX "student_answers_questionId_idx" ON "student_answers"("questionId");

-- CreateIndex
CREATE INDEX "subjects_schoolId_idx" ON "subjects"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "subjects_schoolId_name_key" ON "subjects"("schoolId", "name");

-- CreateIndex
CREATE INDEX "teacher_subject_assignments_schoolId_idx" ON "teacher_subject_assignments"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "student_class_enrollments_studentId_academicYearId_key" ON "student_class_enrollments"("studentId", "academicYearId");

-- CreateIndex
CREATE UNIQUE INDEX "course_assignments_schoolId_courseId_classId_studentId_subj_key" ON "course_assignments"("schoolId", "courseId", "classId", "studentId", "subjectId");

-- CreateIndex
CREATE INDEX "assessments_schoolId_idx" ON "assessments"("schoolId");

-- CreateIndex
CREATE INDEX "assessments_classId_idx" ON "assessments"("classId");

-- CreateIndex
CREATE INDEX "assessments_subjectId_idx" ON "assessments"("subjectId");

-- CreateIndex
CREATE INDEX "assessment_scores_assessmentId_idx" ON "assessment_scores"("assessmentId");

-- CreateIndex
CREATE INDEX "assessment_scores_studentId_idx" ON "assessment_scores"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "assessment_scores_assessmentId_studentId_key" ON "assessment_scores"("assessmentId", "studentId");

-- CreateIndex
CREATE INDEX "result_submissions_schoolId_idx" ON "result_submissions"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "result_submissions_schoolId_classId_term_key" ON "result_submissions"("schoolId", "classId", "term");

-- CreateIndex
CREATE INDEX "attendance_schoolId_idx" ON "attendance"("schoolId");

-- CreateIndex
CREATE INDEX "attendance_studentId_idx" ON "attendance"("studentId");

-- CreateIndex
CREATE INDEX "attendance_classId_idx" ON "attendance"("classId");

-- CreateIndex
CREATE INDEX "attendance_date_idx" ON "attendance"("date");

-- CreateIndex
CREATE INDEX "courses_schoolId_idx" ON "courses"("schoolId");

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_classId_fkey" FOREIGN KEY ("classId") REFERENCES "school_classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "academic_years"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_staff" ADD CONSTRAINT "school_staff_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_staff" ADD CONSTRAINT "school_staff_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_classes" ADD CONSTRAINT "school_classes_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_classes" ADD CONSTRAINT "school_classes_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "academic_years"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_years" ADD CONSTRAINT "academic_years_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_enrollments" ADD CONSTRAINT "student_enrollments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_enrollments" ADD CONSTRAINT "student_enrollments_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_progress" ADD CONSTRAINT "student_progress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_progress" ADD CONSTRAINT "student_progress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_test_attempts" ADD CONSTRAINT "student_test_attempts_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_test_attempts" ADD CONSTRAINT "student_test_attempts_testId_fkey" FOREIGN KEY ("testId") REFERENCES "tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_answers" ADD CONSTRAINT "student_answers_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "student_test_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_answers" ADD CONSTRAINT "student_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_subject_assignments" ADD CONSTRAINT "teacher_subject_assignments_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_subject_assignments" ADD CONSTRAINT "teacher_subject_assignments_teacherStaffId_fkey" FOREIGN KEY ("teacherStaffId") REFERENCES "school_staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_subject_assignments" ADD CONSTRAINT "teacher_subject_assignments_classId_fkey" FOREIGN KEY ("classId") REFERENCES "school_classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_subject_assignments" ADD CONSTRAINT "teacher_subject_assignments_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_class_enrollments" ADD CONSTRAINT "student_class_enrollments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_class_enrollments" ADD CONSTRAINT "student_class_enrollments_classId_fkey" FOREIGN KEY ("classId") REFERENCES "school_classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_class_enrollments" ADD CONSTRAINT "student_class_enrollments_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "academic_years"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_assignments" ADD CONSTRAINT "course_assignments_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_assignments" ADD CONSTRAINT "course_assignments_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_assignments" ADD CONSTRAINT "course_assignments_classId_fkey" FOREIGN KEY ("classId") REFERENCES "school_classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_assignments" ADD CONSTRAINT "course_assignments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_assignments" ADD CONSTRAINT "course_assignments_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_classId_fkey" FOREIGN KEY ("classId") REFERENCES "school_classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_scores" ADD CONSTRAINT "assessment_scores_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_scores" ADD CONSTRAINT "assessment_scores_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_scores" ADD CONSTRAINT "assessment_scores_enteredBy_fkey" FOREIGN KEY ("enteredBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "result_submissions" ADD CONSTRAINT "result_submissions_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "result_submissions" ADD CONSTRAINT "result_submissions_classId_fkey" FOREIGN KEY ("classId") REFERENCES "school_classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "result_submissions" ADD CONSTRAINT "result_submissions_submittedBy_fkey" FOREIGN KEY ("submittedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "result_submissions" ADD CONSTRAINT "result_submissions_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_classId_fkey" FOREIGN KEY ("classId") REFERENCES "school_classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_recordedBy_fkey" FOREIGN KEY ("recordedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
