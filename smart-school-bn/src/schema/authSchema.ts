import { body } from "express-validator";


export const loginValidation = [
  body("identifier")
    .notEmpty()
    .withMessage("Email or phone number is required"),
  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];

export const registerValidation = [
    body().custom((value, { req }) => {
      if (!req.body.email && !req.body.phoneNumber) {
        throw new Error("Either email or phone number is required");
      }
      return true;
    }),
  
    body("email")
      .optional()
      .isEmail()
      .optional({ nullable: true, checkFalsy: true })
      .withMessage("Valid email is required"),
  
      body("phoneNumber")
      .optional({ nullable: true, checkFalsy: true })
      .isMobilePhone("any")
      .withMessage("Invalid phone number"),
    
    body("username").notEmpty().withMessage("Username is required"),
    body("firstName").notEmpty().withMessage("First name is required"),
    body("lastName").notEmpty().withMessage("Last name is required"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
    body("role")
      .isIn(["ADMIN", "TEACHER", "STUDENT"])
      .withMessage("Invalid role"),
  ];
  

export const resetPasswordValidation = [
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
  
    body("confirmPassword")
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Passwords do not match");
        }
        return true;
      }),
  ];
export const forgotPasswordValidation = [
    body("identifier")
    .notEmpty()
    .withMessage("Email or phone number is required"),
  ];