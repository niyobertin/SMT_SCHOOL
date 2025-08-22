# Express TypeScript API

A well-structured Express.js API with TypeScript, Swagger documentation (no YAML files), comprehensive middleware, and advanced logging monitoring.

## 🚀 Features

- **TypeScript** - Full type safety and modern JavaScript features
- **Swagger Documentation** - Auto-generated from JSDoc comments (no YAML files needed)
- **Winston Logging** - Daily log rotation, structured logging, and performance monitoring
- **Security** - Helmet, CORS, rate limiting, and input validation
- **Middleware Stack** - Error handling, request logging, authentication, and performance monitoring
- **Development Tools** - ESLint, hot reload, and comprehensive debugging

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd express-typescript-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`

## 📚 API Documentation

- **Swagger UI**: `http://localhost:3000/api-docs`
- **JSON Spec**: `http://localhost:3000/swagger.json`
- **Health Check**: `http://localhost:3000/health`

## 🗂️ Project Structure

```
src/
├── config/          # Configuration files
│   └── swagger.ts   # Swagger setup (no YAML needed)
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── routes/          # Route definitions
├── utils/           # Utility functions
│   └── logger.ts    # Winston logging configuration
└── index.ts         # Application entry point
```

## 🔧 Available Scripts

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm start            # Start production server
npm run start:dev    # Start with ts-node
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm test             # Run tests
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile (protected)
- `POST /api/auth/logout` - User logout (protected)

### Users
- `GET /api/users` - Get all users (paginated)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### System
- `GET /health` - Health check
- `GET /api` - API information

## 🔐 Authentication

The API uses Bearer token authentication. Include the token in the Authorization header:

```bash
Authorization: Bearer your-token-here
```

For demo purposes, use:
- **Email**: `demo@example.com`
- **Password**: `password123`
- **Demo Token**: `demo-token`

## 📝 Logging

### Log Levels
- `error` - Error messages
- `warn` - Warning messages  
- `info` - General information
- `http` - HTTP request logs
- `debug` - Debug information

### Log Files
- `logs/application-YYYY-MM-DD.log` - General logs
- `logs/error-YYYY-MM-DD.log` - Error logs only
- `logs/exceptions-YYYY-MM-DD.log` - Uncaught exceptions

### Features
- Daily log rotation
- 20MB max file size
- Configurable retention periods
- Structured JSON logging
- Performance monitoring

## 🛡️ Security Features

- **Helmet.js** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - 100 requests per 15 minutes
- **Input Validation** - Request data validation
- **Error Handling** - Centralized error management

## 🔧 Configuration

### Environment Variables

```env
PORT=3000
NODE_ENV=development
LOG_LEVEL=info
JWT_SECRET=your-jwt-secret
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

### TypeScript Configuration

- ES2020 target
- Strict type checking
- Path aliases for clean imports
- Decorator support

## 📖 Adding New Endpoints

1. **Create a controller** with Swagger documentation:
   ```typescript
   /**
    * @swagger
    * /api/example:
    *   get:
    *     summary: Example endpoint
    *     responses:
    *       200:
    *         description: Success
    */
   export const exampleController = async (req, res, next) => {
     // Implementation
   };
   ```

2. **Create routes** with validation:
   ```typescript
   import { Router } from 'express';
   import { validateRequest } from '../middleware';
   
   const router = Router();
   router.get('/', validateRequest, exampleController);
   ```

3. **Register routes** in `src/routes/index.ts`

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 🚀 Production Deployment

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Set production environment**:
   ```bash
   export NODE_ENV=production
   ```

3. **Start the server**:
   ```bash
   npm start
   ```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔍 Monitoring

### Health Check
- Endpoint: `GET /health`
- Returns: Server status, uptime, memory usage, and environment info

### Performance Monitoring
- Slow request detection (>1000ms)
- Memory usage tracking
- Request duration logging
- Error rate monitoring

## 📈 Next Steps

- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] JWT authentication implementation
- [ ] File upload support
- [ ] Redis caching
- [ ] Background job processing
- [ ] Prometheus metrics
- [ ] Unit and integration tests
- [ ] CI/CD pipeline

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions, please open an issue in the GitHub repository.

---

Built with 🤝 using Express.js, TypeScript, and modern development practices.