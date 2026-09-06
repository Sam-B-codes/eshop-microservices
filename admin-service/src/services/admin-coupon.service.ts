import { CouponDiscountType, Prisma } from "@prisma/client";

import prisma from "@org/prisma";

import {
  AdminCouponState,
  GetAdminCouponsInput,
} from "../types/admin-coupon.types";

const createServiceError = (message: string, statusCode: number) => {
  const error = new Error(message) as Error & {
    statusCode: number;
  };

  error.statusCode = statusCode;

  return error;
};

const normalizePage = (value: number) => {
  if (!Number.isFinite(value) || value < 1) {
    return 1;
  }

  return Math.floor(value);
};

const normalizeLimit = (value: number) => {
  if (!Number.isFinite(value) || value < 1) {
    return 10;
  }

  return Math.min(Math.floor(value), 100);
};

const createStateFilter = (
  state: AdminCouponState | undefined,
  now: Date,
): Prisma.CouponWhereInput => {
  switch (state) {
    case "ACTIVE":
      return {
        isActive: true,
        expiryDate: {
          gt: now,
        },
        OR: [
          {
            usageLimit: null,
          },
          {
            usageLimit: {
              isSet: false,
            },
          },
        ],
      };

    case "INACTIVE":
      return {
        isActive: false,
      };

    case "EXPIRED":
      return {
        expiryDate: {
          lte: now,
        },
      };

    case "EXHAUSTED":
      /*
       * Prisma cannot compare usedCount directly
       * against usageLimit in a normal where clause.
       * EXHAUSTED is filtered after fetching below.
       */
      return {};

    default:
      return {};
  }
};

export const getAdminCouponSummary = async () => {
  const now = new Date();

  const [
    totalCoupons,
    enabledCoupons,
    disabledCoupons,
    expiredCoupons,
    couponsWithLimits,
    redemptionAggregate,
  ] = await Promise.all([
    prisma.coupon.count(),

    prisma.coupon.count({
      where: {
        isActive: true,
        expiryDate: {
          gt: now,
        },
      },
    }),

    prisma.coupon.count({
      where: {
        isActive: false,
      },
    }),

    prisma.coupon.count({
      where: {
        expiryDate: {
          lte: now,
        },
      },
    }),

    prisma.coupon.findMany({
      where: {
        usageLimit: {
          not: null,
        },
      },

      select: {
        usedCount: true,
        usageLimit: true,
      },
    }),

    prisma.coupon.aggregate({
      _sum: {
        usedCount: true,
      },
    }),
  ]);

  const exhaustedCoupons = couponsWithLimits.filter(
    (coupon) =>
      coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit,
  ).length;

  return {
    totalCoupons,
    activeCoupons: enabledCoupons - exhaustedCoupons,
    inactiveCoupons: disabledCoupons,
    expiredCoupons,
    exhaustedCoupons,
    totalRedemptions: redemptionAggregate._sum.usedCount || 0,
  };
};

export const getAdminCoupons = async ({
  page,
  limit,
  search,
  state,
  discountType,
}: GetAdminCouponsInput) => {
  const normalizedPage = normalizePage(page);

  const normalizedLimit = normalizeLimit(limit);

  const now = new Date();

  const normalizedSearch = search?.trim();

  const searchFilter: Prisma.CouponWhereInput = normalizedSearch
    ? {
        OR: [
          {
            code: {
              contains: normalizedSearch,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: normalizedSearch,
              mode: "insensitive",
            },
          },
          {
            seller: {
              is: {
                name: {
                  contains: normalizedSearch,
                  mode: "insensitive",
                },
              },
            },
          },
          {
            seller: {
              is: {
                email: {
                  contains: normalizedSearch,
                  mode: "insensitive",
                },
              },
            },
          },
          {
            seller: {
              is: {
                shopName: {
                  contains: normalizedSearch,
                  mode: "insensitive",
                },
              },
            },
          },
        ],
      }
    : {};

  const where: Prisma.CouponWhereInput = {
    AND: [
      searchFilter,
      createStateFilter(state, now),
      discountType
        ? {
            discountType,
          }
        : {},
    ],
  };

  /*
   * EXHAUSTED needs application-level filtering because
   * Prisma cannot compare two fields in MongoDB filters.
   */
  if (state === "EXHAUSTED") {
    const matchingCoupons = await prisma.coupon.findMany({
      where,

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
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    const exhaustedCoupons = matchingCoupons.filter(
      (coupon) =>
        coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit,
    );

    const total = exhaustedCoupons.length;

    const paginatedCoupons = exhaustedCoupons.slice(
      (normalizedPage - 1) * normalizedLimit,
      normalizedPage * normalizedLimit,
    );

    return {
      coupons: paginatedCoupons.map(mapAdminCoupon),

      pagination: {
        page: normalizedPage,
        limit: normalizedLimit,
        total,
        pages: Math.ceil(total / normalizedLimit),
      },
    };
  }

  const [coupons, total] = await Promise.all([
    prisma.coupon.findMany({
      where,

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
      },

      orderBy: {
        createdAt: "desc",
      },

      skip: (normalizedPage - 1) * normalizedLimit,

      take: normalizedLimit,
    }),

    prisma.coupon.count({
      where,
    }),
  ]);

  return {
    coupons: coupons.map(mapAdminCoupon),

    pagination: {
      page: normalizedPage,
      limit: normalizedLimit,
      total,
      pages: Math.ceil(total / normalizedLimit),
    },
  };
};

export const updateAdminCouponStatus = async (
  couponId: string,
  isActive: boolean,
) => {
  const normalizedCouponId = couponId.trim();

  if (!normalizedCouponId) {
    throw createServiceError("Coupon ID is required", 400);
  }

  const coupon = await prisma.coupon.findUnique({
    where: {
      id: normalizedCouponId,
    },

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
    },
  });

  if (!coupon) {
    throw createServiceError("Coupon not found", 404);
  }

  if (isActive && coupon.expiryDate <= new Date()) {
    throw createServiceError("An expired coupon cannot be activated", 400);
  }

  if (
    isActive &&
    coupon.usageLimit !== null &&
    coupon.usedCount >= coupon.usageLimit
  ) {
    throw createServiceError("An exhausted coupon cannot be activated", 400);
  }

  const updatedCoupon = await prisma.coupon.update({
    where: {
      id: normalizedCouponId,
    },

    data: {
      isActive,
    },

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
    },
  });

  return mapAdminCoupon(updatedCoupon);
};

export const deleteAdminCoupon = async (couponId: string) => {
  const normalizedCouponId = couponId.trim();

  if (!normalizedCouponId) {
    throw createServiceError("Coupon ID is required", 400);
  }

  const coupon = await prisma.coupon.findUnique({
    where: {
      id: normalizedCouponId,
    },

    select: {
      id: true,
      code: true,
    },
  });

  if (!coupon) {
    throw createServiceError("Coupon not found", 404);
  }

  await prisma.coupon.delete({
    where: {
      id: normalizedCouponId,
    },
  });

  return coupon;
};

type CouponWithSeller = Prisma.CouponGetPayload<{
  include: {
    seller: {
      select: {
        id: true;
        name: true;
        email: true;
        shopName: true;
        status: true;
      };
    };
  };
}>;

const mapAdminCoupon = (coupon: CouponWithSeller) => {
  const now = new Date();

  const expired = coupon.expiryDate <= now;

  const exhausted =
    coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit;

  const state: AdminCouponState = expired
    ? "EXPIRED"
    : exhausted
      ? "EXHAUSTED"
      : coupon.isActive
        ? "ACTIVE"
        : "INACTIVE";

  return {
    id: coupon.id,
    code: coupon.code,
    description: coupon.description,

    discountType: coupon.discountType,
    discountValue: coupon.discountValue,

    minimumOrderValue: coupon.minimumOrderValue,
    maximumDiscount: coupon.maximumDiscount,

    usageLimit: coupon.usageLimit,
    usedCount: coupon.usedCount,

    expiryDate: coupon.expiryDate,
    isActive: coupon.isActive,
    state,

    seller: {
      id: coupon.seller.id,
      name: coupon.seller.name,
      email: coupon.seller.email,
      shopName: coupon.seller.shopName,
      status: coupon.seller.status,
    },

    createdAt: coupon.createdAt,
    updatedAt: coupon.updatedAt,
  };
};

export const isCouponDiscountType = (
  value: string,
): value is CouponDiscountType => {
  return value === "PERCENTAGE" || value === "FIXED";
};

export const isAdminCouponState = (
  value: string,
): value is AdminCouponState => {
  return ["ACTIVE", "INACTIVE", "EXPIRED", "EXHAUSTED"].includes(value);
};
