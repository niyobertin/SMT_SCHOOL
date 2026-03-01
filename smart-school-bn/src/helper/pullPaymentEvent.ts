import { getTransactionEvents } from "../utils/getPaymentEvent";
import logger from "../utils/logger";
import { stopPendingPaymentsJob } from "../utils/jobs";
import prisma from "../services/prisma.singleton";

export const pollPendingPayments = async () => {
    const { getIO } = await import("../utils/socketServer");
    const io = getIO();
    try {
        const pendingPayments = await prisma.payment.findMany({
            where: { status: "PENDING" },
        });

        if (pendingPayments.length === 0) {
            console.log("⏳ No pending payments found");
            return;
        }

        console.log(`🔍 Checking ${pendingPayments.length} pending payments...`);

        for (const payment of pendingPayments) {
            try {
                if (!payment.paypackRef) continue;

                const events = await getTransactionEvents(payment.paypackRef);

                if (!events.transactions || events.transactions.length === 0) {
                    continue;
                }

                for (const event of events.transactions) {
                    if (event.event_kind === "transaction:processed") {
                        const status =
                            event.data.status === "successful" ? "COMPLETED" : "FAILED";

                        if (payment.status !== status) {
                            const remainingPeriod =
                                payment.remainingPeriod + payment.subscriptionPeriod;

                            const updatedPayment = await prisma.payment.update({
                                where: { id: payment.id },
                                data: {
                                    status,
                                    remainingPeriod: status === "COMPLETED" ? payment.subscriptionPeriod : 0,
                                    isActive: status === "COMPLETED", // only mark active if completed
                                },
                            });

                            // ✅ Only create enrollments if COMPLETED
                            if (status === "COMPLETED") {
                                const paymentCourses = await prisma.paymentCourse.findMany({
                                    where: { paymentId: payment.id },
                                });

                                for (const pc of paymentCourses) {
                                    await prisma.enrollment.upsert({
                                        where: {
                                            userId_courseId: {
                                                userId: payment.userId,
                                                courseId: pc.courseId,
                                            },
                                        },
                                        update: {
                                            status: "ACTIVE",
                                            enrollementPeriod: payment.subscriptionPeriod,
                                        },
                                        create: {
                                            userId: payment.userId,
                                            courseId: pc.courseId,
                                            status: "ACTIVE",
                                            enrollementPeriod: payment.subscriptionPeriod,
                                        },
                                    });
                                }
                            }
                            stopPendingPaymentsJob();
                            logger.info(
                                `✅ Payment ${payment.id} updated to ${status} (ref: ${payment.paypackRef})`
                            );
                            io.to(payment.id).emit("transactionUpdate", {
                                transactionId: payment.id,
                                status,
                                amount: payment.amount,
                            });

                            break;
                        }
                    }
                }

            } catch (err: any) {
                logger.error(
                    `Error checking payment ${payment.id} (ref: ${payment.paypackRef}):`,
                    err.message
                );
                io.to(payment.id).emit("transactionUpdate", {
                    message: `Paying ${payment.amount} failed due to ${err.message} try again after some time`
                });
            }
        }
    } catch (err: any) {
        logger.error("Error polling pending payments:", err.message);
    }
};

export const updateRemainingDays = async () => {
    try {
        const payments = await prisma.payment.findMany({
            where: { status: "COMPLETED" },
            include: {
                courses: true
            }
        });

        const now = new Date();

        for (const payment of payments) {
            const createdAt = payment.createdAt;
            const subscriptionEnd = new Date(createdAt);
            subscriptionEnd.setDate(subscriptionEnd.getDate() + payment.subscriptionPeriod);

            const remainingDays = Math.max(
                Math.ceil((subscriptionEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
                0
            );

            await prisma.payment.update({
                where: { id: payment.id },
                data: { remainingPeriod: remainingDays },
            });

            if (payment.remainingPeriod === 0) {
                await prisma.payment.update({
                    where: { id: payment.id },
                    data: { isActive: false },
                });

                await prisma.enrollment.updateMany({
                    where: {
                        courseId: {
                            in: payment?.courses?.map((course) => course.courseId),
                        }
                    },
                    data: { status: "SUSPENDED" },
                });
            }
        }

        console.log(`✅ Updated remaining days for ${payments.length} payments.`);
    } catch (err: any) {
        console.error("Error updating remaining days:", err.message);
    }
};

export const deleteOldFailedPayments = async () => {
    try {
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2); // 2 days ago

        const payments = await prisma.payment.findMany({
            where: {
                status: "FAILED",
                createdAt: { lt: twoDaysAgo }, // older than 2 days
            },
        });

        for (const payment of payments) {
            await prisma.payment.delete({
                where: { id: payment.id },
            });
        }

        console.log(`✅ Deleted ${payments.length} failed payments older than 2 days.`);
    } catch (err: any) {
        console.error("Error deleting failed payments:", err.message);
    }
};
