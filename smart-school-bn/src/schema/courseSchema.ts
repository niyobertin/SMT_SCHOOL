import { body } from "express-validator";

export const courseValidation = [
    body("title").notEmpty().withMessage("Title is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("shortDescription").notEmpty().withMessage("Short description is required"),
    body("thumbnail").notEmpty().withMessage("Thumbnail is required"),
    body("language").notEmpty().withMessage("Language is required"),
    body("level").notEmpty().withMessage("Level is required"),
    body("status").notEmpty().withMessage("Status is required"),
    body("isPublished").notEmpty().withMessage("Is published is required"),
    body("isFeatured").notEmpty().withMessage("Is featured is required"),
    body("tags").optional({ checkFalsy: true }),
    body("requirements").optional({ checkFalsy: true }),
    body("objectives").optional({ checkFalsy: true })
];

export const updateCourseValidation = [
    body("title").optional(),
    body("description").optional(),
    body("shortDescription").optional(),
    body("thumbnail").optional(),
    body("language").optional(),
    body("level").optional(),
    body("status").optional(),
    body("isPublished").optional(),
    body("isFeatured").optional(),
    body("tags").optional(),
    body("requirements").optional(),
    body("objectives").optional()
];