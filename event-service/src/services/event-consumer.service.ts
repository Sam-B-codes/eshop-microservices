import {
  Prisma,
} from "@prisma/client";

import prisma from "@org/prisma";

import {
  getKafkaClient,
  KAFKA_TOPICS,
  type EventEnvelope,
} from "@org/event-client";

import type {
  Consumer,
  EachMessagePayload,
} from "kafkajs";

// ======================================================
// STATE
// ======================================================

let consumer: Consumer | null =
  null;

let consumerRunning =
  false;

let consumerError:
  string | null = null;

// ======================================================
// HELPERS
// ======================================================

const isRecord = (
  value: unknown,
): value is Record<string, unknown> => {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
};

const parseEvent = (
  value: Buffer | null,
): EventEnvelope => {
  if (!value) {
    throw new Error(
      "Kafka message has no value",
    );
  }

  let parsed: unknown;

  try {
    parsed =
      JSON.parse(
        value.toString("utf8"),
      );
  } catch {
    throw new Error(
      "Kafka message contains invalid JSON",
    );
  }

  if (!isRecord(parsed)) {
    throw new Error(
      "Kafka event must be an object",
    );
  }

  if (
    typeof parsed.id !==
      "string" ||
    !parsed.id.trim()
  ) {
    throw new Error(
      "Kafka event ID is missing",
    );
  }

  if (
    typeof parsed.type !==
      "string" ||
    !parsed.type.trim()
  ) {
    throw new Error(
      "Kafka event type is missing",
    );
  }

  if (
    typeof parsed.source !==
      "string" ||
    !parsed.source.trim()
  ) {
    throw new Error(
      "Kafka event source is missing",
    );
  }

  if (
    typeof parsed.occurredAt !==
      "string" ||
    Number.isNaN(
      new Date(
        parsed.occurredAt,
      ).getTime(),
    )
  ) {
    throw new Error(
      "Kafka event occurredAt is invalid",
    );
  }

  if (!("data" in parsed)) {
    throw new Error(
      "Kafka event data is missing",
    );
  }

  return parsed as unknown as EventEnvelope;
};

// ======================================================
// PROCESS MESSAGE
// ======================================================

const processMessage = async ({
  topic,
  partition,
  message,
}: EachMessagePayload): Promise<void> => {
  const event =
    parseEvent(
      message.value,
    );

  const messageKey =
    message.key?.toString(
      "utf8",
    ) ?? null;

  /*
   * Upsert makes processing idempotent.
   * Replayed Kafka events with the same
   * event ID do not create duplicates.
   */
  await prisma.processedKafkaEvent.upsert({
    where: {
      eventId: event.id,
    },

    update: {},

    create: {
      eventId: event.id,

      type: event.type,

      source:
        event.source,

      topic,

      messageKey,

      partition,

      offset:
        message.offset,

      occurredAt:
        new Date(
          event.occurredAt,
        ),

      payload:
        event as unknown as
          Prisma.InputJsonValue,
    },
  });

  console.log(
    `[EVENT] Processed ${event.type} (${event.id}) from ${topic}`,
  );
};

// ======================================================
// START CONSUMER
// ======================================================

export const startEventConsumer =
  async (): Promise<void> => {
    if (consumerRunning) {
      return;
    }

    consumerError = null;

    consumer =
      getKafkaClient().consumer({
        groupId:
          process.env
            .KAFKA_GROUP_ID
            ?.trim() ||
          "eshop-event-consumers",

        sessionTimeout:
          30_000,

        heartbeatInterval:
          3_000,

        allowAutoTopicCreation:
          false,
      });

    await consumer.connect();

    await consumer.subscribe({
      topics:
        Object.values(
          KAFKA_TOPICS,
        ),

      /*
       * Start from new events for a new
       * consumer group. Change to true only
       * when intentionally replaying history.
       */
      fromBeginning: false,
    });

    consumerRunning = true;

    console.log(
      "[EVENT] Kafka consumer connected",
    );

    void consumer
      .run({
        eachMessage:
          processMessage,
      })
      .catch((error) => {
        consumerRunning =
          false;

        consumerError =
          error instanceof Error
            ? error.message
            : "Unknown consumer error";

        console.error(
          "[EVENT] Kafka consumer stopped:",
          error,
        );
      });
  };

// ======================================================
// STOP CONSUMER
// ======================================================

export const stopEventConsumer =
  async (): Promise<void> => {
    if (!consumer) {
      return;
    }

    try {
      await consumer.stop();

      await consumer.disconnect();
    } finally {
      consumer = null;

      consumerRunning =
        false;
    }

    console.log(
      "[EVENT] Kafka consumer disconnected",
    );
  };

// ======================================================
// STATUS
// ======================================================

export const getEventConsumerStatus =
  () => {
    return {
      running:
        consumerRunning,

      error:
        consumerError,
    };
  };