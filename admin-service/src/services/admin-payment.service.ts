// import { Prisma, SettlementStatus } from "@prisma/client";

// import prisma from "@org/prisma";

// import { BadRequestError, NotFoundError } from "@org/error-handler";

// import {
//   AdminPaymentListParams,
//   AdminPaymentListResponse,
//   AdminPaymentSummary,
// } from "../types/admin-payment.types";

// import {
//   sendSellerSettlementNotification,
// } from "./admin-notification.service";

// import {
//   sendSettlementCompletedEvent,
// } from "./settlement-event.service";

// const DEFAULT_LIMIT = 10;
// const MAX_LIMIT = 50;

// const roundMoney = (amount: number): number => {
//   return Math.round((amount + Number.EPSILON) * 100) / 100;
// };

// export const getAdminPaymentSummary =
//   async (): Promise<AdminPaymentSummary> => {
//     const [
//       totalTransactions,
//       pendingTransactions,
//       processingTransactions,
//       settledTransactions,
//       failedTransactions,
//       totals,
//       pendingTotals,
//       settledTotals,
//     ] = await Promise.all([
//       prisma.sellerSettlement.count(),

//       prisma.sellerSettlement.count({
//         where: {
//           status: "PENDING",
//         },
//       }),

//       prisma.sellerSettlement.count({
//         where: {
//           status: "PROCESSING",
//         },
//       }),

//       prisma.sellerSettlement.count({
//         where: {
//           status: "SETTLED",
//         },
//       }),

//       prisma.sellerSettlement.count({
//         where: {
//           status: "FAILED",
//         },
//       }),

//       prisma.sellerSettlement.aggregate({
//         _sum: {
//           grossAmount: true,
//           discountAmount: true,
//           netAmount: true,
//           platformFee: true,
//           sellerEarnings: true,
//         },
//       }),

//       prisma.sellerSettlement.aggregate({
//         where: {
//           status: {
//             in: ["PENDING", "PROCESSING"],
//           },
//         },

//         _sum: {
//           sellerEarnings: true,
//         },
//       }),

//       prisma.sellerSettlement.aggregate({
//         where: {
//           status: "SETTLED",
//         },

//         _sum: {
//           sellerEarnings: true,
//         },
//       }),
//     ]);

//     return {
//       totalTransactions,
//       pendingTransactions,
//       processingTransactions,
//       settledTransactions,
//       failedTransactions,

//       grossAmount: roundMoney(totals._sum.grossAmount ?? 0),

//       totalDiscounts: roundMoney(totals._sum.discountAmount ?? 0),

//       netAmount: roundMoney(totals._sum.netAmount ?? 0),

//       platformFees: roundMoney(totals._sum.platformFee ?? 0),

//       sellerEarnings: roundMoney(totals._sum.sellerEarnings ?? 0),

//       pendingEarnings: roundMoney(pendingTotals._sum.sellerEarnings ?? 0),

//       settledEarnings: roundMoney(settledTotals._sum.sellerEarnings ?? 0),
//     };
//   };

// export const getAdminPayments = async (
//   params: AdminPaymentListParams,
// ): Promise<AdminPaymentListResponse> => {
//   const page = Math.max(Math.trunc(params.page ?? 1), 1);

//   const limit = Math.min(
//     Math.max(Math.trunc(params.limit ?? DEFAULT_LIMIT), 1),
//     MAX_LIMIT,
//   );

//   const search = params.search?.trim();

//   const searchConditions: Prisma.SellerSettlementWhereInput[] = [];

//   if (search) {
//     searchConditions.push(
//       {
//         paymentId: {
//           contains: search,
//           mode: "insensitive",
//         },
//       },
//       {
//         seller: {
//           is: {
//             OR: [
//               {
//                 name: {
//                   contains: search,
//                   mode: "insensitive",
//                 },
//               },
//               {
//                 email: {
//                   contains: search,
//                   mode: "insensitive",
//                 },
//               },
//               {
//                 shopName: {
//                   contains: search,
//                   mode: "insensitive",
//                 },
//               },
//             ],
//           },
//         },
//       },
//     );

//     if (/^[a-f\d]{24}$/i.test(search)) {
//       searchConditions.push(
//         {
//           id: search,
//         },
//         {
//           orderId: search,
//         },
//         {
//           sellerId: search,
//         },
//       );
//     }
//   }

//   const where: Prisma.SellerSettlementWhereInput = {
//     ...(params.status
//       ? {
//           status: params.status,
//         }
//       : {}),

//     ...(searchConditions.length > 0
//       ? {
//           OR: searchConditions,
//         }
//       : {}),
//   };

//   const [totalPayments, payments] = await Promise.all([
//     prisma.sellerSettlement.count({
//       where,
//     }),

//     prisma.sellerSettlement.findMany({
//       where,

//       skip: (page - 1) * limit,

//       take: limit,

//       orderBy: {
//         createdAt: "desc",
//       },

//       include: {
//         seller: {
//           select: {
//             id: true,
//             name: true,
//             email: true,
//             shopName: true,
//           },
//         },

//         order: {
//           select: {
//             createdAt: true,
//           },
//         },
//       },
//     }),
//   ]);

//   const totalPages = totalPayments === 0 ? 0 : Math.ceil(totalPayments / limit);

//   return {
//     success: true,

//     message: "Admin payments fetched successfully",

//     payments: payments.map((payment) => ({
//       id: payment.id,
//       orderId: payment.orderId,

//       sellerOrderId: payment.sellerOrderId,

//       sellerId: payment.sellerId,

//       sellerName: payment.seller.name,

//       shopName: payment.seller.shopName,

//       sellerEmail: payment.seller.email,

//       currency: payment.currency,

//       paymentProvider: payment.paymentProvider,

//       transactionReference: payment.paymentId,

//       paymentVerifiedAt: payment.paymentVerifiedAt?.toISOString() ?? null,

//       grossAmount: roundMoney(payment.grossAmount),

//       discountAmount: roundMoney(payment.discountAmount),

//       netAmount: roundMoney(payment.netAmount),

//       platformFeeRate: payment.platformFeeRate,

//       platformFee: roundMoney(payment.platformFee),

//       sellerEarnings: roundMoney(payment.sellerEarnings),

//       status: payment.status,

//       processingAt: payment.processingAt?.toISOString() ?? null,

//       settledAt: payment.settledAt?.toISOString() ?? null,

//       failedAt: payment.failedAt?.toISOString() ?? null,

//       failureReason: payment.failureReason,

//       orderCreatedAt: payment.order.createdAt.toISOString(),

//       createdAt: payment.createdAt.toISOString(),

//       updatedAt: payment.updatedAt.toISOString(),
//     })),

//     pagination: {
//       page,
//       limit,
//       totalPayments,
//       totalPages,

//       hasPreviousPage: page > 1,

//       hasNextPage: page < totalPages,
//     },
//   };
// };

// export const updateAdminSettlementStatus = async (
//   settlementId: string,
//   nextStatus: SettlementStatus,
//   failureReason?: string,
// ) => {
//   const normalizedId = settlementId.trim();

//   if (!normalizedId) {
//     throw new BadRequestError("Settlement ID is required");
//   }

//   const settlement = await prisma.sellerSettlement.findUnique({
//     where: {
//       id: normalizedId,
//     },
//   });

//   if (!settlement) {
//     throw new NotFoundError("Settlement not found");
//   }

//   if (settlement.status === "SETTLED") {
//     throw new BadRequestError("A settled transaction cannot be changed");
//   }

//   const allowedTransitions: Record<SettlementStatus, SettlementStatus[]> = {
//     PENDING: ["PROCESSING", "FAILED"],

//     PROCESSING: ["SETTLED", "FAILED"],

//     FAILED: ["PENDING"],

//     SETTLED: [],
//   };

//   if (!allowedTransitions[settlement.status].includes(nextStatus)) {
//     throw new BadRequestError(
//       `Settlement cannot move from ${settlement.status} to ${nextStatus}`,
//     );
//   }

//   const normalizedReason = failureReason?.trim();

//   if (nextStatus === "FAILED" && !normalizedReason) {
//     throw new BadRequestError("Failure reason is required");
//   }

//   const now = new Date();

//   const updated = await prisma.sellerSettlement.update({
//     where: {
//       id: normalizedId,
//     },

//     data: {
//       status: nextStatus,

//       processingAt:
//         nextStatus === "PROCESSING"
//           ? now
//           : nextStatus === "PENDING"
//             ? null
//             : settlement.processingAt,

//       settledAt: nextStatus === "SETTLED" ? now : null,

//       failedAt: nextStatus === "FAILED" ? now : null,

//       failureReason: nextStatus === "FAILED" ? normalizedReason : null,
//     },

//     include: {
//       seller: {
//         select: {
//           name: true,
//           email: true,
//           shopName: true,
//         },
//       },
//     },
//   });

//   if (
//   updated.status ===
//   "SETTLED"
// ) {
//   await sendSellerSettlementNotification({
//     settlementId:
//       updated.id,

//     orderId:
//       updated.orderId,

//     sellerId:
//       updated.sellerId,

//     sellerEarnings:
//       updated.sellerEarnings,

//     currency:
//       updated.currency,
//   });
// }


//   return {
//     success: true,

//     message: `Settlement marked as ${nextStatus.toLowerCase()}`,

//     settlement: {
//       id: updated.id,
//       status: updated.status,

//       processingAt: updated.processingAt?.toISOString() ?? null,

//       settledAt: updated.settledAt?.toISOString() ?? null,

//       failedAt: updated.failedAt?.toISOString() ?? null,

//       failureReason: updated.failureReason,

//       updatedAt: updated.updatedAt.toISOString(),
//     },
//   };
// };



import {
  Prisma,
  SettlementStatus,
} from "@prisma/client";

import prisma from "@org/prisma";

import {
  BadRequestError,
  NotFoundError,
} from "@org/error-handler";

import {
  AdminPaymentListParams,
  AdminPaymentListResponse,
  AdminPaymentSummary,
} from "../types/admin-payment.types";

import {
  sendSellerSettlementNotification,
} from "./admin-notification.service";

import {
  sendSettlementCompletedEvent,
} from "./settlement-event.service";

// ======================================================
// CONSTANTS
// ======================================================

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

// ======================================================
// MONEY
// ======================================================

const roundMoney = (
  amount: number,
): number => {
  return (
    Math.round(
      (
        amount +
        Number.EPSILON
      ) *
        100,
    ) / 100
  );
};

// ======================================================
// GET ADMIN PAYMENT SUMMARY
// ======================================================

export const getAdminPaymentSummary =
  async (): Promise<AdminPaymentSummary> => {
    const [
      totalTransactions,
      pendingTransactions,
      processingTransactions,
      settledTransactions,
      failedTransactions,
      totals,
      pendingTotals,
      settledTotals,
    ] = await Promise.all([
      prisma.sellerSettlement.count(),

      prisma.sellerSettlement.count({
        where: {
          status:
            "PENDING",
        },
      }),

      prisma.sellerSettlement.count({
        where: {
          status:
            "PROCESSING",
        },
      }),

      prisma.sellerSettlement.count({
        where: {
          status:
            "SETTLED",
        },
      }),

      prisma.sellerSettlement.count({
        where: {
          status:
            "FAILED",
        },
      }),

      prisma.sellerSettlement.aggregate({
        _sum: {
          grossAmount:
            true,

          discountAmount:
            true,

          netAmount:
            true,

          platformFee:
            true,

          sellerEarnings:
            true,
        },
      }),

      prisma.sellerSettlement.aggregate({
        where: {
          status: {
            in: [
              "PENDING",
              "PROCESSING",
            ],
          },
        },

        _sum: {
          sellerEarnings:
            true,
        },
      }),

      prisma.sellerSettlement.aggregate({
        where: {
          status:
            "SETTLED",
        },

        _sum: {
          sellerEarnings:
            true,
        },
      }),
    ]);

    return {
      totalTransactions,
      pendingTransactions,
      processingTransactions,
      settledTransactions,
      failedTransactions,

      grossAmount:
        roundMoney(
          totals._sum
            .grossAmount ??
            0,
        ),

      totalDiscounts:
        roundMoney(
          totals._sum
            .discountAmount ??
            0,
        ),

      netAmount:
        roundMoney(
          totals._sum
            .netAmount ??
            0,
        ),

      platformFees:
        roundMoney(
          totals._sum
            .platformFee ??
            0,
        ),

      sellerEarnings:
        roundMoney(
          totals._sum
            .sellerEarnings ??
            0,
        ),

      pendingEarnings:
        roundMoney(
          pendingTotals._sum
            .sellerEarnings ??
            0,
        ),

      settledEarnings:
        roundMoney(
          settledTotals._sum
            .sellerEarnings ??
            0,
        ),
    };
  };

// ======================================================
// GET ADMIN PAYMENTS
// ======================================================

export const getAdminPayments =
  async (
    params:
      AdminPaymentListParams,
  ): Promise<AdminPaymentListResponse> => {
    const page =
      Math.max(
        Math.trunc(
          params.page ??
            1,
        ),
        1,
      );

    const limit =
      Math.min(
        Math.max(
          Math.trunc(
            params.limit ??
              DEFAULT_LIMIT,
          ),
          1,
        ),
        MAX_LIMIT,
      );

    const search =
      params.search?.trim();

    const searchConditions:
      Prisma.SellerSettlementWhereInput[] =
      [];

    if (search) {
      searchConditions.push(
        {
          paymentId: {
            contains:
              search,

            mode:
              "insensitive",
          },
        },

        {
          seller: {
            is: {
              OR: [
                {
                  name: {
                    contains:
                      search,

                    mode:
                      "insensitive",
                  },
                },

                {
                  email: {
                    contains:
                      search,

                    mode:
                      "insensitive",
                  },
                },

                {
                  shopName: {
                    contains:
                      search,

                    mode:
                      "insensitive",
                  },
                },
              ],
            },
          },
        },
      );

      if (
        /^[a-f\d]{24}$/i.test(
          search,
        )
      ) {
        searchConditions.push(
          {
            id:
              search,
          },

          {
            orderId:
              search,
          },

          {
            sellerId:
              search,
          },
        );
      }
    }

    const where:
      Prisma.SellerSettlementWhereInput =
      {
        ...(params.status
          ? {
              status:
                params.status,
            }
          : {}),

        ...(searchConditions.length >
        0
          ? {
              OR:
                searchConditions,
            }
          : {}),
      };

    const [
      totalPayments,
      payments,
    ] = await Promise.all([
      prisma.sellerSettlement.count({
        where,
      }),

      prisma.sellerSettlement.findMany({
        where,

        skip:
          (page - 1) *
          limit,

        take:
          limit,

        orderBy: {
          createdAt:
            "desc",
        },

        include: {
          seller: {
            select: {
              id:
                true,

              name:
                true,

              email:
                true,

              shopName:
                true,
            },
          },

          order: {
            select: {
              createdAt:
                true,
            },
          },
        },
      }),
    ]);

    const totalPages =
      totalPayments === 0
        ? 0
        : Math.ceil(
            totalPayments /
              limit,
          );

    return {
      success:
        true,

      message:
        "Admin payments fetched successfully",

      payments:
        payments.map(
          (payment) => ({
            id:
              payment.id,

            orderId:
              payment.orderId,

            sellerOrderId:
              payment.sellerOrderId,

            sellerId:
              payment.sellerId,

            sellerName:
              payment.seller.name,

            shopName:
              payment.seller
                .shopName,

            sellerEmail:
              payment.seller.email,

            currency:
              payment.currency,

            paymentProvider:
              payment.paymentProvider,

            transactionReference:
              payment.paymentId,

            paymentVerifiedAt:
              payment.paymentVerifiedAt
                ?.toISOString() ??
              null,

            grossAmount:
              roundMoney(
                payment.grossAmount,
              ),

            discountAmount:
              roundMoney(
                payment.discountAmount,
              ),

            netAmount:
              roundMoney(
                payment.netAmount,
              ),

            platformFeeRate:
              payment.platformFeeRate,

            platformFee:
              roundMoney(
                payment.platformFee,
              ),

            sellerEarnings:
              roundMoney(
                payment.sellerEarnings,
              ),

            status:
              payment.status,

            processingAt:
              payment.processingAt
                ?.toISOString() ??
              null,

            settledAt:
              payment.settledAt
                ?.toISOString() ??
              null,

            failedAt:
              payment.failedAt
                ?.toISOString() ??
              null,

            failureReason:
              payment.failureReason,

            orderCreatedAt:
              payment.order
                .createdAt
                .toISOString(),

            createdAt:
              payment.createdAt
                .toISOString(),

            updatedAt:
              payment.updatedAt
                .toISOString(),
          }),
        ),

      pagination: {
        page,
        limit,
        totalPayments,
        totalPages,

        hasPreviousPage:
          page > 1,

        hasNextPage:
          page <
          totalPages,
      },
    };
  };

// ======================================================
// UPDATE SETTLEMENT STATUS
// ======================================================

export const updateAdminSettlementStatus =
  async (
    settlementId:
      string,

    nextStatus:
      SettlementStatus,

    failureReason?:
      string,
  ) => {
    const normalizedId =
      settlementId.trim();

    if (!normalizedId) {
      throw new BadRequestError(
        "Settlement ID is required",
      );
    }

    const settlement =
      await prisma.sellerSettlement.findUnique({
        where: {
          id:
            normalizedId,
        },
      });

    if (!settlement) {
      throw new NotFoundError(
        "Settlement not found",
      );
    }

    if (
      settlement.status ===
      "SETTLED"
    ) {
      throw new BadRequestError(
        "A settled transaction cannot be changed",
      );
    }

    const allowedTransitions:
      Record<
        SettlementStatus,
        SettlementStatus[]
      > = {
        PENDING: [
          "PROCESSING",
          "FAILED",
        ],

        PROCESSING: [
          "SETTLED",
          "FAILED",
        ],

        FAILED: [
          "PENDING",
        ],

        SETTLED:
          [],
      };

    if (
      !allowedTransitions[
        settlement.status
      ].includes(
        nextStatus,
      )
    ) {
      throw new BadRequestError(
        `Settlement cannot move from ${settlement.status} to ${nextStatus}`,
      );
    }

    const normalizedReason =
      failureReason?.trim();

    if (
      nextStatus ===
        "FAILED" &&
      !normalizedReason
    ) {
      throw new BadRequestError(
        "Failure reason is required",
      );
    }

    const now =
      new Date();

    // ==================================================
    // UPDATE DATABASE FIRST
    // ==================================================

    const updated =
      await prisma.sellerSettlement.update({
        where: {
          id:
            normalizedId,
        },

        data: {
          status:
            nextStatus,

          processingAt:
            nextStatus ===
            "PROCESSING"
              ? now
              : nextStatus ===
                  "PENDING"
                ? null
                : settlement.processingAt,

          settledAt:
            nextStatus ===
            "SETTLED"
              ? now
              : null,

          failedAt:
            nextStatus ===
            "FAILED"
              ? now
              : null,

          failureReason:
            nextStatus ===
            "FAILED"
              ? normalizedReason
              : null,
        },

        include: {
          seller: {
            select: {
              name:
                true,

              email:
                true,

              shopName:
                true,
            },
          },
        },
      });

    // ==================================================
    // NOTIFY AND PUBLISH AFTER SUCCESSFUL SETTLEMENT
    // ==================================================

    if (
      updated.status ===
      "SETTLED"
    ) {
      await sendSellerSettlementNotification({
        settlementId:
          updated.id,

        orderId:
          updated.orderId,

        sellerId:
          updated.sellerId,

        sellerEarnings:
          updated.sellerEarnings,

        currency:
          updated.currency,
      });

      await sendSettlementCompletedEvent(
        updated,
      );
    }

    return {
      success:
        true,

      message:
        `Settlement marked as ${nextStatus.toLowerCase()}`,

      settlement: {
        id:
          updated.id,

        status:
          updated.status,

        processingAt:
          updated.processingAt
            ?.toISOString() ??
          null,

        settledAt:
          updated.settledAt
            ?.toISOString() ??
          null,

        failedAt:
          updated.failedAt
            ?.toISOString() ??
          null,

        failureReason:
          updated.failureReason,

        updatedAt:
          updated.updatedAt.toISOString(),
      },
    };
  };