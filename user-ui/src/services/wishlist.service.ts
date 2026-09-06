import api from "./api";

import {
  AddToWishlistData,
  WishlistMutationResponse,
  WishlistResponse,
} from "@/types/wishlist";

// ======================================================
// GET WISHLIST
// ======================================================

export const getWishlist =
  async (): Promise<WishlistResponse> => {
    const response =
      await api.get<WishlistResponse>(
        "/wishlist"
      );

    return response.data;
  };

// ======================================================
// ADD TO WISHLIST
// ======================================================

export const addToWishlist = async (
  data: AddToWishlistData
): Promise<WishlistMutationResponse> => {
  const response =
    await api.post<WishlistMutationResponse>(
      "/wishlist/items",
      data
    );

  return response.data;
};

// ======================================================
// REMOVE FROM WISHLIST
// ======================================================

export const removeFromWishlist = async (
  productId: string
): Promise<WishlistMutationResponse> => {
  const response =
    await api.delete<WishlistMutationResponse>(
      `/wishlist/items/${encodeURIComponent(
        productId
      )}`
    );

  return response.data;
};

// ======================================================
// CLEAR WISHLIST
// ======================================================

export const clearWishlist =
  async (): Promise<WishlistMutationResponse> => {
    const response =
      await api.delete<WishlistMutationResponse>(
        "/wishlist"
      );

    return response.data;
  };