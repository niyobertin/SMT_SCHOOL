import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { getAccessToken } from "../services/paypackAuth";

const prisma = new PrismaClient();

export const cashin = async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const userId = req.user?.id;
    const { amount, phoneNumber, channel, subscribedCourseIds, subscriptionPeriod, isActive } = req.body;
    const remainingPeriod = subscriptionPeriod;
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
                remainingPeriod,
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

        logger.info("Payment created", payment);
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
