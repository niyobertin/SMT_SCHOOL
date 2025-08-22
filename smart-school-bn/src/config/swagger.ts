import { Express } from "express";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { logger } from "../utils/logger";
// Swagger definition
const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Smart school API",
    version: "1.0.0",
    description:
      "This is the API documentation for the Smart school application.",
    contact: {
      name: "API Support",
      email: "support@example.com",
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
  },
  servers: [
    {
      url: process.env.API_BASE_URL || "http://localhost:3000",
      description: "Development server",
    },
    {
      url: "https://api.yourdomain.com",
      description: "Production server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
      apiKey: {
        type: "apiKey",
        in: "header",
        name: "X-API-Key",
      },
    },
    schemas: {
      Error: {
        type: "object",
        required: ["status", "message"],
        properties: {
          status: {
            type: "string",
            example: "error",
          },
          message: {
            type: "string",
            example: "Something went wrong",
          },
          timestamp: {
            type: "string",
            format: "date-time",
            example: "2023-12-01T10:00:00.000Z",
          },
          errors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                field: {
                  type: "string",
                },
                message: {
                  type: "string",
                },
              },
            },
          },
        },
      },
      Success: {
        type: "object",
        required: ["status", "message"],
        properties: {
          status: {
            type: "string",
            example: "success",
          },
          message: {
            type: "string",
            example: "Operation completed successfully",
          },
          data: {
            type: "object",
          },
          timestamp: {
            type: "string",
            format: "date-time",
            example: "2023-12-01T10:00:00.000Z",
          },
        },
      },
      User: {
        type: "object",
        required: ["id", "email", "name"],
        properties: {
          id: {
            type: "integer",
            example: 1,
          },
          email: {
            type: "string",
            format: "email",
            example: "user@example.com",
          },
          name: {
            type: "string",
            example: "John Doe",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            example: "2023-12-01T10:00:00.000Z",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            example: "2023-12-01T10:00:00.000Z",
          },
        },
      },
      CreateUserRequest: {
        type: "object",
        required: ["email", "name", "password"],
        properties: {
          email: {
            type: "string",
            format: "email",
            example: "user@example.com",
          },
          name: {
            type: "string",
            example: "John Doe",
          },
          password: {
            type: "string",
            minLength: 6,
            example: "password123",
          },
        },
      },
      HealthCheck: {
        type: "object",
        properties: {
          status: {
            type: "string",
            example: "OK",
          },
          timestamp: {
            type: "string",
            format: "date-time",
          },
          uptime: {
            type: "number",
            example: 12345.67,
          },
          version: {
            type: "string",
            example: "1.0.0",
          },
          environment: {
            type: "string",
            example: "development",
          },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

// Options for swagger-jsdoc
const swaggerOptions = {
  definition: swaggerDefinition,
  apis: [
    "./src/routes/*.ts",
    "./src/controllers/*.ts",
    "./src/middleware/*.ts",
  ],
};

// Generate swagger specification
const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Swagger UI options
const swaggerUiOptions = {
  customCss: `
    .swagger-ui .topbar { display: none; }
    .swagger-ui .info hgroup.main h2 { color: #3b82f6; }
  `,
  customSiteTitle: "Smart school API Docs",
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    defaultModelsExpandDepth: 2,
    defaultModelExpandDepth: 2,
  },
};

export const swaggerSetup = (app: Express): void => {
  try {
    // Serve swagger documentation
    app.use(
      "/api-docs",
      swaggerUi.serve,
      swaggerUi.setup(swaggerSpec, swaggerUiOptions)
    );

    // Serve swagger JSON
    app.get("/swagger.json", (req, res) => {
      res.setHeader("Content-Type", "application/json");
      res.send(swaggerSpec);
    });

    logger.info("Swagger documentation setup completed");
  } catch (error) {
    logger.error("Failed to setup Swagger documentation:", error);
  }
};

export { swaggerSpec };
