import "dotenv/config";

import {
  disconnectEventProducer,
  publishEvent,
} from "../event-client/src/index.ts";

const runKafkaSmokeTest =
  async (): Promise<void> => {
    const result =
      await publishEvent({
        type: "chat.message.sent",

        source: "chat-service",

        key: "kafka-smoke-test",

        correlationId:
          "manual-smoke-test",

        data: {
          messageId:
            "smoke-message-001",

          conversationId:
            "smoke-conversation-001",

          orderId:
            "smoke-order-001",

          senderId:
            "smoke-user-001",

          senderRole: "USER",

          recipientId:
            "smoke-seller-001",

          recipientRole:
            "SELLER",
        },
      });

    console.log(
      "Kafka smoke-test result:",
      result,
    );

    if (!result.published) {
      throw new Error(
        result.error ||
          "Kafka event was not published",
      );
    }
  };

runKafkaSmokeTest()
  .catch((error) => {
    console.error(
      "Kafka smoke test failed:",
      error,
    );

    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectEventProducer();
  });