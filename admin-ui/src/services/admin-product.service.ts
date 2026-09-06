import api from "./api";

import {
  AdminProductListResponse,
  GetAdminProductsParams,
  ProductStatus,
  UpdateAdminProductStatusResponse,
} from "@/types/admin-product";

export const getAdminProducts =
  async (
    params: GetAdminProductsParams = {}
  ): Promise<AdminProductListResponse> => {
    const response =
      await api.get<AdminProductListResponse>(
        "/admin/products",
        {
          params,
        }
      );

    return response.data;
  };

export const updateAdminProductStatus =
  async (
    productId: string,
    status: ProductStatus
  ): Promise<UpdateAdminProductStatusResponse> => {
    const response =
      await api.patch<UpdateAdminProductStatusResponse>(
        `/admin/products/${encodeURIComponent(
          productId
        )}/status`,
        {
          status,
        }
      );

    return response.data;
  };