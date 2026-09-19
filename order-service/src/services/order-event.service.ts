import {
  publishEvent,
} from "@org/event-client";

interface OrderCreatedEventInput {
  id: string;
  userId: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  discount: number;
  shippingAmount: number;
  totalAmount: number;

  items: Array<{
    sellerId: string;
    quantity: number;
  }>;
}

interface OrderStatusUpdatedEventInput {
  orderId: string;
  sellerOrderId: string;
  sellerId: string;
  previousStatus: string;
  status: string;
}

export const sendOrderCreatedEvent =
  async (
    order: OrderCreatedEventInput,
  ): Promise<void> => {
    const sellerIds = [
      ...new Set(
        order.items.map(
          (item) =>
            item.sellerId,
        ),
      ),
    ];

    const totalQuantity =
      order.items.reduce(
        (total, item) =>
          total +
          item.quantity,
        0,
      );

    const result =
      await publishEvent({
        type:
          "order.created",

        source:
          "order-service",

        key:
          order.id,

        correlationId:
          order.id,

        data: {
          orderId:
            order.id,

          userId:
            order.userId,

          status:
            order.status,

          paymentStatus:
            order.paymentStatus,

          subtotal:
            order.subtotal,

          discount:
            order.discount,

          shippingAmount:
            order.shippingAmount,

          totalAmount:
            order.totalAmount,

          currency:
            "INR",

          itemCount:
            order.items.length,

          totalQuantity,

          sellerIds,
        },
      });

    if (!result.published) {
      console.error(
        `[ORDER] Kafka order.created event failed for ${order.id}:`,
        result.error,
      );
    }
  };

export const sendOrderStatusUpdatedEvent =
  async ({
    orderId,
    sellerOrderId,
    sellerId,
    previousStatus,
    status,
  }: OrderStatusUpdatedEventInput): Promise<void> => {
    const result =
      await publishEvent({
        type:
          "order.status.updated",

        source:
          "order-service",

        key:
          orderId,

        correlationId:
          orderId,

        data: {
          orderId,
          sellerOrderId,
          sellerId,
          previousStatus,
          status,
        },
      });

    if (!result.published) {
      console.error(
        `[ORDER] Kafka order.status.updated event failed for ${sellerOrderId}:`,
        result.error,
      );
    }
  };