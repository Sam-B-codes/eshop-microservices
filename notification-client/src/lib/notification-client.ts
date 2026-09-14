// ======================================================
// NOTIFICATION TYPES
// ======================================================

export type NotificationRecipientRole =
  | "USER"
  | "SELLER"
  | "ADMIN";

export type NotificationEventType =
  | "PAYMENT_SUCCESS"
  | "NEW_PAID_ORDER"
  | "ORDER_STATUS_UPDATED"
  | "NEW_REVIEW"
  | "SELLER_REPLY"
  | "PAYMENT_RECEIVED";

// ======================================================
// NOTIFICATION INPUT
// ======================================================

export interface SendNotificationInput {
  recipientId: string;

  recipientRole:
    NotificationRecipientRole;

  type:
    NotificationEventType;

  title: string;
  message: string;

  actionUrl?: string | null;

  metadata?: Record<
    string,
    unknown
  > | null;

  idempotencyKey: string;
}

// ======================================================
// RESULT
// ======================================================

export interface NotificationDeliveryResult {
  delivered: boolean;
  notificationId?: string;
  reason?: string;
}

// ======================================================
// INTERNAL RESPONSE
// ======================================================

interface NotificationApiResponse {
  success?: boolean;

  message?: string;

  notification?: {
    id?: string;
  };
}

// ======================================================
// CONFIGURATION
// ======================================================

const getNotificationServiceUrl =
  (): string | null => {
    const value =
      process.env
        .NOTIFICATION_SERVICE_URL
        ?.trim()
        .replace(/\/+$/, "");

    return (
      value ||
      null
    );
  };

const getInternalSecret =
  (): string | null => {
    const value =
      process.env
        .INTERNAL_SERVICE_SECRET
        ?.trim();

    return (
      value ||
      null
    );
  };

// ======================================================
// ERROR MESSAGE
// ======================================================

const getErrorMessage = (
  error: unknown
): string => {
  if (
    error instanceof Error
  ) {
    return error.message;
  }

  return "Unknown notification delivery error";
};

// ======================================================
// SEND NOTIFICATION SAFELY
// ======================================================
//
// This function never throws. Existing business operations
// must not fail because the Notification Service is
// temporarily unavailable.
//
// Callers should still await this function so serverless
// runtimes have time to complete the request.
//
// ======================================================

export const sendNotificationSafely =
  async (
    input:
      SendNotificationInput
  ): Promise<
    NotificationDeliveryResult
  > => {
    const serviceUrl =
      getNotificationServiceUrl();

    const internalSecret =
      getInternalSecret();

    if (
      !serviceUrl ||
      !internalSecret
    ) {
      const reason =
        "Notification Service configuration is missing";

      console.warn(
        `[NOTIFICATION] ${reason}`
      );

      return {
        delivered: false,
        reason,
      };
    }

    const controller =
      new AbortController();

    const timeoutId =
      setTimeout(
        () => {
          controller.abort();
        },
        5_000
      );

    try {
      const response =
        await fetch(
          `${serviceUrl}/api/notifications/internal`,
          {
            method:
              "POST",

            headers: {
              Accept:
                "application/json",

              "Content-Type":
                "application/json",

              "x-internal-api-key":
                internalSecret,
            },

            body:
              JSON.stringify(
                input
              ),

            signal:
              controller.signal,
          }
        );

      const data =
        await response.json()
          .catch(
            () =>
              ({}) as
                NotificationApiResponse
          ) as
          NotificationApiResponse;

      if (
        !response.ok ||
        data.success !== true
      ) {
        const reason =
          data.message ||
          `Notification Service returned HTTP ${response.status}`;

        console.warn(
          `[NOTIFICATION] Delivery failed for ${input.idempotencyKey}: ${reason}`
        );

        return {
          delivered: false,
          reason,
        };
      }

      const notificationId =
        data.notification?.id;

      console.log(
        `[NOTIFICATION] Processed ${input.idempotencyKey}${
          notificationId
            ? ` as ${notificationId}`
            : ""
        }`
      );

      return {
        delivered: true,
        ...(notificationId
          ? {
              notificationId,
            }
          : {}),
      };
    } catch (error) {
      const reason =
        controller.signal.aborted
          ? "Notification request timed out"
          : getErrorMessage(
              error
            );

      console.warn(
        `[NOTIFICATION] Delivery failed for ${input.idempotencyKey}: ${reason}`
      );

      return {
        delivered: false,
        reason,
      };
    } finally {
      clearTimeout(
        timeoutId
      );
    }
  };