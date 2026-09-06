import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "Product Service API",
      version: "1.0.0",
      description: "Product Microservice APIs",
    },

    servers: [
      {
        url: "http://localhost:6002",
        description: "Product Service - Direct",
      },
      {
        url: "http://localhost:8080",
        description: "API Gateway",
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "JWT access token supplied through the Authorization header.",
        },

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
      },
    },

    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  apis: [
    "./product-service/src/routes/*.ts",
    "./product-service/src/controllers/*.ts",
  ],
};

const specs =
  swaggerJsdoc(options);

console.log(
  "Swagger Paths:",
  (specs as any).paths
);

export default specs;