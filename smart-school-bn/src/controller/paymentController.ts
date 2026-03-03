import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { getAccessToken } from "../services/paypackAuth";
// import { pollPendingPaymentsJob } from "../utils/jobs";
import { logActivity } from "../helper/activitylogs";
import { getIO } from '../utils/socketServer';
import { PaymentStatus } from '@prisma/client';
import crypto from 'crypto';
const prisma = new PrismaClient();

interface PaypackWebhookPayload {
    event_id: string;
    kind: string;
    data: {
        ref: string;
        user_ref: string;
        kind: string;
        fee: number;
        merchant: string;
        client: string;
        amount: number;
        provider: string;
        status: string;
        metadata: any;
        created_at: string;
        processed_at: string;
    };
    webhooks: string[];
    created_at: string;
}

const logWebhook = (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] WEBHOOK: ${message}`, data ? JSON.stringify(data, null, 2) : '');
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function findPaymentWithRetry(ref: string, retries = 3, delay = 2000) {
    for (let i = 0; i < retries; i++) {
        const payment = await prisma.payment.findFirst({
            where: {
                paypackRef: ref
            },
            include: {
                courses: true, // This brings PaymentCourse relation
                user: true
            },
        });

        if (payment) {
            return payment;
        }

        console.log(`Payment for ref ${ref} not found. Retrying in ${delay}ms... (${i + 1}/${retries})`);
        await sleep(delay);
    }
    return null;
}

async function handleProcessedTransaction(payload: PaypackWebhookPayload) {
    const { data } = payload;

    try {
        const payment = await findPaymentWithRetry(data.ref);

        if (!payment) {
            console.warn('[WEBHOOK] No payment found for reference:', data.ref);
            return;
        }

        if (payment.status === 'COMPLETED') {
            console.log(`[WEBHOOK] Payment ${data.ref} already completed. Skipping.`);
            return;
        }

        const mapPaypackStatusToPaymentStatus = (status: string): PaymentStatus => {
            const map: any = {
                successful: "COMPLETED",
                failed: "FAILED",
                pending: "PENDING",
                canceled: "CANCELED",
                cancelled: "CANCELLED",
                unpaid: "UNPAID",
                refunded: "REFUNDED",
            };
            return map[status.toLowerCase()] || "FAILED";
        };

        const newStatus = mapPaypackStatusToPaymentStatus(data.status);
        logWebhook(`Mapped status '${data.status}' to '${newStatus}'`);

        // Update Payment
        const updatedPayment = await prisma.payment.update({
            where: { id: payment.id },
            data: {
                status: newStatus,
                amount: data.amount,
                isActive: newStatus === "COMPLETED" ? true : payment.isActive,
                remainingPeriod: newStatus === "COMPLETED" ? (payment.subscriptionPeriod || 30) : payment.remainingPeriod,
            },
            include: { courses: true }
        });
        logWebhook("Payment updated", updatedPayment);

        /** -------------------------------------------
         *   PAYMENT SUCCESS → ACTIVATE ENROLLMENTS
         *  ------------------------------------------- */
        if (newStatus === "COMPLETED") {
            logWebhook("Payment successful, activating enrollments...");
            // Activate enrollments for all courses in this payment
            const enrollmentPromises = payment.courses.map(async (pc) => {
                return prisma.enrollment.upsert({
                    where: {
                        userId_courseId: {
                            userId: payment.userId,
                            courseId: pc.courseId
                        }
                    },
                    update: {
                        status: 'ACTIVE',
                        enrollmentDate: new Date(),
                        enrollementPeriod: payment.subscriptionPeriod || 30,
                        progress: 0
                    },
                    create: {
                        userId: payment.userId,
                        courseId: pc.courseId,
                        status: 'ACTIVE',
                        enrollementPeriod: payment.subscriptionPeriod || 30,
                        enrollmentDate: new Date(),
                        progress: 0
                    }
                });
            });

            await Promise.all(enrollmentPromises);
            logWebhook("Enrollments activated");
        }

        // Emit WebSocket event
        const io = getIO();
        const eventData = {
            event: 'payment:processed',
            status: newStatus,
            payment: {
                id: updatedPayment.id,
                amount: updatedPayment.amount,
                currency: updatedPayment.currency,
                reference: updatedPayment.paypackRef,
                status: updatedPayment.status,
                timestamp: new Date().toISOString()
            }
        };
        const roomName = `trx-${data.ref}`;
        logWebhook(`Emitting 'transactionUpdate' to room: ${roomName} and ${data.ref} and ${updatedPayment.id}`, eventData);
        io.to(roomName).emit('transactionUpdate', eventData);
        io.to(data.ref).emit('transactionUpdate', eventData);
        io.to(updatedPayment.id).emit('transactionUpdate', eventData);

        logWebhook(`Payment ${data.ref} processing complete.`);

    } catch (error) {
        console.error('[WEBHOOK] Error processing transaction:', error);
        throw error;
    }
}


export const handlePaypackWebhook = async (req: Request, res: Response) => {
    console.log(">>> WEBHOOK HIT. Method:", req.method, "Mode:", req.headers['x-webhook-mode']);
    try {
        const signature = req.get("X-Paypack-Signature");
        const webhookSecret = process.env.PAYPACK_WEBHOOK_SECRET;

        // Log headers and body for debugging
        logWebhook("Webhook received", { headers: req.headers, body: req.body });

        if (!webhookSecret) {
            logger.warn("[WEBHOOK] Missing PAYPACK_WEBHOOK_SECRET");
        } else if (signature) {
            const rawBody = req.rawBody;
            if (rawBody) {
                const hash = crypto
                    .createHmac("sha256", webhookSecret)
                    .update(rawBody)
                    .digest("base64");

                if (hash !== signature) {
                    logger.warn(`[WEBHOOK] Invalid signature. Computed: ${hash}, Received: ${signature}`);
                    return res.status(401).send("Invalid Signature");
                } else {
                    logWebhook("Signature verified successfully");
                }
            } else {
                logger.warn("[WEBHOOK] No rawBody found for signature verification");
            }
        }

        const payload = req.body as PaypackWebhookPayload;

        // Process 'transaction:processed' events (or check if data has ref)
        if (payload.data && payload.data.ref) {
            // Process asynchronously
            handleProcessedTransaction(payload).catch(err => {
                console.error("[WEBHOOK] Async processing failed", err);
            });
        } else {
            logWebhook("Payload missing reference or data", payload);
        }

        res.status(200).send('Webhook received');
    } catch (error: any) {
        console.error('[WEBHOOK] Error in webhook handler:', error);
        res.status(500).json({
            error: 'Error processing webhook',
            message: error.message
        });
    }
};
export const cashin = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const { amount, phoneNumber, channel, subscribedCourseIds, subscriptionPeriod, isActive } = req.body;
    try {
        // 1. Create the payment
        const payment = await prisma.payment.create({
            data: {
                id: uuidv4(),
                amount,
                channel,
                userId,
                status: "PENDING",
                courses: {
                    create: subscribedCourseIds.map((courseId: string) => ({
                        courseId,
                    })),
                },
                subscriptionPeriod,
                isActive,
            },
            include: { courses: true },
        });
        const { access } = await getAccessToken();
        const webhookMode = process.env.PAYPACK_WEBHOOK_MODE || "development";
        console.log("Initiating Cashin with Webhook Mode:", webhookMode);

        const { data } = await axios.post(
            `${process.env.PAYPACK_BASE_URL}/transactions/cashin`,
            { amount, number: phoneNumber },
            {
                headers: {
                    Authorization: `Bearer ${access}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-Webhook-Mode": `${webhookMode}`,
                },
            }
        );
        await prisma.payment.update({
            where: { id: payment.id },
            data: {
                paypackRef: data.ref,
                status: "PENDING",
            },
        });
        logActivity(userId, "PAYMENT", "Payment initialized", req.ip || "");
        logger.info("Payment created", payment);
        // pollPendingPaymentsJob(); // Removing polling as per requirement
        // 4. Return response
        res.json({
            message: "Payment initialized successfully",
            paymentId: payment.id,
            paypackRef: data.ref,
            courses: payment.courses,
        });
    } catch (error: any) {
        next(error);
    }
}

export const getPayments = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;
        const payments = await prisma.payment.findMany({
            skip,
            take: limit,
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        phoneNumber: true,
                    }
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        const total = await prisma.payment.count();
        const active = await prisma.payment.count({
            where: { isActive: true },
        });
        const pending = await prisma.payment.count({
            where: { status: "PENDING" },
        });
        const completed = await prisma.payment.count({
            where: { status: "COMPLETED" },
        });
        const failed = await prisma.payment.count({
            where: { status: "FAILED" },
        });
        const amount = await prisma.payment.aggregate({
            where: { status: "COMPLETED" },
            _sum: { amount: true },
        });
        res.status(200).json({
            payments,
            page,
            limit,
            total,
            active,
            pending,
            completed,
            failed,
            amount: amount._sum.amount,
        });
    } catch (error: any) {
        next(error);
    }
}
