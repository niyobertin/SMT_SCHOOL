import { pollPendingPayments } from "../helper/pullPaymentEvent";
import cron from "node-cron";
import { updateRemainingDays } from "../helper/pullPaymentEvent";
import { deleteOldFailedPayments } from "../helper/pullPaymentEvent";

// Declare the cron job instance
let pendingPaymentsCron: any = null;

export const pollPendingPaymentsJob = () => {
    if (!pendingPaymentsCron) {
        pendingPaymentsCron = cron.schedule("*/5 * * * * *", async () => {
            console.log("⏰ Running Paypack polling job...");
            await pollPendingPayments();
        });
        pendingPaymentsCron.start();
    }
    return pendingPaymentsCron;
};

export const stopPendingPaymentsJob = () => {
    if (pendingPaymentsCron) {
        console.log("🛑 Stopping Paypack polling job...");
        pendingPaymentsCron.stop();
        pendingPaymentsCron = null;
    }
};


export const startUpdateRemainingDaysJob = () => {
    const job = cron.schedule(" 0 0 * * *", async () => {
        console.log("⏰ Running remaining days update job...");
        await updateRemainingDays();
        await deleteOldFailedPayments();
    });

    job.start();
    return job;
};  