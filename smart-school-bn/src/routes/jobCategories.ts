import { createJobCategory, deleteJobCategory, getJobCategories, getJobPostByCategory, updateJobCategory } from "../controller/jobPost.controller";
import { authenticate, authorize } from "../middleware/auth";
import { Router } from "express";

const jobCategoriesRouter = Router();

jobCategoriesRouter.get("/category/:slug", getJobPostByCategory);
jobCategoriesRouter.get("/", getJobCategories);
jobCategoriesRouter.delete("/category/:slug", authenticate, authorize("ADMIN"), deleteJobCategory);
jobCategoriesRouter.patch("/category/:slug", authenticate, authorize("ADMIN"), updateJobCategory);
jobCategoriesRouter.post("/category", authenticate, authorize("ADMIN"), createJobCategory);

export default jobCategoriesRouter;
