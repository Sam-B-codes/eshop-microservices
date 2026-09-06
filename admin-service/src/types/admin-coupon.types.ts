import { CouponDiscountType } from "@prisma/client";

export type AdminCouponState = "ACTIVE" | "INACTIVE" | "EXPIRED" | "EXHAUSTED";

export interface GetAdminCouponsInput {
  page: number;
  limit: number;
  search?: string;
  state?: AdminCouponState;
  discountType?: CouponDiscountType;
}

export interface UpdateAdminCouponStatusInput {
  isActive: boolean;
}
