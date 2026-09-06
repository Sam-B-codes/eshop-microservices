import { Prisma, ProductStatus } from "@prisma/client";

import prisma from "@org/prisma";

import { BadRequestError, NotFoundError } from "@org/error-handler";

import {
  AdminProductListParams,
  AdminProductListResponse,
} from "../types/admin-product.types";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

const getPrimaryImage = (images: Prisma.JsonValue): string | null => {
  if (!Array.isArray(images)) {
    return null;
  }

  const firstImage = images[0];

  if (
    typeof firstImage !== "object" ||
    firstImage === null ||
    Array.isArray(firstImage)
  ) {
    return null;
  }

  const url = firstImage.url;

  return typeof url === "string" ? url : null;
};

export const getAdminProducts = async (
  params: AdminProductListParams,
): Promise<AdminProductListResponse> => {
  const page = Math.max(Math.trunc(params.page ?? 1), 1);

  const limit = Math.min(
    Math.max(Math.trunc(params.limit ?? DEFAULT_LIMIT), 1),
    MAX_LIMIT,
  );

  const search = params.search?.trim();

  const stockWhere: Prisma.ProductWhereInput =
    params.stock === "OUT_OF_STOCK"
      ? {
          stock: {
            lte: 0,
          },
        }
      : params.stock === "LOW_STOCK"
        ? {
            stock: {
              gt: 0,
              lte: 10,
            },
          }
        : params.stock === "IN_STOCK"
          ? {
              stock: {
                gt: 10,
              },
            }
          : {};

  const where: Prisma.ProductWhereInput = {
    ...stockWhere,

    ...(params.status
      ? {
          status: params.status,
        }
      : {}),

    ...(search
      ? {
          OR: [
            {
              title: {
                contains: search,

                mode: "insensitive",
              },
            },
            {
              brand: {
                contains: search,

                mode: "insensitive",
              },
            },
            {
              sku: {
                contains: search,

                mode: "insensitive",
              },
            },
            {
              category: {
                contains: search,

                mode: "insensitive",
              },
            },
            {
              seller: {
                is: {
                  OR: [
                    {
                      name: {
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
                },
              },
            },
          ],
        }
      : {}),
  };

  const [totalProducts, products] = await Promise.all([
    prisma.product.count({
      where,
    }),

    prisma.product.findMany({
      where,

      skip: (page - 1) * limit,

      take: limit,

      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        sellerId: true,
        title: true,
        slug: true,
        category: true,
        brand: true,
        sku: true,
        price: true,
        discountPrice: true,
        salePrice: true,
        stock: true,
        status: true,
        images: true,
        createdAt: true,
        updatedAt: true,

        seller: {
          select: {
            name: true,
            shopName: true,
          },
        },
      },
    }),
  ]);

  const totalPages = totalProducts === 0 ? 0 : Math.ceil(totalProducts / limit);

  return {
    success: true,

    message: "Products fetched successfully",

    products: products.map((product) => ({
      id: product.id,
      sellerId: product.sellerId,

      sellerName: product.seller.name,

      shopName: product.seller.shopName,

      title: product.title,

      slug: product.slug,

      category: product.category,

      brand: product.brand,

      sku: product.sku,

      price: product.price,

      discountPrice: product.discountPrice,

      salePrice: product.salePrice,

      stock: product.stock,

      status: product.status,

      image: getPrimaryImage(product.images),

      createdAt: product.createdAt.toISOString(),

      updatedAt: product.updatedAt.toISOString(),
    })),

    pagination: {
      page,
      limit,
      totalProducts,
      totalPages,

      hasPreviousPage: page > 1,

      hasNextPage: page < totalPages,
    },
  };
};

export const updateAdminProductStatus = async (
  productId: string,
  status: ProductStatus,
) => {
  const normalizedProductId = productId.trim();

  if (!normalizedProductId) {
    throw new BadRequestError("Product ID is required");
  }

  const allowedStatuses: ProductStatus[] = [
    "DRAFT",
    "PUBLISHED",
    "OUT_OF_STOCK",
    "ARCHIVED",
  ];

  if (!allowedStatuses.includes(status)) {
    throw new BadRequestError("Invalid product status");
  }

  const product = await prisma.product.findUnique({
    where: {
      id: normalizedProductId,
    },

    select: {
      id: true,
      stock: true,
    },
  });

  if (!product) {
    throw new NotFoundError("Product not found");
  }

  if (status === "PUBLISHED" && product.stock <= 0) {
    throw new BadRequestError("An out-of-stock product cannot be published");
  }

  const updatedProduct = await prisma.product.update({
    where: {
      id: normalizedProductId,
    },

    data: {
      status,
    },

    select: {
      id: true,
      status: true,
      updatedAt: true,
    },
  });

  return {
    success: true,

    message: "Product status updated successfully",

    product: {
      id: updatedProduct.id,

      status: updatedProduct.status,

      updatedAt: updatedProduct.updatedAt.toISOString(),
    },
  };
};
