import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { NotFoundError } from "../utils/errors";
import { generateCertificatePDF } from "../utils/pdfGenerator";
import { uploadBufferToCloudinary } from "../config/cloudinary";

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

    const result = await issueCertificateForTest(testId, testAttemptId, userId);
    res.status(result.status === "exists" ? 200 : 201).json({
      status: "success",
      data: result.certificate,
      message: result.message,
    });
  } catch (error: any) {
    if (error.message?.includes("does not meet")) {
      res.status(400).json({ status: "error", message: error.message });
      return;
    }
    if (error.message?.includes("not found")) {
      res.status(404).json({ status: "error", message: error.message });
      return;
    }
    if (error.message?.includes("Forbidden")) {
      res.status(403).json({ status: "error", message: error.message });
      return;
    }
    next(error);
  }
};

export const issueCertificateForTest = async (
  testId: string,
  testAttemptId: string,
  userId: string,
): Promise<{ certificate: any; message: string; status: string }> => {
  const testAttempt = await prisma.testAttempt.findUnique({
    where: { id: testAttemptId },
    include: {
      test: true,
      user: { select: { firstName: true, lastName: true } },
    },
  });

  if (!testAttempt) {
    throw new Error("Test attempt not found");
  }

  if (testAttempt.userId !== userId) {
    throw new Error("Forbidden");
  }

  const passingScore = testAttempt.test.passingScore || 70;
  if ((testAttempt.score || 0) < passingScore) {
    throw new Error(
      `Score ${testAttempt.score}% does not meet the passing threshold of ${passingScore}%`
    );
  }

  const existingCert = await prisma.certificate.findFirst({
    where: { userId, certificationId: testId, status: "ACTIVE" },
  });

  if (existingCert) {
    return { certificate: existingCert, message: "Certificate already exists", status: "exists" };
  }

  const certificateNumber = generateCertificateNumber();
  const qrCode = generateQRCodeUrl(certificateNumber);
  const completionDate = new Date().toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
  const fullName = `${testAttempt.user.firstName} ${testAttempt.user.lastName}`;

  // Generate PDF buffer
  const pdfBuffer = await generateCertificatePDF(
    fullName,
    testAttempt.test.title,
    completionDate,
    certificateNumber,
    testAttempt.score || 0,
    passingScore,
  );

  // Upload to Cloudinary
  let pdfUrl: string | null = null;
  try {
    pdfUrl = await uploadBufferToCloudinary(
      pdfBuffer,
      "application/pdf",
      `certificate_${certificateNumber}.pdf`,
    );
  } catch (uploadError) {
    console.error("Certificate PDF upload failed:", uploadError);
  }

  const certificate = await prisma.certificate.create({
    data: {
      userId,
      certificationId: testId,
      certificationName: testAttempt.test.title,
      certificateNumber,
      score: testAttempt.score || 0,
      pdfUrl,
      qrCode,
      status: "ACTIVE",
    },
  });

  return { certificate, message: "Certificate generated automatically", status: "created" };
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

export const issueCertificateForExam = async (
  examId: string,
  attemptId: string,
  candidateId: string,
): Promise<{ certificate: any; message: string }> => {
  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
    include: {
      exam: true,
      candidate: true,
    },
  });

  if (!attempt) {
    throw new Error("Exam attempt not found");
  }

  if (!attempt.isPassed) {
    throw new Error(`Score ${attempt.score}% does not meet the passing threshold of ${attempt.exam.passingScore}%`);
  }

  // Find an admin user from the exam's organization to own the certificate
  const orgAdmin = await prisma.userOrganization.findFirst({
    where: { organizationId: attempt.exam.organizationId },
    include: { user: { select: { id: true, role: true } } },
  });

  if (!orgAdmin) {
    throw new Error("No organization admin found to issue certificate");
  }

  const certificateNumber = generateCertificateNumber();
  const qrCode = generateQRCodeUrl(certificateNumber);
  const candidateName = `${attempt.candidate.firstName} ${attempt.candidate.lastName}`;
  const completionDate = new Date().toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  // Generate PDF
  const pdfBuffer = await generateCertificatePDF(
    candidateName,
    attempt.exam.title,
    completionDate,
    certificateNumber,
    attempt.score || 0,
    attempt.exam.passingScore,
  );

  let pdfUrl: string | null = null;
  try {
    pdfUrl = await uploadBufferToCloudinary(
      pdfBuffer, "application/pdf", `certificate_${certificateNumber}.pdf`,
    );
  } catch (err) {
    console.error("Certificate PDF upload failed:", err);
  }

  const certificate = await prisma.certificate.create({
    data: {
      userId: orgAdmin.user.id,
      certificationId: examId,
      certificationName: `${candidateName} - ${attempt.exam.title}`,
      certificateNumber,
      score: attempt.score || 0,
      pdfUrl,
      qrCode,
      status: "ACTIVE",
    },
  });

  return { certificate, message: "Certificate generated" };
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
