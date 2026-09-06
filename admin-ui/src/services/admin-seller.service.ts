import api from "./api";

import {
  AdminSellerListResponse,
  GetAdminSellersParams,
  SellerStatus,
  UpdateAdminSellerStatusResponse,
} from "@/types/admin-seller";

export const getAdminSellers =
  async (
    params: GetAdminSellersParams = {}
  ): Promise<AdminSellerListResponse> => {
    const response =
      await api.get<AdminSellerListResponse>(
        "/admin/sellers",
        {
          params,
        }
      );

    return response.data;
  };

export const updateAdminSellerStatus =
  async (
    sellerId: string,
    status: SellerStatus
  ): Promise<UpdateAdminSellerStatusResponse> => {
    const response =
      await api.patch<UpdateAdminSellerStatusResponse>(
        `/admin/sellers/${encodeURIComponent(
          sellerId
        )}/status`,
        {
          status,
        }
      );

    return response.data;
  };