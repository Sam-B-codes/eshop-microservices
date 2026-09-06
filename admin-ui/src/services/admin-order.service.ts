import api from "./api";

import {
  AdminOrderDetailsResponse,
  AdminOrderListResponse,
  GetAdminOrdersParams,
} from "@/types/admin-order";

export const getAdminOrders =
  async (
    params: GetAdminOrdersParams = {}
  ): Promise<AdminOrderListResponse> => {
    const response =
      await api.get<AdminOrderListResponse>(
        "/admin/orders",
        {
          params,
        }
      );

    return response.data;
  };

  export const getAdminOrderById =
  async (
    orderId: string
  ): Promise<AdminOrderDetailsResponse> => {
    const normalizedOrderId =
      orderId.trim();

    if (!normalizedOrderId) {
      throw new Error(
        "Order ID is required"
      );
    }

    const response =
      await api.get<AdminOrderDetailsResponse>(
        `/admin/orders/${encodeURIComponent(
          normalizedOrderId
        )}`
      );

    return response.data;
  };