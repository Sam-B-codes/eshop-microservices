import api from "./api";

import type {
  DeleteSellerReplyResponse,
  SellerReplyData,
  SellerReplyResponse,
  SellerReviewQuery,
  SellerReviewsResponse,
} from "@/types/review";

// ======================================================
// GET SELLER REVIEWS
// ======================================================

export const getSellerReviews =
  async (
    query:
      SellerReviewQuery = {}
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

    if (
      query.search?.trim()
    ) {
      params.set(
        "search",
        query.search.trim()
      );
    }

    if (query.rating) {
      params.set(
        "rating",
        String(query.rating)
      );
    }

    if (
      query.replied !==
      undefined
    ) {
      params.set(
        "replied",
        String(query.replied)
      );
    }

    const queryString =
      params.toString();

    const response =
      await api.get<SellerReviewsResponse>(
        `/reviews/seller/list${
          queryString
            ? `?${queryString}`
            : ""
        }`
      );

    return response.data;
  };

// ======================================================
// CREATE OR UPDATE SELLER REPLY
// ======================================================

export const saveSellerReply =
  async (
    reviewId: string,
    data: SellerReplyData
  ) => {
    const response =
      await api.patch<SellerReplyResponse>(
        `/reviews/seller/${encodeURIComponent(
          reviewId
        )}/reply`,
        data
      );

    return response.data;
  };

// ======================================================
// DELETE SELLER REPLY
// ======================================================

export const deleteSellerReply =
  async (
    reviewId: string
  ) => {
    const response =
      await api.delete<DeleteSellerReplyResponse>(
        `/reviews/seller/${encodeURIComponent(
          reviewId
        )}/reply`
      );

    return response.data;
  };