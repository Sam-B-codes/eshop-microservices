import api from "./api";

import {
  CouponValidationRequest,
  CouponValidationResponse,
  PublicCouponsResponse,
} from "@/types/coupon";

// ======================================================
// GET PUBLIC COUPONS
// ======================================================

export const getPublicCoupons =
  async (
    sellerId?: string
  ): Promise<PublicCouponsResponse> => {
    const params =
      new URLSearchParams();

    if (sellerId?.trim()) {
      params.set(
        "sellerId",
        sellerId.trim()
      );
    }

    const queryString =
      params.toString();

    const url =
      queryString
        ? `/coupons/public?${queryString}`
        : "/coupons/public";

    const response =
      await api.get<PublicCouponsResponse>(
        url
      );

    return response.data;
  };

// ======================================================
// VALIDATE COUPON
// ======================================================

export const validateCoupon =
  async (
    data: CouponValidationRequest
  ): Promise<CouponValidationResponse> => {
    const normalizedData: CouponValidationRequest = {
      ...data,

      code:
        data.code
          .trim()
          .toUpperCase(),

      sellerId:
        data.sellerId.trim(),

      orderAmount:
        Number(
          data.orderAmount
        ),
    };

    const response =
      await api.post<CouponValidationResponse>(
        "/coupons/validate",
        normalizedData
      );

    return response.data;
  };

// ======================================================
// CHECKOUT COUPON ALIAS
// ======================================================

/**
 * Checkout-specific name.
 *
 * The actual API endpoint remains the same.
 * Keeping this alias makes checkout code easier to read
 * without duplicating the coupon validation logic.
 */
export const validateCheckoutCoupon =
  validateCoupon;