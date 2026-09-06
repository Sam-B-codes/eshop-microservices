"use client";

import {
    useEffect,
    useState,
} from "react";

import Link from "next/link";

import axios from "axios";

import {
    ArrowRight,
    BadgeIndianRupee,
    Banknote,
    Check,
    Clock3,
    Copy,
    CreditCard,
    RefreshCw,
    Search,
    ShieldCheck,
    WalletCards,
    X,
} from "lucide-react";

import {
    getSellerPayments,
    getSellerPaymentSummary,
} from "@/services/payment.service";

import type {
    SellerPayment,
    SellerPaymentPagination,
    SellerPaymentSummary,
    SettlementStatus,
} from "@/types/payment";

import SettlementStatusFilter, {
    SettlementStatusOption,
} from "./SettlementStatusFilter";

// ======================================================
// CONSTANTS
// ======================================================

const SETTLEMENT_OPTIONS:
  SettlementStatusOption[] = [
    {
      label:
        "All settlements",
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

const EMPTY_PAGINATION:
  SellerPaymentPagination = {
    page: 1,
    limit: 10,
    totalPayments: 0,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  };

const EMPTY_SUMMARY:
  SellerPaymentSummary = {
    totalTransactions: 0,

    pendingSettlements: 0,
    processingSettlements: 0,
    settledTransactions: 0,
    failedSettlements: 0,

    grossSales: 0,
    totalDiscounts: 0,
    netSales: 0,

    totalPlatformFees: 0,
    totalSellerEarnings: 0,

    pendingEarnings: 0,
    settledEarnings: 0,
  };

// ======================================================
// SELLER PAYMENTS DASHBOARD
// ======================================================

export default function SellerPaymentsDashboard() {
  const [
    payments,
    setPayments,
  ] =
    useState<
      SellerPayment[]
    >([]);

  const [
    summary,
    setSummary,
  ] =
    useState<SellerPaymentSummary>(
      EMPTY_SUMMARY
    );

  const [
    pagination,
    setPagination,
  ] =
    useState<SellerPaymentPagination>(
      EMPTY_PAGINATION
    );

  const [
    searchInput,
    setSearchInput,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    status,
    setStatus,
  ] =
    useState<
      SettlementStatus | ""
    >("");

  const [
    page,
    setPage,
  ] = useState(1);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    refreshKey,
    setRefreshKey,
  ] = useState(0);

  // ====================================================
  // SCROLL TO TOP
  // ====================================================

  useEffect(() => {
    const scrollContainer =
      document.querySelector(
        "main"
      );

    scrollContainer?.scrollTo({
      top: 0,
      behavior: "auto",
    });
  }, []);

  // ====================================================
  // DEBOUNCE SEARCH
  // ====================================================

  useEffect(() => {
    const timer =
      window.setTimeout(
        () => {
          setSearch(
            searchInput.trim()
          );

          setPage(1);
        },
        400
      );

    return () => {
      window.clearTimeout(
        timer
      );
    };
  }, [searchInput]);

  // ====================================================
  // LOAD PAYMENT DATA
  // ====================================================

  useEffect(() => {
    let active = true;

    const loadPaymentData =
      async () => {
        try {
          setError("");

          if (
            refreshKey === 0
          ) {
            setLoading(true);
          } else {
            setRefreshing(true);
          }

          const [
            summaryResponse,
            paymentsResponse,
          ] =
            await Promise.all([
              getSellerPaymentSummary(),

              getSellerPayments({
                page,
                limit: 10,

                search:
                  search ||
                  undefined,

                status:
                  status ||
                  undefined,
              }),
            ]);

          if (!active) {
            return;
          }

          setSummary(
            summaryResponse
              .summary ||
              EMPTY_SUMMARY
          );

          setPayments(
            paymentsResponse
              .payments || []
          );

          setPagination(
            paymentsResponse
              .pagination ||
              EMPTY_PAGINATION
          );
        } catch (
          loadError: unknown
        ) {
          console.error(
            "Failed to load seller payments:",
            loadError
          );

          if (!active) {
            return;
          }

          if (
            axios.isAxiosError(
              loadError
            )
          ) {
            const message =
              loadError
                .response
                ?.data
                ?.message;

            setError(
              typeof message ===
                "string"
                ? message
                : "Unable to load payment information."
            );
          } else {
            setError(
              "Unable to load payment information."
            );
          }
        } finally {
          if (active) {
            setLoading(false);
            setRefreshing(false);
          }
        }
      };

    void loadPaymentData();

    return () => {
      active = false;
    };
  }, [
    page,
    refreshKey,
    search,
    status,
  ]);

  // ====================================================
  // STATUS CHANGE
  // ====================================================

  const handleStatusChange = (
    nextStatus:
      | SettlementStatus
      | ""
  ) => {
    setStatus(
      nextStatus
    );

    setPage(1);
  };

  // ====================================================
  // CLEAR FILTERS
  // ====================================================

  const clearFilters =
    () => {
      setSearchInput("");
      setSearch("");
      setStatus("");
      setPage(1);
    };

  const hasFilters =
    Boolean(
      searchInput.trim()
    ) ||
    Boolean(status);

  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {
    return (
      <PaymentsSkeleton />
    );
  }

  return (
    <div className="min-w-0 space-y-7">
      {/* PAGE HEADER */}

      <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
            Finance
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.045em] text-neutral-950 sm:text-[38px]">
            Payments
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
            Monitor customer payments,
            platform fees, seller earnings,
            and internal settlement progress.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setRefreshKey(
              (current) =>
                current + 1
            )
          }
          disabled={refreshing}
          className="inline-flex min-h-11 w-fit items-center justify-center gap-2 rounded-full border border-black/[0.08] bg-white px-5 text-sm font-semibold text-neutral-700 shadow-sm transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              refreshing
                ? "animate-spin"
                : ""
            }`}
            strokeWidth={1.8}
          />

          {refreshing
            ? "Refreshing..."
            : "Refresh"}
        </button>
      </section>

      {/* SUMMARY */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Seller earnings"
          value={formatCurrency(
            summary.totalSellerEarnings
          )}
          description="After discounts and platform fees"
          icon={
            <BadgeIndianRupee
              className="h-5 w-5"
              strokeWidth={1.8}
            />
          }
          iconStyle="bg-emerald-50 text-emerald-700"
        />

        <SummaryCard
          label="Pending earnings"
          value={formatCurrency(
            summary.pendingEarnings
          )}
          description={`${summary.pendingSettlements} awaiting settlement`}
          icon={
            <Clock3
              className="h-5 w-5"
              strokeWidth={1.8}
            />
          }
          iconStyle="bg-amber-50 text-amber-700"
        />

        <SummaryCard
          label="Settled earnings"
          value={formatCurrency(
            summary.settledEarnings
          )}
          description={`${summary.settledTransactions} settled transactions`}
          icon={
            <Banknote
              className="h-5 w-5"
              strokeWidth={1.8}
            />
          }
          iconStyle="bg-blue-50 text-blue-700"
        />

        <SummaryCard
          label="Platform fees"
          value={formatCurrency(
            summary.totalPlatformFees
          )}
          description={`From ${summary.totalTransactions} paid transactions`}
          icon={
            <ShieldCheck
              className="h-5 w-5"
              strokeWidth={1.8}
            />
          }
          iconStyle="bg-violet-50 text-violet-700"
        />
      </section>

      {/* REVENUE BREAKDOWN */}

      <section className="grid overflow-hidden rounded-[28px] border border-black/[0.06] bg-[#0b1220] text-white shadow-[0_16px_50px_rgba(11,18,32,0.12)] md:grid-cols-3">
        <RevenueCell
          label="Gross sales"
          value={formatCurrency(
            summary.grossSales
          )}
          description="Before discounts"
        />

        <RevenueCell
          label="Seller discounts"
          value={formatCurrency(
            summary.totalDiscounts
          )}
          description="Coupons applied"
        />

        <RevenueCell
          label="Net sales"
          value={formatCurrency(
            summary.netSales
          )}
          description="After discounts"
        />
      </section>

      {/* FILTERS */}

      <section className="rounded-[26px] border border-black/[0.06] bg-white p-3 shadow-[0_12px_40px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-neutral-400"
              strokeWidth={1.8}
            />

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
              placeholder="Search order ID or transaction reference..."
              className="h-13 w-full rounded-[18px] border border-black/[0.07] bg-[#fafafa] pl-12 pr-11 text-sm text-neutral-950 outline-none transition placeholder:text-neutral-400 hover:border-black/[0.13] focus:border-[#0b1220] focus:bg-white"
            />

            {searchInput && (
              <button
                type="button"
                onClick={() =>
                  setSearchInput(
                    ""
                  )
                }
                aria-label="Clear search"
                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-950"
              >
                <X
                  className="h-4 w-4"
                  strokeWidth={1.8}
                />
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <SettlementStatusFilter
              value={status}
              options={
                SETTLEMENT_OPTIONS
              }
              onChange={
                handleStatusChange
              }
            />

            {hasFilters && (
              <button
                type="button"
                onClick={
                  clearFilters
                }
                className="h-13 rounded-[18px] border border-black/[0.07] bg-white px-5 text-sm font-semibold text-neutral-600 transition hover:bg-[#0b1220] hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      {/* PAYMENT LEDGER */}

      <section className="overflow-hidden rounded-[28px] border border-black/[0.06] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between gap-4 border-b border-black/[0.06] px-5 py-5 sm:px-6">
          <div>
            <h2 className="text-sm font-semibold text-neutral-950">
              Payment ledger
            </h2>

            <p className="mt-1 text-xs text-neutral-500">
              Internal settlement records
              generated from paid orders.
            </p>
          </div>

          <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-[10px] font-semibold text-neutral-600">
            {
              pagination.totalPayments
            }{" "}
            {pagination.totalPayments ===
            1
              ? "transaction"
              : "transactions"}
          </span>
        </div>

        {error ? (
          <ErrorState
            message={error}
            onRetry={() =>
              setRefreshKey(
                (current) =>
                  current + 1
              )
            }
          />
        ) : payments.length ===
          0 ? (
          <EmptyPayments
            filtered={
              hasFilters
            }
            onClear={
              clearFilters
            }
          />
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <PaymentTable
                payments={
                  payments
                }
              />
            </div>

            <div className="divide-y divide-black/[0.06] lg:hidden">
              {payments.map(
                (payment) => (
                  <PaymentMobileCard
                    key={
                      payment.id
                    }
                    payment={
                      payment
                    }
                  />
                )
              )}
            </div>
          </>
        )}

        {!error &&
          payments.length > 0 && (
            <Pagination
              pagination={
                pagination
              }
              onPrevious={() =>
                setPage(
                  (
                    current
                  ) =>
                    Math.max(
                      1,
                      current - 1
                    )
                )
              }
              onNext={() =>
                setPage(
                  (
                    current
                  ) =>
                    current + 1
                )
              }
            />
          )}
      </section>

      {/* DISCLAIMER */}

      <div className="flex items-start gap-3 rounded-[22px] border border-black/[0.06] bg-[#eef1f5] px-5 py-4">
        <ShieldCheck
          className="mt-0.5 h-4 w-4 shrink-0 text-slate-600"
          strokeWidth={1.8}
        />

        <p className="text-xs leading-5 text-slate-600">
          Settlement statuses are tracked
          internally by Eshop. Customer
          payments are verified through
          Razorpay Test Mode. No real bank
          transfer is initiated from this
          dashboard.
        </p>
      </div>
    </div>
  );
}

// ======================================================
// SUMMARY CARD
// ======================================================

function SummaryCard({
  label,
  value,
  description,
  icon,
  iconStyle,
}: {
  label: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  iconStyle: string;
}) {
  return (
    <article className="rounded-[26px] border border-black/[0.06] bg-white p-5 shadow-[0_12px_40px_rgba(0,0,0,0.03)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-neutral-400">
            {label}
          </p>

          <p className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-neutral-950">
            {value}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] ${iconStyle}`}
        >
          {icon}
        </div>
      </div>

      <p className="mt-3 text-xs leading-5 text-neutral-500">
        {description}
      </p>
    </article>
  );
}

// ======================================================
// REVENUE CELL
// ======================================================

function RevenueCell({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="border-b border-white/[0.07] px-6 py-6 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-slate-500">
        {label}
      </p>

      <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">
        {value}
      </p>

      <p className="mt-2 text-xs text-slate-500">
        {description}
      </p>
    </div>
  );
}

// ======================================================
// PAYMENT TABLE
// ======================================================

function PaymentTable({
  payments,
}: {
  payments:
    SellerPayment[];
}) {
  return (
    <table className="w-full min-w-[1180px]">
      <thead className="border-b border-black/[0.06] bg-neutral-50/80">
        <tr>
          <TableHeading>
            Order
          </TableHeading>

          <TableHeading>
            Customer
          </TableHeading>

          <TableHeading>
            Net sale
          </TableHeading>

          <TableHeading>
            Platform fee
          </TableHeading>

          <TableHeading>
            Seller earnings
          </TableHeading>

          <TableHeading>
            Settlement
          </TableHeading>

          <TableHeading>
            Payment date
          </TableHeading>

          <TableHeading>
            Transaction
          </TableHeading>
        </tr>
      </thead>

      <tbody className="divide-y divide-black/[0.06]">
        {payments.map(
          (payment) => (
            <tr
              key={
                payment.id
              }
              className="transition hover:bg-neutral-50/70"
            >
              <td className="px-6 py-5">
                <Link
                  href={`/dashboard/orders/${encodeURIComponent(
                    payment.orderId
                  )}`}
                  className="group inline-flex items-center gap-2 text-sm font-semibold text-neutral-950"
                >
                  #
                  {shortId(
                    payment.orderId
                  )}

                  <ArrowRight
                    className="h-3.5 w-3.5 text-neutral-300 transition group-hover:translate-x-0.5 group-hover:text-neutral-700"
                    strokeWidth={1.8}
                  />
                </Link>

                <p className="mt-1 text-[11px] text-neutral-400">
                  {
                    payment.paymentStatus
                  }
                </p>
              </td>

              <td className="px-6 py-5">
                <p className="max-w-[180px] truncate text-sm font-semibold text-neutral-800">
                  {
                    payment
                      .customer
                      .fullName
                  }
                </p>

                <p className="mt-1 max-w-[180px] truncate text-[11px] text-neutral-400">
                  {
                    payment
                      .customer
                      .email
                  }
                </p>
              </td>

              <td className="px-6 py-5">
                <p className="text-sm font-semibold text-neutral-900">
                  {formatCurrency(
                    payment.netSale
                  )}
                </p>

                {payment.sellerDiscount >
                  0 && (
                  <p className="mt-1 text-[11px] text-emerald-700">
                    −
                    {formatCurrency(
                      payment.sellerDiscount
                    )}{" "}
                    discount
                  </p>
                )}
              </td>

              <td className="px-6 py-5">
                <p className="text-sm font-semibold text-neutral-800">
                  {formatCurrency(
                    payment.platformFee
                  )}
                </p>

                <p className="mt-1 text-[11px] text-neutral-400">
                  {
                    payment.platformFeeRate
                  }
                  %
                </p>
              </td>

              <td className="px-6 py-5">
                <p className="text-sm font-semibold text-emerald-700">
                  {formatCurrency(
                    payment.sellerEarnings
                  )}
                </p>
              </td>

              <td className="px-6 py-5">
                <SettlementBadge
                  status={
                    payment.settlementStatus
                  }
                />
              </td>

              <td className="px-6 py-5">
                <p className="text-sm font-medium text-neutral-700">
                  {formatDate(
                    payment.paymentVerifiedAt ||
                      payment.orderCreatedAt
                  )}
                </p>

                <p className="mt-1 text-[11px] text-neutral-400">
                  {formatTime(
                    payment.paymentVerifiedAt ||
                      payment.orderCreatedAt
                  )}
                </p>
              </td>

              <td className="px-6 py-5">
                <TransactionReference
                  value={
                    payment.transactionReference
                  }
                />
              </td>
            </tr>
          )
        )}
      </tbody>
    </table>
  );
}

// ======================================================
// MOBILE PAYMENT CARD
// ======================================================

function PaymentMobileCard({
  payment,
}: {
  payment:
    SellerPayment;
}) {
  return (
    <article className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
            Order
          </p>

          <Link
            href={`/dashboard/orders/${encodeURIComponent(
              payment.orderId
            )}`}
            className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-neutral-950"
          >
            #
            {shortId(
              payment.orderId
            )}

            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <SettlementBadge
          status={
            payment.settlementStatus
          }
        />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <MobileValue
          label="Net sale"
          value={formatCurrency(
            payment.netSale
          )}
        />

        <MobileValue
          label="Platform fee"
          value={formatCurrency(
            payment.platformFee
          )}
        />

        <MobileValue
          label="Seller earnings"
          value={formatCurrency(
            payment.sellerEarnings
          )}
          positive
        />

        <MobileValue
          label="Payment date"
          value={formatDate(
            payment.paymentVerifiedAt ||
              payment.orderCreatedAt
          )}
        />
      </div>

      <div className="mt-4 border-t border-black/[0.06] pt-4">
        <p className="text-xs font-semibold text-neutral-800">
          {
            payment.customer
              .fullName
          }
        </p>

        <div className="mt-3">
          <TransactionReference
            value={
              payment.transactionReference
            }
          />
        </div>
      </div>
    </article>
  );
}

// ======================================================
// TRANSACTION REFERENCE
// ======================================================

function TransactionReference({
  value,
}: {
  value:
    | string
    | null;
}) {
  const [
    copied,
    setCopied,
  ] = useState(false);

  if (!value) {
    return (
      <span className="text-xs text-neutral-400">
        Not available
      </span>
    );
  }

  const copyReference =
    async () => {
      try {
        await navigator
          .clipboard
          .writeText(value);

        setCopied(true);

        window.setTimeout(
          () => {
            setCopied(
              false
            );
          },
          1500
        );
      } catch (error) {
        console.error(
          "Unable to copy transaction reference:",
          error
        );
      }
    };

  return (
    <button
      type="button"
      onClick={
        copyReference
      }
      className="group flex max-w-[180px] items-center gap-2 rounded-xl bg-neutral-100 px-3 py-2 text-left transition hover:bg-neutral-200"
      title={value}
    >
      <span className="truncate text-[11px] font-semibold text-neutral-600">
        {value}
      </span>

      {copied ? (
        <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
      ) : (
        <Copy className="h-3.5 w-3.5 shrink-0 text-neutral-400 group-hover:text-neutral-700" />
      )}
    </button>
  );
}

// ======================================================
// SETTLEMENT BADGE
// ======================================================

function SettlementBadge({
  status,
}: {
  status:
    SettlementStatus;
}) {
  const styles: Record<
    SettlementStatus,
    string
  > = {
    PENDING:
      "border-amber-200 bg-amber-50 text-amber-700",

    PROCESSING:
      "border-blue-200 bg-blue-50 text-blue-700",

    SETTLED:
      "border-emerald-200 bg-emerald-50 text-emerald-700",

    FAILED:
      "border-red-200 bg-red-50 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] ${styles[status]}`}
    >
      {formatStatus(
        status
      )}
    </span>
  );
}

// ======================================================
// SMALL COMPONENTS
// ======================================================

function TableHeading({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <th className="px-6 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
      {children}
    </th>
  );
}

function MobileValue({
  label,
  value,
  positive = false,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-[16px] bg-neutral-50 p-3">
      <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-neutral-400">
        {label}
      </p>

      <p
        className={`mt-2 text-sm font-semibold ${
          positive
            ? "text-emerald-700"
            : "text-neutral-800"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

// ======================================================
// PAGINATION
// ======================================================

function Pagination({
  pagination,
  onPrevious,
  onNext,
}: {
  pagination:
    SellerPaymentPagination;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 border-t border-black/[0.06] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <p className="text-xs text-neutral-500">
        Page{" "}
        <span className="font-semibold text-neutral-950">
          {
            pagination.page
          }
        </span>{" "}
        of{" "}
        <span className="font-semibold text-neutral-950">
          {Math.max(
            pagination.totalPages,
            1
          )}
        </span>
      </p>

      <div className="flex gap-2">
        <button
          type="button"
          disabled={
            !pagination.hasPreviousPage
          }
          onClick={
            onPrevious
          }
          className="min-h-10 rounded-full border border-black/[0.08] bg-white px-5 text-xs font-semibold text-neutral-700 transition hover:bg-[#0b1220] hover:text-white disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-white disabled:hover:text-neutral-700"
        >
          Previous
        </button>

        <button
          type="button"
          disabled={
            !pagination.hasNextPage
          }
          onClick={onNext}
          className="min-h-10 rounded-full bg-[#0b1220] px-5 text-xs font-semibold text-white transition hover:bg-[#172033] disabled:cursor-not-allowed disabled:opacity-35"
        >
          Next
        </button>
      </div>
    </div>
  );
}

// ======================================================
// EMPTY STATE
// ======================================================

function EmptyPayments({
  filtered,
  onClear,
}: {
  filtered: boolean;
  onClear: () => void;
}) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center px-6 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-neutral-100 text-neutral-500">
        <WalletCards
          className="h-6 w-6"
          strokeWidth={1.7}
        />
      </div>

      <h3 className="mt-5 text-base font-semibold text-neutral-950">
        {filtered
          ? "No matching payments"
          : "No payment transactions yet"}
      </h3>

      <p className="mt-2 max-w-sm text-sm leading-6 text-neutral-500">
        {filtered
          ? "Try changing your search or settlement status."
          : "Verified customer payments will appear here automatically."}
      </p>

      {filtered && (
        <button
          type="button"
          onClick={onClear}
          className="mt-5 min-h-10 rounded-full bg-[#0b1220] px-5 text-xs font-semibold text-white"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

// ======================================================
// ERROR STATE
// ======================================================

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center px-6 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-red-50 text-red-600">
        <CreditCard
          className="h-6 w-6"
          strokeWidth={1.7}
        />
      </div>

      <h3 className="mt-5 text-base font-semibold text-neutral-950">
        Unable to load payments
      </h3>

      <p className="mt-2 max-w-sm text-sm leading-6 text-neutral-500">
        {message}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-full bg-[#0b1220] px-5 text-xs font-semibold text-white"
      >
        <RefreshCw className="h-3.5 w-3.5" />

        Try again
      </button>
    </div>
  );
}

// ======================================================
// SKELETON
// ======================================================

function PaymentsSkeleton() {
  return (
    <div className="min-w-0 animate-pulse space-y-7">
      <div className="flex items-end justify-between">
        <div>
          <div className="h-3 w-20 rounded-full bg-neutral-200" />
          <div className="mt-4 h-10 w-52 rounded-xl bg-neutral-200" />
          <div className="mt-3 h-4 w-96 max-w-full rounded-full bg-neutral-200" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map(
          (item) => (
            <div
              key={item}
              className="h-[150px] rounded-[26px] bg-white"
            />
          )
        )}
      </div>

      <div className="h-[125px] rounded-[28px] bg-[#0b1220]" />

      <div className="h-[78px] rounded-[26px] bg-white" />

      <div className="h-[420px] rounded-[28px] bg-white" />
    </div>
  );
}

// ======================================================
// FORMATTERS
// ======================================================

function formatCurrency(
  value: number
): string {
  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }
  ).format(value);
}

function formatStatus(
  value: string
): string {
  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase()
    );
}

function shortId(
  value: string
): string {
  return value
    .slice(-8)
    .toUpperCase();
}

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
    return "Not available";
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

function formatTime(
  value: string
): string {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(date);
}