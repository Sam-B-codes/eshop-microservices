import {
  NextFunction,
  Response,
} from "express";

import {
  AuthenticationError,
  BadRequestError,
} from "@org/error-handler";

import {
  AuthRequest,
} from "../middleware/auth.middleware";

import {
  addToWishlist,
  clearWishlist,
  getWishlist,
  removeFromWishlist,
} from "../services/wishlist.service";

// ======================================================
// GET AUTHENTICATED USER ID
// ======================================================

const getAuthenticatedUserId = (
  req: AuthRequest
) => {
  const userId =
    req.user?.id;

  if (!userId) {
    throw new AuthenticationError(
      "Please login first"
    );
  }

  return userId;
};

// ======================================================
// GET WISHLIST
// GET /api/wishlist
// ======================================================

export const getWishlistController =
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId =
        getAuthenticatedUserId(req);

      const wishlist =
        await getWishlist(
          userId
        );

      return res.status(200).json({
        success: true,
        wishlist,
      });
    } catch (error) {
      return next(error);
    }
  };

// ======================================================
// ADD TO WISHLIST
// POST /api/wishlist/items
// ======================================================

export const addToWishlistController =
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId =
        getAuthenticatedUserId(req);

      const {
        productId,
      } = req.body;

      if (
        typeof productId !==
          "string" ||
        !productId.trim()
      ) {
        throw new BadRequestError(
          "Product ID is required"
        );
      }

      const wishlist =
        await addToWishlist(
          userId,
          productId.trim()
        );

      return res.status(200).json({
        success: true,
        message:
          "Product added to wishlist successfully",
        wishlist,
      });
    } catch (error) {
      return next(error);
    }
  };

// ======================================================
// REMOVE FROM WISHLIST
// DELETE /api/wishlist/items/:productId
// ======================================================

export const removeFromWishlistController =
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
        typeof productId !==
          "string" ||
        !productId.trim()
      ) {
        throw new BadRequestError(
          "Product ID is required"
        );
      }

      const wishlist =
        await removeFromWishlist(
          userId,
          productId.trim()
        );

      return res.status(200).json({
        success: true,
        message:
          "Product removed from wishlist successfully",
        wishlist,
      });
    } catch (error) {
      return next(error);
    }
  };

// ======================================================
// CLEAR WISHLIST
// DELETE /api/wishlist
// ======================================================

export const clearWishlistController =
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId =
        getAuthenticatedUserId(req);

      const wishlist =
        await clearWishlist(
          userId
        );

      return res.status(200).json({
        success: true,
        message:
          "Wishlist cleared successfully",
        wishlist,
      });
    } catch (error) {
      return next(error);
    }
  };