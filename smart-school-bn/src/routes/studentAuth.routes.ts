import { Router } from "express";
import { authenticateStudent } from "../middleware/studentAuth";
import { studentAuthController } from "../controller/studentAuth.controller";

const router = Router();

router.post(
  "/login",
  studentAuthController.login
);

router.get(
  "/me",
  authenticateStudent,
  studentAuthController.getProfile
);

router.get(
  "/courses",
  authenticateStudent,
  studentAuthController.getAssignedCourses
);

router.post(
  "/refresh",
  authenticateStudent,
  studentAuthController.refreshToken
);

export default router;
