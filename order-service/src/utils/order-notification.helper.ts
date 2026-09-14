import prisma from "@org/prisma";

import {
  sendNotificationSafely,
} from "@org/notification-client";

// ======================================================
// SUPPORTED STATUS
// ======================================================

type NotifiableOrderStatus =
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED";

// ======================================================
// STATUS CONTENT
// ======================================================

const getStatusContent = (
  status: NotifiableOrderStatus,
  trackingNumber:
    string | null,
  shippingCarrier:
    string | null
) => {
  switch (status) {
    case "PROCESSING":
      return {
        title:
          "Order is being processed",

        message:
          "The seller has started preparing your order.",
      };

    case "SHIPPED": {
      const trackingDetails =
        trackingNumber &&
        shippingCarrier
          ? ` Tracking number: ${trackingNumber} via ${shippingCarrier}.`
          : "";

      return {
        title:
          "Your order has shipped",

        message:
          `Your order is on its way.${trackingDetails}`,
      };
    }

    case "DELIVERED":
      return {
        title:
          "Order delivered",

        message:
          "Your order has been marked as delivered.",
      };
  }
};

// ======================================================
// SEND STATUS NOTIFICATION
// ======================================================

export const sendOrderStatusNotification =
  async (
    sellerOrderId: string
  ): Promise<void> => {
    try {
      const sellerOrder =
        await prisma.sellerOrder.findUnique({
          where: {
            id:
              sellerOrderId,
          },

          select: {
            id: true,
            orderId: true,
            sellerId: true,
            status: true,
            trackingNumber: true,
            shippingCarrier: true,

            order: {
              select: {
                userId: true,
              },
            },
          },
        });

      if (!sellerOrder) {
        console.warn(
          `[NOTIFICATION] Seller order ${sellerOrderId} was not found`
        );

        return;
      }

      if (
        sellerOrder.status !==
          "PROCESSING" &&
        sellerOrder.status !==
          "SHIPPED" &&
        sellerOrder.status !==
          "DELIVERED"
      ) {
        return;
      }

      const content =
        getStatusContent(
          sellerOrder.status,
          sellerOrder.trackingNumber,
          sellerOrder.shippingCarrier
        );

      await sendNotificationSafely({
        recipientId:
          sellerOrder.order.userId,

        recipientRole:
          "USER",

        type:
          "ORDER_STATUS_UPDATED",

        title:
          content.title,

        message:
          content.message,

        actionUrl:
          `/profile/orders/${sellerOrder.orderId}`,

        metadata: {
          orderId:
            sellerOrder.orderId,

          sellerOrderId:
            sellerOrder.id,

          sellerId:
            sellerOrder.sellerId,

          status:
            sellerOrder.status,

          trackingNumber:
            sellerOrder.trackingNumber,

          shippingCarrier:
            sellerOrder.shippingCarrier,
        },

        idempotencyKey:
          `order-status:${sellerOrder.id}:${sellerOrder.status}:${sellerOrder.order.userId}`,
      });
    } catch (error) {
      console.warn(
        `[NOTIFICATION] Unable to prepare status notification for seller order ${sellerOrderId}:`,
        error
      );
    }
  };