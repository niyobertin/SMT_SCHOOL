import { body } from "express-validator";

// Login validation
export const loginValidation = [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email address"),
    body("password").notEmpty().withMessage("Password is required"),
  ];
  
  // Register validation
  export const registerValidation = [
    body("email").isEmail().withMessage("Valid email is required"),
    body("phoneNumber").notEmpty().withMessage("Phone number is required"),
    body("username").notEmpty().withMessage("Username is required"),
    body("firstName").notEmpty().withMessage("First name is required"),
    body("lastName").notEmpty().withMessage("Last name is required"),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
    body("role").isIn(["ADMIN", "TEACHER", "STUDENT"]).withMessage("Invalid role"),
  ];