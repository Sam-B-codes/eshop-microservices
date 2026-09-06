export interface ProductImage {
  url: string;
  publicId: string;
}

export type ProductAvailability = "IN_STOCK" | "OUT_OF_STOCK";

export interface Product {
  id: string;
  sellerId: string;

  title: string;
  slug: string;
  description: string;
  category: string;
  brand?: string | null;

  price: number;
  discountPrice?: number | null;

  /**
   * Authoritative effective selling price returned
   * by Product Service.
   */
  salePrice: number;

  stock: number;
  images: ProductImage[];
  tags: string[];

  status: "PUBLISHED";

  createdAt: string;
  updatedAt: string;

  available: boolean;
  availability: ProductAvailability;

  hasDiscount: boolean;
  discountPercentage: number;
}

export interface ProductPagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface PublicProductsResponse {
  success: boolean;
  products: Product[];
  pagination: ProductPagination;
}

export interface PublicCategoriesResponse {
  success: boolean;
  categories: string[];
}

export type ProductSort = "newest" | "price-low" | "price-high";

export interface PublicProductQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  availability?: ProductAvailability;
  sort?: ProductSort;
}

export interface PublicProductFilters {
  categories: string[];
  brands: string[];

  priceRange: {
    min: number;
    max: number;
  };

  availability: {
    inStock: number;
    outOfStock: number;
  };
}

export interface PublicProductFiltersResponse {
  success: boolean;
  filters: PublicProductFilters;
}

export interface PublicProductResponse {
  success: boolean;
  product: Product;
}
