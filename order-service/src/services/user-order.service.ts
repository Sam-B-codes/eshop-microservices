import prisma from "@org/prisma";

import {
  BadRequestError,
  NotFoundError,
} from "@org/error-handler";

import {
  UserOrderListQuery,
  UserOrderListResult,
} from "../types/order.types";

// ======================================================
// HELPERS
// ======================================================

const normalizeString = (
  value: unknown
): string => {
  return typeof value === "string"
    ? value.trim()
    : "";
};

const roundMoney = (
  value: number
): number => {
  return (
    Math.round(
      (value + Number.EPSILON) * 100
    ) / 100
  );
};

const isMongoObjectId = (
  value: string
): boolean => {
  return /^[a-f\d]{24}$/i.test(
    value
  );
};

// ======================================================
// VERIFY USER
// ======================================================

const verifyUser = async (
  userId: string
): Promise<string> => {
  const normalizedUserId =
    normalizeString(userId);

  if (!normalizedUserId) {
    throw new BadRequestError(
      "User ID is required"
    );
  }

  const user =
    await prisma.users.findUnique({
      where: {
        id: normalizedUserId,
      },

      select: {
        id: true,
      },
    });

  if (!user) {
    throw new NotFoundError(
      "User not found"
    );
  }

  return user.id;
};

// ======================================================
// GET AUTHENTICATED USER ORDERS
// ======================================================

export const getUserOrders =
  async (
    userId: string,
    query: UserOrderListQuery = {}
  ): Promise<UserOrderListResult> => {
    const verifiedUserId =
      await verifyUser(
        userId
      );

    // ==================================================
    // PAGINATION
    // ==================================================

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

    const skip =
      (page - 1) *
      limit;

    // ==================================================
    // FILTERS
    // ==================================================

    const search =
      normalizeString(
        query.search
      );

    const searchConditions: any[] = [];

    if (search) {
      searchConditions.push(
        {
          couponCode: {
            contains:
              search,

            mode:
              "insensitive",
          },
        },
        {
          items: {
            some: {
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
              productSku: {
                contains:
                  search,

                mode:
                  "insensitive",
              },
            },
          },
        }
      );

      if (
        isMongoObjectId(
          search
        )
      ) {
        searchConditions.push({
          id: search,
        });
      }
    }

    const where: any = {
      userId:
        verifiedUserId,

      ...(query.status
        ? {
            status:
              query.status,
          }
        : {}),

      ...(query.paymentStatus
        ? {
            paymentStatus:
              query.paymentStatus,
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

    // ==================================================
    // LOAD ORDERS
    // ==================================================

    const [
      totalOrders,
      orders,
    ] = await prisma.$transaction([
      prisma.order.count({
        where,
      }),

      prisma.order.findMany({
        where,

        skip,
        take: limit,

        orderBy: {
          createdAt:
            "desc",
        },

        select: {
          id: true,

          status: true,
          paymentStatus: true,

          subtotal: true,
          discount: true,
          shippingAmount:
            true,
          totalAmount: true,

          couponCode: true,

          paymentProvider:
            true,
          paymentVerifiedAt:
            true,

          createdAt: true,
          updatedAt: true,

          items: {
            orderBy: {
              createdAt:
                "asc",
            },

            select: {
              id: true,
              productId: true,
              sellerId: true,

              productTitle:
                true,
              productSlug:
                true,
              productImage:
                true,
              productSku:
                true,

              unitPrice: true,
              quantity: true,
              lineTotal: true,

              createdAt: true,
              updatedAt: true,
            },
          },
        },
      }),
    ]);

    // ==================================================
    // BUILD CUSTOMER-SAFE RESPONSE
    // ==================================================

    const userOrders =
      orders.map(
        (order) => {
          const totalQuantity =
            order.items.reduce(
              (
                total,
                item
              ) =>
                total +
                item.quantity,
              0
            );

          const sellerCount =
            new Set(
              order.items.map(
                (item) =>
                  item.sellerId
              )
            ).size;

          return {
            id:
              order.id,

            status:
              order.status,

            paymentStatus:
              order.paymentStatus,

            subtotal:
              roundMoney(
                order.subtotal
              ),

            discount:
              roundMoney(
                order.discount
              ),

            shippingAmount:
              roundMoney(
                order.shippingAmount
              ),

            totalAmount:
              roundMoney(
                order.totalAmount
              ),

            couponCode:
              order.couponCode,

            itemCount:
              order.items.length,

            totalQuantity,

            sellerCount,

            paymentProvider:
              order.paymentProvider,

            paymentVerifiedAt:
              order.paymentVerifiedAt,

            createdAt:
              order.createdAt,

            updatedAt:
              order.updatedAt,

            items:
              order.items,
          };
        }
      );

    const totalPages =
      totalOrders === 0
        ? 0
        : Math.ceil(
            totalOrders /
              limit
          );

    return {
      orders:
        userOrders,

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
// GET AUTHENTICATED USER ORDER BY ID
// ======================================================

export const getUserOrderById =
  async (
    userId: string,
    orderId: string
  ) => {
    const verifiedUserId =
      await verifyUser(
        userId
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

    const order =
      await prisma.order.findFirst({
        where: {
          id:
            normalizedOrderId,

          userId:
            verifiedUserId,
        },

        include: {
          items: {
            orderBy: {
              createdAt:
                "asc",
            },
          },

          sellerOrders: {
            orderBy: {
              createdAt:
                "asc",
            },

            include: {
              seller: {
                select: {
                  id: true,
                  name: true,
                  shopName: true,
                },
              },
            },
          },
        },
      });

    if (!order) {
      throw new NotFoundError(
        "Order not found"
      );
    }

    return order;
  };