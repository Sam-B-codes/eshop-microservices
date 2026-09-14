import path from "path";

import swaggerJsdoc from "swagger-jsdoc";

// ======================================================
// NORMALIZE GLOB PATH
// ======================================================

const normalizeGlobPath = (
  value: string
): string => {
  return value.replace(
    /\\/g,
    "/"
  );
};

// ======================================================
// ROUTE SOURCES
// ======================================================

const workspaceRoutePath =
  normalizeGlobPath(
    path.resolve(
      process.cwd(),
      "notification-service/src/routes/**/*.ts"
    )
  );

const serviceRoutePath =
  normalizeGlobPath(
    path.resolve(
      process.cwd(),
      "src/routes/**/*.ts"
    )
  );

// ======================================================
// SWAGGER DEFINITION
// ======================================================

const definition = {
  openapi:
    "3.0.3",

  info: {
    title:
      "Eshop Notification Service API",

    version:
      "1.0.0",

    description:
      "Notifications for Eshop users, sellers, administrators, and trusted internal services.",
  },

  servers: [
    {
      url:
        "http://localhost:6008",

      description:
        "Local Notification Service",
    },
  ],

  tags: [
    {
      name:
        "User Notifications",
    },
    {
      name:
        "Seller Notifications",
    },
    {
      name:
        "Admin Notifications",
    },
    {
      name:
        "Internal Notifications",
    },
  ],

  components: {
    securitySchemes: {
      bearerAuth: {
        type:
          "http",

        scheme:
          "bearer",

        bearerFormat:
          "JWT",
      },

      userCookieAuth: {
        type:
          "apiKey",

        in:
          "cookie",

        name:
          "user_access_token",
      },

      sellerCookieAuth: {
        type:
          "apiKey",

        in:
          "cookie",

        name:
          "seller_access_token",
      },

      adminCookieAuth: {
        type:
          "apiKey",

        in:
          "cookie",

        name:
          "admin_access_token",
      },

      internalApiKey: {
        type:
          "apiKey",

        in:
          "header",

        name:
          "x-internal-api-key",
      },
    },

    schemas: {
      Notification: {
        type:
          "object",

        properties: {
          id: {
            type:
              "string",
          },

          recipientId: {
            type:
              "string",
          },

          recipientRole: {
            type:
              "string",

            enum: [
              "USER",
              "SELLER",
              "ADMIN",
            ],
          },

          type: {
            type:
              "string",

            enum: [
              "PAYMENT_SUCCESS",
              "NEW_PAID_ORDER",
              "ORDER_STATUS_UPDATED",
              "NEW_REVIEW",
              "SELLER_REPLY",
              "PAYMENT_RECEIVED",
            ],
          },

          title: {
            type:
              "string",
          },

          message: {
            type:
              "string",
          },

          actionUrl: {
            type:
              "string",

            nullable:
              true,
          },

          metadata: {
            type:
              "object",

            nullable:
              true,

            additionalProperties:
              true,
          },

          idempotencyKey: {
            type:
              "string",
          },

          isRead: {
            type:
              "boolean",
          },

          readAt: {
            type:
              "string",

            format:
              "date-time",

            nullable:
              true,
          },

          createdAt: {
            type:
              "string",

            format:
              "date-time",
          },

          updatedAt: {
            type:
              "string",

            format:
              "date-time",
          },
        },
      },

      ErrorResponse: {
        type:
          "object",

        properties: {
          success: {
            type:
              "boolean",

            example:
              false,
          },

          message: {
            type:
              "string",

            example:
              "Request could not be completed",
          },
        },
      },
    },
  },
} as const;

// ======================================================
// SWAGGER SPECIFICATION
// ======================================================

const swaggerSpec =
  swaggerJsdoc({
    definition,

    apis: [
      workspaceRoutePath,
      serviceRoutePath,
    ],
  });

export default swaggerSpec;