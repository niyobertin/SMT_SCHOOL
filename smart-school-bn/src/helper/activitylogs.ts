import { logger } from "../utils/logger";
import prisma from "../services/prisma.singleton";

export const logActivity = async (userId: string, action: string, details: string, ip: string) => {
    try {
        await prisma.activityLog.create({
            data: { userId, action, details, ip }
        });
    } catch (error) {
        logger.error("Failed to log activity", error);
    }
}