import api from "./api";

import {
  SellerDashboardResponse,
} from "@/types/dashboard";

import { DashboardProduct } from "@/types/dashboard";

export const getSellerDashboardStats =
  async (): Promise<SellerDashboardResponse> => {
    const response = await api.get(
      "/seller/dashboard/stats"
    );

    return response.data;
  };

export const getRecentSellerProducts =
  async (): Promise<DashboardProduct[]> => {
    const response = await api.get(
      "/products?limit=5&page=1"
    );

    return response.data.products;
  };