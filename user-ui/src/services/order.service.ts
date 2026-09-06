import api from "./api";

import {
  CreateOrderData,
  CreateOrderResponse,
  GetOrderResponse,
  GetUserOrdersParams,
  GetUserOrdersResponse,
} from "@/types/order";

// ======================================================
// CREATE ORDER
// ======================================================

export const createOrder =
  async (
    data: CreateOrderData
  ): Promise<CreateOrderResponse> => {
    const response =
      await api.post<CreateOrderResponse>(
        "/orders",
        data
      );

    return response.data;
  };

// ======================================================
// GET USER ORDERS
// ======================================================

export const getUserOrders =
  async (
    params: GetUserOrdersParams = {}
  ): Promise<GetUserOrdersResponse> => {
    const response =
      await api.get<GetUserOrdersResponse>(
        "/orders",
        {
          params,
        }
      );

    return response.data;
  };

// ======================================================
// GET ORDER BY ID
// ======================================================

export const getOrderById =
  async (
    orderId: string
  ): Promise<GetOrderResponse> => {
    const normalizedOrderId =
      orderId.trim();

    if (!normalizedOrderId) {
      throw new Error(
        "Order ID is required"
      );
    }

    const response =
      await api.get<GetOrderResponse>(
        `/orders/${encodeURIComponent(
          normalizedOrderId
        )}`
      );

    return response.data;
  };