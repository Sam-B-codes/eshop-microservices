import api from "./api";

import {
  AdminPaymentsResponse,
  AdminPaymentSummaryResponse,
  GetAdminPaymentsParams,
  UpdateSettlementStatusData,
} from "@/types/payment";

export const getAdminPaymentSummary =
  async (): Promise<AdminPaymentSummaryResponse> => {
    const response =
      await api.get<AdminPaymentSummaryResponse>(
        "/admin/payments/summary"
      );

    return response.data;
  };

export const getAdminPayments = async (
  params: GetAdminPaymentsParams = {}
): Promise<AdminPaymentsResponse> => {
  const response =
    await api.get<AdminPaymentsResponse>(
      "/admin/payments",
      {
        params: {
          page: params.page ?? 1,
          limit: params.limit ?? 10,
          search:
            params.search?.trim() ||
            undefined,
          status:
            params.status ||
            undefined,
        },
      }
    );

  return response.data;
};

export const updateSettlementStatus =
  async (
    settlementId: string,
    data: UpdateSettlementStatusData
  ) => {
    const response = await api.patch(
      `/admin/payments/${settlementId}/status`,
      data
    );

    return response.data;
  };