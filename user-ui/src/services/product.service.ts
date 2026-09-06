import api from "./api";

import {
  PublicCategoriesResponse,
  PublicProductFiltersResponse,
  PublicProductQuery,
  PublicProductsResponse,
    PublicProductResponse,
} from "@/types/product";

/* =========================================
   PUBLIC PRODUCT REQUEST CACHE
========================================= */

interface CachedProducts {
  data: PublicProductsResponse;
  expiresAt: number;
}

const productCache = new Map<
  string,
  CachedProducts
>();

const pendingRequests = new Map<
  string,
  Promise<PublicProductsResponse>
>();

const CACHE_DURATION = 15_000;

/* =========================================
   GET PUBLIC PRODUCTS
========================================= */

export const getPublicProducts = async (
  query: PublicProductQuery = {}
): Promise<PublicProductsResponse> => {
  const params = new URLSearchParams();

  if (query.page !== undefined) {
    params.set(
      "page",
      String(query.page)
    );
  }

  if (query.limit !== undefined) {
    params.set(
      "limit",
      String(query.limit)
    );
  }

  if (query.search?.trim()) {
    params.set(
      "search",
      query.search.trim()
    );
  }

  if (query.category?.trim()) {
    params.set(
      "category",
      query.category.trim()
    );
  }

  if (query.brand?.trim()) {
    params.set(
      "brand",
      query.brand.trim()
    );
  }

  if (query.minPrice !== undefined) {
    params.set(
      "minPrice",
      String(query.minPrice)
    );
  }

  if (query.maxPrice !== undefined) {
    params.set(
      "maxPrice",
      String(query.maxPrice)
    );
  }

  if (query.availability) {
    params.set(
      "availability",
      query.availability
    );
  }

  if (query.sort) {
    params.set(
      "sort",
      query.sort
    );
  }

  const queryString =
    params.toString();

  const url = queryString
    ? `/products/public?${queryString}`
    : "/products/public";

  /* =========================================
     RETURN CACHED RESULT
  ========================================= */

  const cached =
    productCache.get(url);

  if (
    cached &&
    cached.expiresAt > Date.now()
  ) {
    return cached.data;
  }

  /* =========================================
     DEDUPLICATE IN-FLIGHT REQUEST
  ========================================= */

  const pending =
    pendingRequests.get(url);

  if (pending) {
    return pending;
  }

  /* =========================================
     CREATE REQUEST
  ========================================= */

  const request =
    api
      .get<PublicProductsResponse>(
        url
      )
      .then((response) => {
        const data = response.data;

        productCache.set(url, {
          data,
          expiresAt:
            Date.now() +
            CACHE_DURATION,
        });

        return data;
      })
      .finally(() => {
        pendingRequests.delete(url);
      });

  pendingRequests.set(
    url,
    request
  );

  return request;
};

/* =========================================
   GET PUBLIC CATEGORIES
========================================= */

export const getPublicCategories =
  async (): Promise<PublicCategoriesResponse> => {
    const response =
      await api.get<PublicCategoriesResponse>(
        "/products/public/categories"
      );

    return response.data;
  };

/* =========================================
   GET PUBLIC FILTER METADATA
========================================= */

export const getPublicProductFilters =
  async (): Promise<PublicProductFiltersResponse> => {
    const response =
      await api.get<PublicProductFiltersResponse>(
        "/products/public/filters"
      );

    return response.data;
  };

export const getPublicProductBySlug = async (
  slug: string
): Promise<PublicProductResponse> => {
  const cleanSlug = slug.trim();

  const response =
    await api.get<PublicProductResponse>(
      `/products/public/${encodeURIComponent(
        cleanSlug
      )}`
    );

  return response.data;
};