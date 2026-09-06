import dotenv from "dotenv";

dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";

import {
  errorMiddleware,
} from "@org/error-handler";

import router from "./routes/auth.router";
import specs from "./swagger";

// ======================================================
// APP
// ======================================================

const app = express();

const isProduction =
  process.env.NODE_ENV === "production";

// ======================================================
// CORS ORIGINS
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
// MIDDLEWARE
// ======================================================

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

app.use(cookieParser());

// ======================================================
// HEALTH CHECK
// ======================================================

app.get("/", (_req, res) => {
  return res.status(200).json({
    success: true,
    service: "Auth Service",
    message:
      "Auth Service is running successfully",
    environment: isProduction
      ? "production"
      : "development",
  });
});

// ======================================================
// SWAGGER
// ======================================================

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs)
);

app.get("/docs-json", (_req, res) => {
  return res.json(specs);
});

// ======================================================
// ROUTES
// ======================================================

app.use("/api", router);

// ======================================================
// GLOBAL ERROR HANDLER
// ======================================================

app.use(errorMiddleware);

// ======================================================
// LOCAL SERVER
// ======================================================

const port =
  Number(process.env.PORT) || 6001;

if (process.env.VERCEL !== "1") {
  const server = app.listen(
    port,
    "0.0.0.0",
    () => {
      console.log(
        `Auth Service running on port ${port}`
      );
      console.log(
        `Swagger: http://localhost:${port}/api-docs`
      );
    }
  );

  server.on("error", (error) => {
    console.error(
      "Auth Service server error:",
      error
    );
  });
}

// ======================================================
// SERVERLESS EXPORT
// ======================================================

export default app;