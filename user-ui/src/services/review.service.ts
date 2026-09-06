import api from "./api";

import type {
  DeleteReviewResponse,
  ProductReviewQuery,
  ProductReviewsResponse,
  ReviewEligibilityResponse,
  ReviewInput,
  ReviewMutationResponse,
} from "@/types/review";

// ======================================================
// PUBLIC PRODUCT REVIEWS
// ======================================================

export const getProductReviews =
  async (
    productId: string,
    query:
      ProductReviewQuery = {}
  ) => {
    const params =
      new URLSearchParams();

    if (query.page) {
      params.set(
        "page",
        String(query.page)
      );
    }

    if (query.limit) {
      params.set(
        "limit",
        String(query.limit)
      );
    }

    if (query.rating) {
      params.set(
        "rating",
        String(query.rating)
      );
    }

    const queryString =
      params.toString();

    const response =
      await api.get<ProductReviewsResponse>(
        `/reviews/product/${encodeURIComponent(
          productId
        )}${
          queryString
            ? `?${queryString}`
            : ""
        }`
      );

    return response.data;
  };

// ======================================================
// REVIEW ELIGIBILITY
// ======================================================

export const getReviewEligibility =
  async (
    productId: string
  ) => {
    const response =
      await api.get<ReviewEligibilityResponse>(
        `/reviews/eligibility/${encodeURIComponent(
          productId
        )}`
      );

    return response.data;
  };

// ======================================================
// CREATE REVIEW
// ======================================================

export const createProductReview =
  async (
    productId: string,
    data: ReviewInput
  ) => {
    const response =
      await api.post<ReviewMutationResponse>(
        `/reviews/product/${encodeURIComponent(
          productId
        )}`,
        data
      );

    return response.data;
  };

// ======================================================
// UPDATE REVIEW
// ======================================================

export const updateProductReview =
  async (
    reviewId: string,
    data: ReviewInput
  ) => {
    const response =
      await api.patch<ReviewMutationResponse>(
        `/reviews/${encodeURIComponent(
          reviewId
        )}`,
        data
      );

    return response.data;
  };

// ======================================================
// DELETE REVIEW
// ======================================================

export const deleteProductReview =
  async (
    reviewId: string
  ) => {
    const response =
      await api.delete<DeleteReviewResponse>(
        `/reviews/${encodeURIComponent(
          reviewId
        )}`
      );

    return response.data;
  };