import dotenv from "dotenv";

dotenv.config();

import express, {
  type Request,
  type Response,
} from "express";

import cookieParser from "cookie-parser";
import cors from "cors";
import * as path from "path";

import couponRoutes from "./routes/coupon.routes";

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
  Number(process.env.PORT) || 6004;

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
// BODY AND COOKIE MIDDLEWARE
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

// Used during local development.
// Vercel ignores express.static().
app.use(
  "/assets",
  express.static(
    path.join(__dirname, "assets")
  )
);

// ======================================================
// SWAGGER
// ======================================================

setupSwagger(app);

// ======================================================
// ROUTES
// ======================================================

app.use(
  "/api/coupons",
  couponRoutes
);

// ======================================================
// HEALTH
// ======================================================

app.get(
  "/coupon-health",
  (_req: Request, res: Response) => {
    return res.status(200).json({
      success: true,
      service: "Coupon Service",
      message:
        "Coupon Service is running successfully",
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
        `Coupon Service running on port ${PORT}`
      );

      console.log(
        `Swagger: http://localhost:${PORT}/api-docs`
      );

      console.log(
        `Health: http://localhost:${PORT}/coupon-health`
      );
    }
  );

  server.on("error", (error) => {
    console.error(
      "Coupon Service server error:",
      error
    );
  });
}

// ======================================================
// SERVERLESS EXPORT
// ======================================================

export default app;