import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "Eshop Authentication Service API",
      version: "1.0.0",
      description:
        "Authentication APIs for customers, sellers and administrators.",
    },

    servers: [
      {
        url: "http://localhost:6001",
        description: "Local Auth Service",
      },
      {
        url: "http://localhost:8080",
        description: "Local API Gateway",
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "Enter an access token without the Bearer prefix.",
        },

        userCookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "user_access_token",
          description:
            "Customer HTTP-only access-token cookie.",
        },

        userRefreshCookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "user_refresh_token",
          description:
            "Customer HTTP-only refresh-token cookie.",
        },

        sellerCookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "seller_access_token",
          description:
            "Seller HTTP-only access-token cookie.",
        },

        sellerRefreshCookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "seller_refresh_token",
          description:
            "Seller HTTP-only refresh-token cookie.",
        },

        adminCookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "admin_access_token",
          description:
            "Administrator HTTP-only access-token cookie.",
        },

        adminRefreshCookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "admin_refresh_token",
          description:
            "Administrator HTTP-only refresh-token cookie.",
        },
      },
    },
  },

  apis: [
    "./apps/Auth-services/src/routes/*.ts",
    "./apps/Auth-services/src/controller/*.ts",
  ],
};

const specs = swaggerJsdoc(options);

export default specs;