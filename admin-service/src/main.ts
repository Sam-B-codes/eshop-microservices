import dotenv from "dotenv";

dotenv.config();

import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";

import cookieParser from "cookie-parser";
import cors from "cors";
import swaggerUi from "swagger-ui-express";

import adminDashboardRoutes from "./routes/admin-dashboard.routes";
import adminUserRoutes from "./routes/admin-user.routes";
import adminSellerRoutes from "./routes/admin-seller.routes";
import adminProductRoutes from "./routes/admin-product.routes";
import adminCouponRoutes from "./routes/admin-coupon.routes";
import adminOrderRoutes from "./routes/admin-order.routes";
import adminPaymentRoutes from "./routes/admin-payment.routes";
import adminAnalyticsRoutes from "./routes/admin-analytics.routes";

import {
  swaggerSpec,
} from "./swagger";

// ======================================================
// APP
// ======================================================

const app = express();

const PORT =
  Number(
    process.env.ADMIN_SERVICE_PORT ??
      process.env.PORT
  ) || 6007;

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
// MIDDLEWARE
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
// ROOT
// ======================================================

app.get(
  "/",
  (_req: Request, res: Response) => {
    return res.status(200).json({
      success: true,
      message:
        "Admin Service is running",
    });
  }
);

// ======================================================
// HEALTH
// ======================================================

app.get(
  "/health",
  (_req: Request, res: Response) => {
    return res.status(200).json({
      success: true,
      service: "admin-service",
      status: "healthy",
    });
  }
);

// ======================================================
// SWAGGER
// ======================================================

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
  })
);

// ======================================================
// ADMIN ROUTES
// ======================================================

app.use(
  "/api/admin/dashboard",
  adminDashboardRoutes
);

app.use(
  "/api/admin/users",
  adminUserRoutes
);

app.use(
  "/api/admin/sellers",
  adminSellerRoutes
);

app.use(
  "/api/admin/products",
  adminProductRoutes
);

app.use(
  "/api/admin/coupons",
  adminCouponRoutes
);

app.use(
  "/api/admin/orders",
  adminOrderRoutes
);

app.use(
  "/api/admin/payments",
  adminPaymentRoutes
);

app.use(
  "/api/admin/analytics",
  adminAnalyticsRoutes
);

// ======================================================
// 404
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
// ERROR HANDLER
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
      "Admin Service Error:",
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
        `Admin Service running on port ${PORT}`
      );
      console.log(
        `Swagger: http://localhost:${PORT}/api-docs`
      );
    }
  );

  server.on("error", (error) => {
    console.error(
      "Admin Service server error:",
      error
    );
  });
}

// ======================================================
// SERVERLESS EXPORT
// ======================================================

export default app;