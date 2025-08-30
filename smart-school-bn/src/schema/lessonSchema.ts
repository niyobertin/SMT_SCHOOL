import { body } from "express-validator";

export const lessonValidation = [
    body("title").notEmpty().withMessage("Title is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("order").isInt().withMessage("Order must be an integer")
];

export const updateLessonValidation = [
    body("title").optional(),
    body("description").optional(),
    body("order").optional().isInt().withMessage("Order must be an integer"),
    body("isPreview").optional().isBoolean().withMessage("isPreview must be a boolean"),
    body("isPublished").optional().isBoolean().withMessage("isPublished must be a boolean")
];