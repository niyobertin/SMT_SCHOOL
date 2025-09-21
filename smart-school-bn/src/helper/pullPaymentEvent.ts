import { PrismaClient } from "@prisma/client";
import { getTransactionEvents } from "../utils/getPaymentEvent";
import logger from "../utils/logger";

const prisma = new PrismaClient();

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
                            const remainingPeriod = payment.remainingPeriod + payment.subscriptionPeriod;
                            const updatedPayment = await prisma.payment.update({
                                where: { id: payment.id },
                                data: {
                                    status,
                                    remainingPeriod,
                                    isActive: true
                                },
                            });
                            // create enrollments for each course
                            const paymentCourses = await prisma.paymentCourse.findMany({
                                where: { paymentId: payment.id },
                            });

                            for (const pc of paymentCourses) {
                                await prisma.enrollment.upsert({
                                    where: { userId_courseId: { userId: payment.userId, courseId: pc.courseId } },
                                    update: { status: "ACTIVE", enrollementPeriod: payment.subscriptionPeriod },
                                    create: {
                                        userId: payment.userId,
                                        courseId: pc.courseId,
                                        status: "ACTIVE",
                                        enrollementPeriod: payment.subscriptionPeriod
                                    },
                                });
                            }

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
