export type AnalyticsRange = "7D" | "30D" | "90D" | "1Y";

export interface AnalyticsTrendPoint {
  date: string;
  label: string;
  revenue: number;
  platformFees: number;
  orders: number;
  users: number;
  sellers: number;
}

export interface AnalyticsDistributionItem {
  label: string;
  value: number;
}

export interface AnalyticsTopShop {
  sellerId: string;
  sellerName: string;
  shopName: string | null;
  orderCount: number;
  grossAmount: number;
  platformFees: number;
  sellerEarnings: number;
}
