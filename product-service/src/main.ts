import dotenv from "dotenv";

dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";

import {
  errorMiddleware,
} from "@org/error-handler";

import uploadRoutes from "./routes/upload.routes";
import productRoutes from "./routes/product.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import cartRoutes from "./routes/cart.routes";
import wishlistRoutes from "./routes/wishlist.routes";
import reviewRoutes from "./routes/review.routes";
import specs from "./swagger";

// ======================================================
// APP
// ======================================================

const app = express();

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
app.use(morgan("dev"));

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

app.use(
  "/api/upload",
  uploadRoutes
);

app.use(
  "/api/products",
  productRoutes
);

app.use(
  "/api/cart",
  cartRoutes
);

app.use(
  "/api/wishlist",
  wishlistRoutes
);

app.use(
  "/api/reviews",
  reviewRoutes
);

app.use(
  "/api/seller/dashboard",
  dashboardRoutes
);

// ======================================================
// HEALTH CHECK
// ======================================================

app.get("/health", (_req, res) => {
  return res.status(200).json({
    success: true,
    service: "Product Service",
    message:
      "Product Service is running",
  });
});

// ======================================================
// 404 HANDLER
// ======================================================

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message:
      `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// ======================================================
// GLOBAL ERROR HANDLER
// ======================================================

app.use(errorMiddleware);

// ======================================================
// LOCAL SERVER
// ======================================================

const PORT =
  Number(process.env.PORT) || 6002;

if (process.env.VERCEL !== "1") {
  const server = app.listen(
    PORT,
    "0.0.0.0",
    () => {
      console.log(
        `Product Service running on port ${PORT}`
      );
      console.log(
        `Health: http://localhost:${PORT}/health`
      );
      console.log(
        `Swagger: http://localhost:${PORT}/api-docs`
      );
    }
  );

  server.on("error", (error) => {
    console.error(
      "Product Service server error:",
      error
    );
  });
}

// ======================================================
// SERVERLESS EXPORT
// ======================================================

export default app;