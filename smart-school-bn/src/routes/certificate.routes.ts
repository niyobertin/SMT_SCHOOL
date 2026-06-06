import express from "express";
import { authenticate } from "../middleware/auth";
import { catchAsync } from "../utils/errors";
import {
  generateCertificate,
  getUserCertificates,
  getCertificateById,
  verifyCertificate,
} from "../controller/certificate.controller";

const router = express.Router();

router.post("/generate", authenticate, catchAsync(generateCertificate));
router.get("/my", authenticate, catchAsync(getUserCertificates));
router.get("/:id", authenticate, catchAsync(getCertificateById));
router.get("/verify/:certificateNumber", catchAsync(verifyCertificate));

export default router;
