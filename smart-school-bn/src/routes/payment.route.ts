import { Router } from "express";
import { cashin, getPayments } from "../controller/paymentController";
import { authenticate } from "../middleware/auth";

const paymentRouter = Router();
paymentRouter.post("/cashin", authenticate, cashin);
paymentRouter.get("/", authenticate, getPayments);

export default paymentRouter;