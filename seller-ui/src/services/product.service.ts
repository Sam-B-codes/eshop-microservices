import api from "./api";

import { ProductImage } from "@/types/product";

/* =========================
   PRODUCT DATA TYPE
========================= */

export interface CreateProductData {
  title: string;
  description: string;
  category: string;
  brand?: string;
  price: number;
  discountPrice?: number;
  stock: number;
  sku?: string;
  images: ProductImage[];
  tags: string[];

  status: "DRAFT" | "PUBLISHED";
}

/* =========================
   CREATE PRODUCT
========================= */

export const createProduct = async (
  data: CreateProductData
) => {
  const response = await api.post(
    "/products",
    data
  );

  console.log(
    "CREATE PRODUCT RESPONSE:",
    response.data
  );

  return response.data;
};

/* =========================
   GET PRODUCTS
   PAGINATED
========================= */

export interface GetProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "DRAFT" | "PUBLISHED";
  category?: string;
}

export const getProducts = async (
  params: GetProductsParams = {}
) => {
  const response = await api.get("/products", {
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      search:
        params.search?.trim() || undefined,
      status: params.status || undefined,
      category:
        params.category || undefined,
    },
  });

  console.log(
    "GET PRODUCTS RESPONSE:",
    response.data
  );

  return response.data;
};

/* =========================
   GET PRODUCT BY ID
========================= */

export const getProductById = async (
  id: string
) => {
  const response = await api.get(
    `/products/${id}`
  );

  console.log(
    "GET PRODUCT BY ID RESPONSE:",
    response.data
  );

  return response.data;
};

/* =========================
   UPDATE PRODUCT
========================= */

export const updateProduct = async (
  id: string,
  data: CreateProductData
) => {
  const response = await api.put(
    `/products/${id}`,
    data
  );

  console.log(
    "UPDATE PRODUCT RESPONSE:",
    response.data
  );

  return response.data;
};

/* =========================
   DELETE PRODUCT
========================= */

export const deleteProduct = async (
  id: string
) => {
  const response = await api.delete(
    `/products/${id}`
  );

  console.log(
    "DELETE PRODUCT RESPONSE:",
    response.data
  );

  return response.data;
};