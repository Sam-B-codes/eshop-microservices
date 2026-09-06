"use client";

import axios from "axios";

import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BadgeIndianRupee,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  Store,
  WalletCards,
  X,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getAdminPayments,
  getAdminPaymentSummary,
  updateSettlementStatus,
} from "@/services/payment.service";

import {
  AdminPayment,
  AdminPaymentPagination,
  AdminPaymentSummary,
  SettlementStatus,
} from "@/types/payment";

const PAGE_LIMIT = 10;

const STATUS_OPTIONS: Array<{
  label: string;
  value: "" | SettlementStatus;
}> = [
  {
    label: "All settlements",
    value: "",
  },
  {
    label: "Pending",
    value: "PENDING",
  },
  {
    label: "Processing",
    value: "PROCESSING",
  },
  {
    label: "Settled",
    value: "SETTLED",
  },
  {
    label: "Failed",
    value: "FAILED",
  },
];

const EMPTY_SUMMARY: AdminPaymentSummary = {
  totalTransactions: 0,
  pendingTransactions: 0,
  processingTransactions: 0,
  settledTransactions: 0,
  failedTransactions: 0,
  grossAmount: 0,
  totalDiscounts: 0,
  netAmount: 0,
  platformFees: 0,
  sellerEarnings: 0,
  pendingEarnings: 0,
  settledEarnings: 0,
};

const EMPTY_PAGINATION: AdminPaymentPagination = {
  page: 1,
  limit: PAGE_LIMIT,
  total: 0,
  pages: 0,
};

export default function AdminPaymentsPage() {
  const [payments, setPayments] =
    useState<AdminPayment[]>([]);

  const [summary, setSummary] =
    useState<AdminPaymentSummary>(
      EMPTY_SUMMARY
    );

  const [pagination, setPagination] =
    useState<AdminPaymentPagination>(
      EMPTY_PAGINATION
    );

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] =
    useState("");
  const [search, setSearch] = useState("");

  const [status, setStatus] =
    useState<"" | SettlementStatus>("");

  const [statusMenuOpen, setStatusMenuOpen] =
    useState(false);

  const [loading, setLoading] =
    useState(true);
  const [summaryLoading, setSummaryLoading] =
    useState(true);
  const [updatingId, setUpdatingId] =
    useState<string | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] =
    useState("");

  const [
    failurePayment,
    setFailurePayment,
  ] = useState<AdminPayment | null>(null);

  const [
    failureReason,
    setFailureReason,
  ] = useState("");

  const loadSummary =
    useCallback(async () => {
      try {
        setSummaryLoading(true);

        const response =
          await getAdminPaymentSummary();

        setSummary(response.summary);
      } catch (requestError) {
        console.error(
          "Failed to load payment summary:",
          requestError
        );
      } finally {
        setSummaryLoading(false);
      }
    }, []);

  const loadPayments =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getAdminPayments({
            page,
            limit: PAGE_LIMIT,
            search: search || undefined,
            status: status || undefined,
          });

        setPayments(response.payments);
        setPagination(response.pagination);
      } catch (requestError) {
        console.error(
          "Failed to load settlements:",
          requestError
        );

        setError(
          getErrorMessage(
            requestError,
            "Unable to load settlement records."
          )
        );
      } finally {
        setLoading(false);
      }
    }, [page, search, status]);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    void loadPayments();
  }, [loadPayments]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 400);

    return () =>
      window.clearTimeout(timeout);
  }, [searchInput]);

  const handleStatusChange = async (
    payment: AdminPayment,
    nextStatus: SettlementStatus,
    reason?: string
  ) => {
    try {
      setUpdatingId(payment.id);
      setError("");
      setSuccess("");

      await updateSettlementStatus(
        payment.id,
        {
          status: nextStatus,
          failureReason: reason,
        }
      );

      setSuccess(
        `Settlement moved to ${formatStatus(
          nextStatus
        )}.`
      );

      setFailurePayment(null);
      setFailureReason("");

      await Promise.all([
        loadPayments(),
        loadSummary(),
      ]);
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Unable to update settlement status."
        )
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const submitFailure = async () => {
    if (
      !failurePayment ||
      !failureReason.trim()
    ) {
      setError(
        "Please provide a failure reason."
      );

      return;
    }

    await handleStatusChange(
      failurePayment,
      "FAILED",
      failureReason.trim()
    );
  };

  const selectedStatusLabel =
    STATUS_OPTIONS.find(
      (option) => option.value === status
    )?.label || "All settlements";

  return (
    <>
      <div className="space-y-7">
        <section className="overflow-hidden rounded-[30px] border border-black/[0.06] bg-white shadow-[0_18px_60px_rgba(15,23,42,0.05)]">
          <div className="flex flex-col gap-5 px-6 py-7 sm:px-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
                Financial operations
              </p>

              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-[36px]">
                Payments & settlements
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
                Monitor verified transactions,
                platform revenue and seller
                settlement lifecycles.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                void Promise.all([
                  loadPayments(),
                  loadSummary(),
                ]);
              }}
              disabled={
                loading || summaryLoading
              }
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-black/[0.09] bg-white px-5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  loading ||
                  summaryLoading
                    ? "animate-spin"
                    : ""
                }`}
              />

              Refresh data
            </button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Gross transaction value"
            value={formatINR(
              summary.grossAmount
            )}
            detail={`${summary.totalTransactions} verified transactions`}
            icon={<BadgeIndianRupee />}
            loading={summaryLoading}
          />

          <SummaryCard
            label="Platform revenue"
            value={formatINR(
              summary.platformFees
            )}
            detail="Fees earned by the marketplace"
            icon={<ShieldCheck />}
            loading={summaryLoading}
          />

          <SummaryCard
            label="Pending seller earnings"
            value={formatINR(
              summary.pendingEarnings
            )}
            detail={`${summary.pendingTransactions} settlements waiting`}
            icon={<Clock3 />}
            loading={summaryLoading}
          />

          <SummaryCard
            label="Settled earnings"
            value={formatINR(
              summary.settledEarnings
            )}
            detail={`${summary.settledTransactions} completed settlements`}
            icon={<CheckCircle2 />}
            loading={summaryLoading}
          />
        </section>

        {(error || success) && (
          <div
            className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
              error
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {error ? (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            )}

            <span>{error || success}</span>
          </div>
        )}

        <section className="overflow-visible rounded-[30px] border border-black/[0.06] bg-white shadow-[0_18px_60px_rgba(15,23,42,0.05)]">
          <div className="flex flex-col gap-4 border-b border-black/[0.06] px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-neutral-950">
                Settlement ledger
              </h2>

              <p className="mt-1 text-xs text-neutral-500">
                {pagination.total} settlement
                records
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />

                <input
                  value={searchInput}
                  onChange={(event) =>
                    setSearchInput(
                      event.target.value
                    )
                  }
                  placeholder="Search seller, shop or reference..."
                  className="min-h-11 w-full rounded-2xl border border-black/[0.08] bg-neutral-50 pl-11 pr-4 text-sm outline-none transition focus:border-black/30 focus:bg-white sm:w-[300px]"
                />
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setStatusMenuOpen(
                      (current) => !current
                    )
                  }
                  className="flex min-h-11 w-full min-w-[190px] items-center justify-between gap-4 rounded-2xl border border-black/[0.08] bg-white px-4 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
                >
                  {selectedStatusLabel}

                  <ChevronDown
                    className={`h-4 w-4 text-neutral-400 transition ${
                      statusMenuOpen
                        ? "rotate-180"
                        : ""
                    }`}
                  />
                </button>

                {statusMenuOpen && (
                  <>
                    <button
                      type="button"
                      aria-label="Close status menu"
                      onClick={() =>
                        setStatusMenuOpen(false)
                      }
                      className="fixed inset-0 z-40 cursor-default"
                    />

                    <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-full min-w-[220px] rounded-2xl border border-black/[0.07] bg-white p-1.5 shadow-[0_18px_50px_rgba(0,0,0,0.13)]">
                      {STATUS_OPTIONS.map(
                        (option) => (
                          <button
                            key={
                              option.value ||
                              "ALL"
                            }
                            type="button"
                            onClick={() => {
                              setStatus(
                                option.value
                              );
                              setPage(1);
                              setStatusMenuOpen(
                                false
                              );
                            }}
                            className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition ${
                              status ===
                              option.value
                                ? "bg-neutral-950 font-semibold text-white"
                                : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950"
                            }`}
                          >
                            {option.label}

                            {status ===
                              option.value && (
                              <Check className="h-4 w-4" />
                            )}
                          </button>
                        )
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px]">
              <thead>
                <tr className="border-b border-black/[0.06] bg-neutral-50/80 text-left">
                  {[
                    "Seller",
                    "Transaction",
                    "Gross",
                    "Platform fee",
                    "Seller earnings",
                    "Status",
                    "Verified",
                    "Actions",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <LoadingRows />
                ) : payments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-20 text-center"
                    >
                      <WalletCards className="mx-auto h-8 w-8 text-neutral-300" />

                      <p className="mt-4 font-semibold text-neutral-900">
                        No settlements found
                      </p>

                      <p className="mt-1 text-sm text-neutral-500">
                        Try changing the search or
                        status filter.
                      </p>
                    </td>
                  </tr>
                ) : (
                  payments.map((payment) => (
                    <PaymentRow
                      key={payment.id}
                      payment={payment}
                      updating={
                        updatingId === payment.id
                      }
                      onChangeStatus={
                        handleStatusChange
                      }
                      onFail={() => {
                        setError("");
                        setFailurePayment(payment);
                        setFailureReason("");
                      }}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-4 border-t border-black/[0.06] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-neutral-500">
              Page {pagination.page} of{" "}
              {Math.max(pagination.pages, 1)}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() =>
                  setPage((current) =>
                    Math.max(current - 1, 1)
                  )
                }
                className="flex h-10 items-center gap-2 rounded-xl border border-black/[0.08] px-4 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-40"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </button>

              <button
                type="button"
                disabled={
                  page >= pagination.pages ||
                  loading ||
                  pagination.pages === 0
                }
                onClick={() =>
                  setPage(
                    (current) => current + 1
                  )
                }
                className="flex h-10 items-center gap-2 rounded-xl bg-neutral-950 px-4 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-40"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      </div>

      {failurePayment && (
        <FailureModal
          payment={failurePayment}
          reason={failureReason}
          updating={
            updatingId === failurePayment.id
          }
          onReasonChange={setFailureReason}
          onClose={() => {
            if (!updatingId) {
              setFailurePayment(null);
              setFailureReason("");
            }
          }}
          onSubmit={submitFailure}
        />
      )}
    </>
  );
}

function SummaryCard({
  label,
  value,
  detail,
  icon,
  loading,
}: {
  label: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
  loading: boolean;
}) {
  return (
    <article className="rounded-[26px] border border-black/[0.06] bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.04)]">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-950 text-white [&>svg]:h-5 [&>svg]:w-5">
        {icon}
      </div>

      <p className="mt-5 text-xs font-medium text-neutral-500">
        {label}
      </p>

      {loading ? (
        <div className="mt-2 h-8 w-32 animate-pulse rounded-lg bg-neutral-200" />
      ) : (
        <p className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-neutral-950">
          {value}
        </p>
      )}

      <p className="mt-2 text-[11px] leading-5 text-neutral-400">
        {detail}
      </p>
    </article>
  );
}

function PaymentRow({
  payment,
  updating,
  onChangeStatus,
  onFail,
}: {
  payment: AdminPayment;
  updating: boolean;
  onChangeStatus: (
    payment: AdminPayment,
    status: SettlementStatus
  ) => Promise<void>;
  onFail: () => void;
}) {
  return (
    <tr className="border-b border-black/[0.05] last:border-b-0 hover:bg-neutral-50/70">
      <td className="px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-100">
            <Store className="h-4 w-4 text-neutral-600" />
          </div>

          <div>
            <p className="text-sm font-semibold text-neutral-950">
              {payment.shopName ||
                payment.sellerName}
            </p>
            <p className="mt-0.5 text-xs text-neutral-400">
              {payment.sellerEmail}
            </p>
          </div>
        </div>
      </td>

      <td className="px-6 py-5">
        <p className="max-w-[180px] truncate text-xs font-semibold text-neutral-700">
          {payment.transactionReference ||
            "Not available"}
        </p>
        <p className="mt-1 text-[11px] uppercase text-neutral-400">
          {payment.paymentProvider ||
            "Provider unavailable"}
        </p>
      </td>

      <td className="px-6 py-5 text-sm font-semibold text-neutral-900">
        {formatINR(payment.grossAmount)}
      </td>

      <td className="px-6 py-5">
        <p className="text-sm font-semibold text-neutral-900">
          {formatINR(payment.platformFee)}
        </p>
        <p className="mt-1 text-[11px] text-neutral-400">
          {payment.platformFeeRate}%
        </p>
      </td>

      <td className="px-6 py-5 text-sm font-semibold text-emerald-700">
        {formatINR(payment.sellerEarnings)}
      </td>

      <td className="px-6 py-5">
        <StatusBadge status={payment.status} />
      </td>

      <td className="px-6 py-5 text-xs text-neutral-500">
        {formatDate(payment.paymentVerifiedAt)}
      </td>

      <td className="px-6 py-5">
        <div className="flex flex-wrap gap-2">
          {updating ? (
            <Loader2 className="h-4 w-4 animate-spin text-neutral-500" />
          ) : (
            <>
              {payment.status === "PENDING" && (
                <>
                  <ActionButton
                    label="Start processing"
                    onClick={() =>
                      void onChangeStatus(
                        payment,
                        "PROCESSING"
                      )
                    }
                  />

                  <DangerButton
                    label="Mark failed"
                    onClick={onFail}
                  />
                </>
              )}

              {payment.status ===
                "PROCESSING" && (
                <>
                  <ActionButton
                    label="Mark settled"
                    onClick={() =>
                      void onChangeStatus(
                        payment,
                        "SETTLED"
                      )
                    }
                  />

                  <DangerButton
                    label="Mark failed"
                    onClick={onFail}
                  />
                </>
              )}

              {payment.status === "FAILED" && (
                <ActionButton
                  label="Retry"
                  onClick={() =>
                    void onChangeStatus(
                      payment,
                      "PENDING"
                    )
                  }
                />
              )}

              {payment.status === "SETTLED" && (
                <span className="text-xs font-semibold text-emerald-700">
                  Completed
                </span>
              )}
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

function StatusBadge({
  status,
}: {
  status: SettlementStatus;
}) {
  const styles: Record<
    SettlementStatus,
    string
  > = {
    PENDING:
      "bg-amber-50 text-amber-700",
    PROCESSING:
      "bg-blue-50 text-blue-700",
    SETTLED:
      "bg-emerald-50 text-emerald-700",
    FAILED: "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${styles[status]}`}
    >
      {formatStatus(status)}
    </span>
  );
}

function ActionButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl bg-neutral-950 px-3 py-2 text-xs font-semibold text-white transition hover:bg-neutral-800"
    >
      {label}
    </button>
  );
}

function DangerButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100"
    >
      {label}
    </button>
  );
}

function FailureModal({
  payment,
  reason,
  updating,
  onReasonChange,
  onClose,
  onSubmit,
}: {
  payment: AdminPayment;
  reason: string;
  updating: boolean;
  onReasonChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => Promise<void>;
}) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close failure modal"
        onClick={onClose}
        className="absolute inset-0 bg-neutral-950/50 backdrop-blur-sm"
      />

      <div className="relative w-full max-w-md rounded-[28px] border border-white/10 bg-white p-6 shadow-2xl sm:p-7">
        <button
          type="button"
          onClick={onClose}
          disabled={updating}
          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 hover:text-neutral-950"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50">
          <AlertCircle className="h-5 w-5 text-red-600" />
        </div>

        <h2 className="mt-5 text-xl font-semibold text-neutral-950">
          Mark settlement as failed
        </h2>

        <p className="mt-2 text-sm leading-6 text-neutral-500">
          Record why the settlement for{" "}
          <span className="font-semibold text-neutral-800">
            {payment.shopName ||
              payment.sellerName}
          </span>{" "}
          could not be processed.
        </p>

        <label className="mt-6 block text-sm font-semibold text-neutral-800">
          Failure reason
        </label>

        <textarea
          value={reason}
          onChange={(event) =>
            onReasonChange(event.target.value)
          }
          rows={4}
          placeholder="For example: Bank account verification failed"
          className="mt-2 w-full resize-none rounded-2xl border border-black/[0.09] bg-neutral-50 px-4 py-3 text-sm outline-none transition focus:border-black/30 focus:bg-white"
        />

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={updating}
            className="min-h-11 flex-1 rounded-full border border-black/[0.09] text-sm font-semibold text-neutral-700"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => void onSubmit()}
            disabled={
              updating || !reason.trim()
            }
            className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-red-600 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            {updating && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}

            Confirm failure
          </button>
        </div>
      </div>
    </div>
  );
}

function LoadingRows() {
  return (
    <>
      {Array.from({ length: 5 }).map(
        (_, index) => (
          <tr
            key={index}
            className="border-b border-black/[0.05]"
          >
            {Array.from({ length: 8 }).map(
              (__, column) => (
                <td
                  key={column}
                  className="px-6 py-5"
                >
                  <div className="h-4 animate-pulse rounded bg-neutral-200" />
                </td>
              )
            )}
          </tr>
        )
      )}
    </>
  );
}

function formatINR(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string | null) {
  if (!value) {
    return "Not verified";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(new Date(value));
}

function formatStatus(value: string) {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function getErrorMessage(
  error: unknown,
  fallback: string
) {
  if (axios.isAxiosError(error)) {
    const message =
      error.response?.data?.message;

    if (typeof message === "string") {
      return message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}