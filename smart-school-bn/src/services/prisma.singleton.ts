import { PrismaClient } from '@prisma/client';

// Ensure only one PrismaClient instance exists across the entire app.
// In development, hot-reload would create new instances on every reload
// without this singleton pattern, exhausting the DB connection pool.
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}

export default prisma;
