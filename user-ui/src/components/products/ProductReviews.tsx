"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  MessageSquare,
  Pencil,
  ShieldCheck,
  Star,
  Trash2,
} from "lucide-react";

import { AxiosError } from "axios";

import { useAuthContext } from "@/context/AuthContext";

import {
  createProductReview,
  deleteProductReview,
  getProductReviews,
  getReviewEligibility,
  updateProductReview,
} from "@/services/review.service";

import type {
  ProductReview,
  ReviewEligibilityResponse,
  ReviewSummary,
} from "@/types/review";

// ======================================================
// TYPES
// ======================================================

interface ProductReviewsProps {
  productId: string;
}

interface ApiErrorResponse {
  message?: string;
}

const emptySummary: ReviewSummary = {
  averageRating: 0,
  totalReviews: 0,

  ratingCounts: {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  },
};

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined;

    if (data?.message) {
      return data.message;
    }
  }

  return fallback;
};

// ======================================================
// COMPONENT
// ======================================================

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const { user, loading: authLoading } = useAuthContext();

  const [reviews, setReviews] = useState<ProductReview[]>([]);

  const [summary, setSummary] = useState<ReviewSummary>(emptySummary);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [page, setPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);

  const [ratingFilter, setRatingFilter] = useState(0);

  const [eligibility, setEligibility] =
    useState<ReviewEligibilityResponse | null>(null);

  const [checkingEligibility, setCheckingEligibility] = useState(false);

  const [editing, setEditing] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({
    rating: 0,
    title: "",
    comment: "",
  });

  const [formError, setFormError] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  // ====================================================
  // LOAD PUBLIC REVIEWS
  // ====================================================

  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getProductReviews(productId, {
        page,
        limit: 6,

        rating: ratingFilter || undefined,
      });

      setReviews(response.reviews || []);

      setSummary(response.summary || emptySummary);

      setTotalPages(response.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Failed to load reviews:", error);

      setError("Reviews could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [page, productId, ratingFilter]);

  useEffect(() => {
    void loadReviews();
  }, [loadReviews]);

  // ====================================================
  // CHECK ELIGIBILITY
  // ====================================================

  const loadEligibility = useCallback(async () => {
    if (authLoading || !user) {
      setEligibility(null);
      return;
    }

    try {
      setCheckingEligibility(true);

      const response = await getReviewEligibility(productId);

      setEligibility(response);

      if (response.review) {
        setForm({
          rating: response.review.rating,

          title: response.review.title || "",

          comment: response.review.comment,
        });
      }
    } catch (error) {
      console.error("Failed to check review eligibility:", error);

      setEligibility(null);
    } finally {
      setCheckingEligibility(false);
    }
  }, [authLoading, productId, user]);

  useEffect(() => {
    void loadEligibility();
  }, [loadEligibility]);

  // ====================================================
  // SUBMIT REVIEW
  // ====================================================

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    if (form.rating < 1 || form.rating > 5) {
      setFormError("Select a rating.");

      return;
    }

    const comment = form.comment.trim();

    if (comment.length < 10) {
      setFormError("Review must contain at least 10 characters.");

      return;
    }

    try {
      setSubmitting(true);
      setFormError("");
      setSuccessMessage("");

      const payload = {
        rating: form.rating,

        title: form.title.trim(),

        comment,
      };

      const response = eligibility?.review
        ? await updateProductReview(eligibility.review.id, payload)
        : await createProductReview(productId, payload);

      setSuccessMessage(response.message);

      setEditing(false);

      await Promise.all([loadReviews(), loadEligibility()]);
    } catch (error) {
      setFormError(getErrorMessage(error, "Review could not be saved."));
    } finally {
      setSubmitting(false);
    }
  };

  // ====================================================
  // DELETE REVIEW
  // ====================================================

  const handleDelete = async () => {
    const reviewId = eligibility?.review?.id;

    if (!reviewId) {
      return;
    }

    const confirmed = window.confirm("Delete your review?");

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setFormError("");
      setSuccessMessage("");

      const response = await deleteProductReview(reviewId);

      setForm({
        rating: 0,
        title: "",
        comment: "",
      });

      setEditing(false);

      setSuccessMessage(response.message);

      await Promise.all([loadReviews(), loadEligibility()]);
    } catch (error) {
      setFormError(getErrorMessage(error, "Review could not be deleted."));
    } finally {
      setDeleting(false);
    }
  };

  // ====================================================
  // UI
  // ====================================================

  return (
    <section
      id="reviews"
      className="mt-16 scroll-mt-28 border-t border-black/10 pt-12 lg:mt-20 lg:pt-16"
    >
      <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
        {/* SUMMARY */}

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
            Customer feedback
          </p>

          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl">
            Ratings & reviews
          </h2>

          <div className="mt-6 rounded-[26px] border border-black/[0.06] bg-white p-6 shadow-sm">
            <div className="flex items-end gap-3">
              <span className="text-5xl font-semibold tracking-[-0.06em] text-neutral-950">
                {summary.averageRating.toFixed(1)}
              </span>

              <span className="pb-1 text-sm text-neutral-400">out of 5</span>
            </div>

            <div className="mt-3">
              <Stars rating={Math.round(summary.averageRating)} />
            </div>

            <p className="mt-3 text-sm text-neutral-500">
              Based on {summary.totalReviews}{" "}
              {summary.totalReviews === 1 ? "review" : "reviews"}
            </p>

            <div className="mt-6 space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = summary.ratingCounts[rating as 1 | 2 | 3 | 4 | 5];

                const percentage =
                  summary.totalReviews > 0
                    ? (count / summary.totalReviews) * 100
                    : 0;

                return (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => {
                      setPage(1);

                      setRatingFilter(ratingFilter === rating ? 0 : rating);
                    }}
                    className="flex w-full items-center gap-3 text-xs"
                  >
                    <span className="w-7 text-neutral-500">{rating}★</span>

                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100">
                      <span
                        className="block h-full rounded-full bg-amber-400"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </span>

                    <span className="w-6 text-right text-neutral-400">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* REVIEW CONTENT */}

        <div className="min-w-0">
          {/* CUSTOMER REVIEW FORM */}

          {!authLoading &&
            user &&
            eligibility &&
            (eligibility.eligible || eligibility.alreadyReviewed) && (
              <div className="mb-6 rounded-[26px] border border-black/[0.06] bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-950">
                      {eligibility.alreadyReviewed
                        ? "Your review"
                        : "Write a review"}
                    </h3>

                    <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                      <ShieldCheck className="h-4 w-4" />
                      Verified purchase
                    </p>
                  </div>

                  {eligibility.alreadyReviewed && !editing && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEditing(true)}
                        className="inline-flex h-9 items-center gap-2 rounded-full border border-black/[0.08] px-4 text-xs font-semibold"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => void handleDelete()}
                        disabled={deleting}
                        className="inline-flex h-9 items-center gap-2 rounded-full border border-red-100 bg-red-50 px-4 text-xs font-semibold text-red-600"
                      >
                        {deleting ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                {!eligibility.alreadyReviewed || editing ? (
                  <form onSubmit={handleSubmit} className="mt-6">
                    <p className="text-xs font-semibold text-neutral-700">
                      Your rating
                    </p>

                    <div className="mt-2 flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() =>
                            setForm((current) => ({
                              ...current,
                              rating: star,
                            }))
                          }
                          aria-label={`${star} stars`}
                        >
                          <Star
                            className={`h-7 w-7 ${
                              star <= form.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-neutral-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>

                    <input
                      type="text"
                      value={form.title}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          title: event.target.value,
                        }))
                      }
                      maxLength={100}
                      placeholder="Review title (optional)"
                      className="mt-5 min-h-12 w-full rounded-2xl border border-black/[0.09] px-4 text-sm outline-none focus:border-neutral-400"
                    />

                    <textarea
                      value={form.comment}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          comment: event.target.value,
                        }))
                      }
                      rows={5}
                      maxLength={1000}
                      placeholder="Share your experience..."
                      className="mt-3 w-full resize-y rounded-2xl border border-black/[0.09] px-4 py-3 text-sm leading-6 outline-none focus:border-neutral-400"
                    />

                    {formError && (
                      <p className="mt-3 text-sm font-medium text-red-600">
                        {formError}
                      </p>
                    )}

                    <div className="mt-4 flex gap-2">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex min-h-11 items-center gap-2 rounded-full bg-black px-6 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        {submitting && (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        )}

                        {eligibility.alreadyReviewed
                          ? "Update review"
                          : "Publish review"}
                      </button>

                      {editing && (
                        <button
                          type="button"
                          onClick={() => setEditing(false)}
                          className="rounded-full border border-black/[0.09] px-5 text-sm font-semibold"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                ) : (
                  <div className="mt-5">
                    <Stars rating={eligibility.review?.rating || 0} />

                    {eligibility.review?.title && (
                      <p className="mt-3 font-semibold text-neutral-950">
                        {eligibility.review.title}
                      </p>
                    )}

                    <p className="mt-2 text-sm leading-6 text-neutral-600">
                      {eligibility.review?.comment}
                    </p>
                  </div>
                )}
              </div>
            )}

          {checkingEligibility && (
            <div className="mb-6 flex items-center gap-2 text-sm text-neutral-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking review eligibility...
            </div>
          )}

          {successMessage && (
            <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              {successMessage}
            </div>
          )}

          {/* REVIEWS */}

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-48 animate-pulse rounded-[24px] bg-neutral-200"
                />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-[24px] border border-red-100 bg-white px-6 py-12 text-center text-sm text-red-600">
              {error}
            </div>
          ) : reviews.length === 0 ? (
            <div className="rounded-[24px] border border-black/[0.06] bg-white px-6 py-14 text-center">
              <MessageSquare className="mx-auto h-7 w-7 text-neutral-300" />

              <p className="mt-3 text-sm font-semibold text-neutral-800">
                No reviews yet
              </p>

              <p className="mt-1 text-sm text-neutral-500">
                Be the first verified customer to review this product.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}

          {/* PAGINATION */}

          {!loading && totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between rounded-2xl border border-black/[0.06] bg-white px-4 py-3">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="flex items-center gap-1 text-sm font-semibold disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>

              <span className="text-xs text-neutral-500">
                Page {page} of {totalPages}
              </span>

              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((current) => current + 1)}
                className="flex items-center gap-1 text-sm font-semibold disabled:opacity-30"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ======================================================
// REVIEW CARD
// ======================================================

function ReviewCard({ review }: { review: ProductReview }) {
  return (
    <article className="rounded-[24px] border border-black/[0.06] bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-semibold text-neutral-950">{review.user.name}</p>

          <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            Verified purchase
          </p>
        </div>

        <div className="sm:text-right">
          <Stars rating={review.rating} />

          <p className="mt-1 text-xs text-neutral-400">
            {formatDate(review.createdAt)}
          </p>
        </div>
      </div>

      {review.title && (
        <h3 className="mt-4 text-sm font-semibold text-neutral-950">
          {review.title}
        </h3>
      )}

      <p className="mt-2 text-sm leading-7 text-neutral-600">
        {review.comment}
      </p>

      {review.sellerReply && (
        <div className="mt-5 rounded-[18px] bg-neutral-50 p-4">
          <p className="text-xs font-semibold text-neutral-800">
            Response from seller
          </p>

          <p className="mt-2 text-sm leading-6 text-neutral-600">
            {review.sellerReply}
          </p>
        </div>
      )}
    </article>
  );
}

// ======================================================
// STARS
// ======================================================

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? "fill-amber-400 text-amber-400"
              : "fill-neutral-100 text-neutral-200"
          }`}
        />
      ))}
    </div>
  );
}

// ======================================================
// DATE
// ======================================================

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}
