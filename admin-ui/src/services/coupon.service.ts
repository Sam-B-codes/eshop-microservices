import api from "./api";

import {
  AdminCouponsResponse,
  AdminCouponSummaryResponse,
  GetAdminCouponsParams,
} from "@/types/coupon";

export const getAdminCouponSummary =
  async (): Promise<AdminCouponSummaryResponse> => {
    const response = await api.get<AdminCouponSummaryResponse>(
      "/admin/coupons/summary",
    );

    return response.data;
  };

export const getAdminCoupons = async (
  params: GetAdminCouponsParams = {},
): Promise<AdminCouponsResponse> => {
  const response = await api.get<AdminCouponsResponse>("/admin/coupons", {
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      search: params.search?.trim() || undefined,
      state: params.state || undefined,
      discountType: params.discountType || undefined,
    },
  });

  return response.data;
};

export const updateAdminCouponStatus = async (
  couponId: string,
  isActive: boolean,
) => {
  const response = await api.patch(`/admin/coupons/${couponId}/status`, {
    isActive,
  });

  return response.data;
};

export const deleteAdminCoupon = async (couponId: string) => {
  const response = await api.delete(`/admin/coupons/${couponId}`);

  return response.data;
};
