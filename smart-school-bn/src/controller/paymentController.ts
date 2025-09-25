import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { getAccessToken } from "../services/paypackAuth";
import { pollPendingPaymentsJob } from "../utils/jobs";
import { logActivity } from "../helper/activitylogs";
const prisma = new PrismaClient();

export const cashin = async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
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
        const { data } = await axios.post(
            `${process.env.PAYPACK_BASE_URL}/transactions/cashin`,
            { amount, number: phoneNumber },
            {
                headers: {
                    Authorization: `Bearer ${access}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-Webhook-Mode": "production",
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
        pollPendingPaymentsJob();
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
        const page = req.query.page || 1;
        const limit = req.query.limit || 10;
        const skip = (page as number - 1) * (limit as number);
        const payments = await prisma.payment.findMany({
            skip,
            take: limit as number,
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
