import prisma from "@org/prisma";

interface CreateCouponData {
  code: string;
  description?: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minimumOrderValue?: number;
  maximumDiscount?: number;
  usageLimit?: number;
  expiryDate: string;
}

// ======================================================
// CREATE COUPON
// ======================================================

export const createCoupon = async (
  data: CreateCouponData,
  sellerId: string
) => {
  const normalizedCode = data.code
    .trim()
    .toUpperCase();

  const existingCoupon =
    await prisma.coupon.findFirst({
      where: {
        code: normalizedCode,
        sellerId,
      },
    });

  if (existingCoupon) {
    throw new Error(
      "Coupon code already exists"
    );
  }

  if (data.discountValue <= 0) {
    throw new Error(
      "Discount value must be greater than 0"
    );
  }

  if (
    data.discountType === "PERCENTAGE" &&
    data.discountValue > 100
  ) {
    throw new Error(
      "Percentage discount cannot exceed 100"
    );
  }

  if (
    data.minimumOrderValue !== undefined &&
    data.minimumOrderValue < 0
  ) {
    throw new Error(
      "Minimum order value cannot be negative"
    );
  }

  if (
    data.maximumDiscount !== undefined &&
    data.maximumDiscount <= 0
  ) {
    throw new Error(
      "Maximum discount must be greater than 0"
    );
  }

  if (
    data.usageLimit !== undefined &&
    data.usageLimit <= 0
  ) {
    throw new Error(
      "Usage limit must be greater than 0"
    );
  }

  if (
    new Date(data.expiryDate) <=
    new Date()
  ) {
    throw new Error(
      "Expiry date must be in the future"
    );
  }

  return prisma.coupon.create({
    data: {
      code: normalizedCode,
      description: data.description,
      discountType: data.discountType,
      discountValue: data.discountValue,
      minimumOrderValue:
        data.minimumOrderValue,
      maximumDiscount:
        data.maximumDiscount,
      usageLimit: data.usageLimit,
      expiryDate: new Date(
        data.expiryDate
      ),
      sellerId,
    },
  });
};

// ======================================================
// SELLER COUPONS
// ======================================================

export const getSellerCoupons = async (
  sellerId: string
) => {
  return prisma.coupon.findMany({
    where: {
      sellerId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

// ======================================================
// PUBLIC CUSTOMER COUPONS
// ======================================================

export const getPublicCoupons = async (
  sellerId?: string
) => {
  const now = new Date();

  const coupons =
    await prisma.coupon.findMany({
      where: {
        isActive: true,

        expiryDate: {
          gt: now,
        },

        ...(sellerId && {
          sellerId,
        }),
      },

      orderBy: {
        expiryDate: "asc",
      },

      select: {
        id: true,
        sellerId: true,
        code: true,
        description: true,
        discountType: true,
        discountValue: true,
        minimumOrderValue: true,
        maximumDiscount: true,
        usageLimit: true,
        usedCount: true,
        expiryDate: true,
      },
    });

  /**
   * Prisma cannot conveniently express:
   *
   * usedCount < usageLimit
   *
   * for two fields in this query in a portable,
   * simple way, so we apply this remaining
   * business rule after fetching already-active,
   * non-expired coupons.
   */
  return coupons
    .filter((coupon) => {
      if (coupon.usageLimit === null) {
        return true;
      }

      return (
        coupon.usedCount <
        coupon.usageLimit
      );
    })
    .map((coupon) => {
      const remainingUses =
        coupon.usageLimit === null
          ? null
          : Math.max(
              coupon.usageLimit -
                coupon.usedCount,
              0
            );

      return {
        id: coupon.id,
        sellerId: coupon.sellerId,
        code: coupon.code,
        description:
          coupon.description,
        discountType:
          coupon.discountType,
        discountValue:
          coupon.discountValue,
        minimumOrderValue:
          coupon.minimumOrderValue,
        maximumDiscount:
          coupon.maximumDiscount,
        expiryDate:
          coupon.expiryDate,
        remainingUses,
      };
    });
};

// ======================================================
// GET SELLER COUPON BY ID
// ======================================================

export const getCouponById = async (
  couponId: string,
  sellerId: string
) => {
  return prisma.coupon.findFirst({
    where: {
      id: couponId,
      sellerId,
    },
  });
};

// ======================================================
// DELETE COUPON
// ======================================================

export const deleteCoupon = async (
  couponId: string,
  sellerId: string
) => {
  const coupon =
    await prisma.coupon.findFirst({
      where: {
        id: couponId,
        sellerId,
      },
    });

  if (!coupon) {
    throw new Error(
      "Coupon not found"
    );
  }

  return prisma.coupon.delete({
    where: {
      id: couponId,
    },
  });
};

// ======================================================
// UPDATE COUPON
// ======================================================

export const updateCoupon = async (
  couponId: string,
  sellerId: string,
  data: Partial<CreateCouponData>
) => {
  const coupon =
    await prisma.coupon.findFirst({
      where: {
        id: couponId,
        sellerId,
      },
    });

  if (!coupon) {
    throw new Error(
      "Coupon not found"
    );
  }

  if (data.code) {
    const normalizedCode =
      data.code
        .trim()
        .toUpperCase();

    const duplicateCoupon =
      await prisma.coupon.findFirst({
        where: {
          sellerId,
          code: normalizedCode,

          NOT: {
            id: couponId,
          },
        },
      });

    if (duplicateCoupon) {
      throw new Error(
        "Coupon code already exists"
      );
    }
  }

  if (
    data.discountValue !==
      undefined &&
    data.discountValue <= 0
  ) {
    throw new Error(
      "Discount value must be greater than 0"
    );
  }

  const resultingDiscountType =
    data.discountType ??
    coupon.discountType;

  const resultingDiscountValue =
    data.discountValue ??
    coupon.discountValue;

  if (
    resultingDiscountType ===
      "PERCENTAGE" &&
    resultingDiscountValue > 100
  ) {
    throw new Error(
      "Percentage discount cannot exceed 100"
    );
  }

  if (
    data.minimumOrderValue !==
      undefined &&
    data.minimumOrderValue < 0
  ) {
    throw new Error(
      "Minimum order value cannot be negative"
    );
  }

  if (
    data.maximumDiscount !==
      undefined &&
    data.maximumDiscount <= 0
  ) {
    throw new Error(
      "Maximum discount must be greater than 0"
    );
  }

  if (
    data.usageLimit !== undefined &&
    data.usageLimit <= 0
  ) {
    throw new Error(
      "Usage limit must be greater than 0"
    );
  }

  if (
    data.expiryDate &&
    new Date(data.expiryDate) <=
      new Date()
  ) {
    throw new Error(
      "Expiry date must be in the future"
    );
  }

  return prisma.coupon.update({
    where: {
      id: couponId,
    },

    data: {
      ...(data.code && {
        code: data.code
          .trim()
          .toUpperCase(),
      }),

      ...(data.description !==
        undefined && {
        description:
          data.description,
      }),

      ...(data.discountType && {
        discountType:
          data.discountType,
      }),

      ...(data.discountValue !==
        undefined && {
        discountValue:
          data.discountValue,
      }),

      ...(data.minimumOrderValue !==
        undefined && {
        minimumOrderValue:
          data.minimumOrderValue,
      }),

      ...(data.maximumDiscount !==
        undefined && {
        maximumDiscount:
          data.maximumDiscount,
      }),

      ...(data.usageLimit !==
        undefined && {
        usageLimit:
          data.usageLimit,
      }),

      ...(data.expiryDate && {
        expiryDate: new Date(
          data.expiryDate
        ),
      }),
    },
  });
};

// ======================================================
// VALIDATE CUSTOMER COUPON
// ======================================================

export const validateCoupon = async (
  code: string,
  sellerId: string,
  orderAmount: number
) => {
  const coupon =
    await prisma.coupon.findFirst({
      where: {
        code: code
          .trim()
          .toUpperCase(),

        sellerId,
      },
    });

  if (!coupon) {
    throw new Error(
      "Invalid coupon code"
    );
  }

  if (!coupon.isActive) {
    throw new Error(
      "Coupon is inactive"
    );
  }

  if (
    new Date() >
    coupon.expiryDate
  ) {
    throw new Error(
      "Coupon has expired"
    );
  }

  if (
    coupon.usageLimit !== null &&
    coupon.usedCount >=
      coupon.usageLimit
  ) {
    throw new Error(
      "Coupon usage limit reached"
    );
  }

  if (
    coupon.minimumOrderValue !==
      null &&
    orderAmount <
      coupon.minimumOrderValue
  ) {
    throw new Error(
      `Minimum order value is ₹${coupon.minimumOrderValue}`
    );
  }

  let discount = 0;

  if (
    coupon.discountType ===
    "PERCENTAGE"
  ) {
    discount =
      (orderAmount *
        coupon.discountValue) /
      100;

    if (
      coupon.maximumDiscount !==
        null &&
      discount >
        coupon.maximumDiscount
    ) {
      discount =
        coupon.maximumDiscount;
    }
  } else {
    discount =
      coupon.discountValue;
  }

  /**
   * Discount can never make
   * the order total negative.
   */
  discount = Math.min(
    discount,
    orderAmount
  );

  const finalAmount =
    orderAmount - discount;

  return {
    coupon: {
      id: coupon.id,
      sellerId:
        coupon.sellerId,
      code: coupon.code,
      discountType:
        coupon.discountType,
      discountValue:
        coupon.discountValue,
    },

    discount,
    finalAmount,
  };
};