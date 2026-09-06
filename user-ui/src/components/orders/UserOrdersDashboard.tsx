"use client";

import { useEffect, useState } from "react";

import Image from "next/image";
import Link from "next/link";
import OrderStatusFilter from "./OrderStatusFilter";
import {
  ArrowRight,
  CalendarDays,
  Package,
  Search,
  ShoppingBag,
  Store,
  X,
} from "lucide-react";

import { getUserOrders } from "@/services/order.service";

import type {
  OrderStatus,
  UserOrderPagination,
  UserOrderSummary,
} from "@/types/order";

// ======================================================
// CONSTANTS
// ======================================================

const ORDER_STATUSES: Array<{
  label: string;
  value: OrderStatus | "";
}> = [
  {
    label: "All orders",
    value: "",
  },

  {
    label: "Confirmed",
    value: "CONFIRMED",
  },
  {
    label: "Processing",
    value: "PROCESSING",
  },
  {
    label: "Shipped",
    value: "SHIPPED",
  },
  {
    label: "Delivered",
    value: "DELIVERED",
  },
  {
    label: "Cancelled",
    value: "CANCELLED",
  },
];

const EMPTY_PAGINATION: UserOrderPagination = {
  page: 1,
  limit: 6,
  totalOrders: 0,
  totalPages: 0,
  hasPreviousPage: false,
  hasNextPage: false,
};

// ======================================================
// MAIN COMPONENT
// ======================================================

export default function UserOrdersDashboard() {
  const [orders, setOrders] = useState<UserOrderSummary[]>([]);
  const [pagination, setPagination] =
    useState<UserOrderPagination>(EMPTY_PAGINATION);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [status, setStatus] = useState<OrderStatus | "">("");

  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ====================================================
  // SCROLL PAGE TO TOP
  // ====================================================

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "auto",
    });
  }, []);

  // ====================================================
  // DEBOUNCE SEARCH
  // ====================================================

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);

    return () => {
      window.clearTimeout(timer);
    };
  }, [searchInput]);

  // ====================================================
  // LOAD ORDERS
  // ====================================================

  useEffect(() => {
    let active = true;

    const loadOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getUserOrders({
          page,
          limit: 6,
          search: search || undefined,
          status: status || undefined,
          paymentStatus: "PAID",
        });

        if (!active) {
          return;
        }

        setOrders(response.orders ?? []);
        setPagination(response.pagination ?? EMPTY_PAGINATION);
      } catch (loadError) {
        console.error("Failed to load customer orders:", loadError);

        if (!active) {
          return;
        }

        setOrders([]);
        setPagination(EMPTY_PAGINATION);
        setError("We could not load your orders. Please try again.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadOrders();

    return () => {
      active = false;
    };
  }, [page, search, status]);

  // ====================================================
  // STATUS CHANGE
  // ====================================================

  const handleStatusChange = (nextStatus: OrderStatus | "") => {
    setStatus(nextStatus);
    setPage(1);
  };

  // ====================================================
  // CLEAR FILTERS
  // ====================================================

  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setStatus("");
    setPage(1);
  };

  const hasFilters = Boolean(searchInput.trim()) || Boolean(status);

  return (
    <div className="min-w-0">
      {/* PAGE HEADING */}

      <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
            Purchase history
          </p>

          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.045em] text-neutral-950 sm:text-[40px]">
            My orders
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-500">
            Follow every purchase from payment confirmation through final
            delivery.
          </p>
        </div>

        {!loading && (
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-black/[0.07] bg-white px-4 py-2.5 text-xs font-semibold text-neutral-700">
            <Package className="h-4 w-4" strokeWidth={1.8} />
            {pagination.totalOrders}{" "}
            {pagination.totalOrders === 1 ? "order" : "orders"}
          </div>
        )}
      </section>

      {/* FILTERS */}

      <section className="mt-8 rounded-[26px] border border-black/[0.06] bg-white p-3 shadow-[0_12px_40px_rgba(0,0,0,0.025)]">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-neutral-400"
              strokeWidth={1.8}
            />

            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by product, SKU or order ID..."
              className="h-13 w-full rounded-[18px] border border-black/[0.07] bg-[#faf9f7] pl-12 pr-11 text-sm text-neutral-950 outline-none transition placeholder:text-neutral-400 hover:border-black/[0.12] focus:border-neutral-950 focus:bg-white"
            />

            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-950"
              >
                <X className="h-4 w-4" strokeWidth={1.8} />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex">
            <OrderStatusFilter
              value={status}
              options={ORDER_STATUSES}
              onChange={handleStatusChange}
            />

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="h-13 rounded-[18px] border border-black/[0.07] bg-white px-5 text-sm font-semibold text-neutral-600 transition hover:bg-neutral-950 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      {/* CONTENT */}

      <section className="mt-6">
        {loading ? (
          <OrdersSkeleton />
        ) : error ? (
          <ErrorState
            message={error}
            onRetry={() => {
              setPage((currentPage) => currentPage);
              setSearch((currentSearch) => currentSearch);
              window.location.reload();
            }}
          />
        ) : orders.length === 0 ? (
          <EmptyState filtered={hasFilters} onClear={clearFilters} />
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </section>

      {/* PAGINATION */}

      {!loading && !error && orders.length > 0 && pagination.totalPages > 1 && (
        <nav
          aria-label="Orders pagination"
          className="mt-7 flex flex-col gap-4 rounded-[22px] border border-black/[0.06] bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-xs text-neutral-500">
            Page{" "}
            <span className="font-semibold text-neutral-950">
              {pagination.page}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-neutral-950">
              {pagination.totalPages}
            </span>
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={!pagination.hasPreviousPage}
              onClick={() =>
                setPage((currentPage) => Math.max(1, currentPage - 1))
              }
              className="min-h-10 rounded-full border border-black/[0.08] bg-white px-5 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-950 hover:text-white disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-white disabled:hover:text-neutral-700"
            >
              Previous
            </button>

            <button
              type="button"
              disabled={!pagination.hasNextPage}
              onClick={() => setPage((currentPage) => currentPage + 1)}
              className="min-h-10 rounded-full bg-neutral-950 px-5 text-xs font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-35"
            >
              Next
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}

// ======================================================
// ORDER CARD
// ======================================================

function OrderCard({ order }: { order: UserOrderSummary }) {
  const previewItems = order.items.slice(0, 3);
  const remainingItems = Math.max(order.items.length - previewItems.length, 0);

  return (
    <article className="group overflow-hidden rounded-[28px] border border-black/[0.06] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.025)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_55px_rgba(0,0,0,0.05)]">
      <div className="flex flex-col gap-5 border-b border-black/[0.06] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-[#eee7dd] text-neutral-700">
            <Package className="h-5 w-5" strokeWidth={1.7} />
          </div>

          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-neutral-400">
              Order
            </p>

            <p className="mt-1 truncate text-sm font-bold tracking-[-0.02em] text-neutral-950">
              #{getShortOrderId(order.id)}
            </p>
          </div>
        </div>

        <StatusBadge status={order.status} />
      </div>

      <div className="grid gap-7 px-5 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_220px_180px] lg:items-center">
        {/* PRODUCTS */}

        <div className="min-w-0">
          <div className="flex items-center">
            {previewItems.map((item, index) => (
              <div
                key={item.id}
                className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-[18px] border-2 border-white bg-[#f1efeb] ${
                  index > 0 ? "-ml-3" : ""
                }`}
                style={{
                  zIndex: previewItems.length - index,
                }}
              >
                {item.productImage ? (
                  <Image
                    src={item.productImage}
                    alt={item.productTitle}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-neutral-300">
                    <ShoppingBag className="h-5 w-5" strokeWidth={1.7} />
                  </div>
                )}
              </div>
            ))}

            {remainingItems > 0 && (
              <div className="-ml-3 flex h-16 w-16 shrink-0 items-center justify-center rounded-[18px] border-2 border-white bg-[#dce4df] text-xs font-bold text-neutral-700">
                +{remainingItems}
              </div>
            )}
          </div>

          <p className="mt-4 truncate text-sm font-semibold text-neutral-950">
            {order.items[0]?.productTitle ?? "Order items"}
          </p>

          <p className="mt-1 text-xs text-neutral-500">
            {order.totalQuantity} {order.totalQuantity === 1 ? "item" : "items"}
            {" · "}
            {order.sellerCount} {order.sellerCount === 1 ? "seller" : "sellers"}
          </p>
        </div>

        {/* DATE */}

        <div>
          <div className="flex items-center gap-2 text-neutral-400">
            <CalendarDays className="h-4 w-4" strokeWidth={1.7} />

            <span className="text-[10px] font-semibold uppercase tracking-[0.15em]">
              Ordered on
            </span>
          </div>

          <p className="mt-2 text-sm font-semibold text-neutral-800">
            {formatDate(order.createdAt)}
          </p>

          <p className="mt-1 text-xs text-neutral-400">
            {formatTime(order.createdAt)}
          </p>
        </div>

        {/* PRICE AND ACTION */}

        <div className="flex items-end justify-between gap-5 lg:block lg:text-right">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
              Total
            </p>

            <p className="mt-2 text-xl font-semibold tracking-[-0.035em] text-neutral-950">
              {formatCurrency(order.totalAmount)}
            </p>

            {order.discount > 0 && (
              <p className="mt-1 text-xs font-medium text-emerald-700">
                {formatCurrency(order.discount)} saved
              </p>
            )}
          </div>

          <Link
            href={`/profile/orders/${encodeURIComponent(order.id)}`}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-white transition group-hover:translate-x-0.5 group-hover:bg-neutral-800 lg:mt-4 lg:ml-auto"
            aria-label={`View order ${order.id}`}
          >
            <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-black/[0.06] bg-[#fbfaf8] px-5 py-4 text-xs text-neutral-500 sm:px-6">
        <div className="flex items-center gap-2">
          <Store className="h-3.5 w-3.5" strokeWidth={1.7} />

          {order.sellerCount === 1
            ? "Single-seller fulfilment"
            : `${order.sellerCount} seller fulfilments`}
        </div>

        <span className="hidden h-1 w-1 rounded-full bg-neutral-300 sm:block" />

        <span>
          Payment:{" "}
          <span
            className={
              order.paymentStatus === "PAID"
                ? "font-semibold text-emerald-700"
                : "font-semibold text-neutral-700"
            }
          >
            {formatStatus(order.paymentStatus)}
          </span>
        </span>
      </div>
    </article>
  );
}

// ======================================================
// STATUS BADGE
// ======================================================

function StatusBadge({ status }: { status: OrderStatus }) {
  const styles: Record<OrderStatus, string> = {
    PENDING_PAYMENT: "border-amber-200 bg-amber-50 text-amber-700",
    CONFIRMED: "border-blue-200 bg-blue-50 text-blue-700",
    PROCESSING: "border-violet-200 bg-violet-50 text-violet-700",
    SHIPPED: "border-sky-200 bg-sky-50 text-sky-700",
    DELIVERED: "border-emerald-200 bg-emerald-50 text-emerald-700",
    CANCELLED: "border-red-200 bg-red-50 text-red-700",
  };

  return (
    <span
      className={`inline-flex w-fit items-center rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${styles[status]}`}
    >
      {formatStatus(status)}
    </span>
  );
}

// ======================================================
// EMPTY STATE
// ======================================================

function EmptyState({
  filtered,
  onClear,
}: {
  filtered: boolean;
  onClear: () => void;
}) {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center rounded-[30px] border border-black/[0.06] bg-white px-6 text-center shadow-[0_12px_40px_rgba(0,0,0,0.025)]">
      <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#ead6da] text-neutral-700">
        <ShoppingBag className="h-7 w-7" strokeWidth={1.6} />
      </div>

      <h3 className="mt-6 text-xl font-semibold tracking-[-0.03em] text-neutral-950">
        {filtered ? "No matching orders" : "Your order history is empty"}
      </h3>

      <p className="mt-3 max-w-sm text-sm leading-6 text-neutral-500">
        {filtered
          ? "Try changing your search or order status."
          : "Once you complete a purchase, you can follow its journey from here."}
      </p>

      {filtered ? (
        <button
          type="button"
          onClick={onClear}
          className="mt-6 min-h-11 rounded-full bg-neutral-950 px-6 text-sm font-semibold text-white transition hover:bg-neutral-800"
        >
          Clear filters
        </button>
      ) : (
        <Link
          href="/products"
          className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-neutral-950 px-6 text-sm font-semibold text-white transition hover:bg-neutral-800"
        >
          Explore products
          <ArrowRight className="h-4 w-4" />
        </Link>
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
    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-[30px] border border-red-100 bg-white px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
        <Package className="h-6 w-6" strokeWidth={1.7} />
      </div>

      <h3 className="mt-5 text-lg font-semibold text-neutral-950">
        Unable to load orders
      </h3>

      <p className="mt-2 max-w-sm text-sm leading-6 text-neutral-500">
        {message}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-6 min-h-11 rounded-full bg-neutral-950 px-6 text-sm font-semibold text-white transition hover:bg-neutral-800"
      >
        Try again
      </button>
    </div>
  );
}

// ======================================================
// SKELETON
// ======================================================

function OrdersSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="overflow-hidden rounded-[28px] border border-black/[0.05] bg-white"
        >
          <div className="flex items-center justify-between border-b border-black/[0.05] px-6 py-5">
            <div className="h-11 w-44 animate-pulse rounded-2xl bg-neutral-100" />
            <div className="h-7 w-24 animate-pulse rounded-full bg-neutral-100" />
          </div>

          <div className="grid gap-7 px-6 py-7 lg:grid-cols-[minmax(0,1fr)_220px_180px]">
            <div className="h-20 animate-pulse rounded-2xl bg-neutral-100" />
            <div className="h-16 animate-pulse rounded-2xl bg-neutral-100" />
            <div className="h-16 animate-pulse rounded-2xl bg-neutral-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ======================================================
// FORMATTERS
// ======================================================

function formatStatus(value: string): string {
  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getShortOrderId(orderId: string): string {
  return orderId.slice(-8).toUpperCase();
}
