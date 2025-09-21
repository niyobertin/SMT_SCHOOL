import { Router } from "express";
import { cashin } from "../controller/paymentController";
import { authenticate } from "../middleware/auth";

const paymentRouter = Router();
paymentRouter.post("/cashin", authenticate, cashin);

export default paymentRouter;