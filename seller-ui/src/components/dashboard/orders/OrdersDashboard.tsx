"use client";

import { useEffect, useMemo, useState } from "react";

import Link from "next/link";

import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Box,
  ChevronRight,
  CircleDollarSign,
  PackageCheck,
  RefreshCw,
  Search,
  ShoppingBag,
  Truck
} from "lucide-react";

import { toast } from "sonner";

import {
  getSellerOrders,
  getSellerRevenueSummary,
} from "@/services/order.service";

import {
  SellerOrder,
  SellerOrderStatus,
  SellerRevenueSummary,
} from "@/types/order";

import OrderStatusFilter from "./OrderStatusFilter";

// ======================================================
// CONSTANTS
// ======================================================

const PAGE_LIMIT = 10;



// ======================================================
// HELPERS
// ======================================================

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
};

const formatDate = (value: string): string => {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

const shortOrderId = (orderId: string): string => {
  return `#${orderId.slice(-8).toUpperCase()}`;
};

const getErrorMessage = (error: unknown): string => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (
      error as {
        response?: {
          data?: {
            message?: unknown;
          };
        };
      }
    ).response;

    if (typeof response?.data?.message === "string") {
      return response.data.message;
    }
  }

  return "Unable to load seller orders.";
};

// ======================================================
// STATUS BADGE
// ======================================================

function StatusBadge({ status }: { status: SellerOrderStatus }) {
  const styles: Record<SellerOrderStatus, string> = {
    PENDING_PAYMENT: "bg-amber-50 text-amber-700 ring-amber-600/15",

    CONFIRMED: "bg-blue-50 text-blue-700 ring-blue-600/15",

    PROCESSING: "bg-violet-50 text-violet-700 ring-violet-600/15",

    SHIPPED: "bg-cyan-50 text-cyan-700 ring-cyan-600/15",

    DELIVERED: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",

    CANCELLED: "bg-red-50 text-red-700 ring-red-600/15",
  };

  const labels: Record<SellerOrderStatus, string> = {
    PENDING_PAYMENT: "Pending payment",

    CONFIRMED: "Confirmed",

    PROCESSING: "Processing",

    SHIPPED: "Shipped",

    DELIVERED: "Delivered",

    CANCELLED: "Cancelled",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ring-inset ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

// ======================================================
// SUMMARY CARD
// ======================================================

function SummaryCard({
  title,
  value,
  description,
  icon: Icon,
  iconClassName,
}: {
  title: string;
  value: string;
  description: string;
  icon: typeof Banknote;
  iconClassName: string;
}) {
  return (
    <article className="group rounded-[24px] border border-black/[0.06] bg-white p-5 shadow-[0_12px_40px_rgba(0,0,0,0.035)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_48px_rgba(0,0,0,0.06)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
            {title}
          </p>

          <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-neutral-950">
            {value}
          </p>

          <p className="mt-2 text-xs leading-5 text-neutral-500">
            {description}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${iconClassName}`}
        >
          <Icon className="h-[19px] w-[19px]" strokeWidth={1.8} />
        </div>
      </div>
    </article>
  );
}

// ======================================================
// LOADING STATE
// ======================================================

function OrdersLoading() {
  return (
    <div className="overflow-hidden rounded-[26px] border border-black/[0.06] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.035)]">
      <div className="border-b border-black/[0.06] px-6 py-5">
        <div className="h-4 w-40 animate-pulse rounded-full bg-neutral-100" />
        <div className="mt-2 h-3 w-64 animate-pulse rounded-full bg-neutral-100" />
      </div>

      <div className="divide-y divide-black/[0.05]">
        {Array.from({
          length: 5,
        }).map((_, index) => (
          <div key={index} className="flex items-center gap-5 px-6 py-5">
            <div className="h-10 w-10 animate-pulse rounded-xl bg-neutral-100" />

            <div className="flex-1">
              <div className="h-3.5 w-36 animate-pulse rounded-full bg-neutral-100" />
              <div className="mt-2 h-3 w-24 animate-pulse rounded-full bg-neutral-100" />
            </div>

            <div className="hidden h-7 w-20 animate-pulse rounded-full bg-neutral-100 sm:block" />
            <div className="hidden h-4 w-20 animate-pulse rounded-full bg-neutral-100 md:block" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ======================================================
// ORDERS DASHBOARD
// ======================================================

export default function OrdersDashboard() {
  const [orders, setOrders] = useState<SellerOrder[]>([]);

  const [summary, setSummary] = useState<SellerRevenueSummary | null>(null);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [page, setPage] = useState(1);

  const [totalPages, setTotalPages] = useState(0);

  const [totalOrders, setTotalOrders] = useState(0);

  const [search, setSearch] = useState("");

  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [status, setStatus] = useState<"" | SellerOrderStatus>("");

  // ====================================================
  // RESET DASHBOARD SCROLL POSITION
  // ====================================================

  useEffect(() => {
    const scrollContainer = document.querySelector("main");

    scrollContainer?.scrollTo({
      top: 0,
      behavior: "instant",
    });
  }, []);

  // ====================================================
  // DEBOUNCE SEARCH
  // ====================================================

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search.trim());

      setPage(1);
    }, 350);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [search]);

  // ====================================================
  // LOAD ORDERS
  // ====================================================

  const loadOrders = async (showRefreshState = false) => {
    try {
      if (showRefreshState) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await getSellerOrders({
        page,
        limit: PAGE_LIMIT,

        search: debouncedSearch || undefined,

        status: status || undefined,

        paymentStatus: "PAID",
      });

      setOrders(data.orders || []);

      setTotalPages(data.pagination.totalPages);

      setTotalOrders(data.pagination.totalOrders);
    } catch (error) {
      console.error("Failed to load seller orders:", error);

      toast.error(getErrorMessage(error));

      setOrders([]);
      setTotalPages(0);
      setTotalOrders(0);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ====================================================
  // LOAD SUMMARY
  // ====================================================

  const loadSummary = async () => {
    try {
      const data = await getSellerRevenueSummary();

      setSummary(data.summary);
    } catch (error) {
      console.error("Failed to load seller revenue:", error);

      setSummary(null);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [page, debouncedSearch, status]);

  useEffect(() => {
    loadSummary();
  }, []);

  // ====================================================
  // PRODUCT PREVIEW
  // ====================================================

  const visibleOrderRange = useMemo(() => {
    if (totalOrders === 0) {
      return "0 orders";
    }

    const start = (page - 1) * PAGE_LIMIT + 1;

    const end = Math.min(page * PAGE_LIMIT, totalOrders);

    return `${start}–${end} of ${totalOrders}`;
  }, [page, totalOrders]);

  const handleRefresh = async () => {
    await Promise.all([loadOrders(true), loadSummary()]);

    toast.success("Orders refreshed.");
  };

  return (
    <div className="min-w-0 space-y-7">
      {/* HEADER */}

      <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
            Fulfilment
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-[34px]">
            Orders
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
            Track paid orders, manage fulfilment, and monitor revenue from your
            products.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-black/[0.08] bg-white px-5 text-sm font-semibold text-neutral-700 shadow-sm transition hover:border-black/[0.14] hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </section>

      {/* SUMMARY */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Net revenue"
          value={summary ? formatCurrency(summary.netRevenue) : "—"}
          description="Paid revenue after discounts"
          icon={CircleDollarSign}
          iconClassName="bg-emerald-50 text-emerald-700"
        />

        <SummaryCard
          title="Paid orders"
          value={summary ? String(summary.totalOrders) : "—"}
          description="All successfully paid orders"
          icon={ShoppingBag}
          iconClassName="bg-blue-50 text-blue-700"
        />

        <SummaryCard
          title="In fulfilment"
          value={
            summary
              ? String(
                  summary.confirmedOrders +
                    summary.processingOrders +
                    summary.shippedOrders,
                )
              : "—"
          }
          description="Confirmed through shipped"
          icon={Truck}
          iconClassName="bg-violet-50 text-violet-700"
        />

        <SummaryCard
          title="Delivered"
          value={summary ? String(summary.deliveredOrders) : "—"}
          description="Successfully completed orders"
          icon={PackageCheck}
          iconClassName="bg-amber-50 text-amber-700"
        />
      </section>

      {/* TOOLBAR */}

      <section className="rounded-[24px] border border-black/[0.06] bg-white p-4 shadow-[0_12px_40px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-neutral-400"
              strokeWidth={1.8}
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search customer, email, phone, product or SKU..."
              className="h-11 w-full rounded-2xl border border-black/[0.07] bg-neutral-50 pl-11 pr-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-300 focus:bg-white focus:ring-4 focus:ring-black/[0.025]"
            />
          </div>

          <OrderStatusFilter
            value={status}
            onChange={(nextStatus) => {
              setStatus(nextStatus);

              setPage(1);
            }}
          />
        </div>
      </section>

      {/* ORDERS */}

      {loading ? (
        <OrdersLoading />
      ) : orders.length === 0 ? (
        <section className="flex min-h-[300px] flex-col items-center justify-center rounded-[26px] border border-black/[0.06] bg-white px-6 text-center shadow-[0_12px_40px_rgba(0,0,0,0.035)]">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-500">
            <Box className="h-6 w-6" />
          </div>

          <h2 className="mt-5 text-lg font-semibold text-neutral-950">
            No orders found
          </h2>

          <p className="mt-2 max-w-md text-sm leading-6 text-neutral-500">
            Try changing your search or status filter. New paid orders will
            appear here automatically.
          </p>
        </section>
      ) : (
        <section className="overflow-hidden rounded-[26px] border border-black/[0.06] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.035)]">
          <div className="flex items-center justify-between gap-4 border-b border-black/[0.06] px-5 py-5 sm:px-6">
            <div>
              <h2 className="text-sm font-semibold text-neutral-950">
                Order fulfilment
              </h2>

              <p className="mt-1 text-xs text-neutral-500">
                Only your products and revenue are shown.
              </p>
            </div>

            <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-[10px] font-semibold text-neutral-600">
              {totalOrders} {totalOrders === 1 ? "order" : "orders"}
            </span>
          </div>

          {/* DESKTOP TABLE */}

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[980px]">
              <thead className="border-b border-black/[0.06] bg-neutral-50/80">
                <tr>
                  {[
                    "Order",
                    "Customer",
                    "Products",
                    "Status",
                    "Revenue",
                    "Placed",
                    "",
                  ].map((heading) => (
                    <th
                      key={heading || "actions"}
                      className="px-6 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400 last:text-right"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-black/[0.05]">
                {orders.map((order) => (
                  <tr
                    key={order.sellerOrderId}
                    className="group transition hover:bg-neutral-50/70"
                  >
                    <td className="px-6 py-5">
                      <Link
                        href={`/dashboard/orders/${order.id}`}
                        className="font-mono text-xs font-semibold text-neutral-950 transition hover:text-blue-700"
                      >
                        {shortOrderId(order.id)}
                      </Link>

                      <p className="mt-1.5 text-[11px] text-neutral-400">
                        {order.totalQuantity}{" "}
                        {order.totalQuantity === 1 ? "unit" : "units"}
                      </p>
                    </td>

                    <td className="px-6 py-5">
                      <p className="max-w-[180px] truncate text-sm font-semibold text-neutral-800">
                        {order.customer.fullName}
                      </p>

                      <p className="mt-1 max-w-[180px] truncate text-xs text-neutral-400">
                        {order.customer.city}, {order.customer.state}
                      </p>
                    </td>

                    <td className="px-6 py-5">
                      <p className="max-w-[230px] truncate text-sm font-medium text-neutral-700">
                        {order.items[0]?.productTitle}
                      </p>

                      {order.itemCount > 1 && (
                        <p className="mt-1 text-xs text-neutral-400">
                          +{order.itemCount - 1} more
                        </p>
                      )}
                    </td>

                    <td className="px-6 py-5">
                      <StatusBadge status={order.status} />
                    </td>

                    <td className="px-6 py-5">
                      <p className="text-sm font-semibold text-neutral-950">
                        {formatCurrency(order.sellerTotal)}
                      </p>

                      {order.sellerDiscount > 0 && (
                        <p className="mt-1 text-[11px] text-emerald-600">
                          {formatCurrency(order.sellerDiscount)} discount
                        </p>
                      )}
                    </td>

                    <td className="px-6 py-5">
                      <p className="whitespace-nowrap text-xs font-medium text-neutral-600">
                        {formatDate(order.createdAt)}
                      </p>
                    </td>

                    <td className="px-6 py-5 text-right">
                      <Link
                        href={`/dashboard/orders/${order.id}`}
                        aria-label="View order"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-black/[0.07] text-neutral-400 transition hover:border-black/[0.12] hover:bg-white hover:text-neutral-950"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS */}

          <div className="divide-y divide-black/[0.05] md:hidden">
            {orders.map((order) => (
              <Link
                key={order.sellerOrderId}
                href={`/dashboard/orders/${order.id}`}
                className="block p-5 transition active:bg-neutral-50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-xs font-semibold text-neutral-950">
                      {shortOrderId(order.id)}
                    </p>

                    <p className="mt-2 text-sm font-semibold text-neutral-800">
                      {order.customer.fullName}
                    </p>

                    <p className="mt-1 text-xs text-neutral-400">
                      {order.itemCount}{" "}
                      {order.itemCount === 1 ? "product" : "products"} ·{" "}
                      {order.totalQuantity} units
                    </p>
                  </div>

                  <StatusBadge status={order.status} />
                </div>

                <div className="mt-4 flex items-end justify-between gap-4 border-t border-black/[0.05] pt-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                      Revenue
                    </p>

                    <p className="mt-1 text-base font-semibold text-neutral-950">
                      {formatCurrency(order.sellerTotal)}
                    </p>
                  </div>

                  <ChevronRight className="h-4 w-4 text-neutral-400" />
                </div>
              </Link>
            ))}
          </div>

          {/* PAGINATION */}

          <div className="flex flex-col gap-4 border-t border-black/[0.06] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-xs text-neutral-500">
              Showing{" "}
              <span className="font-semibold text-neutral-700">
                {visibleOrderRange}
              </span>
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setPage((currentPage) => Math.max(currentPage - 1, 1))
                }
                disabled={page <= 1}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-black/[0.07] px-3.5 text-xs font-semibold text-neutral-600 transition hover:border-black/[0.12] hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Previous
              </button>

              <span className="min-w-20 text-center text-xs font-semibold text-neutral-600">
                Page {page}
                {totalPages > 0 ? ` of ${totalPages}` : ""}
              </span>

              <button
                type="button"
                onClick={() =>
                  setPage((currentPage) =>
                    Math.min(currentPage + 1, totalPages),
                  )
                }
                disabled={page >= totalPages || totalPages === 0}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-black/[0.07] px-3.5 text-xs font-semibold text-neutral-600 transition hover:border-black/[0.12] hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
