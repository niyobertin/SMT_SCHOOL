import { Router } from "express";
import {
  createLevel,
  getLevelsByCourse,
  getCourseLevelProgress,
  getLevelById,
  updateLevel,
  reorderLevels,
  deleteLevel,
  unlockLevelForUser,
} from "../controller/level.controller";
import { authenticate, authorize, optionalAuthenticate } from "../middleware/auth";
import { uploadFile } from "../middleware/uploadFile";
import { catchAsync } from "../utils/errors";

const levelRouter = Router();

levelRouter.post(
  "/course/:courseId",
  authenticate,
  authorize("ADMIN", "INSTRUCTOR"),
  uploadFile,
  catchAsync(createLevel)
);
levelRouter.get("/course/:courseId", optionalAuthenticate, catchAsync(getLevelsByCourse));
levelRouter.get("/course/:courseId/progress", authenticate, catchAsync(getCourseLevelProgress));
levelRouter.patch(
  "/course/:courseId/reorder",
  authenticate,
  authorize("ADMIN", "INSTRUCTOR"),
  catchAsync(reorderLevels)
);
levelRouter.get("/:levelId", optionalAuthenticate, catchAsync(getLevelById));
levelRouter.patch(
  "/:levelId",
  authenticate,
  authorize("ADMIN", "INSTRUCTOR"),
  uploadFile,
  catchAsync(updateLevel)
);
levelRouter.delete("/:levelId", authenticate, authorize("ADMIN", "INSTRUCTOR"), catchAsync(deleteLevel));
levelRouter.post(
  "/:levelId/unlock",
  authenticate,
  authorize("ADMIN"),
  catchAsync(unlockLevelForUser)
);

export default levelRouter;
