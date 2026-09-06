export type SellerStatus =
  | "ACTIVE"
  | "SUSPENDED";

export type SellerOnboardingFilter =
  | "COMPLETE"
  | "INCOMPLETE";

export interface AdminSeller {
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

export interface GetAdminSellersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: SellerStatus;
  onboarding?: SellerOnboardingFilter;
}

export interface AdminSellerListResponse {
  success: boolean;
  message: string;
  sellers: AdminSeller[];
  pagination: AdminSellerPagination;
}

export interface UpdateAdminSellerStatusResponse {
  success: boolean;
  message: string;
  seller: AdminSeller;
}