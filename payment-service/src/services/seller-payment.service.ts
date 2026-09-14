// import prisma from "@org/prisma";

// import {
//   BadRequestError,
//   NotFoundError,
// } from "@org/error-handler";

// import {
//   SellerPaymentListQuery,
//   SellerPaymentListResult,
//   SellerPaymentSummary,
// } from "../types/seller-payment.types";

// // ======================================================
// // PLATFORM FEE
// // ======================================================

// const DEFAULT_PLATFORM_FEE_PERCENT =
//   5;

// const getPlatformFeePercent =
//   (): number => {
//     const configuredValue =
//       process.env
//         .PLATFORM_FEE_PERCENT
//         ?.trim();

//     if (!configuredValue) {
//       return DEFAULT_PLATFORM_FEE_PERCENT;
//     }

//     const platformFeePercent =
//       Number(configuredValue);

//     if (
//       !Number.isFinite(
//         platformFeePercent
//       ) ||
//       platformFeePercent < 0 ||
//       platformFeePercent > 100
//     ) {
//       throw new Error(
//         "PLATFORM_FEE_PERCENT must be between 0 and 100"
//       );
//     }

//     return platformFeePercent;
//   };

// // ======================================================
// // ROUND MONEY
// // ======================================================

// const roundMoney = (
//   value: number
// ): number => {
//   return (
//     Math.round(
//       (value +
//         Number.EPSILON) *
//         100
//     ) / 100
//   );
// };

// // ======================================================
// // NORMALIZE STRING
// // ======================================================

// const normalizeString = (
//   value: unknown
// ): string => {
//   return typeof value ===
//     "string"
//     ? value.trim()
//     : "";
// };

// // ======================================================
// // NORMALIZE PAGINATION
// // ======================================================

// const normalizePagination = (
//   pageValue?: number,
//   limitValue?: number
// ) => {
//   const requestedPage =
//     Number(pageValue);

//   const requestedLimit =
//     Number(limitValue);

//   const page =
//     Number.isInteger(
//       requestedPage
//     ) &&
//     requestedPage > 0
//       ? requestedPage
//       : 1;

//   const limit =
//     Number.isInteger(
//       requestedLimit
//     ) &&
//     requestedLimit > 0
//       ? Math.min(
//           requestedLimit,
//           50
//         )
//       : 10;

//   return {
//     page,
//     limit,
//     skip:
//       (page - 1) *
//       limit,
//   };
// };

// // ======================================================
// // VERIFY SELLER
// // ======================================================

// const verifySeller = async (
//   sellerId: string
// ) => {
//   const normalizedSellerId =
//     normalizeString(
//       sellerId
//     );

//   if (!normalizedSellerId) {
//     throw new BadRequestError(
//       "Seller ID is required"
//     );
//   }

//   const seller =
//     await prisma.sellers.findUnique({
//       where: {
//         id:
//           normalizedSellerId,
//       },

//       select: {
//         id: true,
//         bankConnected: true,
//       },
//     });

//   if (!seller) {
//     throw new NotFoundError(
//       "Seller not found"
//     );
//   }

//   return seller;
// };

// // ======================================================
// // BACKFILL MISSING SELLER SETTLEMENTS
// //
// // This safely creates settlement records for existing
// // paid orders that were completed before the settlement
// // model was introduced.
// //
// // Existing settlements are never overwritten.
// // ======================================================

// export const ensureSellerSettlements =
//   async (
//     sellerId: string
//   ): Promise<number> => {
//     const seller =
//       await verifySeller(
//         sellerId
//       );

//     const sellerOrders =
//       await prisma.sellerOrder.findMany({
//         where: {
//           sellerId:
//             seller.id,
//         },

//         include: {
//           settlement: true,

//           order: {
//             select: {
//               paymentStatus:
//                 true,

//               paymentProvider:
//                 true,

//               paymentId:
//                 true,

//               paymentVerifiedAt:
//                 true,
//             },
//           },
//         },
//       });

//     const platformFeePercent =
//       getPlatformFeePercent();

//     let createdCount = 0;

//     for (
//       const sellerOrder of
//       sellerOrders
//     ) {
//       if (
//         sellerOrder.settlement ||
//         sellerOrder.order
//           .paymentStatus !==
//           "PAID"
//       ) {
//         continue;
//       }

//       const grossAmount =
//         roundMoney(
//           sellerOrder.subtotal
//         );

//       const discountAmount =
//         roundMoney(
//           Math.min(
//             Math.max(
//               sellerOrder.discount,
//               0
//             ),
//             grossAmount
//           )
//         );

//       const netAmount =
//         roundMoney(
//           Math.max(
//             sellerOrder.totalAmount,
//             0
//           )
//         );

//       const platformFee =
//         roundMoney(
//           netAmount *
//             (platformFeePercent /
//               100)
//         );

//       const sellerEarnings =
//         roundMoney(
//           Math.max(
//             netAmount -
//               platformFee,
//             0
//           )
//         );

//       await prisma.sellerSettlement.upsert({
//         where: {
//           sellerOrderId:
//             sellerOrder.id,
//         },

//         create: {
//           orderId:
//             sellerOrder.orderId,

//           sellerId:
//             sellerOrder.sellerId,

//           sellerOrderId:
//             sellerOrder.id,

//           currency:
//             "INR",

//           paymentProvider:
//             sellerOrder.order
//               .paymentProvider,

//           paymentId:
//             sellerOrder.order
//               .paymentId,

//           paymentVerifiedAt:
//             sellerOrder.order
//               .paymentVerifiedAt,

//           grossAmount,
//           discountAmount,
//           netAmount,

//           platformFeeRate:
//             platformFeePercent,

//           platformFee,
//           sellerEarnings,

//           status:
//             "PENDING",
//         },

//         update: {},
//       });

//       createdCount += 1;
//     }

//     if (createdCount > 0) {
//       console.log(
//         `💰 Created ${createdCount} missing settlement record(s) for seller ${seller.id}`
//       );
//     }

//     return createdCount;
//   };

// // ======================================================
// // GET SELLER PAYMENTS
// // ======================================================

// export const getSellerPayments =
//   async (
//     sellerId: string,
//     query: SellerPaymentListQuery = {}
//   ): Promise<SellerPaymentListResult> => {
//     const seller =
//       await verifySeller(
//         sellerId
//       );

//     // Backfill old paid seller orders before listing.

//     await ensureSellerSettlements(
//       seller.id
//     );

//     const {
//       page,
//       limit,
//       skip,
//     } = normalizePagination(
//       query.page,
//       query.limit
//     );

//     const search =
//       normalizeString(
//         query.search
//       );

//     const objectIdSearch =
//       /^[a-fA-F0-9]{24}$/.test(
//         search
//       );

//     const where = {
//       sellerId:
//         seller.id,

//       ...(query.status
//         ? {
//             status:
//               query.status,
//           }
//         : {}),

//       ...(search
//         ? {
//             OR: [
//               {
//                 paymentId: {
//                   contains:
//                     search,

//                   mode:
//                     "insensitive" as const,
//                 },
//               },

//               ...(objectIdSearch
//                 ? [
//                     {
//                       orderId:
//                         search,
//                     },
//                     {
//                       sellerOrderId:
//                         search,
//                     },
//                   ]
//                 : []),
//             ],
//           }
//         : {}),
//     };

//     const [
//       totalPayments,
//       settlements,
//     ] = await prisma.$transaction([
//       prisma.sellerSettlement.count({
//         where,
//       }),

//       prisma.sellerSettlement.findMany({
//         where,

//         orderBy: {
//           paymentVerifiedAt:
//             "desc",
//         },

//         skip,
//         take: limit,

//         include: {
//           order: {
//             select: {
//               paymentStatus:
//                 true,

//               shippingFullName:
//                 true,

//               contactEmail:
//                 true,

//               createdAt:
//                 true,
//             },
//           },
//         },
//       }),
//     ]);

//     const payments =
//       settlements.map(
//         (settlement) => ({
//           id:
//             settlement.id,

//           orderId:
//             settlement.orderId,

//           sellerOrderId:
//             settlement.sellerOrderId,

//           paymentStatus:
//             settlement.order
//               .paymentStatus,

//           paymentProvider:
//             settlement.paymentProvider,

//           transactionReference:
//             settlement.paymentId,

//           paymentVerifiedAt:
//             settlement.paymentVerifiedAt,

//           grossSale:
//             roundMoney(
//               settlement.grossAmount
//             ),

//           sellerDiscount:
//             roundMoney(
//               settlement.discountAmount
//             ),

//           netSale:
//             roundMoney(
//               settlement.netAmount
//             ),

//           platformFeeRate:
//             settlement.platformFeeRate,

//           platformFee:
//             roundMoney(
//               settlement.platformFee
//             ),

//           sellerEarnings:
//             roundMoney(
//               settlement.sellerEarnings
//             ),

//           settlementStatus:
//             settlement.status,

//           processingAt:
//             settlement.processingAt,

//           settledAt:
//             settlement.settledAt,

//           failedAt:
//             settlement.failedAt,

//           failureReason:
//             settlement.failureReason,

//           customer: {
//             fullName:
//               settlement.order
//                 .shippingFullName,

//             email:
//               settlement.order
//                 .contactEmail,
//           },

//           orderCreatedAt:
//             settlement.order
//               .createdAt,

//           createdAt:
//             settlement.createdAt,

//           updatedAt:
//             settlement.updatedAt,
//         })
//       );

//     const totalPages =
//       totalPayments === 0
//         ? 0
//         : Math.ceil(
//             totalPayments /
//               limit
//           );

//     return {
//       payments,

//       pagination: {
//         page,
//         limit,
//         totalPayments,
//         totalPages,

//         hasPreviousPage:
//           page > 1,

//         hasNextPage:
//           page <
//           totalPages,
//       },
//     };
//   };

// // ======================================================
// // GET SELLER PAYMENT SUMMARY
// // ======================================================

// export const getSellerPaymentSummary =
//   async (
//     sellerId: string
//   ): Promise<SellerPaymentSummary> => {
//     const seller =
//       await verifySeller(
//         sellerId
//       );

//     await ensureSellerSettlements(
//       seller.id
//     );

//     const [
//       totalTransactions,
//       pendingSettlements,
//       processingSettlements,
//       settledTransactions,
//       failedSettlements,
//       overallAmounts,
//       pendingAmounts,
//       settledAmounts,
//     ] = await prisma.$transaction([
//       prisma.sellerSettlement.count({
//         where: {
//           sellerId:
//             seller.id,
//         },
//       }),

//       prisma.sellerSettlement.count({
//         where: {
//           sellerId:
//             seller.id,

//           status:
//             "PENDING",
//         },
//       }),

//       prisma.sellerSettlement.count({
//         where: {
//           sellerId:
//             seller.id,

//           status:
//             "PROCESSING",
//         },
//       }),

//       prisma.sellerSettlement.count({
//         where: {
//           sellerId:
//             seller.id,

//           status:
//             "SETTLED",
//         },
//       }),

//       prisma.sellerSettlement.count({
//         where: {
//           sellerId:
//             seller.id,

//           status:
//             "FAILED",
//         },
//       }),

//       prisma.sellerSettlement.aggregate({
//         where: {
//           sellerId:
//             seller.id,
//         },

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
//           sellerId:
//             seller.id,

//           status: {
//             in: [
//               "PENDING",
//               "PROCESSING",
//             ],
//           },
//         },

//         _sum: {
//           sellerEarnings: true,
//         },
//       }),

//       prisma.sellerSettlement.aggregate({
//         where: {
//           sellerId:
//             seller.id,

//           status:
//             "SETTLED",
//         },

//         _sum: {
//           sellerEarnings: true,
//         },
//       }),
//     ]);

//     return {
//       totalTransactions,

//       pendingSettlements,
//       processingSettlements,
//       settledTransactions,
//       failedSettlements,

//       grossSales:
//         roundMoney(
//           overallAmounts
//             ._sum
//             .grossAmount ?? 0
//         ),

//       totalDiscounts:
//         roundMoney(
//           overallAmounts
//             ._sum
//             .discountAmount ?? 0
//         ),

//       netSales:
//         roundMoney(
//           overallAmounts
//             ._sum
//             .netAmount ?? 0
//         ),

//       totalPlatformFees:
//         roundMoney(
//           overallAmounts
//             ._sum
//             .platformFee ?? 0
//         ),

//       totalSellerEarnings:
//         roundMoney(
//           overallAmounts
//             ._sum
//             .sellerEarnings ?? 0
//         ),

//       pendingEarnings:
//         roundMoney(
//           pendingAmounts
//             ._sum
//             .sellerEarnings ?? 0
//         ),

//       settledEarnings:
//         roundMoney(
//           settledAmounts
//             ._sum
//             .sellerEarnings ?? 0
//         ),
//     };
//   };

import prisma from "@org/prisma";

import {
  BadRequestError,
  NotFoundError,
} from "@org/error-handler";

import {
  SellerPaymentListQuery,
  SellerPaymentListResult,
  SellerPaymentSummary,
} from "../types/seller-payment.types";

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
// ROUND MONEY
// ======================================================

const roundMoney = (
  value: number
): number => {
  return (
    Math.round(
      (value + Number.EPSILON) *
        100
    ) / 100
  );
};

// ======================================================
// NORMALIZE STRING
// ======================================================

const normalizeString = (
  value: unknown
): string => {
  return typeof value ===
    "string"
    ? value.trim()
    : "";
};

// ======================================================
// NORMALIZE PAGINATION
// ======================================================

const normalizePagination = (
  pageValue?: number,
  limitValue?: number
) => {
  const requestedPage =
    Number(pageValue);

  const requestedLimit =
    Number(limitValue);

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

// ======================================================
// VERIFY SELLER
// ======================================================

const verifySeller = async (
  sellerId: string
) => {
  const normalizedSellerId =
    normalizeString(
      sellerId
    );

  if (!normalizedSellerId) {
    throw new BadRequestError(
      "Seller ID is required"
    );
  }

  const seller =
    await prisma.sellers.findUnique({
      where: {
        id:
          normalizedSellerId,
      },

      select: {
        id: true,
        bankConnected: true,
      },
    });

  if (!seller) {
    throw new NotFoundError(
      "Seller not found"
    );
  }

  return seller;
};

// ======================================================
// BACKFILL MISSING SELLER SETTLEMENTS
// ======================================================

export const ensureSellerSettlements =
  async (
    sellerId: string
  ): Promise<number> => {
    const seller =
      await verifySeller(
        sellerId
      );

    const sellerOrders =
      await prisma.sellerOrder.findMany({
        where: {
          sellerId:
            seller.id,
        },

        include: {
          settlement: true,

          order: {
            select: {
              paymentStatus:
                true,

              paymentProvider:
                true,

              paymentId:
                true,

              paymentVerifiedAt:
                true,
            },
          },
        },
      });

    const platformFeePercent =
      getPlatformFeePercent();

    let createdCount = 0;

    for (
      const sellerOrder of
      sellerOrders
    ) {
      if (
        sellerOrder.settlement ||
        sellerOrder.order
          .paymentStatus !==
          "PAID"
      ) {
        continue;
      }

      const grossAmount =
        roundMoney(
          sellerOrder.subtotal
        );

      const discountAmount =
        roundMoney(
          Math.min(
            Math.max(
              sellerOrder.discount,
              0
            ),
            grossAmount
          )
        );

      const netAmount =
        roundMoney(
          Math.max(
            sellerOrder.totalAmount,
            0
          )
        );

      const platformFee =
        roundMoney(
          netAmount *
            (
              platformFeePercent /
              100
            )
        );

      const sellerEarnings =
        roundMoney(
          Math.max(
            netAmount -
              platformFee,
            0
          )
        );

      await prisma.sellerSettlement.upsert({
        where: {
          sellerOrderId:
            sellerOrder.id,
        },

        create: {
          orderId:
            sellerOrder.orderId,

          sellerId:
            sellerOrder.sellerId,

          sellerOrderId:
            sellerOrder.id,

          currency:
            "INR",

          paymentProvider:
            sellerOrder.order
              .paymentProvider,

          paymentId:
            sellerOrder.order
              .paymentId,

          paymentVerifiedAt:
            sellerOrder.order
              .paymentVerifiedAt,

          grossAmount,
          discountAmount,
          netAmount,

          platformFeeRate:
            platformFeePercent,

          platformFee,
          sellerEarnings,

          status:
            "PENDING",
        },

        update: {},
      });

      createdCount += 1;
    }

    if (createdCount > 0) {
      console.log(
        `💰 Created ${createdCount} missing settlement record(s) for seller ${seller.id}`
      );
    }

    return createdCount;
  };

// ======================================================
// GET SELLER PAYMENTS
// ======================================================

export const getSellerPayments =
  async (
    sellerId: string,
    query:
      SellerPaymentListQuery = {}
  ): Promise<
    SellerPaymentListResult
  > => {
    const seller =
      await verifySeller(
        sellerId
      );

    await ensureSellerSettlements(
      seller.id
    );

    const {
      page,
      limit,
      skip,
    } =
      normalizePagination(
        query.page,
        query.limit
      );

    const search =
      normalizeString(
        query.search
      );

    const objectIdSearch =
      /^[a-fA-F0-9]{24}$/.test(
        search
      );

    const where = {
      sellerId:
        seller.id,

      ...(query.status
        ? {
            status:
              query.status,
          }
        : {}),

      ...(search
        ? {
            OR: [
              {
                paymentId: {
                  contains:
                    search,

                  mode:
                    "insensitive" as const,
                },
              },

              ...(objectIdSearch
                ? [
                    {
                      orderId:
                        search,
                    },

                    {
                      sellerOrderId:
                        search,
                    },
                  ]
                : []),
            ],
          }
        : {}),
    };

    const [
      totalPayments,
      settlements,
    ] =
      await prisma.$transaction([
        prisma.sellerSettlement.count({
          where,
        }),

        prisma.sellerSettlement.findMany({
          where,

          orderBy: {
            paymentVerifiedAt:
              "desc",
          },

          skip,
          take:
            limit,

          include: {
            order: {
              select: {
                paymentStatus:
                  true,

                shippingFullName:
                  true,

                contactEmail:
                  true,

                createdAt:
                  true,
              },
            },
          },
        }),
      ]);

    const payments =
      settlements.map(
        (
          settlement
        ) => ({
          id:
            settlement.id,

          orderId:
            settlement.orderId,

          sellerOrderId:
            settlement.sellerOrderId,

          paymentStatus:
            settlement.order
              .paymentStatus,

          paymentProvider:
            settlement.paymentProvider,

          transactionReference:
            settlement.paymentId,

          paymentVerifiedAt:
            settlement.paymentVerifiedAt,

          grossSale:
            roundMoney(
              settlement.grossAmount
            ),

          sellerDiscount:
            roundMoney(
              settlement.discountAmount
            ),

          netSale:
            roundMoney(
              settlement.netAmount
            ),

          platformFeeRate:
            settlement.platformFeeRate,

          platformFee:
            roundMoney(
              settlement.platformFee
            ),

          sellerEarnings:
            roundMoney(
              settlement.sellerEarnings
            ),

          settlementStatus:
            settlement.status,

          processingAt:
            settlement.processingAt,

          settledAt:
            settlement.settledAt,

          failedAt:
            settlement.failedAt,

          failureReason:
            settlement.failureReason,

          customer: {
            fullName:
              settlement.order
                .shippingFullName,

            email:
              settlement.order
                .contactEmail,
          },

          orderCreatedAt:
            settlement.order
              .createdAt,

          createdAt:
            settlement.createdAt,

          updatedAt:
            settlement.updatedAt,
        })
      );

    const totalPages =
      totalPayments === 0
        ? 0
        : Math.ceil(
            totalPayments /
              limit
          );

    return {
      payments,

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
// GET SELLER PAYMENT SUMMARY
// ======================================================

export const getSellerPaymentSummary =
  async (
    sellerId: string
  ): Promise<
    SellerPaymentSummary
  > => {
    const seller =
      await verifySeller(
        sellerId
      );

    await ensureSellerSettlements(
      seller.id
    );

    const [
      totalTransactions,
      pendingSettlements,
      processingSettlements,
      settledTransactions,
      failedSettlements,
      overallAmounts,
      pendingAmounts,
      settledAmounts,
    ] =
      await prisma.$transaction([
        prisma.sellerSettlement.count({
          where: {
            sellerId:
              seller.id,
          },
        }),

        prisma.sellerSettlement.count({
          where: {
            sellerId:
              seller.id,

            status:
              "PENDING",
          },
        }),

        prisma.sellerSettlement.count({
          where: {
            sellerId:
              seller.id,

            status:
              "PROCESSING",
          },
        }),

        prisma.sellerSettlement.count({
          where: {
            sellerId:
              seller.id,

            status:
              "SETTLED",
          },
        }),

        prisma.sellerSettlement.count({
          where: {
            sellerId:
              seller.id,

            status:
              "FAILED",
          },
        }),

        prisma.sellerSettlement.aggregate({
          where: {
            sellerId:
              seller.id,
          },

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
            sellerId:
              seller.id,

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
            sellerId:
              seller.id,

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
      pendingSettlements,
      processingSettlements,
      settledTransactions,
      failedSettlements,

      grossSales:
        roundMoney(
          overallAmounts
            ._sum
            .grossAmount ?? 0
        ),

      totalDiscounts:
        roundMoney(
          overallAmounts
            ._sum
            .discountAmount ?? 0
        ),

      netSales:
        roundMoney(
          overallAmounts
            ._sum
            .netAmount ?? 0
        ),

      totalPlatformFees:
        roundMoney(
          overallAmounts
            ._sum
            .platformFee ?? 0
        ),

      totalSellerEarnings:
        roundMoney(
          overallAmounts
            ._sum
            .sellerEarnings ?? 0
        ),

      pendingEarnings:
        roundMoney(
          pendingAmounts
            ._sum
            .sellerEarnings ?? 0
        ),

      settledEarnings:
        roundMoney(
          settledAmounts
            ._sum
            .sellerEarnings ?? 0
        ),
    };
  };