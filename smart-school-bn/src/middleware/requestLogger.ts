import morgan from "morgan";
import { loggerStream } from "../utils/logger";
morgan.token("response-time-ms", (req: any, res: any) => {
  if (!req._startAt) return "0";
  const diff = process.hrtime(req._startAt);
  return `${(diff[0] * 1000 + diff[1] / 1e6).toFixed(2)}ms`;
});
morgan.format("with-response-time", (tokens, req: any, res: any) => {
  if (!req._startAt) req._startAt = process.hrtime();
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, "content-length"),
    "-",
    tokens["response-time-ms"](req, res),
  ].join(" ");
});

export const requestLogger = morgan("with-response-time", {
  stream: loggerStream,
  skip: (req) => req.url === "/health" || req.url === "/metrics",
});
