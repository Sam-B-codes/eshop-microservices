import swaggerJsdoc from "swagger-jsdoc";

// ======================================================
// SWAGGER CONFIGURATION
// ======================================================

const swaggerSpec =
  swaggerJsdoc({
    definition: {
      openapi:
        "3.0.3",

      info: {
        title:
          "Eshop Chat Service API",

        version:
          "1.0.0",

        description:
          "Order-based conversations between Eshop customers and sellers.",
      },

      servers: [
        {
          url:
            "http://localhost:6009",

          description:
            "Local Chat Service",
        },
      ],

      tags: [
        {
          name:
            "Chat",

          description:
            "Customer and seller conversations",
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
        },

        schemas: {
          CreateConversationInput: {
            type:
              "object",

            required: [
              "orderId",
              "sellerId",
            ],

            properties: {
              orderId: {
                type:
                  "string",

                example:
                  "6aa6964afd9723b1d64cefa8",
              },

              sellerId: {
                type:
                  "string",

                example:
                  "6a64aa1361b2bc25f9a9d308",
              },
            },
          },

          SendMessageInput: {
            type:
              "object",

            required: [
              "content",
            ],

            properties: {
              content: {
                type:
                  "string",

                maxLength:
                  2000,

                example:
                  "Hello, when will my order be shipped?",
              },
            },
          },
        },
      },

      paths: {
        "/api/chats": {
          post: {
            tags: [
              "Chat",
            ],

            summary:
              "Create or reuse an order conversation",

            description:
              "Only the authenticated customer who owns a paid order can create its seller conversation.",

            security: [
              {
                bearerAuth: [],
              },
            ],

            requestBody: {
              required:
                true,

              content: {
                "application/json": {
                  schema: {
                    $ref:
                      "#/components/schemas/CreateConversationInput",
                  },
                },
              },
            },

            responses: {
              "200": {
                description:
                  "Conversation ready",
              },

              "400": {
                description:
                  "Invalid request",
              },

              "401": {
                description:
                  "Authentication required",
              },

              "404": {
                description:
                  "Paid order or seller not found",
              },
            },
          },

          get: {
            tags: [
              "Chat",
            ],

            summary:
              "List authenticated actor conversations",

            security: [
              {
                bearerAuth: [],
              },
            ],

            parameters: [
              {
                in:
                  "query",

                name:
                  "page",

                schema: {
                  type:
                    "integer",

                  minimum:
                    1,

                  default:
                    1,
                },
              },

              {
                in:
                  "query",

                name:
                  "limit",

                schema: {
                  type:
                    "integer",

                  minimum:
                    1,

                  maximum:
                    50,

                  default:
                    20,
                },
              },
            ],

            responses: {
              "200": {
                description:
                  "Conversations fetched",
              },

              "401": {
                description:
                  "Authentication required",
              },
            },
          },
        },

        "/api/chats/unread-count": {
          get: {
            tags: [
              "Chat",
            ],

            summary:
              "Get total unread message count",

            security: [
              {
                bearerAuth: [],
              },
            ],

            responses: {
              "200": {
                description:
                  "Unread count fetched",
              },

              "401": {
                description:
                  "Authentication required",
              },
            },
          },
        },

        "/api/chats/{conversationId}": {
          get: {
            tags: [
              "Chat",
            ],

            summary:
              "Get conversation and messages",

            security: [
              {
                bearerAuth: [],
              },
            ],

            parameters: [
              {
                in:
                  "path",

                name:
                  "conversationId",

                required:
                  true,

                schema: {
                  type:
                    "string",
                },
              },

              {
                in:
                  "query",

                name:
                  "page",

                schema: {
                  type:
                    "integer",

                  minimum:
                    1,

                  default:
                    1,
                },
              },

              {
                in:
                  "query",

                name:
                  "limit",

                schema: {
                  type:
                    "integer",

                  minimum:
                    1,

                  maximum:
                    50,

                  default:
                    20,
                },
              },
            ],

            responses: {
              "200": {
                description:
                  "Messages fetched",
              },

              "404": {
                description:
                  "Conversation not found",
              },
            },
          },
        },

        "/api/chats/{conversationId}/messages": {
          post: {
            tags: [
              "Chat",
            ],

            summary:
              "Send a text message",

            security: [
              {
                bearerAuth: [],
              },
            ],

            parameters: [
              {
                in:
                  "path",

                name:
                  "conversationId",

                required:
                  true,

                schema: {
                  type:
                    "string",
                },
              },
            ],

            requestBody: {
              required:
                true,

              content: {
                "application/json": {
                  schema: {
                    $ref:
                      "#/components/schemas/SendMessageInput",
                  },
                },
              },
            },

            responses: {
              "201": {
                description:
                  "Message sent",
              },

              "400": {
                description:
                  "Invalid message",
              },

              "404": {
                description:
                  "Conversation not found",
              },
            },
          },
        },

        "/api/chats/{conversationId}/read": {
          patch: {
            tags: [
              "Chat",
            ],

            summary:
              "Mark received messages as read",

            security: [
              {
                bearerAuth: [],
              },
            ],

            parameters: [
              {
                in:
                  "path",

                name:
                  "conversationId",

                required:
                  true,

                schema: {
                  type:
                    "string",
                },
              },
            ],

            responses: {
              "200": {
                description:
                  "Conversation marked as read",
              },

              "404": {
                description:
                  "Conversation not found",
              },
            },
          },
        },
      },
    },

    apis: [],
  });

export default swaggerSpec;