import api from "./api";

import {
  SellerPaymentListParams,
  SellerPaymentListResponse,
  SellerPaymentSummaryResponse,
} from "@/types/payment";

// ======================================================
// GET SELLER PAYMENT SUMMARY
// ======================================================

export const getSellerPaymentSummary =
  async (): Promise<SellerPaymentSummaryResponse> => {
    const response =
      await api.get<SellerPaymentSummaryResponse>(
        "/payments/seller/summary"
      );

    return response.data;
  };

// ======================================================
// GET SELLER PAYMENTS
// ======================================================

export const getSellerPayments =
  async (
    params:
      SellerPaymentListParams = {}
  ): Promise<SellerPaymentListResponse> => {
    const response =
      await api.get<SellerPaymentListResponse>(
        "/payments/seller",
        {
          params,
        }
      );

    return response.data;
  };