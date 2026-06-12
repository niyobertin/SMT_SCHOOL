import { Router } from "express";
import { sendContactMessage } from "../controller/contact.controller";

const router = Router();

router.post("/contact", sendContactMessage);

export default router;
