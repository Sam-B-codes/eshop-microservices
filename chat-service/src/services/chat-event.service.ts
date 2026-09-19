import {
  publishEvent,
} from "@org/event-client";

import {
  type ChatActor,
} from "../types/chat.types";

interface SendChatMessageEventInput {
  actor: ChatActor;
  messageId: string;
  conversationId: string;
  orderId: string;
  userId: string;
  sellerId: string;
}

// ======================================================
// PUBLISH CHAT MESSAGE EVENT
// ======================================================

export const sendChatMessageEvent =
  async ({
    actor,
    messageId,
    conversationId,
    orderId,
    userId,
    sellerId,
  }: SendChatMessageEventInput): Promise<void> => {
    const senderRole =
      actor.role === "user"
        ? "USER"
        : "SELLER";

    const recipientRole =
      actor.role === "user"
        ? "SELLER"
        : "USER";

    const recipientId =
      actor.role === "user"
        ? sellerId
        : userId;

    const result =
      await publishEvent({
        type:
          "chat.message.sent",

        source:
          "chat-service",

        key:
          conversationId,

        correlationId:
          conversationId,

        data: {
          messageId,
          conversationId,
          orderId,

          senderId:
            actor.id,

          senderRole,

          recipientId,

          recipientRole,
        },
      });

    if (!result.published) {
      console.error(
        `[CHAT] Kafka event was not published for message ${messageId}:`,
        result.error,
      );
    }
  };