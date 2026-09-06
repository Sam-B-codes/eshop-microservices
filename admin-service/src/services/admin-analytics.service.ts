import prisma from "@org/prisma";

import {
  AnalyticsRange,
  AnalyticsTopShop,
  AnalyticsTrendPoint,
} from "../types/admin-analytics.types";

const roundMoney = (value: number) => {
  return Math.round((value + Number.EPSILON) * 100) / 100;
};

const RANGE_DAYS: Record<AnalyticsRange, number> = {
  "7D": 7,
  "30D": 30,
  "90D": 90,
  "1Y": 365,
};

const startOfDay = (value: Date) => {
  const date = new Date(value);

  date.setHours(0, 0, 0, 0);

  return date;
};

const addDays = (value: Date, days: number) => {
  const date = new Date(value);

  date.setDate(date.getDate() + days);

  return date;
};

const getPercentageChange = (current: number, previous: number) => {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }

  return roundMoney(((current - previous) / previous) * 100);
};

const getBucketKey = (date: Date, range: AnalyticsRange, startDate: Date) => {
  if (range === "7D" || range === "30D") {
    return date.toISOString().slice(0, 10);
  }

  if (range === "90D") {
    const difference = date.getTime() - startDate.getTime();

    const weekIndex = Math.max(
      Math.floor(difference / (7 * 24 * 60 * 60 * 1000)),
      0,
    );

    return addDays(startDate, weekIndex * 7)
      .toISOString()
      .slice(0, 10);
  }

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}`;
};

const createBuckets = (
  range: AnalyticsRange,
  startDate: Date,
  endDate: Date,
) => {
  const buckets = new Map<string, AnalyticsTrendPoint>();

  if (range === "7D" || range === "30D") {
    let cursor = new Date(startDate);

    while (cursor <= endDate) {
      const key = cursor.toISOString().slice(0, 10);

      buckets.set(key, {
        date: key,
        label: cursor.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
        }),
        revenue: 0,
        platformFees: 0,
        orders: 0,
        users: 0,
        sellers: 0,
      });

      cursor = addDays(cursor, 1);
    }
  } else if (range === "90D") {
    let cursor = new Date(startDate);

    while (cursor <= endDate) {
      const key = cursor.toISOString().slice(0, 10);

      buckets.set(key, {
        date: key,
        label: cursor.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
        }),
        revenue: 0,
        platformFees: 0,
        orders: 0,
        users: 0,
        sellers: 0,
      });

      cursor = addDays(cursor, 7);
    }
  } else {
    for (let monthOffset = 11; monthOffset >= 0; monthOffset--) {
      const date = new Date(
        endDate.getFullYear(),
        endDate.getMonth() - monthOffset,
        1,
      );

      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0",
      )}`;

      buckets.set(key, {
        date: key,
        label: date.toLocaleDateString("en-IN", {
          month: "short",
          year: "2-digit",
        }),
        revenue: 0,
        platformFees: 0,
        orders: 0,
        users: 0,
        sellers: 0,
      });
    }
  }

  return buckets;
};

export const getAdminAnalytics = async (range: AnalyticsRange) => {
  const rangeDays = RANGE_DAYS[range];

  const endDate = new Date();

  const startDate = startOfDay(addDays(endDate, -(rangeDays - 1)));

  const previousStartDate = startOfDay(addDays(startDate, -rangeDays));

  const [
    currentOrders,
    previousOrders,

    currentUsers,
    previousUserCount,

    currentSellers,
    previousSellerCount,

    currentSettlements,
    previousSettlements,

    productStatusCounts,
    orderStatusCounts,
    settlementStatusCounts,

    topShopGroups,
  ] = await Promise.all([
    prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },

      select: {
        id: true,
        createdAt: true,
        totalAmount: true,
        paymentStatus: true,
      },
    }),

    prisma.order.findMany({
      where: {
        createdAt: {
          gte: previousStartDate,
          lt: startDate,
        },
      },

      select: {
        totalAmount: true,
        paymentStatus: true,
      },
    }),

    prisma.users.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },

      select: {
        createdAt: true,
      },
    }),

    prisma.users.count({
      where: {
        createdAt: {
          gte: previousStartDate,
          lt: startDate,
        },
      },
    }),

    prisma.sellers.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },

      select: {
        createdAt: true,
      },
    }),

    prisma.sellers.count({
      where: {
        createdAt: {
          gte: previousStartDate,
          lt: startDate,
        },
      },
    }),

    prisma.sellerSettlement.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },

      select: {
        sellerId: true,
        createdAt: true,
        grossAmount: true,
        platformFee: true,
        sellerEarnings: true,
        status: true,
      },
    }),

    prisma.sellerSettlement.findMany({
      where: {
        createdAt: {
          gte: previousStartDate,
          lt: startDate,
        },
      },

      select: {
        grossAmount: true,
        platformFee: true,
      },
    }),

    prisma.product.groupBy({
      by: ["status"],

      _count: {
        _all: true,
      },
    }),

    prisma.order.groupBy({
      by: ["status"],

      _count: {
        _all: true,
      },
    }),

    prisma.sellerSettlement.groupBy({
      by: ["status"],

      _count: {
        _all: true,
      },
    }),

    prisma.sellerSettlement.groupBy({
      by: ["sellerId"],

      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },

      _count: {
        _all: true,
      },

      _sum: {
        grossAmount: true,
        platformFee: true,
        sellerEarnings: true,
      },

      orderBy: {
        _sum: {
          grossAmount: "desc",
        },
      },

      take: 5,
    }),
  ]);

  const sellerIds = topShopGroups.map((group) => group.sellerId);

  const topSellers =
    sellerIds.length > 0
      ? await prisma.sellers.findMany({
          where: {
            id: {
              in: sellerIds,
            },
          },

          select: {
            id: true,
            name: true,
            shopName: true,
          },
        })
      : [];

  const sellerMap = new Map(topSellers.map((seller) => [seller.id, seller]));

  const paidCurrentOrders = currentOrders.filter(
    (order) => order.paymentStatus === "PAID",
  );

  const paidPreviousOrders = previousOrders.filter(
    (order) => order.paymentStatus === "PAID",
  );

  const currentRevenue = roundMoney(
    paidCurrentOrders.reduce((total, order) => total + order.totalAmount, 0),
  );

  const previousRevenue = roundMoney(
    paidPreviousOrders.reduce((total, order) => total + order.totalAmount, 0),
  );

  const currentPlatformFees = roundMoney(
    currentSettlements.reduce(
      (total, settlement) => total + settlement.platformFee,
      0,
    ),
  );

  const previousPlatformFees = roundMoney(
    previousSettlements.reduce(
      (total, settlement) => total + settlement.platformFee,
      0,
    ),
  );

  const sellerEarnings = roundMoney(
    currentSettlements.reduce(
      (total, settlement) => total + settlement.sellerEarnings,
      0,
    ),
  );

  const averageOrderValue =
    paidCurrentOrders.length > 0
      ? roundMoney(currentRevenue / paidCurrentOrders.length)
      : 0;

  const buckets = createBuckets(range, startDate, endDate);

  currentOrders.forEach((order) => {
    const key = getBucketKey(order.createdAt, range, startDate);

    const bucket = buckets.get(key);

    if (!bucket) {
      return;
    }

    bucket.orders += 1;

    if (order.paymentStatus === "PAID") {
      bucket.revenue = roundMoney(bucket.revenue + order.totalAmount);
    }
  });

  currentSettlements.forEach((settlement) => {
    const key = getBucketKey(settlement.createdAt, range, startDate);

    const bucket = buckets.get(key);

    if (bucket) {
      bucket.platformFees = roundMoney(
        bucket.platformFees + settlement.platformFee,
      );
    }
  });

  currentUsers.forEach((user) => {
    const key = getBucketKey(user.createdAt, range, startDate);

    const bucket = buckets.get(key);

    if (bucket) {
      bucket.users += 1;
    }
  });

  currentSellers.forEach((seller) => {
    const key = getBucketKey(seller.createdAt, range, startDate);

    const bucket = buckets.get(key);

    if (bucket) {
      bucket.sellers += 1;
    }
  });

  const topShops: AnalyticsTopShop[] = topShopGroups.map((group) => {
    const seller = sellerMap.get(group.sellerId);

    return {
      sellerId: group.sellerId,

      sellerName: seller?.name || "Unknown seller",

      shopName: seller?.shopName || null,

      orderCount: group._count._all,

      grossAmount: roundMoney(group._sum.grossAmount || 0),

      platformFees: roundMoney(group._sum.platformFee || 0),

      sellerEarnings: roundMoney(group._sum.sellerEarnings || 0),
    };
  });

  return {
    success: true,

    message: "Admin analytics fetched successfully",

    range,

    period: {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    },

    overview: {
      revenue: currentRevenue,
      revenueChange: getPercentageChange(currentRevenue, previousRevenue),

      platformFees: currentPlatformFees,
      platformFeeChange: getPercentageChange(
        currentPlatformFees,
        previousPlatformFees,
      ),

      sellerEarnings,

      orders: currentOrders.length,
      orderChange: getPercentageChange(
        currentOrders.length,
        previousOrders.length,
      ),

      averageOrderValue,

      newUsers: currentUsers.length,
      userChange: getPercentageChange(currentUsers.length, previousUserCount),

      newSellers: currentSellers.length,
      sellerChange: getPercentageChange(
        currentSellers.length,
        previousSellerCount,
      ),
    },

    trend: Array.from(buckets.values()),

    distributions: {
      products: productStatusCounts.map((item) => ({
        label: item.status,
        value: item._count._all,
      })),

      orders: orderStatusCounts.map((item) => ({
        label: item.status,
        value: item._count._all,
      })),

      settlements: settlementStatusCounts.map((item) => ({
        label: item.status,
        value: item._count._all,
      })),
    },

    topShops,
  };
};

export const isAnalyticsRange = (value: string): value is AnalyticsRange => {
  return ["7D", "30D", "90D", "1Y"].includes(value);
};
