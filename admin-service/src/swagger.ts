import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.3",

    info: {
      title: "Eshop Admin Service API",

      version: "1.0.0",

      description:
        "Administration APIs for Eshop marketplace management and analytics.",
    },

    servers: [
      {
        url: "http://localhost:6007",

        description: "Admin Service",
      },
      {
        url: "http://localhost:8080",

        description: "API Gateway",
      },
    ],

    components: {
      securitySchemes: {
        adminCookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "admin_access_token",
        },

        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },

  apis: ["./admin-service/src/routes/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
