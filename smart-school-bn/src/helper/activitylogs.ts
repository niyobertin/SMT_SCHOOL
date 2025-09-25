import { logger } from "../utils/logger";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const logActivity = async (userId: string, action: string, details: string, ip: string) => {
    try {
        await prisma.activityLog.create({
            data: { userId, action, details, ip }
        });
    } catch (error) {
        logger.error("Failed to log activity", error);
    }
}