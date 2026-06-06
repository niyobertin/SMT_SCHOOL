import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { NotFoundError } from "../utils/errors";

const prisma = new PrismaClient();

function generateCertificateNumber(): string {
  const prefix = "JER";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export const generateCertificate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { certificationId, score } = req.body;
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

    const certificate = await prisma.certificate.create({
      data: {
        userId,
        certificationId,
        certificateNumber: generateCertificateNumber(),
        score,
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
        score: certificate.score,
        issuedAt: certificate.issuedAt,
        status: certificate.status,
      },
      valid: true,
    });
  } catch (error) {
    next(error);
  }
};
