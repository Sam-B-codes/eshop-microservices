import { SellerStatus } from "@prisma/client";

export interface AdminSellerListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: SellerStatus;
  onboarding?: "COMPLETE" | "INCOMPLETE";
}

export interface AdminSellerSummary {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  country: string;
  shopName: string | null;
  category: string | null;
  status: SellerStatus;
  isOnboarded: boolean;
  bankConnected: boolean;
  productCount: number;
  orderCount: number;
  couponCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminSellerPagination {
  page: number;
  limit: number;
  totalSellers: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface AdminSellerListResponse {
  success: true;
  message: string;
  sellers: AdminSellerSummary[];
  pagination: AdminSellerPagination;
}
