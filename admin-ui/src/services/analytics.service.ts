import api from "./api";

import { AdminAnalyticsResponse, AnalyticsRange } from "@/types/analytics";

export const getAdminAnalytics = async (
  range: AnalyticsRange,
): Promise<AdminAnalyticsResponse> => {
  const response = await api.get<AdminAnalyticsResponse>("/admin/analytics", {
    params: {
      range,
    },
  });

  return response.data;
};
