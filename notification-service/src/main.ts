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

import notificationRoutes from "./routes/notification.routes";
import swaggerSpec from "./swagger";

// ======================================================
// APP
// ======================================================

const app = express();

const PORT =
  Number(
    process.env.NOTIFICATION_SERVICE_PORT ??
      process.env.PORT
  ) || 6008;

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
    origin
      .trim()
      .replace(/\/+$/, "")
  )
  .filter(Boolean);

// ======================================================
// REVERSE PROXY
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
       * Requests without an Origin include API clients,
       * health checks and trusted server-to-server calls.
       */
      if (!origin) {
        return callback(
          null,
          true
        );
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
        return callback(
          null,
          true
        );
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
      "x-internal-api-key",
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

app.use(
  cookieParser()
);

// ======================================================
// ROOT
// ======================================================

app.get(
  "/",
  (
    _req: Request,
    res: Response
  ) => {
    return res.status(200).json({
      success: true,
      message:
        "Notification Service is running",
    });
  }
);

// ======================================================
// HEALTH
// ======================================================

app.get(
  "/health",
  (
    _req: Request,
    res: Response
  ) => {
    return res.status(200).json({
      success: true,
      service:
        "notification-service",
      status:
        "healthy",
    });
  }
);

// ======================================================
// SWAGGER
// ======================================================

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(
    swaggerSpec,
    {
      customSiteTitle:
        "Notification Service API Docs",

      swaggerOptions: {
        persistAuthorization:
          true,

        displayRequestDuration:
          true,
      },
    }
  )
);

app.get(
  "/api-docs.json",
  (
    _req: Request,
    res: Response
  ) => {
    return res.json(
      swaggerSpec
    );
  }
);

// ======================================================
// NOTIFICATION ROUTES
// ======================================================

app.use(
  "/api/notifications",
  notificationRoutes
);

// ======================================================
// 404
// ======================================================

app.use(
  (
    req: Request,
    res: Response
  ) => {
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
      "Notification Service Error:",
      error
    );

    const normalizedError =
      error as {
        statusCode?: number;
        status?: number;
        message?: string;
        details?: unknown;
      };

    const possibleStatus =
      normalizedError.statusCode ??
      normalizedError.status ??
      500;

    const statusCode =
      Number.isInteger(
        possibleStatus
      ) &&
      possibleStatus >= 400 &&
      possibleStatus <= 599
        ? possibleStatus
        : 500;

    const message =
      normalizedError.message ??
      "Internal server error";

    return res
      .status(statusCode)
      .json({
        success: false,
        message,

        ...(normalizedError
          .details !== undefined
          ? {
              details:
                normalizedError.details,
            }
          : {}),
      });
  }
);

// ======================================================
// LOCAL SERVER
// ======================================================

if (
  process.env.VERCEL !==
  "1"
) {
  const server =
    app.listen(
      PORT,
      "0.0.0.0",
      () => {
        console.log(
          `Notification Service running on http://localhost:${PORT}`
        );

        console.log(
          `Swagger: http://localhost:${PORT}/api-docs`
        );
      }
    );

  server.on(
    "error",
    (error) => {
      console.error(
        "Notification Service server error:",
        error
      );
    }
  );
}

// ======================================================
// SERVERLESS EXPORT
// ======================================================

export default app;