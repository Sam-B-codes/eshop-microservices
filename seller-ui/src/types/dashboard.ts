export interface SellerDashboardStats {
  totalProducts: number;
  publishedProducts: number;
  draftProducts: number;
  outOfStockProducts: number;
  lowStockProducts: number;
}

export interface DashboardProduct {
  id: string;
  title: string;
  price: number;
  discountPrice?: number | null;
  stock: number;
  status: "DRAFT" | "PUBLISHED";
  category: string;
  createdAt: string;
  images: {
    url: string;
    publicId: string;
    width?: number;
    height?: number;
    format?: string;
    bytes?: number;
  }[];
}

export interface SellerDashboardResponse {
  success: boolean;
  stats: SellerDashboardStats;
}