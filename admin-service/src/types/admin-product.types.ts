import { ProductStatus } from "@prisma/client";

export type StockFilter = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

export interface AdminProductListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ProductStatus;
  stock?: StockFilter;
}

export interface AdminProductSummary {
  id: string;
  sellerId: string;
  sellerName: string;
  shopName: string | null;
  title: string;
  slug: string;
  category: string;
  brand: string | null;
  sku: string | null;
  price: number;
  discountPrice: number | null;
  salePrice: number;
  stock: number;
  status: ProductStatus;
  image: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminProductPagination {
  page: number;
  limit: number;
  totalProducts: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface AdminProductListResponse {
  success: true;
  message: string;
  products: AdminProductSummary[];
  pagination: AdminProductPagination;
}
