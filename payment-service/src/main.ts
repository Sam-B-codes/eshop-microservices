import dotenv from "dotenv";

dotenv.config();

import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";

import cors from "cors";
import cookieParser from "cookie-parser";

import paymentRoutes from "./routes/payment.routes";
import sellerPaymentRoutes from "./routes/seller-payment.routes";

import {
  setupSwagger,
} from "./swagger";

// ======================================================
// APP
// ======================================================

const app = express();

// ======================================================
// PORT
// ======================================================

const PORT =
  Number(
    process.env.PAYMENT_SERVICE_PORT ??
      process.env.PORT
  ) || 6006;

// ======================================================
// ALLOWED ORIGINS
// ======================================================

const allowedOrigins = (
  process.env.CORS_ORIGINS ??
  [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
  ].join(",")
)
  .split(",")
  .map((origin) =>
    origin.trim().replace(/\/+$/, "")
  )
  .filter(Boolean);

// ======================================================
// REVERSE PROXY
// ======================================================

app.set("trust proxy", 1);

// ======================================================
// CORS
// ======================================================

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin =
        origin.replace(/\/+$/, "");

      if (
        allowedOrigins.includes(
          normalizedOrigin
        )
      ) {
        return callback(null, true);
      }

      return callback(
        new Error(
          `Origin ${origin} is not allowed by CORS`
        )
      );
    },

    credentials: true,

    allowedHeaders: [
      "Authorization",
      "Content-Type",
    ],

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],
  })
);

// ======================================================
// BODY MIDDLEWARE
// ======================================================

app.use(
  express.json({
    limit: "1mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  })
);

app.use(cookieParser());

// ======================================================
// SWAGGER
// ======================================================

setupSwagger(app);

// ======================================================
// ROOT
// ======================================================

app.get(
  "/",
  (_req: Request, res: Response) => {
    return res.status(200).json({
      success: true,
      message:
        "Payment Service is running",
    });
  }
);

// ======================================================
// HEALTH CHECK
// ======================================================

app.get(
  "/health",
  (_req: Request, res: Response) => {
    return res.status(200).json({
      success: true,
      service: "payment-service",
      status: "healthy",
    });
  }
);

// ======================================================
// SELLER PAYMENT ROUTES
// ======================================================

app.use(
  "/api/payments/seller",
  sellerPaymentRoutes
);

// ======================================================
// CUSTOMER PAYMENT ROUTES
// ======================================================

app.use(
  "/api/payments",
  paymentRoutes
);

// ======================================================
// 404 HANDLER
// ======================================================

app.use(
  (req: Request, res: Response) => {
    return res.status(404).json({
      success: false,
      message:
        `Route ${req.method} ${req.originalUrl} not found`,
    });
  }
);

// ======================================================
// GLOBAL ERROR HANDLER
// ======================================================

app.use(
  (
    error: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
  ) => {
    void _next;

    console.error(
      "Payment Service Error:",
      error
    );

    const normalizedError =
      error as {
        statusCode?: number;
        status?: number;
        message?: string;
      };

    const statusCode =
      normalizedError.statusCode ??
      normalizedError.status ??
      500;

    const message =
      normalizedError.message ??
      "Internal server error";

    return res
      .status(statusCode)
      .json({
        success: false,
        message,
      });
  }
);

// ======================================================
// LOCAL SERVER
// ======================================================

if (process.env.VERCEL !== "1") {
  const server = app.listen(
    PORT,
    "0.0.0.0",
    () => {
      console.log(
        `Payment Service running on port ${PORT}`
      );
      console.log(
        `Swagger: http://localhost:${PORT}/api-docs`
      );
    }
  );

  server.on("error", (error) => {
    console.error(
      "Payment Service server error:",
      error
    );
  });
}

// ======================================================
// SERVERLESS EXPORT
// ======================================================

export default app;