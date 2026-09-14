import prisma from "@org/prisma";

import {
  sendNotificationSafely,
} from "@org/notification-client";

// ======================================================
// MONEY FORMAT
// ======================================================

const formatMoney = (
  value: number
): string => {
  return new Intl.NumberFormat(
    "en-IN",
    {
      style:
        "currency",

      currency:
        "INR",

      maximumFractionDigits:
        2,
    }
  ).format(value);
};

// ======================================================
// SEND PAID ORDER NOTIFICATIONS
// ======================================================

export const sendPaidOrderNotifications =
  async (
    orderId: string
  ): Promise<void> => {
    try {
      const order =
        await prisma.order.findUnique({
          where: {
            id:
              orderId,
          },

          select: {
            id: true,
            userId: true,
            totalAmount: true,

            sellerOrders: {
              select: {
                id: true,
                sellerId: true,
                totalAmount: true,
              },
            },
          },
        });

      if (!order) {
        console.warn(
          `[NOTIFICATION] Paid order ${orderId} was not found`
        );

        return;
      }

      const activeAdmins =
        await prisma.admins.findMany({
          where: {
            status:
              "ACTIVE",
          },

          select: {
            id: true,
          },
        });

      const sellerNotifications =
        order.sellerOrders.map(
          (sellerOrder) =>
            sendNotificationSafely({
              recipientId:
                sellerOrder.sellerId,

              recipientRole:
                "SELLER",

              type:
                "NEW_PAID_ORDER",

              title:
                "New paid order",

              message:
                `You received a new order worth ${formatMoney(
                  sellerOrder.totalAmount
                )}.`,

              actionUrl:
                `/dashboard/orders/${order.id}`,

              metadata: {
                orderId:
                  order.id,

                sellerOrderId:
                  sellerOrder.id,

                totalAmount:
                  sellerOrder.totalAmount,
              },

              idempotencyKey:
                `new-paid-order:${order.id}:${sellerOrder.sellerId}`,
            })
        );

      const adminNotifications =
        activeAdmins.map(
          (admin) =>
            sendNotificationSafely({
              recipientId:
                admin.id,

              recipientRole:
                "ADMIN",

              type:
                "PAYMENT_RECEIVED",

              title:
                "Payment received",

              message:
                `A payment of ${formatMoney(
                  order.totalAmount
                )} was verified successfully.`,

              actionUrl:
                `/dashboard/orders/${order.id}`,

              metadata: {
                orderId:
                  order.id,

                totalAmount:
                  order.totalAmount,
              },

              idempotencyKey:
                `payment-received:${order.id}:${admin.id}`,
            })
        );

      await Promise.all([
        sendNotificationSafely({
          recipientId:
            order.userId,

          recipientRole:
            "USER",

          type:
            "PAYMENT_SUCCESS",

          title:
            "Payment successful",

          message:
            `Your payment of ${formatMoney(
              order.totalAmount
            )} was successful and your order is confirmed.`,

          actionUrl:
            `/profile/orders/${order.id}`,

          metadata: {
            orderId:
              order.id,

            totalAmount:
              order.totalAmount,
          },

          idempotencyKey:
            `payment-success:${order.id}:${order.userId}`,
        }),

        ...sellerNotifications,
        ...adminNotifications,
      ]);
    } catch (error) {
      console.warn(
        `[NOTIFICATION] Unable to prepare paid-order notifications for ${orderId}:`,
        error
      );
    }
  };