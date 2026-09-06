import {
  NextFunction,
  Response,
} from "express";

import {
  BadRequestError,
  AuthenticationError,
} from "@org/error-handler";

import { AuthRequest } from "../middleware/auth.middleware";

import {
  addToCart,
  clearCart,
  getCart,
  removeFromCart,
  updateCartItem,
} from "../services/cart.service";

// ======================================================
// GET USER ID
// ======================================================

const getAuthenticatedUserId = (
  req: AuthRequest
) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AuthenticationError(
      "Please login first"
    );
  }

  return userId;
};

// ======================================================
// GET CART
// GET /api/cart
// ======================================================

export const getCartController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const cart =
      await getCart(userId);

    return res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    return next(error);
  }
};

// ======================================================
// ADD TO CART
// POST /api/cart/items
// ======================================================

export const addToCartController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const {
      productId,
      quantity = 1,
    } = req.body;

    if (
      typeof productId !== "string" ||
      !productId.trim()
    ) {
      throw new BadRequestError(
        "Product ID is required"
      );
    }

    if (
      typeof quantity !== "number"
    ) {
      throw new BadRequestError(
        "Quantity must be a number"
      );
    }

    const cart =
      await addToCart(
        userId,
        productId.trim(),
        quantity
      );

    return res.status(200).json({
      success: true,
      message:
        "Product added to cart successfully",
      cart,
    });
  } catch (error) {
    return next(error);
  }
};

// ======================================================
// UPDATE CART ITEM
// PUT /api/cart/items/:productId
// ======================================================

export const updateCartItemController =
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId =
        getAuthenticatedUserId(req);

      const productId =
        req.params.productId;

      const { quantity } = req.body;

      if (
        typeof productId !== "string" ||
        !productId.trim()
      ) {
        throw new BadRequestError(
          "Product ID is required"
        );
      }

      if (
        typeof quantity !== "number"
      ) {
        throw new BadRequestError(
          "Quantity must be a number"
        );
      }

      const cart =
        await updateCartItem(
          userId,
          productId.trim(),
          quantity
        );

      return res.status(200).json({
        success: true,
        message:
          "Cart updated successfully",
        cart,
      });
    } catch (error) {
      return next(error);
    }
  };

// ======================================================
// REMOVE FROM CART
// DELETE /api/cart/items/:productId
// ======================================================

export const removeFromCartController =
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId =
        getAuthenticatedUserId(req);

      const productId =
        req.params.productId;

      if (
        typeof productId !== "string" ||
        !productId.trim()
      ) {
        throw new BadRequestError(
          "Product ID is required"
        );
      }

      const cart =
        await removeFromCart(
          userId,
          productId.trim()
        );

      return res.status(200).json({
        success: true,
        message:
          "Product removed from cart successfully",
        cart,
      });
    } catch (error) {
      return next(error);
    }
  };

// ======================================================
// CLEAR CART
// DELETE /api/cart
// ======================================================

export const clearCartController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const cart =
      await clearCart(userId);

    return res.status(200).json({
      success: true,
      message:
        "Cart cleared successfully",
      cart,
    });
  } catch (error) {
    return next(error);
  }
};