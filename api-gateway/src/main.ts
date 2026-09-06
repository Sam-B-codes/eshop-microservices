import dotenv from "dotenv";

dotenv.config();

import express from "express";
import cors from "cors";
import proxy from "express-http-proxy";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import rateLimit, {
  ipKeyGenerator,
} from "express-rate-limit";

// ======================================================
// APP
// ======================================================

const app = express();

const isProduction =
  process.env.NODE_ENV ===
  "production";

// ======================================================
// ENVIRONMENT CONFIGURATION
// ======================================================

const normalizeUrl = (
  value: string | undefined,
  fallback: string
): string => {
  return (
    value
      ?.trim()
      .replace(/\/+$/, "") ||
    fallback
  );
};

const AUTH_SERVICE_URL =
  normalizeUrl(
    process.env
      .AUTH_SERVICE_URL,
    "http://localhost:6001"
  );

const PRODUCT_SERVICE_URL =
  normalizeUrl(
    process.env
      .PRODUCT_SERVICE_URL,
    "http://localhost:6002"
  );

const COUPON_SERVICE_URL =
  normalizeUrl(
    process.env
      .COUPON_SERVICE_URL,
    "http://localhost:6004"
  );

const ORDER_SERVICE_URL =
  normalizeUrl(
    process.env
      .ORDER_SERVICE_URL,
    "http://localhost:6005"
  );

const PAYMENT_SERVICE_URL =
  normalizeUrl(
    process.env
      .PAYMENT_SERVICE_URL,
    "http://localhost:6006"
  );

const ADMIN_SERVICE_URL =
  normalizeUrl(
    process.env
      .ADMIN_SERVICE_URL,
    "http://localhost:6007"
  );

// ======================================================
// CORS ORIGINS
// ======================================================

const allowedOrigins =
  (
    process.env.CORS_ORIGINS ||
    [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
    ].join(",")
  )
    .split(",")
    .map((origin) =>
      origin
        .trim()
        .replace(
          /\/+$/,
          ""
        )
    )
    .filter(Boolean);

// ======================================================
// TRUST REVERSE PROXY
// ======================================================

app.set(
  "trust proxy",
  1
);

// ======================================================
// CORS
// ======================================================

app.use(
  cors({
    origin(
      origin,
      callback
    ) {
      /*
       * Requests without an Origin
       * include server-to-server calls,
       * health checks and API clients.
       */
      if (!origin) {
        callback(
          null,
          true
        );

        return;
      }

      const normalizedOrigin =
        origin.replace(
          /\/+$/,
          ""
        );

      if (
        allowedOrigins.includes(
          normalizedOrigin
        )
      ) {
        callback(
          null,
          true
        );

        return;
      }

      callback(
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
// MIDDLEWARES
// ======================================================

app.use(
  cookieParser()
);

app.use(
  morgan(
    isProduction
      ? "combined"
      : "dev"
  )
);

app.use(
  express.json({
    limit: "100mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "100mb",
  })
);

// ======================================================
// RATE LIMITER
// ======================================================

const limiter =
  rateLimit({
    windowMs:
      15 * 60 * 1000,

    max:
      isProduction
        ? 300
        : 5000,

    message: {
      success: false,

      error:
        "Too many requests from this IP. Please try again later.",
    },

    standardHeaders: true,

    legacyHeaders: false,

    keyGenerator: (
      req
    ) =>
      ipKeyGenerator(
        req.ip || ""
      ),
  });

app.use(limiter);

// ======================================================
// HEALTH CHECK
// ======================================================

app.get(
  "/gateway-health",
  (_req, res) => {
    res.status(200).json({
      success: true,

      service:
        "API Gateway",

      message:
        "Gateway is running successfully",

      environment:
        isProduction
          ? "production"
          : "development",
    });
  }
);

// ======================================================
// SHARED SERVICE PROXY
// ======================================================

const createServiceProxy = (
  target: string
) =>
  proxy(target, {
    /*
     * Preserve the complete route.
     * Example:
     * /api/products remains
     * /api/products downstream.
     */
    proxyReqPathResolver(
      req
    ) {
      return req.originalUrl;
    },

    /*
     * Forward HTTP-only cookies
     * and optional Bearer tokens.
     */
    proxyReqOptDecorator(
      proxyReqOpts,
      srcReq
    ) {
      const cookie =
        srcReq.headers.cookie;

      const authorization =
        srcReq.headers
          .authorization;

      proxyReqOpts.headers =
        proxyReqOpts.headers ||
        {};

      if (cookie) {
        proxyReqOpts.headers.cookie =
          cookie;
      }

      if (authorization) {
        proxyReqOpts.headers.authorization =
          authorization;
      }

      return proxyReqOpts;
    },

    /*
     * Express has already parsed the
     * request body, so forward it.
     */
    proxyReqBodyDecorator(
      bodyContent
    ) {
      return bodyContent;
    },

    proxyErrorHandler(
      error,
      res,
      next
    ) {
      console.error(
        `Gateway proxy error for ${target}:`,
        error
      );

      if (
        !res.headersSent
      ) {
        res.status(502).json({
          success: false,

          message:
            "The requested service is temporarily unavailable.",
        });

        return;
      }

      next(error);
    },
  });

// ======================================================
// PRODUCT SERVICE
// ======================================================

app.use(
  [
    "/api/products",
    "/api/upload",
    "/api/seller/dashboard",
    "/api/cart",
    "/api/wishlist",
    "/api/reviews",
  ],

  createServiceProxy(
    PRODUCT_SERVICE_URL
  )
);

// ======================================================
// COUPON SERVICE
// ======================================================

app.use(
  "/api/coupons",

  createServiceProxy(
    COUPON_SERVICE_URL
  )
);

// ======================================================
// ORDER SERVICE
// ======================================================

app.use(
  "/api/orders",

  createServiceProxy(
    ORDER_SERVICE_URL
  )
);

// ======================================================
// PAYMENT SERVICE
// ======================================================

app.use(
  "/api/payments",

  createServiceProxy(
    PAYMENT_SERVICE_URL
  )
);

// ======================================================
// ADMIN SERVICE
// ======================================================

app.use(
  [
    "/api/admin/dashboard",
    "/api/admin/users",
    "/api/admin/sellers",
    "/api/admin/products",
    "/api/admin/orders",
    "/api/admin/payments",
    "/api/admin/coupons",
    "/api/admin/analytics",
  ],

  createServiceProxy(
    ADMIN_SERVICE_URL
  )
);

// ======================================================
// AUTH SERVICE FALLBACK
// ======================================================
//
// This must remain after all specific service routes.
//
// ======================================================

app.use(
  "/",

  createServiceProxy(
    AUTH_SERVICE_URL
  )
);

// ======================================================
// LOCAL SERVER
// ======================================================
//
// Vercel imports and executes the Express application.
// Local Nx development still needs app.listen().
//
// ======================================================

const PORT =
  Number(
    process.env.PORT
  ) || 8080;

if (
  process.env.VERCEL !==
  "1"
) {
  const server =
    app.listen(
      PORT,
      () => {
        console.log(
          "======================================"
        );

        console.log(
          `🚀 API Gateway running on port ${PORT}`
        );

        console.log(
          `🌐 Health: http://localhost:${PORT}/gateway-health`
        );

        console.log(
          `🛡️ Rate limit: ${
            isProduction
              ? "300"
              : "5000"
          } requests / 15 minutes`
        );

        console.log(
          `⚙️ Environment: ${
            isProduction
              ? "production"
              : "development"
          }`
        );

        console.log(
          "📦 Services:"
        );

        console.log(
          `   Auth    → ${AUTH_SERVICE_URL}`
        );

        console.log(
          `   Product → ${PRODUCT_SERVICE_URL}`
        );

        console.log(
          `   Coupon  → ${COUPON_SERVICE_URL}`
        );

        console.log(
          `   Order   → ${ORDER_SERVICE_URL}`
        );

        console.log(
          `   Payment → ${PAYMENT_SERVICE_URL}`
        );

        console.log(
          `   Admin   → ${ADMIN_SERVICE_URL}`
        );

        console.log(
          "======================================"
        );
      }
    );

  server.on(
    "error",
    (error) => {
      console.error(
        "Server Error:",
        error
      );
    }
  );
}

// ======================================================
// SERVERLESS EXPORT
// ======================================================

export default app;