import { Prisma, SellerStatus } from "@prisma/client";

import prisma from "@org/prisma";

import { BadRequestError, NotFoundError } from "@org/error-handler";

import {
  AdminSellerListParams,
  AdminSellerListResponse,
} from "../types/admin-seller.types";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

export const getAdminSellers = async (
  params: AdminSellerListParams,
): Promise<AdminSellerListResponse> => {
  const page = Math.max(Math.trunc(params.page ?? 1), 1);

  const limit = Math.min(
    Math.max(Math.trunc(params.limit ?? DEFAULT_LIMIT), 1),
    MAX_LIMIT,
  );

  const search = params.search?.trim();

  const where: Prisma.sellersWhereInput = {
    ...(params.status
      ? {
          status: params.status,
        }
      : {}),

    ...(params.onboarding
      ? {
          isOnboarded: params.onboarding === "COMPLETE",
        }
      : {}),

    ...(search
      ? {
          OR: [
            {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              email: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              shopName: {
                contains: search,
                mode: "insensitive",
              },
            },
          ],
        }
      : {}),
  };

  const [totalSellers, sellers] = await Promise.all([
    prisma.sellers.count({
      where,
    }),

    prisma.sellers.findMany({
      where,

      skip: (page - 1) * limit,

      take: limit,

      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        name: true,
        email: true,
        phone_number: true,
        country: true,
        shopName: true,
        category: true,
        status: true,
        isOnboarded: true,
        bankConnected: true,
        createdAt: true,
        updatedAt: true,

        _count: {
          select: {
            products: true,
            sellerOrders: true,
            coupons: true,
          },
        },
      },
    }),
  ]);

  const totalPages = totalSellers === 0 ? 0 : Math.ceil(totalSellers / limit);

  return {
    success: true,

    message: "Sellers fetched successfully",

    sellers: sellers.map((seller) => ({
      id: seller.id,
      name: seller.name,
      email: seller.email,

      phoneNumber: seller.phone_number,

      country: seller.country,

      shopName: seller.shopName,

      category: seller.category,

      status: seller.status,

      isOnboarded: seller.isOnboarded,

      bankConnected: seller.bankConnected,

      productCount: seller._count.products,

      orderCount: seller._count.sellerOrders,

      couponCount: seller._count.coupons,

      createdAt: seller.createdAt.toISOString(),

      updatedAt: seller.updatedAt.toISOString(),
    })),

    pagination: {
      page,
      limit,
      totalSellers,
      totalPages,

      hasPreviousPage: page > 1,

      hasNextPage: page < totalPages,
    },
  };
};

export const updateAdminSellerStatus = async (
  sellerId: string,
  status: SellerStatus,
) => {
  const normalizedSellerId = sellerId.trim();

  if (!normalizedSellerId) {
    throw new BadRequestError("Seller ID is required");
  }

  if (status !== "ACTIVE" && status !== "SUSPENDED") {
    throw new BadRequestError("Invalid seller status");
  }

  const existingSeller = await prisma.sellers.findUnique({
    where: {
      id: normalizedSellerId,
    },

    select: {
      id: true,
    },
  });

  if (!existingSeller) {
    throw new NotFoundError("Seller not found");
  }

  const seller = await prisma.sellers.update({
    where: {
      id: normalizedSellerId,
    },

    data: {
      status,
    },

    select: {
      id: true,
      name: true,
      email: true,
      phone_number: true,
      country: true,
      shopName: true,
      category: true,
      status: true,
      isOnboarded: true,
      bankConnected: true,
      createdAt: true,
      updatedAt: true,

      _count: {
        select: {
          products: true,
          sellerOrders: true,
          coupons: true,
        },
      },
    },
  });

  return {
    success: true,

    message:
      status === "SUSPENDED"
        ? "Seller suspended successfully"
        : "Seller reactivated successfully",

    seller: {
      id: seller.id,
      name: seller.name,
      email: seller.email,

      phoneNumber: seller.phone_number,

      country: seller.country,

      shopName: seller.shopName,

      category: seller.category,

      status: seller.status,

      isOnboarded: seller.isOnboarded,

      bankConnected: seller.bankConnected,

      productCount: seller._count.products,

      orderCount: seller._count.sellerOrders,

      couponCount: seller._count.coupons,

      createdAt: seller.createdAt.toISOString(),

      updatedAt: seller.updatedAt.toISOString(),
    },
  };
};
