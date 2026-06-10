import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { NotFoundError } from "../utils/errors";

const prisma = new PrismaClient();

const BASE_URL = process.env.FRONTEND_URL || "https://jobexam.rw";

function generateCertificateNumber(): string {
  const prefix = "JER";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

function generateQRCodeUrl(certificateNumber: string): string {
  return `${BASE_URL}/certificates/verify/${certificateNumber}`;
}

export const generateCertificate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { certificationId, score, certificationName } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({ status: "error", message: "Unauthorized" });
      return;
    }

    const passingThreshold = 70;
    if (score < passingThreshold) {
      res.status(400).json({
        status: "error",
        message: `Score ${score}% does not meet the passing threshold of ${passingThreshold}%`,
      });
      return;
    }

    const existingCert = await prisma.certificate.findFirst({
      where: { userId, certificationId, status: "ACTIVE" },
    });

    if (existingCert) {
      res.status(200).json({
        status: "success",
        data: existingCert,
        message: "Certificate already exists",
      });
      return;
    }

    const certificateNumber = generateCertificateNumber();
    const qrCode = generateQRCodeUrl(certificateNumber);

    const certificate = await prisma.certificate.create({
      data: {
        userId,
        certificationId,
        certificateNumber,
        certificationName: certificationName || null,
        score,
        qrCode,
        status: "ACTIVE",
      },
    });

    res.status(201).json({
      status: "success",
      data: certificate,
      message: "Certificate generated successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const autoGenerateCertificate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { testId, testAttemptId } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({ status: "error", message: "Unauthorized" });
      return;
    }

    const testAttempt = await prisma.testAttempt.findUnique({
      where: { id: testAttemptId },
      include: { test: true },
    });

    if (!testAttempt) {
      res.status(404).json({ status: "error", message: "Test attempt not found" });
      return;
    }

    if (testAttempt.userId !== userId) {
      res.status(403).json({ status: "error", message: "Forbidden" });
      return;
    }

    const passingScore = testAttempt.test.passingScore || 70;
    if ((testAttempt.score || 0) < passingScore) {
      res.status(400).json({
        status: "error",
        message: `Score ${testAttempt.score}% does not meet the passing threshold of ${passingScore}%`,
      });
      return;
    }

    const existingCert = await prisma.certificate.findFirst({
      where: { userId, certificationId: testId, status: "ACTIVE" },
    });

    if (existingCert) {
      res.status(200).json({
        status: "success",
        data: existingCert,
        message: "Certificate already exists",
      });
      return;
    }

    const certificateNumber = generateCertificateNumber();
    const qrCode = generateQRCodeUrl(certificateNumber);

    const certificate = await prisma.certificate.create({
      data: {
        userId,
        certificationId: testId,
        certificationName: testAttempt.test.title,
        certificateNumber,
        score: testAttempt.score || 0,
        qrCode,
        status: "ACTIVE",
      },
    });

    res.status(201).json({
      status: "success",
      data: certificate,
      message: "Certificate generated automatically",
    });
  } catch (error) {
    next(error);
  }
};

export const getUserCertificates = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({ status: "error", message: "Unauthorized" });
      return;
    }

    const certificates = await prisma.certificate.findMany({
      where: { userId },
      orderBy: { issuedAt: "desc" },
    });

    res.status(200).json({
      status: "success",
      data: certificates,
    });
  } catch (error) {
    next(error);
  }
};

export const getCertificateById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    const certificate = await prisma.certificate.findFirst({
      where: { id, userId },
    });

    if (!certificate) {
      throw new NotFoundError("Certificate not found");
    }

    res.status(200).json({
      status: "success",
      data: certificate,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyCertificate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { certificateNumber } = req.params;

    const certificate = await prisma.certificate.findUnique({
      where: { certificateNumber },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!certificate) {
      res.status(404).json({
        status: "error",
        message: "Certificate not found or invalid",
        valid: false,
      });
      return;
    }

    if (certificate.status !== "ACTIVE") {
      res.status(400).json({
        status: "error",
        message: "Certificate has been revoked or expired",
        valid: false,
      });
      return;
    }

    res.status(200).json({
      status: "success",
      data: {
        certificateNumber: certificate.certificateNumber,
        fullName: `${certificate.user.firstName} ${certificate.user.lastName}`,
        certificationId: certificate.certificationId,
        certificationName: certificate.certificationName,
        score: certificate.score,
        issuedAt: certificate.issuedAt,
        status: certificate.status,
        qrCode: certificate.qrCode,
      },
      valid: true,
    });
  } catch (error) {
    next(error);
  }
};
