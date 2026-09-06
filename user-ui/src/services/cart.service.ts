import api from "./api";

import {
  AddToCartData,
  CartMutationResponse,
  CartResponse,
  UpdateCartItemData,
} from "@/types/cart";

// ======================================================
// GET CART
// ======================================================

export const getCart =
  async (): Promise<CartResponse> => {
    const response =
      await api.get<CartResponse>(
        "/cart"
      );

    return response.data;
  };

// ======================================================
// ADD TO CART
// ======================================================

export const addToCart = async (
  data: AddToCartData
): Promise<CartMutationResponse> => {
  const response =
    await api.post<CartMutationResponse>(
      "/cart/items",
      data
    );

  return response.data;
};

// ======================================================
// UPDATE CART ITEM
// ======================================================

export const updateCartItem = async (
  productId: string,
  data: UpdateCartItemData
): Promise<CartMutationResponse> => {
  const response =
    await api.put<CartMutationResponse>(
      `/cart/items/${encodeURIComponent(
        productId
      )}`,
      data
    );

  return response.data;
};

// ======================================================
// REMOVE CART ITEM
// ======================================================

export const removeFromCart = async (
  productId: string
): Promise<CartMutationResponse> => {
  const response =
    await api.delete<CartMutationResponse>(
      `/cart/items/${encodeURIComponent(
        productId
      )}`
    );

  return response.data;
};

// ======================================================
// CLEAR CART
// ======================================================

export const clearCart =
  async (): Promise<CartMutationResponse> => {
    const response =
      await api.delete<CartMutationResponse>(
        "/cart"
      );

    return response.data;
  };