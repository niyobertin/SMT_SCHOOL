import { body } from "express-validator";

export const categoryValidation = [
  body("name")
    .notEmpty()
    .withMessage("Category name is required"),

  body("description")
    .optional()
    .isString()
    .withMessage("Category description must be a string"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("Category isActive must be a boolean"),
];

export const updateCategoryValidation = [
  body("name")
    .optional()
    .isString()
    .withMessage("Category name must be a string"),

  body("description")
    .optional()
    .isString()
    .withMessage("Category description must be a string"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("Category isActive must be a boolean"),
];
