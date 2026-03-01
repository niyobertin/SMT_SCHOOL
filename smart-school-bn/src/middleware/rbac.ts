/**
 * Centralized RBAC helpers.
 *
 * Instead of repeating `authorize('SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR', 'EXAMINER')`
 * across every route file, use these named helpers. This makes role changes
 * a single-file edit rather than a grep-and-replace across 17 route files.
 */
import { authorize } from './auth';

/** Only SUPER_ADMIN and ADMIN */
export const forAdmin = authorize('SUPER_ADMIN', 'ADMIN');

/** All exam staff: SUPER_ADMIN, ADMIN, INSTRUCTOR, EXAMINER */
export const forExamStaff = authorize('SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR', 'EXAMINER');

/** LMS instructors and above: SUPER_ADMIN, ADMIN, INSTRUCTOR */
export const forInstructor = authorize('SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR');

/** Students and above (anyone authenticated) */
export const forStudent = authorize('SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR', 'STUDENT', 'EXAMINER');
