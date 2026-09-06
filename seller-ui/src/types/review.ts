// ======================================================
// REVIEW USER
// ======================================================

export interface ReviewUser {
  id: string;
  name: string;
}

// ======================================================
// REVIEW PRODUCT IMAGE
// ======================================================

export interface ReviewProductImage {
  url: string;
  publicId?: string;
}

// ======================================================
// REVIEW PRODUCT
// ======================================================

export interface ReviewProduct {
  id: string;
  title: string;
  slug: string;

  images:
    | ReviewProductImage[]
    | string[]
    | null;
}

// ======================================================
// SELLER REVIEW
// ======================================================

export interface SellerReview {
  id: string;

  userId: string;
  productId: string;
  sellerId: string;
  orderId: string;

  rating: number;
  title: string | null;
  comment: string;

  sellerReply:
    | string
    | null;

  sellerRepliedAt:
    | string
    | null;

  status:
    | "PUBLISHED"
    | "HIDDEN";

  createdAt: string;
  updatedAt: string;

  user: ReviewUser;
  product: ReviewProduct;
}

// ======================================================
// REVIEW SUMMARY
// ======================================================

export interface SellerReviewSummary {
  averageRating: number;
  totalReviews: number;
  repliedReviews: number;
  awaitingReply: number;
}

// ======================================================
// REVIEW PAGINATION
// ======================================================

export interface SellerReviewPagination {
  page: number;
  limit: number;
  totalReviews: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// ======================================================
// SELLER REVIEW LIST RESPONSE
// ======================================================

export interface SellerReviewsResponse {
  success: boolean;

  summary:
    SellerReviewSummary;

  reviews:
    SellerReview[];

  pagination:
    SellerReviewPagination;
}

// ======================================================
// REVIEW QUERY
// ======================================================

export interface SellerReviewQuery {
  page?: number;
  limit?: number;
  search?: string;
  rating?: number;

  replied?:
    | boolean
    | undefined;
}

// ======================================================
// SELLER REPLY
// ======================================================

export interface SellerReplyData {
  reply: string;
}

export interface SellerReplyResponse {
  success: boolean;
  message: string;
  review: SellerReview;
}

export interface DeleteSellerReplyResponse {
  success: boolean;
  message: string;
  review: SellerReview;
}