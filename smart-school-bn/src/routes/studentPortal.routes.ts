import { Router } from "express";
import { authenticateStudent } from "../middleware/studentAuth";
import { studentPortalController } from "../controller/studentPortal.controller";

const router = Router();

router.get(
    "/available-tests",
    authenticateStudent,
    studentPortalController.listAvailableTests
);

export default router;
