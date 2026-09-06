export interface ReviewUser {
  id: string;
  name: string;
}

export interface ProductReview {
  id: string;
  rating: number;
  title: string | null;
  comment: string;

  sellerReply:
    | string
    | null;

  sellerRepliedAt:
    | string
    | null;

  createdAt: string;
  updatedAt: string;

  user: ReviewUser;
}

export interface ReviewRatingCounts {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;

  ratingCounts:
    ReviewRatingCounts;
}

export interface ReviewPagination {
  page: number;
  limit: number;
  totalReviews: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface ProductReviewsResponse {
  success: boolean;
  summary: ReviewSummary;
  reviews: ProductReview[];
  pagination: ReviewPagination;
}

export interface ReviewEligibilityResponse {
  success: boolean;
  eligible: boolean;
  alreadyReviewed: boolean;

  review: {
    id: string;
    rating: number;
    title: string | null;
    comment: string;
    createdAt: string;
    updatedAt: string;
  } | null;

  orderId:
    | string
    | null;
}

export interface ReviewInput {
  rating: number;
  title?: string;
  comment: string;
}

export interface ReviewMutationResponse {
  success: boolean;
  message: string;
  review: ProductReview;
}

export interface DeleteReviewResponse {
  success: boolean;
  message: string;
}

export interface ProductReviewQuery {
  page?: number;
  limit?: number;
  rating?: number;
}