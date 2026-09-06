import api from "./api";

import {
  GetSellerOrdersParams,
  GetSellerRevenueSummaryParams,
  SellerOrderDetailsResponse,
  SellerOrdersResponse,
  SellerRevenueSummaryResponse,
  UpdateSellerOrderStatusData,
  UpdateSellerOrderStatusResponse,
} from "@/types/order";

// ======================================================
// GET SELLER ORDERS
// ======================================================

export const getSellerOrders = async (
  params: GetSellerOrdersParams = {}
): Promise<SellerOrdersResponse> => {
  const response =
    await api.get<SellerOrdersResponse>(
      "/orders/seller",
      {
        params,
      }
    );

  return response.data;
};

// ======================================================
// GET SELLER ORDER DETAILS
// ======================================================

export const getSellerOrderDetails =
  async (
    orderId: string
  ): Promise<SellerOrderDetailsResponse> => {
    const response =
      await api.get<SellerOrderDetailsResponse>(
        `/orders/seller/${orderId}`
      );

    return response.data;
  };

// ======================================================
// UPDATE SELLER ORDER STATUS
// ======================================================

export const updateSellerOrderStatus =
  async (
    orderId: string,
    data: UpdateSellerOrderStatusData
  ): Promise<UpdateSellerOrderStatusResponse> => {
    const response =
      await api.patch<UpdateSellerOrderStatusResponse>(
        `/orders/seller/${orderId}/status`,
        data
      );

    return response.data;
  };

// ======================================================
// GET SELLER REVENUE SUMMARY
// ======================================================

export const getSellerRevenueSummary =
  async (
    params: GetSellerRevenueSummaryParams = {}
  ): Promise<SellerRevenueSummaryResponse> => {
    const response =
      await api.get<SellerRevenueSummaryResponse>(
        "/orders/seller/revenue-summary",
        {
          params,
        }
      );

    return response.data;
  };