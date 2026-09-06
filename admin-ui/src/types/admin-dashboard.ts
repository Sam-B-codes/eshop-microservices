export interface AdminDashboardSummary {
  users: {
    total: number;
  };

  sellers: {
    total: number;
    onboarded: number;
    awaitingOnboarding: number;
    bankConnected: number;
  };

  products: {
    total: number;
    published: number;
    draft: number;
    outOfStock: number;
    lowStock: number;
  };

  orders: {
    total: number;
    pendingPayment: number;
    confirmed: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };

  revenue: {
    grossOrderRevenue: number;
    marketplaceGrossAmount: number;
    totalDiscounts: number;
    platformFees: number;
    sellerEarnings: number;
  };

  settlements: {
    total: number;
    pending: number;
    processing: number;
    settled: number;
    failed: number;
  };
}

export interface RecentAdminOrder {
  id: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  customerName: string;
  customerEmail: string;
  itemCount: number;
  sellerCount: number;
  createdAt: string;
}

export interface AdminDashboardResponse {
  success: boolean;
  message: string;
  summary: AdminDashboardSummary;
  recentOrders: RecentAdminOrder[];
}