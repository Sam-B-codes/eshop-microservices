import prisma from "@org/prisma";

import {
  BadRequestError,
  NotFoundError,
} from "@org/error-handler";

import {
  SellerOrderDetails,
  SellerOrderListQuery,
  SellerOrderListResult,
  SellerOrderStatus,
  SellerRevenueSummary,
  SellerRevenueSummaryQuery,
  UpdateSellerOrderStatusInput,
} from "../types/order.types";

// ======================================================
// HELPERS
// ======================================================

const roundMoney = (
  value: number
): number => {
  return (
    Math.round(
      (value + Number.EPSILON) * 100
    ) / 100
  );
};

const normalizeString = (
  value: unknown
): string => {
  return typeof value === "string"
    ? value.trim()
    : "";
};

// ======================================================
// VERIFY SELLER
// ======================================================

const verifySeller = async (
  sellerId: string
): Promise<string> => {
  const normalizedSellerId =
    normalizeString(sellerId);

  if (!normalizedSellerId) {
    throw new BadRequestError(
      "Seller ID is required"
    );
  }

  const seller =
    await prisma.sellers.findUnique({
      where: {
        id: normalizedSellerId,
      },

      select: {
        id: true,
      },
    });

  if (!seller) {
    throw new NotFoundError(
      "Seller not found"
    );
  }

  return seller.id;
};

// ======================================================
// BACKFILL MISSING SELLER ORDERS
//
// This creates SellerOrder records for paid orders that
// existed before the SellerOrder model was introduced.
//
// Existing fulfilment statuses are never reset.
// ======================================================

const ensureSellerOrders = async (
  sellerId: string
): Promise<void> => {
  const paidOrders =
    await prisma.order.findMany({
      where: {
        paymentStatus: "PAID",

        items: {
          some: {
            sellerId,
          },
        },
      },

      select: {
        id: true,
        couponSellerId: true,
        couponDiscount: true,

        items: {
          where: {
            sellerId,
          },

          select: {
            lineTotal: true,
          },
        },
      },
    });

  for (const order of paidOrders) {
    const subtotal =
      roundMoney(
        order.items.reduce(
          (
            total,
            item
          ) =>
            total +
            item.lineTotal,
          0
        )
      );

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

    await prisma.sellerOrder.upsert({
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
  }
};

// ======================================================
// MAP SELLER ORDER
// ======================================================

const mapSellerOrder = (
  sellerOrder: any
) => {
  const order =
    sellerOrder.order;

  const items =
    order.items;

  const totalQuantity =
    items.reduce(
      (
        total: number,
        item: {
          quantity: number;
        }
      ) =>
        total +
        item.quantity,
      0
    );

  const couponAppliedToSeller =
    order.couponSellerId ===
    sellerOrder.sellerId;

  return {
    id:
      order.id,

    sellerOrderId:
      sellerOrder.id,

    status:
      sellerOrder.status,

    paymentStatus:
      order.paymentStatus,

    customer: {
      fullName:
        order.shippingFullName,

      city:
        order.shippingCity,

      state:
        order.shippingState,

      country:
        order.shippingCountry,
    },

    itemCount:
      items.length,

    totalQuantity,

    sellerSubtotal:
      roundMoney(
        sellerOrder.subtotal
      ),

    sellerDiscount:
      roundMoney(
        sellerOrder.discount
      ),

    sellerTotal:
      roundMoney(
        sellerOrder.totalAmount
      ),

    couponCode:
      couponAppliedToSeller
        ? order.couponCode
        : null,

    couponAppliedToSeller,

    paymentProvider:
      order.paymentProvider,

    paymentVerifiedAt:
      order.paymentVerifiedAt,

    processingAt:
      sellerOrder.processingAt,

    shippedAt:
      sellerOrder.shippedAt,

    deliveredAt:
      sellerOrder.deliveredAt,

    createdAt:
    order.createdAt,

    updatedAt:
    sellerOrder.updatedAt,

    items,
  };
};

// ======================================================
// GET SELLER ORDERS
// ======================================================

export const getSellerOrders =
  async (
    sellerId: string,
    query: SellerOrderListQuery = {}
  ): Promise<SellerOrderListResult> => {
    const verifiedSellerId =
      await verifySeller(
        sellerId
      );

    await ensureSellerOrders(
      verifiedSellerId
    );

    const requestedPage =
      Number(query.page);

    const requestedLimit =
      Number(query.limit);

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

    const search =
      normalizeString(
        query.search
      );

    const where: any = {
      sellerId:
        verifiedSellerId,

      order: {
        paymentStatus:
          query.paymentStatus ??
          "PAID",
      },
    };

    if (query.status) {
      where.status =
        query.status;
    }

    if (search) {
      where.order = {
        ...where.order,

        OR: [
          {
            shippingFullName: {
              contains:
                search,

              mode:
                "insensitive",
            },
          },

          {
            contactEmail: {
              contains:
                search,

              mode:
                "insensitive",
            },
          },

          {
            contactPhone: {
              contains:
                search,
            },
          },

          {
            items: {
              some: {
                sellerId:
                  verifiedSellerId,

                productTitle: {
                  contains:
                    search,

                  mode:
                    "insensitive",
                },
              },
            },
          },

          {
            items: {
              some: {
                sellerId:
                  verifiedSellerId,

                productSku: {
                  contains:
                    search,

                  mode:
                    "insensitive",
                },
              },
            },
          },
        ],
      };
    }

    const skip =
      (page - 1) *
      limit;

    const [
      totalOrders,
      sellerOrders,
    ] = await prisma.$transaction([
      prisma.sellerOrder.count({
        where,
      }),

      prisma.sellerOrder.findMany({
        where,

        skip,
        take: limit,

        orderBy: {
          createdAt:
            "desc",
        },

        include: {
          order: {
            include: {
              items: {
                where: {
                  sellerId:
                    verifiedSellerId,
                },

                orderBy: {
                  createdAt:
                    "asc",
                },
              },
            },
          },
        },
      }),
    ]);

    const orders =
      sellerOrders.map(
        mapSellerOrder
      );

    const totalPages =
      totalOrders === 0
        ? 0
        : Math.ceil(
            totalOrders /
              limit
          );

    return {
      orders,

      pagination: {
        page,
        limit,
        totalOrders,
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
// GET SELLER ORDER DETAILS
// ======================================================

export const getSellerOrderDetails =
  async (
    sellerId: string,
    orderId: string
  ): Promise<SellerOrderDetails> => {
    const verifiedSellerId =
      await verifySeller(
        sellerId
      );

    const normalizedOrderId =
      normalizeString(
        orderId
      );

    if (!normalizedOrderId) {
      throw new BadRequestError(
        "Order ID is required"
      );
    }

    await ensureSellerOrders(
      verifiedSellerId
    );

    const sellerOrder =
      await prisma.sellerOrder.findFirst({
        where: {
          orderId:
            normalizedOrderId,

          sellerId:
            verifiedSellerId,
        },

        include: {
          order: {
            include: {
              items: {
                where: {
                  sellerId:
                    verifiedSellerId,
                },

                orderBy: {
                  createdAt:
                    "asc",
                },
              },
            },
          },
        },
      });

    if (!sellerOrder) {
      throw new NotFoundError(
        "Seller order not found"
      );
    }

    const mappedOrder =
      mapSellerOrder(
        sellerOrder
      );

    return {
      ...mappedOrder,

      contact: {
        email:
          sellerOrder.order
            .contactEmail,

        phone:
          sellerOrder.order
            .contactPhone,
      },

      shippingAddress: {
        fullName:
          sellerOrder.order
            .shippingFullName,

        addressLine1:
          sellerOrder.order
            .shippingAddressLine1,

        addressLine2:
          sellerOrder.order
            .shippingAddressLine2,

        city:
          sellerOrder.order
            .shippingCity,

        state:
          sellerOrder.order
            .shippingState,

        postalCode:
          sellerOrder.order
            .shippingPostalCode,

        country:
          sellerOrder.order
            .shippingCountry,
      },

      payment: {
        status:
          sellerOrder.order
            .paymentStatus,

        provider:
          sellerOrder.order
            .paymentProvider,

        paymentOrderId:
          sellerOrder.order
            .paymentOrderId,

        paymentId:
          sellerOrder.order
            .paymentId,

        verifiedAt:
          sellerOrder.order
            .paymentVerifiedAt,
      },

      tracking: {
        trackingNumber:
          sellerOrder
            .trackingNumber,

        shippingCarrier:
          sellerOrder
            .shippingCarrier,
      },

      cancelledAt:
        sellerOrder.cancelledAt,
    };
  };

// ======================================================
// ALLOWED STATUS TRANSITIONS
// ======================================================

const statusTransitions: Record<
  SellerOrderStatus,
  SellerOrderStatus[]
> = {
  PENDING_PAYMENT: [
    "CONFIRMED",
  ],

  CONFIRMED: [
    "PROCESSING",
  ],

  PROCESSING: [
    "SHIPPED",
  ],

  SHIPPED: [
    "DELIVERED",
  ],

  DELIVERED: [],

  CANCELLED: [],
};

// ======================================================
// SYNCHRONIZE GLOBAL ORDER STATUS
// ======================================================

const synchronizeGlobalOrderStatus =
  async (
    orderId: string
  ): Promise<void> => {
    const sellerOrders =
      await prisma.sellerOrder.findMany({
        where: {
          orderId,
        },

        select: {
          status: true,
        },
      });

    if (
      sellerOrders.length ===
      0
    ) {
      return;
    }

    const statuses =
      sellerOrders.map(
        (sellerOrder) =>
          sellerOrder.status
      );

    let globalStatus:
      | "CONFIRMED"
      | "PROCESSING"
      | "SHIPPED"
      | "DELIVERED" =
      "CONFIRMED";

    if (
      statuses.every(
        (status) =>
          status ===
          "DELIVERED"
      )
    ) {
      globalStatus =
        "DELIVERED";
    } else if (
      statuses.every(
        (status) =>
          status ===
            "SHIPPED" ||
          status ===
            "DELIVERED"
      )
    ) {
      globalStatus =
        "SHIPPED";
    } else if (
      statuses.some(
        (status) =>
          status ===
            "PROCESSING" ||
          status ===
            "SHIPPED" ||
          status ===
            "DELIVERED"
      )
    ) {
      globalStatus =
        "PROCESSING";
    }

    await prisma.order.update({
      where: {
        id: orderId,
      },

      data: {
        status:
          globalStatus,
      },
    });
  };

// ======================================================
// UPDATE SELLER ORDER STATUS
// ======================================================

export const updateSellerOrderStatus =
  async (
    sellerId: string,
    orderId: string,
    input: UpdateSellerOrderStatusInput
  ) => {
    const verifiedSellerId =
      await verifySeller(
        sellerId
      );

    const normalizedOrderId =
      normalizeString(
        orderId
      );

    if (!normalizedOrderId) {
      throw new BadRequestError(
        "Order ID is required"
      );
    }

    await ensureSellerOrders(
      verifiedSellerId
    );

    const sellerOrder =
      await prisma.sellerOrder.findFirst({
        where: {
          orderId:
            normalizedOrderId,

          sellerId:
            verifiedSellerId,
        },

        include: {
          order: {
            select: {
              paymentStatus:
                true,
            },
          },
        },
      });

    if (!sellerOrder) {
      throw new NotFoundError(
        "Seller order not found"
      );
    }

    if (
      sellerOrder.order
        .paymentStatus !==
      "PAID"
    ) {
      throw new BadRequestError(
        "Only paid orders can be fulfilled"
      );
    }

    const nextStatus =
      input.status;

    const allowedStatuses =
      statusTransitions[
        sellerOrder.status
      ];

    if (
      !allowedStatuses.includes(
        nextStatus
      )
    ) {
      throw new BadRequestError(
        `Cannot change seller order status from ${sellerOrder.status} to ${nextStatus}`
      );
    }

    const trackingNumber =
      normalizeString(
        input.trackingNumber
      ) || null;

    const shippingCarrier =
      normalizeString(
        input.shippingCarrier
      ) || null;

    if (
      nextStatus ===
        "SHIPPED" &&
      (
        !trackingNumber ||
        !shippingCarrier
      )
    ) {
      throw new BadRequestError(
        "Tracking number and shipping carrier are required when shipping an order"
      );
    }

    const now =
      new Date();

    const updatedSellerOrder =
      await prisma.sellerOrder.update({
        where: {
          id:
            sellerOrder.id,
        },

        data: {
          status:
            nextStatus,

          ...(nextStatus ===
          "PROCESSING"
            ? {
                processingAt:
                  now,
              }
            : {}),

          ...(nextStatus ===
          "SHIPPED"
            ? {
                shippedAt:
                  now,

                trackingNumber,

                shippingCarrier,
              }
            : {}),

          ...(nextStatus ===
          "DELIVERED"
            ? {
                deliveredAt:
                  now,
              }
            : {}),
        },
      });

    await synchronizeGlobalOrderStatus(
      sellerOrder.orderId
    );

    return updatedSellerOrder;
  };

// ======================================================
// GET SELLER REVENUE SUMMARY
// ======================================================

export const getSellerRevenueSummary =
  async (
    sellerId: string,
    query: SellerRevenueSummaryQuery = {}
  ): Promise<SellerRevenueSummary> => {
    const verifiedSellerId =
      await verifySeller(
        sellerId
      );

    await ensureSellerOrders(
      verifiedSellerId
    );

    const createdAt =
      query.from ||
      query.to
        ? {
            ...(query.from
              ? {
                  gte:
                    query.from,
                }
              : {}),

            ...(query.to
              ? {
                  lte:
                    query.to,
                }
              : {}),
          }
        : undefined;

    const sellerOrders =
      await prisma.sellerOrder.findMany({
        where: {
          sellerId:
            verifiedSellerId,

          ...(createdAt
            ? {
                createdAt,
              }
            : {}),
        },

        include: {
          order: {
            select: {
              paymentStatus:
                true,
            },
          },
        },
      });

    const paidOrders =
      sellerOrders.filter(
        (sellerOrder) =>
          sellerOrder.order
            .paymentStatus ===
          "PAID"
      );

    const refundedOrders =
      sellerOrders.filter(
        (sellerOrder) =>
          sellerOrder.order
            .paymentStatus ===
          "REFUNDED"
      );

    const grossRevenue =
      roundMoney(
        paidOrders.reduce(
          (
            total,
            sellerOrder
          ) =>
            total +
            sellerOrder.subtotal,
          0
        )
      );

    const totalDiscount =
      roundMoney(
        paidOrders.reduce(
          (
            total,
            sellerOrder
          ) =>
            total +
            sellerOrder.discount,
          0
        )
      );

    const paidRevenue =
      roundMoney(
        paidOrders.reduce(
          (
            total,
            sellerOrder
          ) =>
            total +
            sellerOrder.totalAmount,
          0
        )
      );

    const refundedRevenue =
      roundMoney(
        refundedOrders.reduce(
          (
            total,
            sellerOrder
          ) =>
            total +
            sellerOrder.totalAmount,
          0
        )
      );

    const countStatus = (
      status: SellerOrderStatus
    ): number => {
      return paidOrders.filter(
        (sellerOrder) =>
          sellerOrder.status ===
          status
      ).length;
    };

    return {
      totalOrders:
        paidOrders.length,

      confirmedOrders:
        countStatus(
          "CONFIRMED"
        ),

      processingOrders:
        countStatus(
          "PROCESSING"
        ),

      shippedOrders:
        countStatus(
          "SHIPPED"
        ),

      deliveredOrders:
        countStatus(
          "DELIVERED"
        ),

      grossRevenue,

      totalDiscount,

      netRevenue:
        roundMoney(
          paidRevenue -
            refundedRevenue
        ),

      paidRevenue,

      refundedRevenue,

      averageOrderValue:
        paidOrders.length >
        0
          ? roundMoney(
              paidRevenue /
                paidOrders.length
            )
          : 0,
    };
  };