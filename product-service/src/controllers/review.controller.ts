import {
  NextFunction,
  Request,
  Response,
} from "express";

import prisma from "@org/prisma";

import {
  AuthenticationError,
  NotFoundError,
  ValidationError,
} from "@org/error-handler";

import {
  AuthRequest,
} from "../middleware/auth.middleware";

import {
  sendNewReviewNotification,
  sendSellerReplyNotification,
} from "../utils/review-notification.helper";

// ======================================================
// HELPERS
// ======================================================

const requireRole = (
  req: AuthRequest,
  role: "user" | "seller"
) => {
  if (
    !req.user ||
    req.user.role !== role
  ) {
    throw new AuthenticationError(
      `Only authenticated ${role}s can perform this action`
    );
  }

  return req.user;
};

const normalizeRequiredText = (
  value: unknown,
  field: string,
  maximumLength: number
): string => {
  if (
    typeof value !== "string"
  ) {
    throw new ValidationError(
      `${field} is required`
    );
  }

  const normalized =
    value.trim();

  if (!normalized) {
    throw new ValidationError(
      `${field} is required`
    );
  }

  if (
    normalized.length >
    maximumLength
  ) {
    throw new ValidationError(
      `${field} cannot exceed ${maximumLength} characters`
    );
  }

  return normalized;
};

const normalizeOptionalText = (
  value: unknown,
  maximumLength: number
): string | null => {
  if (
    value === undefined ||
    value === null
  ) {
    return null;
  }

  if (
    typeof value !== "string"
  ) {
    throw new ValidationError(
      "Invalid text value"
    );
  }

  const normalized =
    value.trim();

  if (!normalized) {
    return null;
  }

  if (
    normalized.length >
    maximumLength
  ) {
    throw new ValidationError(
      `Text cannot exceed ${maximumLength} characters`
    );
  }

  return normalized;
};

const normalizeRating = (
  value: unknown
): number => {
  const rating =
    Number(value);

  if (
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    throw new ValidationError(
      "Rating must be an integer between 1 and 5"
    );
  }

  return rating;
};

const getPagination = (
  req: Request
) => {
  const requestedPage =
    Number(req.query.page);

  const requestedLimit =
    Number(req.query.limit);

  const page =
    Number.isInteger(
      requestedPage
    ) &&
    requestedPage > 0
      ? requestedPage
      : 1;

  const limit =
    Number.isInteger(
      requestedLimit
    ) &&
    requestedLimit > 0
      ? Math.min(
          requestedLimit,
          50
        )
      : 10;

  return {
    page,
    limit,
    skip:
      (page - 1) *
      limit,
  };
};

const reviewInclude = {
  user: {
    select: {
      id: true,
      name: true,
    },
  },
  product: {
    select: {
      id: true,
      title: true,
      slug: true,
      images: true,
    },
  },
} as const;

// ======================================================
// REVIEW ELIGIBILITY
// GET /api/reviews/eligibility/:productId
// ======================================================

export const getReviewEligibility =
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user =
        requireRole(
          req,
          "user"
        );

      const productId =
        String(
          req.params.productId ||
            ""
        ).trim();

      if (!productId) {
        throw new ValidationError(
          "Product id is required"
        );
      }

      const product =
        await prisma.product.findUnique({
          where: {
            id: productId,
          },
          select: {
            id: true,
            sellerId: true,
          },
        });

      if (!product) {
        throw new NotFoundError(
          "Product not found"
        );
      }

      const existingReview =
        await prisma.review.findUnique({
          where: {
            userId_productId: {
              userId:
                user.id,
              productId,
            },
          },
          select: {
            id: true,
            rating: true,
            title: true,
            comment: true,
            createdAt: true,
            updatedAt: true,
          },
        });

      const eligibleOrder =
        await prisma.order.findFirst({
          where: {
            userId:
              user.id,

            paymentStatus:
              "PAID",

            items: {
              some: {
                productId,
                sellerId:
                  product.sellerId,
              },
            },

            sellerOrders: {
              some: {
                sellerId:
                  product.sellerId,

                status:
                  "DELIVERED",
              },
            },
          },

          orderBy: {
            createdAt:
              "desc",
          },

          select: {
            id: true,
          },
        });

      return res
        .status(200)
        .json({
          success: true,

          eligible:
            Boolean(
              eligibleOrder
            ),

          alreadyReviewed:
            Boolean(
              existingReview
            ),

          review:
            existingReview,

          orderId:
            eligibleOrder?.id ||
            null,
        });
    } catch (error) {
      return next(error);
    }
  };

// ======================================================
// CREATE REVIEW
// POST /api/reviews/product/:productId
// ======================================================

export const createReview =
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user =
        requireRole(
          req,
          "user"
        );

      const productId =
        String(
          req.params.productId ||
            ""
        ).trim();

      if (!productId) {
        throw new ValidationError(
          "Product id is required"
        );
      }

      const rating =
        normalizeRating(
          req.body.rating
        );

      const title =
        normalizeOptionalText(
          req.body.title,
          100
        );

      const comment =
        normalizeRequiredText(
          req.body.comment,
          "Review comment",
          1000
        );

      if (
        comment.length < 10
      ) {
        throw new ValidationError(
          "Review comment must contain at least 10 characters"
        );
      }

      const product =
        await prisma.product.findUnique({
          where: {
            id: productId,
          },
          select: {
            id: true,
            sellerId: true,
            status: true,
          },
        });

      if (!product) {
        throw new NotFoundError(
          "Product not found"
        );
      }

      const existingReview =
        await prisma.review.findUnique({
          where: {
            userId_productId: {
              userId:
                user.id,
              productId,
            },
          },
          select: {
            id: true,
          },
        });

      if (existingReview) {
        throw new ValidationError(
          "You have already reviewed this product"
        );
      }

      const eligibleOrder =
        await prisma.order.findFirst({
          where: {
            userId:
              user.id,

            paymentStatus:
              "PAID",

            items: {
              some: {
                productId,
                sellerId:
                  product.sellerId,
              },
            },

            sellerOrders: {
              some: {
                sellerId:
                  product.sellerId,

                status:
                  "DELIVERED",
              },
            },
          },

          orderBy: {
            createdAt:
              "desc",
          },

          select: {
            id: true,
          },
        });

      if (!eligibleOrder) {
        throw new ValidationError(
          "Only customers with a delivered, paid purchase can review this product"
        );
      }

      const review =
  await prisma.review.create({
    data: {
      userId:
        user.id,

      productId,

      sellerId:
        product.sellerId,

      orderId:
        eligibleOrder.id,

      rating,
      title,
      comment,

      status:
        "PUBLISHED",
    },

    include:
      reviewInclude,
  });

await sendNewReviewNotification(
  review.id
);

return res
  .status(201)
  .json({
    success: true,
    message:
      "Review published successfully",
    review,
  });

     
    } catch (error) {
      return next(error);
    }
  };

// ======================================================
// UPDATE CUSTOMER REVIEW
// PATCH /api/reviews/:reviewId
// ======================================================

export const updateReview =
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user =
        requireRole(
          req,
          "user"
        );

      const reviewId =
        String(
          req.params.reviewId ||
            ""
        ).trim();

      if (!reviewId) {
        throw new ValidationError(
          "Review id is required"
        );
      }

      const existingReview =
        await prisma.review.findFirst({
          where: {
            id: reviewId,
            userId:
              user.id,
          },
          select: {
            id: true,
          },
        });

      if (!existingReview) {
        throw new NotFoundError(
          "Review not found"
        );
      }

      const rating =
        normalizeRating(
          req.body.rating
        );

      const title =
        normalizeOptionalText(
          req.body.title,
          100
        );

      const comment =
        normalizeRequiredText(
          req.body.comment,
          "Review comment",
          1000
        );

      if (
        comment.length < 10
      ) {
        throw new ValidationError(
          "Review comment must contain at least 10 characters"
        );
      }

      const review =
        await prisma.review.update({
          where: {
            id: reviewId,
          },

          data: {
            rating,
            title,
            comment,
          },

          include:
            reviewInclude,
        });

      return res
        .status(200)
        .json({
          success: true,
          message:
            "Review updated successfully",
          review,
        });
    } catch (error) {
      return next(error);
    }
  };

// ======================================================
// DELETE CUSTOMER REVIEW
// DELETE /api/reviews/:reviewId
// ======================================================

export const deleteReview =
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user =
        requireRole(
          req,
          "user"
        );

      const reviewId =
        String(
          req.params.reviewId ||
            ""
        ).trim();

      if (!reviewId) {
        throw new ValidationError(
          "Review id is required"
        );
      }

      const review =
        await prisma.review.findFirst({
          where: {
            id: reviewId,
            userId:
              user.id,
          },
          select: {
            id: true,
          },
        });

      if (!review) {
        throw new NotFoundError(
          "Review not found"
        );
      }

      await prisma.review.delete({
        where: {
          id: reviewId,
        },
      });

      return res
        .status(200)
        .json({
          success: true,
          message:
            "Review deleted successfully",
        });
    } catch (error) {
      return next(error);
    }
  };

// ======================================================
// PUBLIC PRODUCT REVIEWS
// GET /api/reviews/product/:productId
// ======================================================

export const getPublicProductReviews =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const productId =
        String(
          req.params.productId ||
            ""
        ).trim();

      if (!productId) {
        throw new ValidationError(
          "Product id is required"
        );
      }

      const product =
        await prisma.product.findUnique({
          where: {
            id: productId,
          },
          select: {
            id: true,
          },
        });

      if (!product) {
        throw new NotFoundError(
          "Product not found"
        );
      }

      const {
        page,
        limit,
        skip,
      } = getPagination(req);

      const ratingFilter =
        Number(
          req.query.rating
        );

      const where = {
        productId,
        status:
          "PUBLISHED" as const,

        ...(Number.isInteger(
          ratingFilter
        ) &&
        ratingFilter >= 1 &&
        ratingFilter <= 5
          ? {
              rating:
                ratingFilter,
            }
          : {}),
      };

      const [
        reviews,
        totalReviews,
        ratingGroups,
      ] = await Promise.all([
        prisma.review.findMany({
          where,

          skip,
          take: limit,

          orderBy: {
            createdAt:
              "desc",
          },

          select: {
            id: true,
            rating: true,
            title: true,
            comment: true,
            sellerReply: true,
            sellerRepliedAt: true,
            createdAt: true,
            updatedAt: true,

            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        }),

        prisma.review.count({
          where,
        }),

        prisma.review.groupBy({
          by: ["rating"],

          where: {
            productId,
            status:
              "PUBLISHED",
          },

          _count: {
            rating: true,
          },
        }),
      ]);

      const ratingCounts = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      };

      let totalRating = 0;
      let allReviewCount = 0;

      for (
        const group of
        ratingGroups
      ) {
        ratingCounts[
          group.rating as
            | 1
            | 2
            | 3
            | 4
            | 5
        ] =
          group._count.rating;

        totalRating +=
          group.rating *
          group._count.rating;

        allReviewCount +=
          group._count.rating;
      }

      const averageRating =
        allReviewCount > 0
          ? Number(
              (
                totalRating /
                allReviewCount
              ).toFixed(1)
            )
          : 0;

      const totalPages =
        Math.max(
          1,
          Math.ceil(
            totalReviews /
              limit
          )
        );

      return res
        .status(200)
        .json({
          success: true,

          summary: {
            averageRating,
            totalReviews:
              allReviewCount,
            ratingCounts,
          },

          reviews,

          pagination: {
            page,
            limit,
            totalReviews,
            totalPages,

            hasPreviousPage:
              page > 1,

            hasNextPage:
              page <
              totalPages,
          },
        });
    } catch (error) {
      return next(error);
    }
  };

// ======================================================
// SELLER REVIEWS
// GET /api/reviews/seller
// ======================================================

export const getSellerReviews =
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const seller =
        requireRole(
          req,
          "seller"
        );

      const {
        page,
        limit,
        skip,
      } = getPagination(req);

      const search =
        typeof req.query.search ===
        "string"
          ? req.query.search.trim()
          : "";

      const rating =
        Number(
          req.query.rating
        );

      const replied =
        req.query.replied;

      const where = {
        sellerId:
          seller.id,

        ...(Number.isInteger(
          rating
        ) &&
        rating >= 1 &&
        rating <= 5
          ? {
              rating,
            }
          : {}),

        ...(replied === "true"
          ? {
              sellerReply: {
                not: null,
              },
            }
          : {}),

        ...(replied === "false"
          ? {
              sellerReply:
                null,
            }
          : {}),

        ...(search
          ? {
              OR: [
                {
                  comment: {
                    contains:
                      search,
                    mode:
                      "insensitive" as const,
                  },
                },
                {
                  title: {
                    contains:
                      search,
                    mode:
                      "insensitive" as const,
                  },
                },
                {
                  product: {
                    title: {
                      contains:
                        search,
                      mode:
                        "insensitive" as const,
                    },
                  },
                },
                {
                  user: {
                    name: {
                      contains:
                        search,
                      mode:
                        "insensitive" as const,
                    },
                  },
                },
              ],
            }
          : {}),
      };

      const [
        reviews,
        totalReviews,
        average,
        repliedCount,
      ] = await Promise.all([
        prisma.review.findMany({
          where,

          skip,
          take: limit,

          orderBy: {
            createdAt:
              "desc",
          },

          include:
            reviewInclude,
        }),

        prisma.review.count({
          where,
        }),

        prisma.review.aggregate({
          where: {
            sellerId:
              seller.id,
            status:
              "PUBLISHED",
          },

          _avg: {
            rating: true,
          },

          _count: {
            id: true,
          },
        }),

        prisma.review.count({
          where: {
            sellerId:
              seller.id,

            sellerReply: {
              not: null,
            },
          },
        }),
      ]);

      const totalSellerReviews =
        average._count.id;

      const totalPages =
        Math.max(
          1,
          Math.ceil(
            totalReviews /
              limit
          )
        );

      return res
        .status(200)
        .json({
          success: true,

          summary: {
            averageRating:
              Number(
                (
                  average._avg.rating ||
                  0
                ).toFixed(1)
              ),

            totalReviews:
              totalSellerReviews,

            repliedReviews:
              repliedCount,

            awaitingReply:
              Math.max(
                0,
                totalSellerReviews -
                  repliedCount
              ),
          },

          reviews,

          pagination: {
            page,
            limit,
            totalReviews,
            totalPages,

            hasPreviousPage:
              page > 1,

            hasNextPage:
              page <
              totalPages,
          },
        });
    } catch (error) {
      return next(error);
    }
  };

// ======================================================
// SELLER REPLY
// PATCH /api/reviews/seller/:reviewId/reply
// ======================================================

export const updateSellerReply =
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const seller =
        requireRole(
          req,
          "seller"
        );

      const reviewId =
        String(
          req.params.reviewId ||
            ""
        ).trim();

      if (!reviewId) {
        throw new ValidationError(
          "Review id is required"
        );
      }

      const reply =
        normalizeRequiredText(
          req.body.reply,
          "Seller reply",
          1000
        );

      if (
        reply.length < 2
      ) {
        throw new ValidationError(
          "Seller reply is too short"
        );
      }

      const existingReview =
        await prisma.review.findFirst({
          where: {
            id: reviewId,
            sellerId:
              seller.id,
          },
          select: {
            id: true,
          },
        });

      if (!existingReview) {
        throw new NotFoundError(
          "Review not found"
        );
      }

      const review =
  await prisma.review.update({
    where: {
      id: reviewId,
    },

    data: {
      sellerReply:
        reply,

      sellerRepliedAt:
        new Date(),
    },

    include:
      reviewInclude,
  });

await sendSellerReplyNotification(
  review.id
);

return res
  .status(200)
  .json({
    success: true,
    message:
      "Reply saved successfully",
    review,
  });
    } catch (error) {
      return next(error);
    }
  };

// ======================================================
// DELETE SELLER REPLY
// DELETE /api/reviews/seller/:reviewId/reply
// ======================================================

export const deleteSellerReply =
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const seller =
        requireRole(
          req,
          "seller"
        );

      const reviewId =
        String(
          req.params.reviewId ||
            ""
        ).trim();

      const existingReview =
        await prisma.review.findFirst({
          where: {
            id: reviewId,
            sellerId:
              seller.id,
          },
          select: {
            id: true,
          },
        });

      if (!existingReview) {
        throw new NotFoundError(
          "Review not found"
        );
      }

      const review =
        await prisma.review.update({
          where: {
            id: reviewId,
          },

          data: {
            sellerReply:
              null,

            sellerRepliedAt:
              null,
          },

          include:
            reviewInclude,
        });

      return res
        .status(200)
        .json({
          success: true,
          message:
            "Reply removed successfully",
          review,
        });
    } catch (error) {
      return next(error);
    }
  };