import prisma from "@org/prisma";

import { AdminDashboardResponse } from "../types/admin-dashboard.types";

const roundMoney = (amount: number): number => {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
};

export const getAdminDashboard = async (): Promise<AdminDashboardResponse> => {
  const [
    totalUsers,

    totalSellers,
    onboardedSellers,
    bankConnectedSellers,

    totalProducts,
    publishedProducts,
    draftProducts,
    outOfStockProducts,
    lowStockProducts,

    totalOrders,
    pendingPaymentOrders,
    confirmedOrders,
    processingOrders,
    shippedOrders,
    deliveredOrders,
    cancelledOrders,

    paidOrderRevenue,

    totalSettlements,
    pendingSettlements,
    processingSettlements,
    settledSettlements,
    failedSettlements,
    settlementAmounts,

    recentOrders,
  ] = await Promise.all([
    prisma.users.count(),

    prisma.sellers.count(),

    prisma.sellers.count({
      where: {
        isOnboarded: true,
      },
    }),

    prisma.sellers.count({
      where: {
        bankConnected: true,
      },
    }),

    prisma.product.count(),

    prisma.product.count({
      where: {
        status: "PUBLISHED",
      },
    }),

    prisma.product.count({
      where: {
        status: "DRAFT",
      },
    }),

    prisma.product.count({
      where: {
        OR: [
          {
            status: "OUT_OF_STOCK",
          },
          {
            stock: {
              lte: 0,
            },
          },
        ],
      },
    }),

    prisma.product.count({
      where: {
        stock: {
          gt: 0,
          lte: 10,
        },

        status: {
          not: "ARCHIVED",
        },
      },
    }),

    prisma.order.count(),

    prisma.order.count({
      where: {
        status: "PENDING_PAYMENT",
      },
    }),

    prisma.order.count({
      where: {
        status: "CONFIRMED",
      },
    }),

    prisma.order.count({
      where: {
        status: "PROCESSING",
      },
    }),

    prisma.order.count({
      where: {
        status: "SHIPPED",
      },
    }),

    prisma.order.count({
      where: {
        status: "DELIVERED",
      },
    }),

    prisma.order.count({
      where: {
        status: "CANCELLED",
      },
    }),

    prisma.order.aggregate({
      where: {
        paymentStatus: "PAID",
      },

      _sum: {
        totalAmount: true,
      },
    }),

    prisma.sellerSettlement.count(),

    prisma.sellerSettlement.count({
      where: {
        status: "PENDING",
      },
    }),

    prisma.sellerSettlement.count({
      where: {
        status: "PROCESSING",
      },
    }),

    prisma.sellerSettlement.count({
      where: {
        status: "SETTLED",
      },
    }),

    prisma.sellerSettlement.count({
      where: {
        status: "FAILED",
      },
    }),

    prisma.sellerSettlement.aggregate({
      _sum: {
        grossAmount: true,
        discountAmount: true,
        platformFee: true,
        sellerEarnings: true,
      },
    }),

    prisma.order.findMany({
      take: 6,

      orderBy: {
        createdAt: "desc",
      },

      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },

        _count: {
          select: {
            items: true,
            sellerOrders: true,
          },
        },
      },
    }),
  ]);

  const marketplaceGrossAmount = roundMoney(
    settlementAmounts._sum.grossAmount ?? 0,
  );

  const totalDiscounts = roundMoney(settlementAmounts._sum.discountAmount ?? 0);

  const platformFees = roundMoney(settlementAmounts._sum.platformFee ?? 0);

  const sellerEarnings = roundMoney(settlementAmounts._sum.sellerEarnings ?? 0);

  return {
    success: true,

    message: "Admin dashboard fetched successfully",

    summary: {
      users: {
        total: totalUsers,
      },

      sellers: {
        total: totalSellers,

        onboarded: onboardedSellers,

        awaitingOnboarding: Math.max(totalSellers - onboardedSellers, 0),

        bankConnected: bankConnectedSellers,
      },

      products: {
        total: totalProducts,

        published: publishedProducts,

        draft: draftProducts,

        outOfStock: outOfStockProducts,

        lowStock: lowStockProducts,
      },

      orders: {
        total: totalOrders,

        pendingPayment: pendingPaymentOrders,

        confirmed: confirmedOrders,

        processing: processingOrders,

        shipped: shippedOrders,

        delivered: deliveredOrders,

        cancelled: cancelledOrders,
      },

      revenue: {
        grossOrderRevenue: roundMoney(paidOrderRevenue._sum.totalAmount ?? 0),

        marketplaceGrossAmount,

        totalDiscounts,

        platformFees,

        sellerEarnings,
      },

      settlements: {
        total: totalSettlements,

        pending: pendingSettlements,

        processing: processingSettlements,

        settled: settledSettlements,

        failed: failedSettlements,
      },
    },

    recentOrders: recentOrders.map((order) => ({
      id: order.id,

      status: order.status,

      paymentStatus: order.paymentStatus,

      totalAmount: roundMoney(order.totalAmount),

      customerName: order.user.name,

      customerEmail: order.user.email,

      itemCount: order._count.items,

      sellerCount: order._count.sellerOrders,

      createdAt: order.createdAt.toISOString(),
    })),
  };
};
