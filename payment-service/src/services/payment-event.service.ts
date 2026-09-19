import {
  publishEvent,
} from "@org/event-client";

interface PaymentCompletedEventInput {
  id: string;
  userId: string;
  paymentId: string | null;
  paymentOrderId: string | null;
  paymentProvider: string | null;
  totalAmount: number;
  paymentVerifiedAt: Date | null;
}

export const sendPaymentCompletedEvent =
  async (
    order: PaymentCompletedEventInput,
  ): Promise<void> => {
    if (
      !order.paymentId ||
      !order.paymentVerifiedAt
    ) {
      console.error(
        `[PAYMENT] Cannot publish payment.completed for order ${order.id}: payment information is incomplete`,
      );

      return;
    }

    const result =
      await publishEvent({
        type:
          "payment.completed",

        source:
          "payment-service",

        key:
          order.id,

        correlationId:
          order.id,

        data: {
          orderId:
            order.id,

          userId:
            order.userId,

          paymentId:
            order.paymentId,

          paymentOrderId:
            order.paymentOrderId,

          provider:
            order.paymentProvider ||
            "razorpay",

          amount:
            order.totalAmount,

          currency:
            "INR",

          verifiedAt:
            order.paymentVerifiedAt.toISOString(),
        },
      });

    if (!result.published) {
      console.error(
        `[PAYMENT] Kafka payment.completed event failed for order ${order.id}:`,
        result.error,
      );
    }
  };