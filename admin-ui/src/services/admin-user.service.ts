import api from "./api";

import {
  AdminUserListResponse,
  GetAdminUsersParams,
  UpdateAdminUserStatusResponse,
  UserStatus,
} from "@/types/admin-user";

export const getAdminUsers =
  async (
    params: GetAdminUsersParams = {}
  ): Promise<AdminUserListResponse> => {
    const response =
      await api.get<AdminUserListResponse>(
        "/admin/users",
        {
          params,
        }
      );

    return response.data;
  };

export const updateAdminUserStatus =
  async (
    userId: string,
    status: UserStatus
  ): Promise<UpdateAdminUserStatusResponse> => {
    const response =
      await api.patch<UpdateAdminUserStatusResponse>(
        `/admin/users/${encodeURIComponent(
          userId
        )}/status`,
        {
          status,
        }
      );

    return response.data;
  };