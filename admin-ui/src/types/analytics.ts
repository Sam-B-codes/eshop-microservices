export type AnalyticsRange = "7D" | "30D" | "90D" | "1Y";

export interface AnalyticsOverview {
  revenue: number;
  revenueChange: number;

  platformFees: number;
  platformFeeChange: number;

  sellerEarnings: number;

  orders: number;
  orderChange: number;

  averageOrderValue: number;

  newUsers: number;
  userChange: number;

  newSellers: number;
  sellerChange: number;
}

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

export interface AdminAnalyticsResponse {
  success: boolean;
  message: string;
  range: AnalyticsRange;

  period: {
    startDate: string;
    endDate: string;
  };

  overview: AnalyticsOverview;

  trend: AnalyticsTrendPoint[];

  distributions: {
    products: AnalyticsDistributionItem[];
    orders: AnalyticsDistributionItem[];
    settlements: AnalyticsDistributionItem[];
  };

  topShops: AnalyticsTopShop[];
}
