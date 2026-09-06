import prisma from "@org/prisma";

import {
  BadRequestError,
  NotFoundError,
} from "@org/error-handler";

// ======================================================
// GET PRODUCT FOR WISHLIST
// ======================================================

const getProductForWishlist = async (
  productId: string
) => {
  const product =
    await prisma.product.findFirst({
      where: {
        id: productId,
        status: "PUBLISHED",
      },

      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        category: true,
        brand: true,

        price: true,
        discountPrice: true,
        salePrice: true,

        stock: true,
        images: true,
        status: true,
      },
    });

  if (!product) {
    throw new NotFoundError(
      "Product not found or unavailable"
    );
  }

  return product;
};

// ======================================================
// GET OR CREATE WISHLIST
// ======================================================

const getOrCreateWishlist = async (
  userId: string
) => {
  const existingWishlist =
    await prisma.wishlist.findUnique({
      where: {
        userId,
      },
    });

  if (existingWishlist) {
    return existingWishlist;
  }

  return prisma.wishlist.create({
    data: {
      userId,
    },
  });
};

// ======================================================
// GET WISHLIST
// ======================================================

export const getWishlist = async (
  userId: string
) => {
  const wishlist =
    await prisma.wishlist.findUnique({
      where: {
        userId,
      },

      include: {
        items: {
          orderBy: {
            createdAt: "desc",
          },

          include: {
            product: {
              select: {
                id: true,
                title: true,
                slug: true,
                description: true,
                category: true,
                brand: true,

                price: true,
                discountPrice: true,
                salePrice: true,

                stock: true,
                images: true,
                status: true,
              },
            },
          },
        },
      },
    });

  // User has never created a wishlist.
  if (!wishlist) {
    return {
      id: null,
      items: [],
      itemCount: 0,
    };
  }

  // ====================================================
  // FORMAT WISHLIST ITEMS
  // ====================================================

  const items =
    wishlist.items.map((item) => {
      const available =
        item.product.status ===
          "PUBLISHED" &&
        item.product.stock > 0;

      const hasDiscount =
        item.product.discountPrice !==
          null &&
        item.product.discountPrice !==
          undefined &&
        item.product.discountPrice >= 0 &&
        item.product.discountPrice <
          item.product.price;

      const discountPercentage =
        hasDiscount
          ? Math.round(
              ((item.product.price -
                item.product.salePrice) /
                item.product.price) *
                100
            )
          : 0;

      return {
        id: item.id,

        productId:
          item.productId,

        createdAt:
          item.createdAt,

        product: {
          id:
            item.product.id,

          title:
            item.product.title,

          slug:
            item.product.slug,

          description:
            item.product.description,

          category:
            item.product.category,

          brand:
            item.product.brand,

          price:
            item.product.price,

          discountPrice:
            item.product
              .discountPrice,

          salePrice:
            item.product.salePrice,

          stock:
            item.product.stock,

          images:
            item.product.images,

          status:
            item.product.status,

          available,

          availability:
            available
              ? "IN_STOCK"
              : "OUT_OF_STOCK",

          hasDiscount,

          discountPercentage,
        },
      };
    });

  return {
    id: wishlist.id,
    items,
    itemCount: items.length,
  };
};

// ======================================================
// ADD TO WISHLIST
// ======================================================

export const addToWishlist = async (
  userId: string,
  productId: string
) => {
  if (!productId) {
    throw new BadRequestError(
      "Product ID is required"
    );
  }

  // Only currently published products can be added.
  await getProductForWishlist(
    productId
  );

  const wishlist =
    await getOrCreateWishlist(
      userId
    );

  // ====================================================
  // DUPLICATE CHECK
  // ====================================================

  const existingItem =
    await prisma.wishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId:
            wishlist.id,

          productId,
        },
      },
    });

  /**
   * Wishlist add is intentionally idempotent.
   *
   * Clicking the heart multiple times or retrying the
   * same network request will not create duplicates.
   */
  if (!existingItem) {
    await prisma.wishlistItem.create({
      data: {
        wishlistId:
          wishlist.id,

        productId,
      },
    });
  }

  return getWishlist(userId);
};

// ======================================================
// REMOVE FROM WISHLIST
// ======================================================

export const removeFromWishlist = async (
  userId: string,
  productId: string
) => {
  if (!productId) {
    throw new BadRequestError(
      "Product ID is required"
    );
  }

  const wishlist =
    await prisma.wishlist.findUnique({
      where: {
        userId,
      },
    });

  if (!wishlist) {
    throw new NotFoundError(
      "Wishlist not found"
    );
  }

  const wishlistItem =
    await prisma.wishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId:
            wishlist.id,

          productId,
        },
      },
    });

  if (!wishlistItem) {
    throw new NotFoundError(
      "Product not found in wishlist"
    );
  }

  await prisma.wishlistItem.delete({
    where: {
      id:
        wishlistItem.id,
    },
  });

  return getWishlist(userId);
};

// ======================================================
// CLEAR WISHLIST
// ======================================================

export const clearWishlist = async (
  userId: string
) => {
  const wishlist =
    await prisma.wishlist.findUnique({
      where: {
        userId,
      },
    });

  /**
   * Clearing a wishlist that doesn't exist is
   * considered successful.
   */
  if (!wishlist) {
    return {
      id: null,
      items: [],
      itemCount: 0,
    };
  }

  await prisma.wishlistItem.deleteMany({
    where: {
      wishlistId:
        wishlist.id,
    },
  });

  return getWishlist(userId);
};