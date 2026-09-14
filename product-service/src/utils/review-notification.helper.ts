import prisma from "@org/prisma";

import {
  sendNotificationSafely,
} from "@org/notification-client";

// ======================================================
// NEW REVIEW NOTIFICATION
// ======================================================

export const sendNewReviewNotification =
  async (
    reviewId: string
  ): Promise<void> => {
    try {
      const review =
        await prisma.review.findUnique({
          where: {
            id:
              reviewId,
          },

          select: {
            id: true,
            rating: true,
            sellerId: true,
            productId: true,

            product: {
              select: {
                title: true,
                slug: true,
              },
            },

            user: {
              select: {
                name: true,
              },
            },
          },
        });

      if (!review) {
        console.warn(
          `[NOTIFICATION] Review ${reviewId} was not found`
        );

        return;
      }

      await sendNotificationSafely({
        recipientId:
          review.sellerId,

        recipientRole:
          "SELLER",

        type:
          "NEW_REVIEW",

        title:
          "New product review",

        message:
          `${review.user.name} left a ${review.rating}-star review for ${review.product.title}.`,

        actionUrl:
          "/dashboard/reviews",

        metadata: {
          reviewId:
            review.id,

          productId:
            review.productId,

          productSlug:
            review.product.slug,

          rating:
            review.rating,
        },

        idempotencyKey:
          `new-review:${review.id}:${review.sellerId}`,
      });
    } catch (error) {
      console.warn(
        `[NOTIFICATION] Unable to prepare new-review notification for ${reviewId}:`,
        error
      );
    }
  };

// ======================================================
// SELLER REPLY NOTIFICATION
// ======================================================

export const sendSellerReplyNotification =
  async (
    reviewId: string
  ): Promise<void> => {
    try {
      const review =
        await prisma.review.findUnique({
          where: {
            id:
              reviewId,
          },

          select: {
            id: true,
            userId: true,
            sellerId: true,
            productId: true,
            sellerReply: true,
            sellerRepliedAt: true,

            product: {
              select: {
                title: true,
                slug: true,
              },
            },

            seller: {
              select: {
                shopName: true,
                name: true,
              },
            },
          },
        });

      if (
        !review ||
        !review.sellerReply ||
        !review.sellerRepliedAt
      ) {
        return;
      }

      const sellerName =
        review.seller.shopName ||
        review.seller.name;

      await sendNotificationSafely({
        recipientId:
          review.userId,

        recipientRole:
          "USER",

        type:
          "SELLER_REPLY",

        title:
          "Seller replied to your review",

        message:
          `${sellerName} replied to your review for ${review.product.title}.`,

        actionUrl:
          `/products/${review.product.slug}`,

        metadata: {
          reviewId:
            review.id,

          productId:
            review.productId,

          productSlug:
            review.product.slug,

          sellerId:
            review.sellerId,
        },

        idempotencyKey:
          `seller-reply:${review.id}:${review.sellerRepliedAt.toISOString()}`,
      });
    } catch (error) {
      console.warn(
        `[NOTIFICATION] Unable to prepare seller-reply notification for ${reviewId}:`,
        error
      );
    }
  };