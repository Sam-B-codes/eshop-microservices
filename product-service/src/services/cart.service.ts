import prisma from "@org/prisma";

import {
  BadRequestError,
  NotFoundError,
} from "@org/error-handler";

// ======================================================
// GET PRODUCT FOR CART
// ======================================================

const getProductForCart = async (
  productId: string
) => {
  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      status: "PUBLISHED",
    },

    select: {
      id: true,

      // Seller ownership is required during checkout
      // so seller-specific coupons can be validated.
      sellerId: true,

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
// GET OR CREATE CART
// ======================================================

const getOrCreateCart = async (
  userId: string
) => {
  const existingCart = await prisma.cart.findUnique({
    where: {
      userId,
    },
  });

  if (existingCart) {
    return existingCart;
  }

  return prisma.cart.create({
    data: {
      userId,
    },
  });
};

// ======================================================
// GET CART
// ======================================================

export const getCart = async (
  userId: string
) => {
  const cart = await prisma.cart.findUnique({
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

              // Required for seller-specific checkout
              // and coupon validation.
              sellerId: true,

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

  // User has never added anything to cart.
  if (!cart) {
    return {
      id: null,
      items: [],
      itemCount: 0,
      subtotal: 0,
    };
  }

  // ====================================================
  // FORMAT CART ITEMS
  // ====================================================

  const items = cart.items.map((item) => {
    const available =
      item.product.status === "PUBLISHED" &&
      item.product.stock > 0;

    const quantityAvailable =
      available &&
      item.quantity <= item.product.stock;

    const lineTotal =
      item.product.salePrice * item.quantity;

    return {
      id: item.id,

      productId: item.productId,

      quantity: item.quantity,

      lineTotal,

      product: {
        id: item.product.id,

        sellerId:
          item.product.sellerId,

        title: item.product.title,

        slug: item.product.slug,

        description:
          item.product.description,

        category:
          item.product.category,

        brand: item.product.brand,

        price: item.product.price,

        discountPrice:
          item.product.discountPrice,

        salePrice:
          item.product.salePrice,

        stock: item.product.stock,

        images: item.product.images,

        status: item.product.status,

        available,

        quantityAvailable,
      },
    };
  });

  // ====================================================
  // TOTAL ITEM COUNT
  // ====================================================

  const itemCount = items.reduce(
    (total, item) =>
      total + item.quantity,
    0
  );

  // ====================================================
  // SUBTOTAL
  // ====================================================

  /**
   * Always use CURRENT Product.salePrice.
   *
   * Cart totals are intentionally not persisted because
   * product prices may change after an item is added.
   */
  const subtotal = items.reduce(
    (total, item) =>
      total + item.lineTotal,
    0
  );

  return {
    id: cart.id,
    items,
    itemCount,
    subtotal,
  };
};

// ======================================================
// ADD TO CART
// ======================================================

export const addToCart = async (
  userId: string,
  productId: string,
  quantity = 1
) => {
  // ====================================================
  // VALIDATION
  // ====================================================

  if (!productId) {
    throw new BadRequestError(
      "Product ID is required"
    );
  }

  if (
    !Number.isInteger(quantity) ||
    quantity < 1
  ) {
    throw new BadRequestError(
      "Quantity must be a positive integer"
    );
  }

  const product =
    await getProductForCart(productId);

  // ====================================================
  // STOCK CHECK
  // ====================================================

  if (product.stock <= 0) {
    throw new BadRequestError(
      "Product is out of stock"
    );
  }

  if (quantity > product.stock) {
    throw new BadRequestError(
      `Only ${product.stock} item(s) available`
    );
  }

  // ====================================================
  // GET / CREATE CART
  // ====================================================

  const cart =
    await getOrCreateCart(userId);

  // ====================================================
  // CHECK EXISTING ITEM
  // ====================================================

  const existingItem =
    await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

  // ====================================================
  // PRODUCT ALREADY IN CART
  // ====================================================

  if (existingItem) {
    const newQuantity =
      existingItem.quantity + quantity;

    if (newQuantity > product.stock) {
      throw new BadRequestError(
        `Only ${product.stock} item(s) available`
      );
    }

    await prisma.cartItem.update({
      where: {
        id: existingItem.id,
      },

      data: {
        quantity: newQuantity,
      },
    });
  } else {
    // ==================================================
    // CREATE NEW CART ITEM
    // ==================================================

    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
      },
    });
  }

  return getCart(userId);
};

// ======================================================
// UPDATE CART ITEM
// ======================================================

export const updateCartItem = async (
  userId: string,
  productId: string,
  quantity: number
) => {
  // ====================================================
  // VALIDATION
  // ====================================================

  if (!productId) {
    throw new BadRequestError(
      "Product ID is required"
    );
  }

  if (
    !Number.isInteger(quantity) ||
    quantity < 1
  ) {
    throw new BadRequestError(
      "Quantity must be a positive integer"
    );
  }

  // ====================================================
  // PRODUCT CHECK
  // ====================================================

  const product =
    await getProductForCart(productId);

  if (product.stock <= 0) {
    throw new BadRequestError(
      "Product is out of stock"
    );
  }

  if (quantity > product.stock) {
    throw new BadRequestError(
      `Only ${product.stock} item(s) available`
    );
  }

  // ====================================================
  // CART CHECK
  // ====================================================

  const cart =
    await prisma.cart.findUnique({
      where: {
        userId,
      },
    });

  if (!cart) {
    throw new NotFoundError(
      "Cart not found"
    );
  }

  // ====================================================
  // CART ITEM CHECK
  // ====================================================

  const cartItem =
    await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

  if (!cartItem) {
    throw new NotFoundError(
      "Product not found in cart"
    );
  }

  // ====================================================
  // UPDATE
  // ====================================================

  await prisma.cartItem.update({
    where: {
      id: cartItem.id,
    },

    data: {
      quantity,
    },
  });

  return getCart(userId);
};

// ======================================================
// REMOVE FROM CART
// ======================================================

export const removeFromCart = async (
  userId: string,
  productId: string
) => {
  if (!productId) {
    throw new BadRequestError(
      "Product ID is required"
    );
  }

  // ====================================================
  // CART CHECK
  // ====================================================

  const cart =
    await prisma.cart.findUnique({
      where: {
        userId,
      },
    });

  if (!cart) {
    throw new NotFoundError(
      "Cart not found"
    );
  }

  // ====================================================
  // ITEM CHECK
  // ====================================================

  const cartItem =
    await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

  if (!cartItem) {
    throw new NotFoundError(
      "Product not found in cart"
    );
  }

  // ====================================================
  // DELETE ITEM
  // ====================================================

  await prisma.cartItem.delete({
    where: {
      id: cartItem.id,
    },
  });

  return getCart(userId);
};

// ======================================================
// CLEAR CART
// ======================================================

export const clearCart = async (
  userId: string
) => {
  const cart =
    await prisma.cart.findUnique({
      where: {
        userId,
      },
    });

  /**
   * Clearing an empty/non-existing cart is considered
   * successful. This keeps the operation idempotent.
   */
  if (!cart) {
    return {
      id: null,
      items: [],
      itemCount: 0,
      subtotal: 0,
    };
  }

  await prisma.cartItem.deleteMany({
    where: {
      cartId: cart.id,
    },
  });

  return getCart(userId);
};