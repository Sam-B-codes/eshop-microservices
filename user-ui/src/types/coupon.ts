export type DiscountType =
  | "PERCENTAGE"
  | "FIXED";

export interface PublicCoupon {
  id: string;
  sellerId: string;

  code: string;
  description?: string | null;

  discountType: DiscountType;
  discountValue: number;

  minimumOrderValue?: number | null;
  maximumDiscount?: number | null;

  expiryDate: string;

  remainingUses?: number | null;
}

export interface PublicCouponsResponse {
  success: boolean;
  coupons: PublicCoupon[];
}

export interface CouponValidationRequest {
  code: string;
  sellerId: string;
  orderAmount: number;
}

export interface ValidatedCoupon {
  id: string;
  sellerId: string;
  code: string;

  discountType: DiscountType;
  discountValue: number;
}

export interface CouponValidationResponse {
  success: boolean;
  message: string;

  coupon: ValidatedCoupon;

  discount: number;
  finalAmount: number;
}