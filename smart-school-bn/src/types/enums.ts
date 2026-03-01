/**
 * Shared enums used across both the LMS (Test) and Exam systems.
 * These unify status strings that were previously hardcoded as literals
 * in both exam.controller.ts and test.controller.ts.
 */

export const AssessmentStatus = {
    DRAFT: 'DRAFT',
    PUBLISHED: 'PUBLISHED',
    ARCHIVED: 'ARCHIVED',
} as const;
export type AssessmentStatus = (typeof AssessmentStatus)[keyof typeof AssessmentStatus];

export const AttemptStatus = {
    IN_PROGRESS: 'IN_PROGRESS',
    SUBMITTED: 'SUBMITTED',
    TIMED_OUT: 'TIMED_OUT',
    GRADED: 'GRADED',
    PENDING_APPROVAL: 'PENDING_APPROVAL',
    APPROVED: 'APPROVED',
} as const;
export type AttemptStatus = (typeof AttemptStatus)[keyof typeof AttemptStatus];

export const QuestionType = {
    MULTIPLE_CHOICE: 'MULTIPLE_CHOICE',
    TRUE_FALSE: 'TRUE_FALSE',
    SHORT_ANSWER: 'SHORT_ANSWER',
    ESSAY: 'ESSAY',
    FILL_BLANK: 'FILL_BLANK',
} as const;
export type QuestionType = (typeof QuestionType)[keyof typeof QuestionType];

export const UserRole = {
    SUPER_ADMIN: 'SUPER_ADMIN',
    ADMIN: 'ADMIN',
    INSTRUCTOR: 'INSTRUCTOR',
    STUDENT: 'STUDENT',
    SELF_STUDENT: 'SELF_STUDENT',
    EXAMINER: 'EXAMINER',
    USER: 'USER',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const ShowResultsPolicy = {
    AFTER_COMPLETION: 'AFTER_COMPLETION',
    AFTER_GRADING: 'AFTER_GRADING',
    NEVER: 'NEVER',
} as const;
export type ShowResultsPolicy = (typeof ShowResultsPolicy)[keyof typeof ShowResultsPolicy];
