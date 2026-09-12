import crypto from "crypto";

import prisma from "@org/prisma";

import {
  BadRequestError,
  NotFoundError,
} from "@org/error-handler";

import {
  razorpay,
} from "../config/razorpay";

// ======================================================
// PLATFORM FEE
// ======================================================

const DEFAULT_PLATFORM_FEE_PERCENT = 5;

const getPlatformFeePercent = (): number => {
  const configuredValue =
    process.env
      .PLATFORM_FEE_PERCENT
      ?.trim();

  if (!configuredValue) {
    return DEFAULT_PLATFORM_FEE_PERCENT;
  }

  const platformFeePercent =
    Number(configuredValue);

  if (
    !Number.isFinite(
      platformFeePercent
    ) ||
    platformFeePercent < 0 ||
    platformFeePercent > 100
  ) {
    throw new Error(
      "PLATFORM_FEE_PERCENT must be between 0 and 100"
    );
  }

  return platformFeePercent;
};

// ======================================================
// MONEY HELPERS
// ======================================================

const roundMoney = (
  amount: number
): number => {
  return (
    Math.round(
      (amount +
        Number.EPSILON) *
        100
    ) / 100
  );
};

const convertRupeesToPaise = (
  amount: number
): number => {
  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    throw new BadRequestError(
      "Invalid order amount"
    );
  }

  return Math.round(
    amount * 100
  );
};

// ======================================================
// CREATE OR REUSE RAZORPAY ORDER
// ======================================================

export const createRazorpayOrder =
  async (
    userId: string,
    orderId: string
  ) => {
    const normalizedOrderId =
      orderId?.trim();

    if (!normalizedOrderId) {
      throw new BadRequestError(
        "Order ID is required"
      );
    }

    // ==================================================
    // LOAD INTERNAL ORDER
    // ==================================================

    const order =
      await prisma.order.findUnique({
        where: {
          id: normalizedOrderId,
        },

        include: {
          items: true,
        },
      });

    if (!order) {
      throw new NotFoundError(
        "Order not found"
      );
    }

    // ==================================================
    // OWNERSHIP
    // ==================================================

    if (
      order.userId !== userId
    ) {
      throw new NotFoundError(
        "Order not found"
      );
    }

    // ==================================================
    // PAYMENT STATE
    // ==================================================

    if (
      order.status !==
      "PENDING_PAYMENT"
    ) {
      throw new BadRequestError(
        "This order is not awaiting payment"
      );
    }

    if (
      order.paymentStatus !==
      "PENDING"
    ) {
      throw new BadRequestError(
        "Payment has already been processed for this order"
      );
    }

    if (
      order.items.length === 0
    ) {
      throw new BadRequestError(
        "Order does not contain any items"
      );
    }

    // ==================================================
    // AUTHORITATIVE AMOUNT
    // ==================================================

    const amountInPaise =
      convertRupeesToPaise(
        order.totalAmount
      );

    const keyId =
      process.env
        .RAZORPAY_KEY_ID;

    if (!keyId) {
      throw new Error(
        "RAZORPAY_KEY_ID is not configured"
      );
    }

    // ==================================================
    // REUSE PROVIDER ORDER
    // ==================================================

    if (
      order.paymentProvider ===
        "razorpay" &&
      order.paymentOrderId
    ) {
      return {
        internalOrderId:
          order.id,

        razorpayOrderId:
          order.paymentOrderId,

        amount:
          amountInPaise,

        currency:
          "INR",

        keyId,
      };
    }

    // ==================================================
    // CREATE RAZORPAY ORDER
    // ==================================================

    const receipt =
      `order_${order.id}`.slice(
        0,
        40
      );

    const razorpayOrder =
      await razorpay.orders.create({
        amount:
          amountInPaise,

        currency:
          "INR",

        receipt,

        notes: {
          internalOrderId:
            order.id,

          userId:
            order.userId,
        },
      });

    if (!razorpayOrder?.id) {
      throw new Error(
        "Razorpay order creation failed"
      );
    }

    // ==================================================
    // STORE PROVIDER INFORMATION
    // ==================================================

    const updatedOrder =
      await prisma.order.update({
        where: {
          id: order.id,
        },

        data: {
          paymentProvider:
            "razorpay",

          paymentOrderId:
            razorpayOrder.id,
        },
      });

    console.log(
      `[PAYMENT] Razorpay order ${razorpayOrder.id} created for internal order ${order.id}`
    );

    return {
      internalOrderId:
        updatedOrder.id,

      razorpayOrderId:
        razorpayOrder.id,

      amount:
        amountInPaise,

      currency:
        razorpayOrder.currency ||
        "INR",

      keyId,
    };
  };

// ======================================================
// VERIFY INPUT
// ======================================================

export interface VerifyRazorpayPaymentInput {
  internalOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

// ======================================================
// FINALIZE PAID ORDER
// ======================================================

const finalizePaidOrder =
  async (
    orderId: string,
    userId: string,
    razorpayPaymentId: string
  ) => {
    return prisma.$transaction(
      async (tx) => {
        // ==============================================
        // LOAD ORDER INSIDE TRANSACTION
        // ==============================================

        const order =
          await tx.order.findUnique({
            where: {
              id: orderId,
            },

            include: {
              items: true,
            },
          });

        if (!order) {
          throw new NotFoundError(
            "Order not found"
          );
        }

        if (
          order.userId !==
          userId
        ) {
          throw new NotFoundError(
            "Order not found"
          );
        }

        if (
          order.paymentId &&
          order.paymentId !==
            razorpayPaymentId
        ) {
          throw new BadRequestError(
            "Order has already been paid using another payment"
          );
        }

        const paymentVerifiedAt =
          order.paymentVerifiedAt ??
          new Date();

        const platformFeePercent =
          getPlatformFeePercent();

        // ==============================================
        // BUILD SELLER SUBTOTALS
        // ==============================================

        const sellerSubtotals =
          new Map<
            string,
            number
          >();

        for (
          const item of
          order.items
        ) {
          const currentSubtotal =
            sellerSubtotals.get(
              item.sellerId
            ) ?? 0;

          sellerSubtotals.set(
            item.sellerId,
            roundMoney(
              currentSubtotal +
                item.lineTotal
            )
          );
        }

        // ==============================================
        // SELLER ORDERS AND SETTLEMENTS
        // ==============================================

        for (
          const [
            sellerId,
            subtotal,
          ] of sellerSubtotals
        ) {
          const discount =
            order.couponSellerId ===
            sellerId
              ? roundMoney(
                  Math.min(
                    Math.max(
                      order.couponDiscount,
                      0
                    ),
                    subtotal
                  )
                )
              : 0;

          const totalAmount =
            roundMoney(
              Math.max(
                subtotal -
                  discount,
                0
              )
            );

          const platformFee =
            roundMoney(
              totalAmount *
                (platformFeePercent /
                  100)
            );

          const sellerEarnings =
            roundMoney(
              Math.max(
                totalAmount -
                  platformFee,
                0
              )
            );

          // --------------------------------------------
          // CREATE OR REUSE SELLER ORDER
          // --------------------------------------------

          const sellerOrder =
            await tx.sellerOrder.upsert({
              where: {
                orderId_sellerId: {
                  orderId:
                    order.id,

                  sellerId,
                },
              },

              create: {
                orderId:
                  order.id,

                sellerId,

                status:
                  "CONFIRMED",

                subtotal,
                discount,
                totalAmount,
              },

              update: {
                subtotal,
                discount,
                totalAmount,
              },
            });

          // --------------------------------------------
          // CREATE OR REUSE SELLER SETTLEMENT
          // --------------------------------------------

          await tx.sellerSettlement.upsert({
            where: {
              sellerOrderId:
                sellerOrder.id,
            },

            create: {
              orderId:
                order.id,

              sellerId,

              sellerOrderId:
                sellerOrder.id,

              currency:
                "INR",

              paymentProvider:
                "razorpay",

              paymentId:
                razorpayPaymentId,

              paymentVerifiedAt,

              grossAmount:
                subtotal,

              discountAmount:
                discount,

              netAmount:
                totalAmount,

              platformFeeRate:
                platformFeePercent,

              platformFee,

              sellerEarnings,

              status:
                "PENDING",
            },

            update: {
              paymentProvider:
                "razorpay",

              paymentId:
                razorpayPaymentId,

              paymentVerifiedAt,
            },
          });
        }

        // ==============================================
        // FULFILMENT IDEMPOTENCY
        // ==============================================

        if (
          order.fulfillmentProcessedAt
        ) {
          return tx.order.findUnique({
            where: {
              id: order.id,
            },

            include: {
              items: true,
              sellerOrders: true,
              sellerSettlements: true,
            },
          });
        }

        // ==============================================
        // PRODUCT STOCK
        // ==============================================

        for (
          const item of
          order.items
        ) {
          const stockResult =
            await tx.product.updateMany({
              where: {
                id:
                  item.productId,

                stock: {
                  gte:
                    item.quantity,
                },
              },

              data: {
                stock: {
                  decrement:
                    item.quantity,
                },
              },
            });

          if (
            stockResult.count !== 1
          ) {
            throw new BadRequestError(
              `Insufficient stock for ${item.productTitle}`
            );
          }

          const product =
            await tx.product.findUnique({
              where: {
                id:
                  item.productId,
              },

              select: {
                stock: true,
                status: true,
              },
            });

          if (
            product &&
            product.stock <= 0 &&
            product.status !==
              "OUT_OF_STOCK"
          ) {
            await tx.product.update({
              where: {
                id:
                  item.productId,
              },

              data: {
                status:
                  "OUT_OF_STOCK",
              },
            });
          }
        }

        // ==============================================
        // COUPON USAGE
        // ==============================================

        if (order.couponId) {
          const couponUpdate =
            await tx.coupon.updateMany({
              where: {
                id:
                  order.couponId,

                ...(order.couponSellerId
                  ? {
                      sellerId:
                        order.couponSellerId,
                    }
                  : {}),

                ...(order.couponCode
                  ? {
                      code:
                        order.couponCode,
                    }
                  : {}),
              },

              data: {
                usedCount: {
                  increment: 1,
                },
              },
            });

          if (
            couponUpdate.count === 0
          ) {
            console.warn(
              `[PAYMENT] Coupon usage could not be incremented for order ${order.id}`
            );
          }
        }

        // ==============================================
        // USER CART
        // ==============================================

        const cart =
          await tx.cart.findUnique({
            where: {
              userId:
                order.userId,
            },

            include: {
              items: true,
            },
          });

        if (cart) {
          for (
            const orderItem of
            order.items
          ) {
            const cartItem =
              cart.items.find(
                (item) =>
                  item.productId ===
                  orderItem.productId
              );

            if (!cartItem) {
              continue;
            }

            if (
              cartItem.quantity <=
              orderItem.quantity
            ) {
              await tx.cartItem.delete({
                where: {
                  id:
                    cartItem.id,
                },
              });

              continue;
            }

            await tx.cartItem.update({
              where: {
                id:
                  cartItem.id,
              },

              data: {
                quantity: {
                  decrement:
                    orderItem.quantity,
                },
              },
            });
          }
        }

        // ==============================================
        // MARK ORDER COMPLETE
        // ==============================================

        const finalizedOrder =
          await tx.order.update({
            where: {
              id:
                order.id,
            },

            data: {
              status:
                "CONFIRMED",

              paymentStatus:
                "PAID",

              paymentProvider:
                "razorpay",

              paymentId:
                razorpayPaymentId,

              paymentVerifiedAt,

              fulfillmentProcessedAt:
                new Date(),
            },

            include: {
              items: true,
              sellerOrders: true,
              sellerSettlements: true,
            },
          });

        return finalizedOrder;
      },
      {
        maxWait: 10_000,
        timeout: 30_000,
      }
    );
  };

// ======================================================
// VERIFY RAZORPAY PAYMENT
// ======================================================

export const verifyRazorpayPayment =
  async (
    userId: string,
    input: VerifyRazorpayPaymentInput
  ) => {
    const internalOrderId =
      input.internalOrderId?.trim();

    const razorpayPaymentId =
      input.razorpayPaymentId?.trim();

    const razorpaySignature =
      input.razorpaySignature?.trim();

    // ==================================================
    // VALIDATE INPUT
    // ==================================================

    if (!internalOrderId) {
      throw new BadRequestError(
        "Internal order ID is required"
      );
    }

    if (!razorpayPaymentId) {
      throw new BadRequestError(
        "Razorpay payment ID is required"
      );
    }

    if (!razorpaySignature) {
      throw new BadRequestError(
        "Razorpay signature is required"
      );
    }

    // ==================================================
    // LOAD INTERNAL ORDER
    // ==================================================

    const order =
      await prisma.order.findUnique({
        where: {
          id:
            internalOrderId,
        },

        include: {
          items: true,
        },
      });

    if (!order) {
      throw new NotFoundError(
        "Order not found"
      );
    }

    if (
      order.userId !==
      userId
    ) {
      throw new NotFoundError(
        "Order not found"
      );
    }

    // ==================================================
    // PAYMENT PROVIDER
    // ==================================================

    if (
      order.paymentProvider !==
      "razorpay"
    ) {
      throw new BadRequestError(
        "Razorpay is not configured for this order"
      );
    }

    const razorpayOrderId =
      order.paymentOrderId;

    if (!razorpayOrderId) {
      throw new BadRequestError(
        "Razorpay order has not been created"
      );
    }

    const razorpayKeySecret =
      process.env
        .RAZORPAY_KEY_SECRET;

    if (!razorpayKeySecret) {
      throw new Error(
        "RAZORPAY_KEY_SECRET is not configured"
      );
    }

    // ==================================================
    // VERIFY RAZORPAY SIGNATURE
    // ==================================================

    const signatureBody =
      `${razorpayOrderId}|${razorpayPaymentId}`;

    const expectedSignature =
      crypto
        .createHmac(
          "sha256",
          razorpayKeySecret
        )
        .update(signatureBody)
        .digest("hex");

    const expectedBuffer =
      Buffer.from(
        expectedSignature,
        "utf8"
      );

    const receivedBuffer =
      Buffer.from(
        razorpaySignature,
        "utf8"
      );

    const signatureMatches =
      expectedBuffer.length ===
        receivedBuffer.length &&
      crypto.timingSafeEqual(
        expectedBuffer,
        receivedBuffer
      );

    if (!signatureMatches) {
      throw new BadRequestError(
        "Payment signature verification failed"
      );
    }

    // ==================================================
    // COMPLETELY PROCESSED ORDER
    // ==================================================

    if (
      order.paymentStatus ===
        "PAID" &&
      order.fulfillmentProcessedAt
    ) {
      if (
        order.paymentId ===
        razorpayPaymentId
      ) {
        const processedOrder =
          await finalizePaidOrder(
            order.id,
            userId,
            razorpayPaymentId
          );

        return {
          verified: true,
          alreadyProcessed: true,
          order:
            processedOrder,
        };
      }

      throw new BadRequestError(
        "This order has already been paid using another payment"
      );
    }

    // ==================================================
    // PAID WITH A DIFFERENT PAYMENT
    // ==================================================

    if (
      order.paymentStatus ===
        "PAID" &&
      order.paymentId &&
      order.paymentId !==
        razorpayPaymentId
    ) {
      throw new BadRequestError(
        "This order has already been paid using another payment"
      );
    }

    // ==================================================
    // FETCH PAYMENT FROM RAZORPAY
    // ==================================================

    const razorpayPayment =
      await razorpay.payments.fetch(
        razorpayPaymentId
      );

    if (!razorpayPayment) {
      throw new BadRequestError(
        "Unable to fetch Razorpay payment"
      );
    }

    // ==================================================
    // PROVIDER ORDER
    // ==================================================

    if (
      razorpayPayment.order_id !==
      razorpayOrderId
    ) {
      throw new BadRequestError(
        "Payment does not belong to this order"
      );
    }

    // ==================================================
    // CURRENCY
    // ==================================================

    if (
      razorpayPayment.currency !==
      "INR"
    ) {
      throw new BadRequestError(
        "Invalid payment currency"
      );
    }

    // ==================================================
    // AMOUNT
    // ==================================================

    const expectedAmount =
      convertRupeesToPaise(
        order.totalAmount
      );

    const paidAmount =
      Number(
        razorpayPayment.amount
      );

    if (
      paidAmount !==
      expectedAmount
    ) {
      throw new BadRequestError(
        "Payment amount does not match the order"
      );
    }

    // ==================================================
    // PAYMENT STATUS
    // ==================================================

    const providerStatus =
      razorpayPayment.status;

    if (
      providerStatus !==
        "captured" &&
      providerStatus !==
        "authorized"
    ) {
      throw new BadRequestError(
        `Payment is not successful. Razorpay status: ${providerStatus}`
      );
    }

    // ==================================================
    // FINALIZE ORDER
    // ==================================================

    const finalizedOrder =
      await finalizePaidOrder(
        order.id,
        userId,
        razorpayPaymentId
      );

    console.log(
      `[PAYMENT] Razorpay payment ${razorpayPaymentId} verified and order ${order.id} fulfilled`
    );

    return {
      verified: true,
      alreadyProcessed: false,
      order:
        finalizedOrder,
    };
  };