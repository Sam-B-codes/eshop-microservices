import dotenv from "dotenv";

dotenv.config();

import express from "express";

import {
  getEventConsumerStatus,
  startEventConsumer,
  stopEventConsumer,
} from "./services/event-consumer.service.js";

// ======================================================
// APPLICATION
// ======================================================

const app =
  express();

const PORT =
  Number(
    process.env.PORT,
  ) || 6010;

// ======================================================
// MIDDLEWARE
// ======================================================

app.use(
  express.json({
    limit: "1mb",
  }),
);

// ======================================================
// ROUTES
// ======================================================

app.get(
  "/",
  (_req, res) => {
    return res
      .status(200)
      .json({
        success: true,

        message:
          "Event Service is running",

        consumer:
          getEventConsumerStatus(),
      });
  },
);

app.get(
  "/health",
  (_req, res) => {
    const consumer =
      getEventConsumerStatus();

    return res
      .status(
        consumer.running
          ? 200
          : 503,
      )
      .json({
        success:
          consumer.running,

        service:
          "event-service",

        status:
          consumer.running
            ? "healthy"
            : "degraded",

        consumer,
      });
  },
);

// ======================================================
// SERVER
// ======================================================

const server =
  app.listen(
    PORT,
    () => {
      console.log(
        `Event Service running on port ${PORT}`,
      );

      void startEventConsumer()
        .catch((error) => {
          console.error(
            "Unable to start Kafka consumer:",
            error,
          );
        });
    },
  );

// ======================================================
// GRACEFUL SHUTDOWN
// ======================================================

const shutdown = async (
  signal: string,
): Promise<void> => {
  console.log(
    `${signal} received. Shutting down Event Service...`,
  );

  try {
    await stopEventConsumer();
  } catch (error) {
    console.error(
      "Unable to stop Kafka consumer cleanly:",
      error,
    );
  }

  server.close(() => {
    process.exit(0);
  });

  setTimeout(() => {
    process.exit(1);
  }, 10_000).unref();
};

process.once(
  "SIGINT",
  () => {
    void shutdown(
      "SIGINT",
    );
  },
);

process.once(
  "SIGTERM",
  () => {
    void shutdown(
      "SIGTERM",
    );
  },
);