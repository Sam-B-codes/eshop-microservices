import api from "./api";

import {
  AdminLoginData,
  AdminLoginResponse,
  AdminLogoutResponse,
  GetAdminResponse,
} from "@/types/admin";

export const loginAdmin = async (
  data: AdminLoginData
): Promise<AdminLoginResponse> => {
  const response =
    await api.post<AdminLoginResponse>(
      "/admin-login",
      data
    );

  return response.data;
};

export const getAdminMe =
  async (): Promise<GetAdminResponse> => {
    const response =
      await api.get<GetAdminResponse>(
        "/admin/me"
      );

    return response.data;
  };

export const logoutAdmin =
  async (): Promise<AdminLogoutResponse> => {
    const response =
      await api.post<AdminLogoutResponse>(
        "/admin-logout"
      );

    return response.data;
  };