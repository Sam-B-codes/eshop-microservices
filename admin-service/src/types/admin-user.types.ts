import { UserStatus } from "@prisma/client";

export interface AdminUserListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: UserStatus;
}

export interface AdminUserSummary {
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
  success: true;
  message: string;
  users: AdminUserSummary[];
  pagination: AdminUserPagination;
}

export interface UpdateUserStatusInput {
  status: UserStatus;
}
