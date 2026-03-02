import { body, param, query } from "express-validator";

export const createAssessmentSchema = [
    body("schoolId").isString().notEmpty().withMessage("schoolId is required"),
    body("classId").isString().notEmpty().withMessage("classId is required"),
    body("subjectId").isString().notEmpty().withMessage("subjectId is required"),
    body("term").isString().notEmpty().withMessage("term is required"),
    body("type").isIn(["EXAM", "TEST", "QUIZ", "ASSIGNMENT", "PRACTICAL"]).withMessage("Invalid assessment type"),
    body("maxScore").isFloat({ min: 1 }).withMessage("maxScore must be a positive number"),
    body("date").optional().isISO8601().withMessage("date must be a valid ISO8601 string"),
];

export const saveScoresSchema = [
    param("assessmentId").isString().notEmpty().withMessage("assessmentId is required in URL"),
    body("schoolId").isString().notEmpty().withMessage("schoolId is required in body for auth"),
    body("classId").isString().notEmpty().withMessage("classId is required in body for auth"),
    body("subjectId").isString().notEmpty().withMessage("subjectId is required in body for auth"),
    body("scores").isArray({ min: 1 }).withMessage("scores must be a non-empty array"),
    body("scores.*.studentId").isString().notEmpty().withMessage("studentId is required for each score"),
    body("scores.*.score").isFloat({ min: 0 }).withMessage("score must be a non-negative number"),
];

export const submitResultsSchema = [
    body("schoolId").isString().notEmpty().withMessage("schoolId is required"),
    body("classId").isString().notEmpty().withMessage("classId is required"),
    body("subjectId").optional().isString(), // Optional: if needed for specific teacher auth logic
    body("term").isString().notEmpty().withMessage("term is required"),
];

export const processApprovalSchema = [
    param("submissionId").isString().notEmpty().withMessage("submissionId is required in URL"),
    body("status").isIn(["APPROVED", "REJECTED"]).withMessage("Status must be either APPROVED or REJECTED"),
];
