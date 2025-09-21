import { Server, Socket } from 'socket.io';
import logger from "./logger";

let io: Server;
export const initSocket = (server: any) => {
    logger.info("Socket.io initialized");
    io = new Server(server, { cors: { origin: '*' } });

    io.on("connection", (socket: Socket) => {
        logger.info("Client connected:", socket.id);

        // Client joins a transaction room
        socket.on("joinTransaction", ({ transactionId }) => {
            socket.join(transactionId);
            logger.info(`Client joined room: ${transactionId}`);
        });

        socket.on("disconnect", () => {
            logger.info("Client disconnected:", socket.id);
        });
    });

    return io;
}


export const getIO = (): Server => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
}
