export type UserStatus =
  | "ACTIVE"
  | "SUSPENDED";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  orderCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserPagination {
  page: number;
  limit: number;
  totalUsers: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface AdminUserListResponse {
  success: boolean;
  message: string;
  users: AdminUser[];
  pagination: AdminUserPagination;
}

export interface GetAdminUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: UserStatus;
}

export interface UpdateAdminUserStatusResponse {
  success: boolean;
  message: string;
  user: AdminUser;
}