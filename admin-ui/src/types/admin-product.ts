export type ProductStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "OUT_OF_STOCK"
  | "ARCHIVED";

export type ProductStockFilter =
  | "IN_STOCK"
  | "LOW_STOCK"
  | "OUT_OF_STOCK";

export interface AdminProduct {
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
  discountPrice:
    | number
    | null;
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
  success: boolean;
  message: string;
  products: AdminProduct[];
  pagination: AdminProductPagination;
}

export interface GetAdminProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ProductStatus;
  stock?: ProductStockFilter;
}

export interface UpdateAdminProductStatusResponse {
  success: boolean;
  message: string;
  product: {
    id: string;
    status: ProductStatus;
    updatedAt: string;
  };
}