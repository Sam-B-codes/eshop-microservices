// export interface ProductImage {
//   url: string;
//   publicId: string;
//   width?: number;
//   height?: number;
//   format?: string;
//   bytes?: number;
// }

// export interface Product {
//   id: string;
//   sellerId: string;

//   title: string;
//   slug: string;
//   description: string;

//   category: string;
//   brand?: string;

//   price: number;
//   discountPrice?: number;

//   stock: number;
//   sku?: string;

//   images: ProductImage[];

//   tags: string[];

//   status:
//     | "DRAFT"
//     | "PUBLISHED"
//     | "OUT_OF_STOCK"
//     | "ARCHIVED";

//   createdAt: string;
//   updatedAt: string;
// }

// export interface ProductsResponse {
//   success: boolean;
//   products: Product[];

//   total: number;
//   page: number;
//   limit: number;
//   totalPages: number;
// }

export interface ProductImage {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
}

export interface Product {
  id: string;
  sellerId: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  brand?: string;
  price: number;
  discountPrice?: number;
  stock: number;
  sku?: string;
  images: ProductImage[];
  tags: string[];

  status:
    | "DRAFT"
    | "PUBLISHED"
    | "OUT_OF_STOCK"
    | "ARCHIVED";

  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  success: boolean;

  products: Product[];

  total: number;

  page: number;

  limit: number;

  pages: number;
}