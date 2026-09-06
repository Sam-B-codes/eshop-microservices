import { Prisma } from "@prisma/client";

import prisma from "@org/prisma";

import { BadRequestError, NotFoundError } from "@org/error-handler";

import {
  AdminOrderListParams,
  AdminOrderListResponse,
} from "../types/admin-order.types";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

const roundMoney = (amount: number): number => {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
};

export const getAdminOrders = async (
  params: AdminOrderListParams,
): Promise<AdminOrderListResponse> => {
  const page = Math.max(Math.trunc(params.page ?? 1), 1);

  const limit = Math.min(
    Math.max(Math.trunc(params.limit ?? DEFAULT_LIMIT), 1),
    MAX_LIMIT,
  );

  const search = params.search?.trim();

  const searchConditions: Prisma.OrderWhereInput[] = [];

  if (search) {
    searchConditions.push(
      {
        contactEmail: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        shippingFullName: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        paymentId: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        paymentOrderId: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        couponCode: {
          contains: search,
          mode: "insensitive",
        },
      },
    );

    if (/^[a-f\d]{24}$/i.test(search)) {
      searchConditions.push({
        id: search,
      });
    }
  }

  const where: Prisma.OrderWhereInput = {
    ...(params.status
      ? {
          status: params.status,
        }
      : {}),

    ...(params.paymentStatus
      ? {
          paymentStatus: params.paymentStatus,
        }
      : {}),

    ...(searchConditions.length > 0
      ? {
          OR: searchConditions,
        }
      : {}),
  };

  const [totalOrders, orders] = await Promise.all([
    prisma.order.count({
      where,
    }),

    prisma.order.findMany({
      where,

      skip: (page - 1) * limit,

      take: limit,

      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        status: true,
        paymentStatus: true,
        totalAmount: true,
        contactEmail: true,
        shippingFullName: true,
        paymentProvider: true,
        paymentId: true,
        createdAt: true,
        updatedAt: true,

        _count: {
          select: {
            items: true,
            sellerOrders: true,
          },
        },
      },
    }),
  ]);

  const totalPages = totalOrders === 0 ? 0 : Math.ceil(totalOrders / limit);

  return {
    success: true,

    message: "Orders fetched successfully",

    orders: orders.map((order) => ({
      id: order.id,

      customerName: order.shippingFullName,

      customerEmail: order.contactEmail,

      status: order.status,

      paymentStatus: order.paymentStatus,

      totalAmount: roundMoney(order.totalAmount),

      itemCount: order._count.items,

      sellerCount: order._count.sellerOrders,

      paymentProvider: order.paymentProvider,

      paymentId: order.paymentId,

      createdAt: order.createdAt.toISOString(),

      updatedAt: order.updatedAt.toISOString(),
    })),

    pagination: {
      page,
      limit,
      totalOrders,
      totalPages,

      hasPreviousPage: page > 1,

      hasNextPage: page < totalPages,
    },
  };
};

export const getAdminOrderById = async (orderId: string) => {
  const normalizedOrderId = orderId.trim();

  if (!normalizedOrderId) {
    throw new BadRequestError("Order ID is required");
  }

  const order = await prisma.order.findUnique({
    where: {
      id: normalizedOrderId,
    },

    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
        },
      },

      items: true,

      sellerOrders: {
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
              shopName: true,
              status: true,
            },
          },

          settlement: true,
        },
      },

      sellerSettlements: true,
    },
  });

  if (!order) {
    throw new NotFoundError("Order not found");
  }

  return {
    success: true,
    message: "Order fetched successfully",
    order,
  };
};
