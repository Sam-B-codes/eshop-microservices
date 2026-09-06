import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',

    info: {
      title: 'Coupon Service API',
      version: '1.0.0',
      description: 'API documentation for the Coupon Microservice',
    },

    servers: [
      {
        url: 'http://localhost:6004',
        description: 'Local Coupon Service',
      },
    ],

    components: {
      securitySchemes: {
        sellerCookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'seller_access_token',
        },
      },

      schemas: {
        Coupon: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '66c123456789abcdef123456',
            },

            code: {
              type: 'string',
              example: 'SAVE20',
            },

            description: {
              type: 'string',
              example: '20% off on orders above ₹500',
            },

            discountType: {
              type: 'string',
              enum: ['PERCENTAGE', 'FIXED'],
              example: 'PERCENTAGE',
            },

            discountValue: {
              type: 'number',
              example: 20,
            },

            minimumOrderValue: {
              type: 'number',
              example: 500,
            },

            maximumDiscount: {
              type: 'number',
              example: 200,
            },

            usageLimit: {
              type: 'integer',
              example: 100,
            },

            usedCount: {
              type: 'integer',
              example: 0,
            },

            expiryDate: {
              type: 'string',
              format: 'date-time',
              example: '2026-08-30T23:59:59.000Z',
            },

            isActive: {
              type: 'boolean',
              example: true,
            },

            sellerId: {
              type: 'string',
              example: '66c123456789abcdef123456',
            },

            createdAt: {
              type: 'string',
              format: 'date-time',
            },

            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },

        CreateCouponRequest: {
          type: 'object',
          required: [
            'code',
            'discountType',
            'discountValue',
            'expiryDate',
          ],
          properties: {
            code: {
              type: 'string',
              example: 'SAVE20',
            },

            description: {
              type: 'string',
              example: '20% off on orders above ₹500',
            },

            discountType: {
              type: 'string',
              enum: ['PERCENTAGE', 'FIXED'],
              example: 'PERCENTAGE',
            },

            discountValue: {
              type: 'number',
              example: 20,
            },

            minimumOrderValue: {
              type: 'number',
              example: 500,
            },

            maximumDiscount: {
              type: 'number',
              example: 200,
            },

            usageLimit: {
              type: 'integer',
              example: 100,
            },

            expiryDate: {
              type: 'string',
              format: 'date-time',
              example: '2026-08-30T23:59:59.000Z',
            },
          },
        },
      },
    },
  },

  apis: ['./coupon-service/src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export const setupSwagger = (app: Express) => {
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
  );
};
