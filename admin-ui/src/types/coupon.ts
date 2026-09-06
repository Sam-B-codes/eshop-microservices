export type CouponDiscountType = "PERCENTAGE" | "FIXED";

export type AdminCouponState = "ACTIVE" | "INACTIVE" | "EXPIRED" | "EXHAUSTED";

export interface AdminCouponSeller {
  id: string;
  name: string;
  email: string;
  shopName: string | null;
  status: "ACTIVE" | "SUSPENDED";
}

export interface AdminCoupon {
  id: string;
  code: string;
  description: string | null;

  discountType: CouponDiscountType;
  discountValue: number;

  minimumOrderValue: number | null;
  maximumDiscount: number | null;

  usageLimit: number | null;
  usedCount: number;

  expiryDate: string;
  isActive: boolean;
  state: AdminCouponState;

  seller: AdminCouponSeller;

  createdAt: string;
  updatedAt: string;
}

export interface AdminCouponSummary {
  totalCoupons: number;
  activeCoupons: number;
  inactiveCoupons: number;
  expiredCoupons: number;
  exhaustedCoupons: number;
  totalRedemptions: number;
}

export interface AdminCouponPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface AdminCouponsResponse {
  success: boolean;
  message: string;
  coupons: AdminCoupon[];
  pagination: AdminCouponPagination;
}

export interface AdminCouponSummaryResponse {
  success: boolean;
  message: string;
  summary: AdminCouponSummary;
}

export interface GetAdminCouponsParams {
  page?: number;
  limit?: number;
  search?: string;
  state?: AdminCouponState;
  discountType?: CouponDiscountType;
}
