

// Request Logger Middleware
import morgan from 'morgan';
import { loggerStream } from '../utils/logger';

// Custom morgan token for response time in milliseconds
morgan.token('response-time-ms', (req: any, res: any) => {
  if (!req._startTime) return '0';
  const diff = process.hrtime(req._startTime);
  return `${(diff[0] * 1000 + diff[1] * 1e-6).toFixed(2)}ms`;
});

// Custom morgan format
const morganFormat = process.env.NODE_ENV === 'production'
  ? ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time-ms'
  : ':method :url :status :res[content-length] - :response-time-ms';

export const requestLogger = morgan(morganFormat, {
  stream: loggerStream,
  skip: (req) => {
    // Skip health check and metrics endpoints
    return req.url === '/health' || req.url === '/metrics';
  }
});