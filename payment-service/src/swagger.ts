import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

import type { Express } from "express";

// ======================================================
// SWAGGER DOCUMENT
// ======================================================

const swaggerDocument = swaggerJsdoc({
  definition: {
    openapi: "3.0.3",

    info: {
      title: "Payment Service API",

      version: "1.0.0",

      description:
        "Razorpay checkout, payment verification, seller earnings and internal settlement APIs.",
    },

    servers: [
      {
        url: "http://localhost:6006",

        description: "Payment Service - Direct",
      },

      {
        url: "http://localhost:8080",

        description: "API Gateway",
      },
    ],

    components: {
      securitySchemes: {
        userCookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "user_access_token",
          description:
            "Customer JWT access token stored in an HTTP-only cookie.",
        },

        sellerCookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "seller_access_token",
          description: "Seller JWT access token stored in an HTTP-only cookie.",
        },

        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },

  apis: [
    "./payment-service/src/routes/*.ts",
    "./payment-service/src/routes/*.js",
  ],
});

// ======================================================
// REGISTER SWAGGER
// ======================================================

export const setupSwagger = (app: Express) => {
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {
      customSiteTitle: "Payment Service API Docs",

      swaggerOptions: {
        persistAuthorization: true,

        displayRequestDuration: true,

        filter: true,
      },
    }),
  );

  app.get("/api-docs.json", (_req, res) => {
    return res.json(swaggerDocument);
  });
};
