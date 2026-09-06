import api from "./api";

import {
  AdminDashboardResponse,
} from "@/types/admin-dashboard";

export const getAdminDashboard =
  async (): Promise<AdminDashboardResponse> => {
    const response =
      await api.get<AdminDashboardResponse>(
        "/admin/dashboard"
      );

    return response.data;
  };