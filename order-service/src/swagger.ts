import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "Order Service API",
      version: "1.0.0",
      description:
        "Customer and seller order management APIs for the multi-seller e-commerce marketplace.",
    },

    servers: [
      {
        url: "http://localhost:6005",
        description: "Order Service - Direct",
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
          description:
            "Seller JWT access token stored in an HTTP-only cookie.",
        },

        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "JWT access token supplied through the Authorization header.",
        },
      },
    },
  },

  apis: [
    "./order-service/src/routes/*.ts",
    "./order-service/src/controllers/*.ts",
  ],
};

const swaggerSpec =
  swaggerJsdoc(options);

export default swaggerSpec;