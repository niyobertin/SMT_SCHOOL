# Code Quality Audit Report
Date: 2026-06-10

## Frontend Issues

| Issue | File Location | Severity | Recommended Fix | Status |
|-------|--------------|----------|-----------------|--------|
| Unused component | `smart-school-fn/src/components/FeatureCard.tsx` | Low | Remove file; `FeatureCard` is never imported anywhere | Pending |
| Unused component | `smart-school-fn/src/components/Lessons.tsx` | Low | Remove file; duplicate Lessons component never imported (used one is in `Dashboards/sections/Lessons.tsx`) | Pending |
| Unused component | `smart-school-fn/src/components/headers/authHeader.tsx` | Low | Remove file; `AuthHeader` defined but never imported | Pending |
| Unused component | `smart-school-fn/src/components/common/Loading.tsx` | Low | Remove file; `PageLoader` defined but never imported | Pending |
| Unused component | `smart-school-fn/src/components/common/ProtectedRoute.tsx` | Medium | Remove file; duplicate ProtectedRoute using Redux auth, never imported. Project uses `src/routes/ProtectedRoute.tsx` instead | Pending |
| Unused component | `smart-school-fn/src/components/common/SEOHead.tsx` | Low | Remove file; `SEOHead` never imported | Pending |
| Unused component | `smart-school-fn/src/components/test/TestTypeNavigation.tsx` | Low | Remove file; never imported | Pending |
| Unused component | `smart-school-fn/src/components/ui/loadingAndError.tsx` | Low | Remove file; `StatusMessage` never imported | Pending |
| Unused component | `smart-school-fn/src/Dashboards/sections/Placeholder.tsx` | Low | Remove file; `Placeholder` never imported | Pending |
| Unused component | `smart-school-fn/src/pages/cources/test.tsx` | Low | Remove file; mock quiz component for dev only, not imported in any route | Pending |
| Duplicate Redux slice | `smart-school-fn/src/redux/features/categories/categorySlice.ts` | High | Remove or merge with `courses/category.ts`. Both define same async thunks (`fetchCategories`, `createCategory`) with identical action names, causing runtime conflicts. Only `courses/category.ts` is registered in the store | Pending |
| Unused Redux state | `smart-school-fn/src/redux/features/studentAuth.ts` | Medium | Slice is in store but actions (`studentLogout`, `updateStudentProfile`) never dispatched. No component reads `state.studentAuth`. `studentAuthActions.ts` async thunk also never called. Student pages use direct API calls | Pending |
| Confusing route mapping | `smart-school-fn/src/Dashboards/sections/Jobs.tsx` exports `JobBoard` but route path `/dashboard/content` renders it | Low | Rename route path from `content` to `job-board` or rename component to `Content` for clarity | Pending |
| Unused utility | `smart-school-fn/src/utils/axiosClient.ts` | Low | Remove or adopt as primary API client; never imported (project uses `redux/api/api.ts`) | Pending |
| Unused types | `smart-school-fn/src/types/index.ts` | Low | Remove; `Program` type never imported | Pending |
| Unused types | `smart-school-fn/src/types/test.ts` | Low | Remove; test-related types never imported | Pending |
| Unused schema | `smart-school-fn/src/schema/courseScema.ts` | Low | Remove; `courseSchema` yup validation never imported. Filename has typo ("Scema" vs "Schema") | Pending |
| Unused asset | `smart-school-fn/src/assets/basgo.png` | Low | Remove; never imported | Pending |
| Unused asset | `smart-school-fn/src/assets/rayonSport.png` | Low | Remove; never imported | Pending |
| Unused asset | `smart-school-fn/src/assets/facebook.png` | Low | Remove; never imported | Pending |
| Unused asset | `smart-school-fn/src/assets/blessed night.jpg` | Low | Remove; never imported (filename with spaces causes tooling issues) | Pending |
| Unused asset | `smart-school-fn/src/assets/nbglogo.png` | Low | Verify; Sidebar uses URL path `/nbglogo.png` (public folder), not import. Move to `public/` if needed | Pending |
| Unused constant | `smart-school-fn/src/constants/animation.ts` | Low | Remove or import; `fadeInUp` defined here but never imported (About.tsx defines its own local version) | Pending |
| Typo in filename | `smart-school-fn/src/components/Skeletons/LessonSekleton.tsx` | Low | Rename to `LessonSkeleton.tsx` ("Sekleton" -> "Skeleton") | Pending |
| Typo in filename | `smart-school-fn/src/schema/courseScema.ts` | Low | Rename to `courseSchema.ts` ("Scema" -> "Schema") | Pending |
| Typo in directory name | `smart-school-fn/src/pages/cources/` | Low | Rename to `courses/` ("cources" -> "courses") | Pending |

## Backend Issues

| Issue | File Location | Severity | Recommended Fix | Status |
|-------|--------------|----------|-----------------|--------|
| Typo in filename | `smart-school-bn/src/controller/dashbord.controller.ts` | Low | Rename to `dashboard.controller.ts` (missing 'a') | Pending |
| No controller for health check | Health check inline in main `index.ts` rather than in a dedicated controller | Low | Extract health check logic to a controller for consistency | Pending |
| Unused schema import check | `smart-school-bn/src/schema/courseSchema.ts` | Low | Verify this backend course validation schema is imported; appears unused in route files | Pending |

## Database Issues

| Issue | File Location | Severity | Recommended Fix | Status |
|-------|--------------|----------|-----------------|--------|
| Missing index | `Lesson` model: `courseId` FK | Medium | Add `@@index([courseId])` - frequently queried | Pending |
| Missing index | `LessonContent` model: `lessonId` FK | Medium | Add `@@index([lessonId])` | Pending |
| Missing index | `Payment` model: `userId` FK | Medium | Add `@@index([userId])` | Pending |
| Missing index | `Answer` model: `testAttemptId`, `questionId` FKs | Medium | Add `@@index([testAttemptId])` and `@@index([questionId])` | Pending |
| Missing index | `ActivityLog` model: `userId` FK, `createdAt` | Medium | Add `@@index([userId])` and `@@index([createdAt])` - table can grow large | Pending |
| Missing index | `Notification` model: `courseId`, `testId` FKs | Low | Add `@@index([courseId])` and `@@index([testId])` | Pending |
| Missing index | `JobPost` model: `jobCategoryId` FK | Low | Add `@@index([jobCategoryId])` | Pending |
| Missing index | `QuestionOption` model: `questionId` FK | Low | Add `@@index([questionId])` | Pending |
| Missing index | `Enrollment` model: `userId`, `courseId` FKs | Medium | Add individual `@@index([userId])` and `@@index([courseId])` | Pending |
| Missing index | `Course` model: `instructorId`, `categoryId` FKs | Medium | Add `@@index([instructorId])` and `@@index([categoryId])` | Pending |
| Missing index | `ExamAnswer` model: `markedBy`, `userId` FKs | Low | Add `@@index([markedBy])` and `@@index([userId])` | Pending |
| Missing index | `StudentEnrollment` model: `courseId` FK | Low | Add `@@index([courseId])` | Pending |
| Missing index | `StudentProgress` model: `lessonId` FK | Low | Add `@@index([lessonId])` | Pending |
| Missing index | `AssessmentScore` model: `enteredBy` FK | Low | Add `@@index([enteredBy])` | Pending |
| Missing index | `Attendance` model: `recordedBy` FK | Low | Add `@@index([recordedBy])` | Pending |
| Missing index | `ResultSubmission` model: `submittedBy`, `approvedBy` FKs | Low | Add `@@index([submittedBy])` and `@@index([approvedBy])` | Pending |
| Missing index | `TeacherSubjectAssignment`: `teacherStaffId`, `classId`, `subjectId` FKs | Medium | Add individual indexes on each FK | Pending |
| Missing index | `StudentClassEnrollment`: `classId`, `academicYearId` FKs | Low | Add individual indexes | Pending |
| No unused tables | All models in Prisma schema are referenced in service/controller code | N/A | N/A - all tables appear in use | OK |

## Summary

- **Frontend**: 15+ unused components/files, 1 duplicate Redux slice with naming conflicts, 1 unused Redux slice, 5 unused assets, multiple typographical errors in filenames, and minor route-to-component naming mismatches.
- **Backend**: Minor typo in filename (`dashbord.controller.ts`). No unused controllers, services, or routes. All models actively referenced.
- **Database**: 18 foreign key fields missing individual indexes, impacting query performance at scale. No unused tables detected.
