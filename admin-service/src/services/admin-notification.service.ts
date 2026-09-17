// ======================================================
// SELLER SETTLEMENT NOTIFICATION INPUT
// ======================================================

interface SendSellerSettlementNotificationInput {
  settlementId: string;
  orderId: string;
  sellerId: string;
  sellerEarnings: number;
  currency: string;
}

// ======================================================
// FORMAT CURRENCY
// ======================================================

const formatCurrency = (
  amount: number,
  currency: string
): string => {
  return new Intl.NumberFormat(
    "en-IN",
    {
      style:
        "currency",

      currency,

      maximumFractionDigits:
        2,
    }
  ).format(amount);
};

// ======================================================
// SEND SELLER SETTLEMENT NOTIFICATION
// ======================================================

export const sendSellerSettlementNotification =
  async ({
    settlementId,
    orderId,
    sellerId,
    sellerEarnings,
    currency,
  }: SendSellerSettlementNotificationInput): Promise<void> => {
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
        "[ADMIN] INTERNAL_SERVICE_SECRET is not configured; settlement notification skipped"
      );

      return;
    }

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
                recipientId:
                  sellerId,

                recipientRole:
                  "SELLER",

                type:
                  "SELLER_PAYMENT_SETTLED",

                title:
                  "Payment settled",

                message:
                  `${formatCurrency(
                    sellerEarnings,
                    currency
                  )} has been settled for order #${orderId
                    .slice(-8)
                    .toUpperCase()}.`,

                actionUrl:
                  "/dashboard/payments",

                metadata: {
                  settlementId,
                  orderId,
                  sellerId,
                  sellerEarnings,
                  currency,

                  status:
                    "SETTLED",
                },

                idempotencyKey:
                  `seller-settlement:${settlementId}:SETTLED`,
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
          `[ADMIN] Settlement notification failed with status ${response.status}: ${responseBody}`
        );
      }
    } catch (error) {
      console.error(
        "[ADMIN] Unable to create settlement notification:",
        error
      );
    }
  };