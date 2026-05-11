import "reflect-metadata";
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";

import http from "http";
import passport from "passport";
import "./config/passport";
import session from "express-session";
import { logger } from "./utils/logger";
import { errorHandler } from "./middleware/errorHandler";
import { requestLogger } from "./middleware/requestLogger";
import { healthCheck } from "./middleware/healthCheck";
import { swaggerSetup } from "./config/swagger";
import router from "./routes";
import YouTubeUploader from "./helper/youtubeUploader";
import { initSocket } from "./utils/socketServer";
import { startUpdateRemainingDaysJob } from "./utils/jobs";


const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

initSocket(server);
// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  })
);

// Compression middleware
app.use(compression() as any);

// Body parsing middleware
app.use(express.json({
  limit: "10mb",
  verify: (req: any, res, buf) => {
    req.rawBody = buf.toString();
  }
}));
app.use(express.urlencoded({ extended: true }));

// @ts-ignore
app.use(session({
  secret: process.env.SESSION_SECRET || "keyboard cat",
  resave: false,
  saveUninitialized: false,
}));
// Passport middleware
// @ts-ignore
app.use(passport.initialize());
// @ts-ignore
app.use(passport.session());

// Request logging middleware
app.use(requestLogger);
// Health check endpoint
app.use("/health", healthCheck);

// Swagger documentation
swaggerSetup(app);

// API routes
app.use("/api", router);
const uploader = new YouTubeUploader();

// OAuth callback endpoint
app.get("/oauth2callback", async (req, res) => {
  const code = req.query.code as string;
  if (!code) return res.status(400).send("No code received.");

  try {
    await uploader.exchangeCodeForToken(code);
    res.send("YouTube authentication successful! You can close this tab.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error exchanging code.");
  }
});

// 404 handler
app.use("*", (req, res) => {
  logger.warn(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    status: "error",
    message: "Route not found",
    timestamp: new Date().toISOString(),
  });
});

// Global error handler
app.use(errorHandler);

startUpdateRemainingDaysJob();
// Graceful shutdown
const shutdown = (signal: string) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  server.close((err) => {
    if (err) {
      logger.error("Error during graceful shutdown:", err);
      process.exit(1);
    }

    logger.info("Server closed successfully");
    process.exit(0);
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 30000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// Start server
server.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
  logger.info(`API Documentation: http://localhost:${PORT}/api-docs`);
  logger.info(`Health Check: http://localhost:${PORT}/health`);
});

export default app;
