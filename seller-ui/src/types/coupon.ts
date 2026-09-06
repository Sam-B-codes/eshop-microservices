export type DiscountType =
  | "PERCENTAGE"
  | "FIXED";

export interface Coupon {
  id: string;
  code: string;
  description?: string;

  discountType: DiscountType;
  discountValue: number;

  minimumOrderValue?: number;
  maximumDiscount?: number;

  usageLimit?: number;
  usedCount: number;

  expiryDate: string;

  isActive: boolean;

  sellerId: string;

  createdAt: string;
  updatedAt: string;
}

export interface CreateCouponData {
  code: string;
  description?: string;

  discountType: DiscountType;
  discountValue: number;

  minimumOrderValue?: number;
  maximumDiscount?: number;

  usageLimit?: number;

  expiryDate: string;
}

export type UpdateCouponData =
  Partial<CreateCouponData>;

export interface CouponsResponse {
  success: boolean;
  coupons: Coupon[];
}

export interface CouponResponse {
  success: boolean;
  coupon: Coupon;
}