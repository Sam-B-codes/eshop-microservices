import {
  randomUUID,
} from "node:crypto";

import {
  readFileSync,
} from "node:fs";

import {
  Kafka,
  logLevel,
  Partitioners,
  type Producer,
} from "kafkajs";

import {
  KAFKA_TOPICS,
  type EshopEventType,
  type EventEnvelope,
  type KafkaTopic,
  type PublishEventInput,
  type PublishEventResult,
} from "./event.types.js";

// ======================================================
// INTERNAL STATE
// ======================================================

let kafkaInstance: Kafka | null =
  null;

let producerInstance: Producer | null =
  null;

let producerConnection:
  Promise<void> | null = null;

// ======================================================
// ENVIRONMENT HELPERS
// ======================================================

const getOptionalEnvironmentValue = (
  name: string,
): string | null => {
  const value =
    process.env[name]?.trim();

  return value || null;
};

const getRequiredEnvironmentValue = (
  name: string,
): string => {
  const value =
    getOptionalEnvironmentValue(
      name,
    );

  if (!value) {
    throw new Error(
      `${name} is required for Kafka`,
    );
  }

  return value;
};

const getKafkaBrokers = (): string[] => {
  const brokers =
    getRequiredEnvironmentValue(
      "KAFKA_BROKERS",
    )
      .split(",")
      .map((broker) =>
        broker.trim(),
      )
      .filter(Boolean);

  if (brokers.length === 0) {
    throw new Error(
      "KAFKA_BROKERS must contain at least one broker",
    );
  }

  return brokers;
};

const isKafkaEnabled = (): boolean => {
  return (
    process.env.KAFKA_ENABLED
      ?.trim()
      .toLowerCase() !== "false"
  );
};

// ======================================================
// CA CERTIFICATE VALIDATION
// ======================================================

const validateKafkaCaCertificate = (
  certificate: string,
  sourceName: string,
): string => {
  const normalizedCertificate =
    certificate
      .replace(/\\n/g, "\n")
      .trim();

  if (
    !normalizedCertificate.includes(
      "-----BEGIN CERTIFICATE-----",
    ) ||
    !normalizedCertificate.includes(
      "-----END CERTIFICATE-----",
    )
  ) {
    throw new Error(
      `${sourceName} does not contain a valid PEM certificate`,
    );
  }

  return normalizedCertificate;
};

// ======================================================
// CA CERTIFICATE
// ======================================================

const getKafkaCaCertificate = (): string => {
  /*
   * Cloud deployments such as Vercel and Northflank
   * should use the Base64 environment variable.
   */
  const base64Certificate =
    getOptionalEnvironmentValue(
      "KAFKA_CA_CERT_BASE64",
    );

  if (base64Certificate) {
    let decodedCertificate: string;

    try {
      decodedCertificate =
        Buffer.from(
          base64Certificate,
          "base64",
        ).toString("utf8");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unknown Base64 decoding error";

      throw new Error(
        `Unable to decode KAFKA_CA_CERT_BASE64: ${message}`,
      );
    }

    return validateKafkaCaCertificate(
      decodedCertificate,
      "KAFKA_CA_CERT_BASE64",
    );
  }

  /*
   * A direct PEM value is also supported.
   * Escaped newline characters are converted
   * into real newlines during validation.
   */
  const directCertificate =
    getOptionalEnvironmentValue(
      "KAFKA_CA_CERT",
    );

  if (directCertificate) {
    return validateKafkaCaCertificate(
      directCertificate,
      "KAFKA_CA_CERT",
    );
  }

  /*
   * Local development can continue using
   * the downloaded Aiven certificate file.
   */
  const certificatePath =
    getOptionalEnvironmentValue(
      "KAFKA_CA_CERT_PATH",
    );

  if (certificatePath) {
    let certificate: string;

    try {
      certificate =
        readFileSync(
          certificatePath,
          "utf8",
        );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unknown file error";

      throw new Error(
        `Unable to read Kafka CA certificate from ${certificatePath}: ${message}`,
      );
    }

    return validateKafkaCaCertificate(
      certificate,
      "KAFKA_CA_CERT_PATH",
    );
  }

  throw new Error(
    "Kafka CA certificate is required. Set KAFKA_CA_CERT_BASE64 for cloud deployment or KAFKA_CA_CERT_PATH for local development.",
  );
};

// ======================================================
// TOPIC RESOLUTION
// ======================================================

export const getTopicForEvent = (
  type: EshopEventType,
): KafkaTopic => {
  switch (type) {
    case "order.created":
    case "order.status.updated":
      return KAFKA_TOPICS.ORDERS;

    case "payment.completed":
      return KAFKA_TOPICS.PAYMENTS;

    case "product.viewed":
    case "product.published":
      return KAFKA_TOPICS.PRODUCTS;

    case "chat.message.sent":
      return KAFKA_TOPICS.CHATS;

    case "settlement.completed":
      return KAFKA_TOPICS.SETTLEMENTS;
  }
};

// ======================================================
// KAFKA CLIENT
// ======================================================

export const getKafkaClient =
  (): Kafka => {
    if (kafkaInstance) {
      return kafkaInstance;
    }

    const username =
      getRequiredEnvironmentValue(
        "KAFKA_USERNAME",
      );

    const password =
      getRequiredEnvironmentValue(
        "KAFKA_PASSWORD",
      );

    const caCertificate =
      getKafkaCaCertificate();

    kafkaInstance = new Kafka({
      clientId:
        process.env.KAFKA_CLIENT_ID
          ?.trim() ||
        "eshop",

      brokers:
        getKafkaBrokers(),

      ssl: {
        rejectUnauthorized: true,

        ca: [
          caCertificate,
        ],
      },

      sasl: {
        mechanism: "plain",
        username,
        password,
      },

      connectionTimeout:
        10_000,

      requestTimeout:
        30_000,

      retry: {
        initialRetryTime:
          300,

        retries:
          5,
      },

      logLevel:
        process.env.NODE_ENV ===
        "production"
          ? logLevel.ERROR
          : logLevel.INFO,
    });

    return kafkaInstance;
  };

// ======================================================
// CONNECT PRODUCER
// ======================================================

const getConnectedProducer =
  async (): Promise<Producer> => {
    if (!producerInstance) {
      producerInstance =
        getKafkaClient().producer({
          allowAutoTopicCreation:
            false,

          createPartitioner:
            Partitioners.DefaultPartitioner,
        });
    }

    if (!producerConnection) {
      producerConnection =
        producerInstance
          .connect()
          .catch((error) => {
            producerConnection =
              null;

            throw error;
          });
    }

    await producerConnection;

    return producerInstance;
  };

// ======================================================
// PUBLISH EVENT
// ======================================================

export const publishEvent = async <
  Type extends EshopEventType,
>(
  input: PublishEventInput<Type>,
): Promise<PublishEventResult> => {
  const eventId =
    randomUUID();

  const topic =
    getTopicForEvent(
      input.type,
    );

  if (!isKafkaEnabled()) {
    return {
      published: false,
      eventId,
      topic,

      error:
        "Kafka publishing is disabled",
    };
  }

  const event: EventEnvelope<Type> = {
    id: eventId,

    type:
      input.type,

    version:
      1,

    source:
      input.source,

    occurredAt:
      new Date().toISOString(),

    correlationId:
      input.correlationId ??
      null,

    data:
      input.data,
  };

  try {
    const producer =
      await getConnectedProducer();

    await producer.send({
      topic,

      acks:
        -1,

      messages: [
        {
          key:
            input.key,

          value:
            JSON.stringify(
              event,
            ),

          headers: {
            eventId,

            eventType:
              input.type,

            eventVersion:
              "1",

            eventSource:
              input.source,
          },
        },
      ],
    });

    console.log(
      `[KAFKA] Published ${input.type} (${eventId}) to ${topic}`,
    );

    return {
      published: true,
      eventId,
      topic,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown Kafka publishing error";

    console.error(
      `[KAFKA] Failed to publish ${input.type}:`,
      error,
    );

    /*
     * Event tracking must never break the
     * customer-facing request if Kafka is
     * temporarily unavailable.
     */
    return {
      published: false,
      eventId,
      topic,
      error: message,
    };
  }
};

// ======================================================
// GRACEFUL DISCONNECTION
// ======================================================

export const disconnectEventProducer =
  async (): Promise<void> => {
    if (!producerInstance) {
      return;
    }

    try {
      await producerInstance.disconnect();
    } finally {
      producerInstance =
        null;

      producerConnection =
        null;

      kafkaInstance =
        null;
    }
  };