import {
  publishEvent,
} from "@org/event-client";

interface SettlementCompletedEventInput {
  id: string;
  orderId: string;
  sellerOrderId: string;
  sellerId: string;
  sellerEarnings: number;
  platformFee: number;
  currency: string;
  settledAt: Date | null;
}

export const sendSettlementCompletedEvent =
  async (
    settlement:
      SettlementCompletedEventInput,
  ): Promise<void> => {
    if (!settlement.settledAt) {
      console.error(
        `[SETTLEMENT] Cannot publish settlement.completed for ${settlement.id}: settledAt is missing`,
      );

      return;
    }

    const result =
      await publishEvent({
        type:
          "settlement.completed",

        source:
          "admin-service",

        key:
          settlement.id,

        correlationId:
          settlement.orderId,

        data: {
          settlementId:
            settlement.id,

          orderId:
            settlement.orderId,

          sellerOrderId:
            settlement.sellerOrderId,

          sellerId:
            settlement.sellerId,

          sellerEarnings:
            settlement.sellerEarnings,

          platformFee:
            settlement.platformFee,

          currency:
            settlement.currency,

          settledAt:
            settlement.settledAt.toISOString(),
        },
      });

    if (!result.published) {
      console.error(
        `[SETTLEMENT] Kafka settlement.completed event failed for ${settlement.id}:`,
        result.error,
      );
    }
  };