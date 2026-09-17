import {
  type ChatActor,
} from "../types/chat.types";

// ======================================================
// INPUT
// ======================================================

interface SendChatNotificationInput {
  actor: ChatActor;
  messageId: string;
  conversationId: string;
  orderId: string;
  userId: string;
  sellerId: string;
  userName: string;
  sellerName: string;
  content: string;
}

// ======================================================
// SEND NEW MESSAGE NOTIFICATION
// ======================================================

export const sendChatNotification =
  async ({
    actor,
    messageId,
    conversationId,
    orderId,
    userId,
    sellerId,
    userName,
    sellerName,
    content,
  }: SendChatNotificationInput): Promise<void> => {
    const notificationServiceUrl =
      process.env
        .NOTIFICATION_SERVICE_URL
        ?.trim()
        .replace(/\/+$/, "") ||
      "http://localhost:6008";

    const internalServiceSecret =
      process.env
        .INTERNAL_SERVICE_SECRET
        ?.trim();

    if (!internalServiceSecret) {
      console.warn(
        "[CHAT] INTERNAL_SERVICE_SECRET is not configured; message notification skipped"
      );

      return;
    }

    const recipientIsUser =
      actor.role ===
      "seller";

    const recipientId =
      recipientIsUser
        ? userId
        : sellerId;

    const recipientRole =
      recipientIsUser
        ? "USER"
        : "SELLER";

    const senderName =
      actor.role ===
      "seller"
        ? sellerName
        : userName;

    const actionUrl =
      recipientIsUser
        ? `/profile/messages?conversation=${encodeURIComponent(
            conversationId
          )}`
        : `/dashboard/messages?conversation=${encodeURIComponent(
            conversationId
          )}`;

    const normalizedContent =
      content.length >
      120
        ? `${content.slice(
            0,
            117
          )}...`
        : content;

    try {
      const response =
        await fetch(
          `${notificationServiceUrl}/api/notifications/internal`,
          {
            method:
              "POST",

            headers: {
              Accept:
                "application/json",

              "Content-Type":
                "application/json",

              "x-internal-api-key":
                internalServiceSecret,
            },

            body:
              JSON.stringify({
                recipientId,
                recipientRole,

                type:
                  "NEW_MESSAGE",

                title:
                  `New message from ${senderName}`,

                message:
                  normalizedContent,

                actionUrl,

                metadata: {
                  messageId,
                  conversationId,
                  orderId,

                  senderId:
                    actor.id,

                  senderRole:
                    actor.role.toUpperCase(),
                },

                idempotencyKey:
                  `chat-message:${messageId}:${recipientRole}`,
              }),
          }
        );

      if (!response.ok) {
        const responseBody =
          await response
            .text()
            .catch(
              () => ""
            );

        console.error(
          `[CHAT] Notification request failed with status ${response.status}: ${responseBody}`
        );
      }
    } catch (error) {
      console.error(
        "[CHAT] Unable to create message notification:",
        error
      );
    }
  };