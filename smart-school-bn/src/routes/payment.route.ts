import { Router } from "express";
import { cashin, getPayments, handlePaypackWebhook } from "../controller/paymentController";
import { authenticate } from "../middleware/auth";

const paymentRouter = Router();
paymentRouter.post("/cashin", authenticate, cashin);
paymentRouter.post("/webhook", handlePaypackWebhook);
paymentRouter.head("/webhook", (req, res) => {
    res.status(200).send();
});
paymentRouter.get("/", authenticate, getPayments);

export default paymentRouter;