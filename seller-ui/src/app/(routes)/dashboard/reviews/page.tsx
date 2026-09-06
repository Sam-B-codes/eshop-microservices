"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

import Image from "next/image";

import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  MessageSquare,
  RefreshCw,
  Search,
  Send,
  Star,
  Trash2,
} from "lucide-react";

import {
  AxiosError,
} from "axios";

import {
  toast,
} from "sonner";

import {
  deleteSellerReply,
  getSellerReviews,
  saveSellerReply,
} from "@/services/review.service";

import type {
  SellerReview,
  SellerReviewPagination,
  SellerReviewSummary,
} from "@/types/review";

// ======================================================
// TYPES
// ======================================================

type ReplyFilter =
  | "all"
  | "replied"
  | "awaiting";

interface ApiErrorResponse {
  message?: string;
}

// ======================================================
// INITIAL VALUES
// ======================================================

const emptySummary:
  SellerReviewSummary = {
    averageRating: 0,
    totalReviews: 0,
    repliedReviews: 0,
    awaitingReply: 0,
  };

const emptyPagination:
  SellerReviewPagination = {
    page: 1,
    limit: 10,
    totalReviews: 0,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  };

// ======================================================
// ERROR MESSAGE
// ======================================================

const getErrorMessage = (
  error: unknown,
  fallback: string
): string => {
  if (
    error instanceof AxiosError
  ) {
    const data =
      error.response
        ?.data as
        | ApiErrorResponse
        | undefined;

    if (data?.message) {
      return data.message;
    }
  }

  if (
    error instanceof Error
  ) {
    return error.message;
  }

  return fallback;
};

// ======================================================
// PAGE
// ======================================================

export default function SellerReviewsPage() {
  const [
    reviews,
    setReviews,
  ] =
    useState<SellerReview[]>(
      []
    );

  const [
    summary,
    setSummary,
  ] =
    useState<SellerReviewSummary>(
      emptySummary
    );

  const [
    pagination,
    setPagination,
  ] =
    useState<SellerReviewPagination>(
      emptyPagination
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    searchInput,
    setSearchInput,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    rating,
    setRating,
  ] = useState(0);

  const [
    replyFilter,
    setReplyFilter,
  ] =
    useState<ReplyFilter>(
      "all"
    );

  const [
    page,
    setPage,
  ] = useState(1);

  const [
    editingReviewId,
    setEditingReviewId,
  ] =
    useState<string | null>(
      null
    );

  const [
    replyText,
    setReplyText,
  ] = useState("");

  const [
    savingReplyId,
    setSavingReplyId,
  ] =
    useState<string | null>(
      null
    );

  const [
    deletingReplyId,
    setDeletingReplyId,
  ] =
    useState<string | null>(
      null
    );

  // ====================================================
  // LOAD REVIEWS
  // ====================================================

  const loadReviews =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getSellerReviews({
            page,
            limit: 10,

            search:
              search ||
              undefined,

            rating:
              rating ||
              undefined,

            replied:
              replyFilter ===
              "replied"
                ? true
                : replyFilter ===
                    "awaiting"
                  ? false
                  : undefined,
          });

        setReviews(
          response.reviews || []
        );

        setSummary(
          response.summary ||
            emptySummary
        );

        setPagination(
          response.pagination ||
            emptyPagination
        );
      } catch (error) {
        console.error(
          "Failed to load seller reviews:",
          error
        );

        setReviews([]);

        setError(
          getErrorMessage(
            error,
            "Reviews could not be loaded."
          )
        );
      } finally {
        setLoading(false);
      }
    }, [
      page,
      rating,
      replyFilter,
      search,
    ]);

  useEffect(() => {
    void loadReviews();
  }, [loadReviews]);

  // ====================================================
  // SEARCH
  // ====================================================

  const handleSearch = (
    event:
      FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setPage(1);

    setSearch(
      searchInput.trim()
    );
  };

  // ====================================================
  // START REPLY
  // ====================================================

  const startReply = (
    review: SellerReview
  ) => {
    setEditingReviewId(
      review.id
    );

    setReplyText(
      review.sellerReply ||
        ""
    );
  };

  const cancelReply = () => {
    setEditingReviewId(
      null
    );

    setReplyText("");
  };

  // ====================================================
  // SAVE REPLY
  // ====================================================

  const handleSaveReply =
    async (
      reviewId: string
    ) => {
      const reply =
        replyText.trim();

      if (
        reply.length < 2
      ) {
        toast.error(
          "Reply is too short."
        );

        return;
      }

      try {
        setSavingReplyId(
          reviewId
        );

        const response =
          await saveSellerReply(
            reviewId,
            {
              reply,
            }
          );

        setReviews(
          (current) =>
            current.map(
              (review) =>
                review.id ===
                reviewId
                  ? response.review
                  : review
            )
        );

        setEditingReviewId(
          null
        );

        setReplyText("");

        toast.success(
          response.message ||
            "Reply saved."
        );

        await loadReviews();
      } catch (error) {
        toast.error(
          getErrorMessage(
            error,
            "Reply could not be saved."
          )
        );
      } finally {
        setSavingReplyId(
          null
        );
      }
    };

  // ====================================================
  // DELETE REPLY
  // ====================================================

  const handleDeleteReply =
    async (
      reviewId: string
    ) => {
      const confirmed =
        window.confirm(
          "Remove your reply from this review?"
        );

      if (!confirmed) {
        return;
      }

      try {
        setDeletingReplyId(
          reviewId
        );

        const response =
          await deleteSellerReply(
            reviewId
          );

        setReviews(
          (current) =>
            current.map(
              (review) =>
                review.id ===
                reviewId
                  ? response.review
                  : review
            )
        );

        toast.success(
          response.message ||
            "Reply removed."
        );

        await loadReviews();
      } catch (error) {
        toast.error(
          getErrorMessage(
            error,
            "Reply could not be removed."
          )
        );
      } finally {
        setDeletingReplyId(
          null
        );
      }
    };

  // ====================================================
  // FILTERS
  // ====================================================

  const handleRatingChange = (
    value: string
  ) => {
    setRating(
      Number(value)
    );

    setPage(1);
  };

  const handleReplyFilterChange =
    (
      value: ReplyFilter
    ) => {
      setReplyFilter(value);

      setPage(1);
    };

  // ====================================================
  // PAGE
  // ====================================================

  return (
    <div className="mx-auto w-full max-w-[1490px]">
      {/* HEADER */}

      <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
            Customer feedback
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.045em] text-neutral-950 sm:text-4xl">
            Product reviews
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-500">
            Read customer feedback
            and respond to reviews
            across your products.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            void loadReviews()
          }
          disabled={loading}
          className="inline-flex min-h-11 w-fit items-center gap-2 rounded-full border border-black/[0.08] bg-white px-5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              loading
                ? "animate-spin"
                : ""
            }`}
          />

          Refresh
        </button>
      </section>

      {/* STATISTICS */}

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Average rating"
          value={
            summary.averageRating.toFixed(
              1
            )
          }
          description="Across all product reviews"
          accent="amber"
        />

        <SummaryCard
          label="Total reviews"
          value={String(
            summary.totalReviews
          )}
          description="Customer reviews received"
          accent="blue"
        />

        <SummaryCard
          label="Replied"
          value={String(
            summary.repliedReviews
          )}
          description="Reviews you responded to"
          accent="green"
        />

        <SummaryCard
          label="Awaiting reply"
          value={String(
            summary.awaitingReply
          )}
          description="Reviews needing attention"
          accent="orange"
        />
      </section>

      {/* SEARCH AND FILTERS */}

      <section className="mt-6 rounded-[24px] border border-black/[0.06] bg-white p-4 shadow-[0_10px_35px_rgba(15,23,42,0.025)]">
        <div className="flex flex-col gap-3 lg:flex-row">
          <form
            onSubmit={
              handleSearch
            }
            className="flex min-w-0 flex-1 gap-2"
          >
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />

              <input
                type="search"
                value={
                  searchInput
                }
                onChange={(
                  event
                ) =>
                  setSearchInput(
                    event.target
                      .value
                  )
                }
                placeholder="Search product, customer or review..."
                className="h-11 w-full rounded-[15px] border border-black/[0.08] bg-neutral-50 pl-11 pr-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              className="rounded-[15px] bg-[#0b1220] px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Search
            </button>
          </form>

          <select
            value={rating}
            onChange={(event) =>
              handleRatingChange(
                event.target
                  .value
              )
            }
            className="h-11 rounded-[15px] border border-black/[0.08] bg-white px-4 text-sm font-medium text-neutral-700 outline-none"
          >
            <option value={0}>
              All ratings
            </option>

            <option value={5}>
              5 stars
            </option>

            <option value={4}>
              4 stars
            </option>

            <option value={3}>
              3 stars
            </option>

            <option value={2}>
              2 stars
            </option>

            <option value={1}>
              1 star
            </option>
          </select>

          <select
            value={
              replyFilter
            }
            onChange={(event) =>
              handleReplyFilterChange(
                event.target
                  .value as
                  ReplyFilter
              )
            }
            className="h-11 rounded-[15px] border border-black/[0.08] bg-white px-4 text-sm font-medium text-neutral-700 outline-none"
          >
            <option value="all">
              All reviews
            </option>

            <option value="replied">
              Replied
            </option>

            <option value="awaiting">
              Awaiting reply
            </option>
          </select>
        </div>
      </section>

      {/* CONTENT */}

      <section className="mt-6">
        {loading ? (
          <ReviewsSkeleton />
        ) : error ? (
          <ErrorState
            message={error}
            retry={() =>
              void loadReviews()
            }
          />
        ) : reviews.length ===
          0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-4">
            {reviews.map(
              (review) => (
                <ReviewCard
                  key={
                    review.id
                  }
                  review={
                    review
                  }
                  editing={
                    editingReviewId ===
                    review.id
                  }
                  replyText={
                    replyText
                  }
                  saving={
                    savingReplyId ===
                    review.id
                  }
                  deleting={
                    deletingReplyId ===
                    review.id
                  }
                  onStart={() =>
                    startReply(
                      review
                    )
                  }
                  onCancel={
                    cancelReply
                  }
                  onReplyChange={
                    setReplyText
                  }
                  onSave={() =>
                    void handleSaveReply(
                      review.id
                    )
                  }
                  onDelete={() =>
                    void handleDeleteReply(
                      review.id
                    )
                  }
                />
              )
            )}
          </div>
        )}
      </section>

      {/* PAGINATION */}

      {!loading &&
        !error &&
        reviews.length > 0 && (
          <section className="mt-6 flex flex-col gap-3 rounded-[20px] border border-black/[0.06] bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-neutral-500">
              Page{" "}
              <span className="font-semibold text-neutral-900">
                {
                  pagination.page
                }
              </span>{" "}
              of{" "}
              <span className="font-semibold text-neutral-900">
                {
                  pagination.totalPages
                }
              </span>
            </p>

            <div className="flex gap-2">
              <PaginationButton
                label="Previous"
                icon={
                  <ChevronLeft className="h-4 w-4" />
                }
                disabled={
                  !pagination.hasPreviousPage
                }
                onClick={() =>
                  setPage(
                    (current) =>
                      Math.max(
                        1,
                        current - 1
                      )
                  )
                }
              />

              <PaginationButton
                label="Next"
                icon={
                  <ChevronRight className="h-4 w-4" />
                }
                iconAfter
                disabled={
                  !pagination.hasNextPage
                }
                onClick={() =>
                  setPage(
                    (current) =>
                      current + 1
                  )
                }
              />
            </div>
          </section>
        )}
    </div>
  );
}

// ======================================================
// REVIEW CARD
// ======================================================

function ReviewCard({
  review,
  editing,
  replyText,
  saving,
  deleting,
  onStart,
  onCancel,
  onReplyChange,
  onSave,
  onDelete,
}: {
  review: SellerReview;
  editing: boolean;
  replyText: string;
  saving: boolean;
  deleting: boolean;
  onStart: () => void;
  onCancel: () => void;
  onReplyChange: (
    value: string
  ) => void;
  onSave: () => void;
  onDelete: () => void;
}) {
  const image =
    getProductImage(
      review
    );

  return (
    <article className="overflow-hidden rounded-[26px] border border-black/[0.06] bg-white shadow-[0_12px_40px_rgba(15,23,42,0.03)]">
      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        {/* PRODUCT */}

        <div className="flex gap-4 lg:block">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[16px] bg-neutral-100 lg:h-36 lg:w-full">
            {image ? (
              <Image
                src={image}
                alt={
                  review.product
                    .title
                }
                fill
                sizes="220px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-neutral-400">
                No image
              </div>
            )}
          </div>

          <div className="min-w-0 lg:mt-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
              Product
            </p>

            <h2 className="mt-1 line-clamp-2 text-sm font-semibold text-neutral-950">
              {
                review.product
                  .title
              }
            </h2>
          </div>
        </div>

        {/* REVIEW */}

        <div className="min-w-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <StarRating
                  rating={
                    review.rating
                  }
                />

                <span className="text-xs font-semibold text-neutral-600">
                  {
                    review.rating
                  }
                  /5
                </span>
              </div>

              <p className="mt-3 text-sm font-semibold text-neutral-950">
                {review.title ||
                  "Customer review"}
              </p>

              <p className="mt-1 text-xs text-neutral-400">
                By{" "}
                <span className="font-medium text-neutral-600">
                  {
                    review.user
                      .name
                  }
                </span>{" "}
                ·{" "}
                {formatDate(
                  review.createdAt
                )}
              </p>
            </div>

            <span className="w-fit rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-emerald-700">
              Verified purchase
            </span>
          </div>

          <p className="mt-5 text-sm leading-7 text-neutral-600">
            {review.comment}
          </p>

          {/* EXISTING REPLY */}

          {review.sellerReply &&
            !editing && (
              <div className="mt-5 rounded-[18px] border border-blue-100 bg-blue-50/60 p-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-blue-600" />

                  <p className="text-xs font-semibold text-blue-900">
                    Your response
                  </p>
                </div>

                <p className="mt-2 text-sm leading-6 text-blue-900/70">
                  {
                    review.sellerReply
                  }
                </p>

                {review.sellerRepliedAt && (
                  <p className="mt-2 text-[11px] text-blue-700/50">
                    {
                      formatDate(
                        review.sellerRepliedAt
                      )
                    }
                  </p>
                )}
              </div>
            )}

          {/* EDITOR */}

          {editing && (
            <div className="mt-5 rounded-[18px] border border-black/[0.07] bg-neutral-50 p-4">
              <label className="text-xs font-semibold text-neutral-700">
                Your response
              </label>

              <textarea
                value={
                  replyText
                }
                onChange={(
                  event
                ) =>
                  onReplyChange(
                    event.target
                      .value
                  )
                }
                rows={4}
                maxLength={1000}
                placeholder="Write a helpful response..."
                className="mt-2 w-full resize-y rounded-[14px] border border-black/[0.08] bg-white px-4 py-3 text-sm leading-6 outline-none focus:border-neutral-400"
              />

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={
                    onSave
                  }
                  disabled={
                    saving
                  }
                  className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#0b1220] px-5 text-xs font-semibold text-white disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}

                  Save reply
                </button>

                <button
                  type="button"
                  onClick={
                    onCancel
                  }
                  disabled={
                    saving
                  }
                  className="min-h-10 rounded-full border border-black/[0.08] bg-white px-5 text-xs font-semibold text-neutral-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* ACTIONS */}

          {!editing && (
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={
                  onStart
                }
                className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#0b1220] px-5 text-xs font-semibold text-white transition hover:bg-slate-800"
              >
                <MessageSquare className="h-4 w-4" />

                {review.sellerReply
                  ? "Edit reply"
                  : "Reply"}
              </button>

              {review.sellerReply && (
                <button
                  type="button"
                  onClick={
                    onDelete
                  }
                  disabled={
                    deleting
                  }
                  className="inline-flex min-h-10 items-center gap-2 rounded-full border border-red-100 bg-red-50 px-5 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                >
                  {deleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}

                  Remove reply
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

// ======================================================
// SUMMARY CARD
// ======================================================

function SummaryCard({
  label,
  value,
  description,
  accent,
}: {
  label: string;
  value: string;
  description: string;
  accent:
    | "amber"
    | "blue"
    | "green"
    | "orange";
}) {
  const styles = {
    amber:
      "bg-amber-50 text-amber-600",
    blue:
      "bg-blue-50 text-blue-600",
    green:
      "bg-emerald-50 text-emerald-600",
    orange:
      "bg-orange-50 text-orange-600",
  };

  return (
    <article className="rounded-[24px] border border-black/[0.06] bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.03)]">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-[14px] ${styles[accent]}`}
      >
        <Star className="h-5 w-5" />
      </div>

      <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
        {label}
      </p>

      <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-neutral-950">
        {value}
      </p>

      <p className="mt-2 text-xs text-neutral-500">
        {description}
      </p>
    </article>
  );
}

// ======================================================
// STAR RATING
// ======================================================

function StarRating({
  rating,
}: {
  rating: number;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(
        (star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-amber-400 text-amber-400"
                : "fill-neutral-100 text-neutral-200"
            }`}
          />
        )
      )}
    </div>
  );
}

// ======================================================
// STATES
// ======================================================

function EmptyState() {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center rounded-[28px] border border-black/[0.06] bg-white px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-amber-50 text-amber-500">
        <Star className="h-6 w-6" />
      </div>

      <h2 className="mt-5 text-lg font-semibold text-neutral-950">
        No reviews found
      </h2>

      <p className="mt-2 max-w-sm text-sm leading-6 text-neutral-500">
        Customer reviews for your
        delivered products will
        appear here.
      </p>
    </div>
  );
}

function ErrorState({
  message,
  retry,
}: {
  message: string;
  retry: () => void;
}) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[28px] border border-red-100 bg-white px-6 text-center">
      <p className="text-sm font-semibold text-red-600">
        {message}
      </p>

      <button
        type="button"
        onClick={retry}
        className="mt-5 rounded-full bg-[#0b1220] px-5 py-2.5 text-xs font-semibold text-white"
      >
        Try again
      </button>
    </div>
  );
}

function ReviewsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map(
        (item) => (
          <div
            key={item}
            className="h-[280px] animate-pulse rounded-[26px] border border-black/[0.05] bg-white"
          />
        )
      )}
    </div>
  );
}

// ======================================================
// PAGINATION
// ======================================================

function PaginationButton({
  label,
  icon,
  iconAfter = false,
  disabled,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  iconAfter?: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex min-h-10 items-center gap-2 rounded-full border border-black/[0.08] bg-white px-4 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {!iconAfter && icon}

      {label}

      {iconAfter && icon}
    </button>
  );
}

// ======================================================
// FORMATTERS
// ======================================================

function formatDate(
  value: string
): string {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(date);
}

function getProductImage(
  review: SellerReview
): string | null {
  const images =
    review.product.images;

  if (
    !Array.isArray(images) ||
    images.length === 0
  ) {
    return null;
  }

  const firstImage =
    images[0];

  if (
    typeof firstImage ===
    "string"
  ) {
    return firstImage;
  }

  if (
    firstImage &&
    typeof firstImage ===
      "object" &&
    "url" in firstImage &&
    typeof firstImage.url ===
      "string"
  ) {
    return firstImage.url;
  }

  return null;
}