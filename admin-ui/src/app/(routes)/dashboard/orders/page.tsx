"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import axios from "axios";

import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Eye,
  Loader2,
  Package,
  ReceiptText,
  RefreshCw,
  Search,
  Store,
  UserRound,
  X,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import AdminFilterDropdown, {
  AdminFilterOption,
} from "@/components/dashboard/AdminFilterDropdown";

import {
  useAdminContext,
} from "@/context/AdminContext";

import {
  getAdminOrders,
} from "@/services/admin-order.service";

import {
  AdminOrder,
  AdminOrderPagination,
  OrderStatus,
  PaymentStatus,
} from "@/types/admin-order";

const PAGE_LIMIT = 10;

type OrderStatusFilter =
  | ""
  | OrderStatus;

type PaymentStatusFilter =
  | ""
  | PaymentStatus;

const orderStatusOptions:
  AdminFilterOption<OrderStatusFilter>[] =
  [
    {
      label: "All orders",
      description:
        "Every order status",
      value: "",
      dotClassName:
        "bg-neutral-300",
    },
    {
      label:
        "Pending payment",
      description:
        "Awaiting payment",
      value:
        "PENDING_PAYMENT",
      dotClassName:
        "bg-amber-500",
    },
    {
      label: "Confirmed",
      description:
        "Payment confirmed",
      value: "CONFIRMED",
      dotClassName:
        "bg-cyan-500",
    },
    {
      label: "Processing",
      description:
        "Being prepared",
      value: "PROCESSING",
      dotClassName:
        "bg-violet-500",
    },
    {
      label: "Shipped",
      description:
        "In transit",
      value: "SHIPPED",
      dotClassName:
        "bg-blue-500",
    },
    {
      label: "Delivered",
      description:
        "Completed orders",
      value: "DELIVERED",
      dotClassName:
        "bg-emerald-500",
    },
    {
      label: "Cancelled",
      description:
        "Cancelled orders",
      value: "CANCELLED",
      dotClassName:
        "bg-red-500",
    },
  ];

const paymentStatusOptions:
  AdminFilterOption<PaymentStatusFilter>[] =
  [
    {
      label: "All payments",
      description:
        "Every payment state",
      value: "",
      dotClassName:
        "bg-neutral-300",
    },
    {
      label: "Paid",
      description:
        "Verified payments",
      value: "PAID",
      dotClassName:
        "bg-emerald-500",
    },
    {
      label: "Pending",
      description:
        "Awaiting payment",
      value: "PENDING",
      dotClassName:
        "bg-amber-500",
    },
    {
      label: "Failed",
      description:
        "Failed transactions",
      value: "FAILED",
      dotClassName:
        "bg-red-500",
    },
    {
      label: "Refunded",
      description:
        "Returned payments",
      value: "REFUNDED",
      dotClassName:
        "bg-blue-500",
    },
  ];

const initialPagination:
  AdminOrderPagination = {
    page: 1,
    limit: PAGE_LIMIT,
    totalOrders: 0,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  };

export default function AdminOrdersPage() {
  const router =
    useRouter();

  const {
    clearAdmin,
  } = useAdminContext();

  const [
    orders,
    setOrders,
  ] = useState<AdminOrder[]>(
    []
  );

  const [
    pagination,
    setPagination,
  ] =
    useState<AdminOrderPagination>(
      initialPagination
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
    useState<OrderStatusFilter>(
      ""
    );

  const [
    paymentStatus,
    setPaymentStatus,
  ] =
    useState<PaymentStatusFilter>(
      ""
    );

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

  useEffect(() => {
    const timeout =
      window.setTimeout(
        () => {
          setSearch(
            searchInput.trim()
          );

          setPage(1);
        },
        400
      );

    return () =>
      window.clearTimeout(
        timeout
      );
  }, [searchInput]);

  const loadOrders =
    useCallback(
      async (
        refresh = false
      ) => {
        try {
          refresh
            ? setRefreshing(
                true
              )
            : setLoading(
                true
              );

          setError("");

          const response =
            await getAdminOrders({
              page,
              limit:
                PAGE_LIMIT,

              search:
                search ||
                undefined,

              status:
                status ||
                undefined,

              paymentStatus:
                paymentStatus ||
                undefined,
            });

          setOrders(
            response.orders
          );

          setPagination(
            response.pagination
          );
        } catch (
          requestError
        ) {
          if (
            axios.isAxiosError(
              requestError
            )
          ) {
            if (
              requestError.response
                ?.status === 401
            ) {
              clearAdmin();

              router.replace(
                "/login"
              );

              return;
            }

            const message =
              requestError.response
                ?.data?.message;

            setError(
              typeof message ===
                "string"
                ? message
                : "Unable to load orders."
            );
          } else {
            setError(
              "Unable to load orders."
            );
          }
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [
        clearAdmin,
        page,
        paymentStatus,
        router,
        search,
        status,
      ]
    );

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const clearFilters =
    () => {
      setSearchInput("");
      setSearch("");
      setStatus("");
      setPaymentStatus("");
      setPage(1);
    };

  const hasFilters =
    Boolean(
      search ||
        status ||
        paymentStatus
    );

  return (
    <div className="mx-auto w-full max-w-[1500px]">
      <section className="relative overflow-hidden rounded-[32px] bg-[#080d19] px-6 py-8 text-white shadow-[0_22px_70px_rgba(8,13,25,0.16)] sm:px-8 lg:px-10">
        <div
          aria-hidden="true"
          className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl"
        />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Marketplace operations
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
              Orders
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
              Monitor customer
              purchases, payments and
              multi-seller fulfilment
              across the marketplace.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.05] px-5 py-3">
            <p className="text-2xl font-semibold">
              {
                pagination.totalOrders
              }
            </p>

            <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-slate-500">
              Matching orders
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 overflow-hidden rounded-[28px] border border-black/[0.06] bg-white shadow-[0_12px_40px_rgba(15,23,42,0.035)]">
        <div className="flex flex-col gap-3 border-b border-black/[0.06] p-5 xl:flex-row xl:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-neutral-400" />

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
              placeholder="Search order, customer, payment or coupon..."
              className="min-h-12 w-full rounded-2xl border border-black/[0.08] bg-neutral-50 pl-11 pr-4 text-sm outline-none focus:border-black/30 focus:bg-white focus:ring-4 focus:ring-black/[0.03]"
            />
          </div>

          <AdminFilterDropdown
            value={status}
            label="Order status"
            options={
              orderStatusOptions
            }
            onChange={(
              value
            ) => {
              setStatus(value);
              setPage(1);
            }}
          />

          <AdminFilterDropdown
            value={
              paymentStatus
            }
            label="Payment status"
            options={
              paymentStatusOptions
            }
            onChange={(
              value
            ) => {
              setPaymentStatus(
                value
              );
              setPage(1);
            }}
          />

          {hasFilters && (
            <button
              type="button"
              onClick={
                clearFilters
              }
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-black/[0.08] px-4 text-sm font-semibold text-neutral-600 hover:bg-neutral-100"
            >
              <X className="h-4 w-4" />
              Clear
            </button>
          )}

          <button
            type="button"
            onClick={() =>
              void loadOrders(
                true
              )
            }
            disabled={
              refreshing
            }
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#080d19] px-5 text-sm font-semibold text-white disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing
                  ? "animate-spin"
                  : ""
              }`}
            />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mx-5 mt-5 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:mx-6">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[450px] items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-neutral-500" />
          </div>
        ) : orders.length ===
          0 ? (
          <div className="flex min-h-[450px] flex-col items-center justify-center text-center">
            <ReceiptText className="h-8 w-8 text-neutral-300" />

            <h2 className="mt-4 text-lg font-semibold">
              No orders found
            </h2>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px]">
              <thead>
                <tr className="border-b border-black/[0.06] bg-neutral-50/80 text-left">
                  <Heading>
                    Order
                  </Heading>
                  <Heading>
                    Customer
                  </Heading>
                  <Heading>
                    Status
                  </Heading>
                  <Heading>
                    Payment
                  </Heading>
                  <Heading>
                    Total
                  </Heading>
                  <Heading>
                    Date
                  </Heading>
                  <Heading alignRight>
                    Action
                  </Heading>
                </tr>
              </thead>

              <tbody>
                {orders.map(
                  (order) => (
                    <tr
                      key={
                        order.id
                      }
                      className="border-b border-black/[0.05] last:border-0 hover:bg-neutral-50/70"
                    >
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-neutral-950">
                          #
                          {order.id.slice(
                            -8
                          )}
                        </p>

                        <div className="mt-2 flex gap-3 text-[10px] text-neutral-400">
                          <span className="flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            {
                              order.itemCount
                            }{" "}
                            items
                          </span>

                          <span className="flex items-center gap-1">
                            <Store className="h-3 w-3" />
                            {
                              order.sellerCount
                            }{" "}
                            sellers
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <UserRound className="h-4 w-4 text-neutral-400" />

                          <div>
                            <p className="max-w-[180px] truncate text-sm font-medium text-neutral-800">
                              {
                                order.customerName
                              }
                            </p>

                            <p className="mt-1 max-w-[180px] truncate text-[10px] text-neutral-400">
                              {
                                order.customerEmail
                              }
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge
                          value={
                            order.status
                          }
                        />
                      </td>

                      <td className="px-6 py-4">
                        <PaymentBadge
                          value={
                            order.paymentStatus
                          }
                        />

                        <p className="mt-1.5 flex items-center gap-1 text-[10px] text-neutral-400">
                          <CreditCard className="h-3 w-3" />
                          {order.paymentProvider ||
                            "Not assigned"}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-sm font-semibold text-neutral-950">
                        {formatINR(
                          order.totalAmount
                        )}
                      </td>

                      <td className="px-6 py-4 text-xs text-neutral-500">
                        {formatDate(
                          order.createdAt
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            router.push(
                              `/dashboard/orders/${order.id}`
                            )
                          }
                          className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-black/[0.08] px-4 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-100"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}

        {!loading &&
          pagination.totalPages >
            1 && (
            <div className="flex items-center justify-between border-t border-black/[0.06] px-6 py-5">
              <p className="text-xs text-neutral-500">
                Page{" "}
                {
                  pagination.page
                }{" "}
                of{" "}
                {
                  pagination.totalPages
                }
              </p>

              <div className="flex gap-2">
                <PageButton
                  disabled={
                    !pagination.hasPreviousPage
                  }
                  onClick={() =>
                    setPage(
                      (current) =>
                        Math.max(
                          current -
                            1,
                          1
                        )
                    )
                  }
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </PageButton>

                <PageButton
                  disabled={
                    !pagination.hasNextPage
                  }
                  onClick={() =>
                    setPage(
                      (current) =>
                        current +
                        1
                    )
                  }
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </PageButton>
              </div>
            </div>
          )}
      </section>
    </div>
  );
}

function Heading({
  children,
  alignRight = false,
}: {
  children:
    React.ReactNode;
  alignRight?: boolean;
}) {
  return (
    <th
      className={`px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400 ${
        alignRight
          ? "text-right"
          : ""
      }`}
    >
      {children}
    </th>
  );
}

function StatusBadge({
  value,
}: {
  value: OrderStatus;
}) {
  const classes = {
    PENDING_PAYMENT:
      "bg-amber-50 text-amber-700",
    CONFIRMED:
      "bg-cyan-50 text-cyan-700",
    PROCESSING:
      "bg-violet-50 text-violet-700",
    SHIPPED:
      "bg-blue-50 text-blue-700",
    DELIVERED:
      "bg-emerald-50 text-emerald-700",
    CANCELLED:
      "bg-red-50 text-red-700",
  }[value];

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${classes}`}
    >
      {formatStatus(value)}
    </span>
  );
}

function PaymentBadge({
  value,
}: {
  value: PaymentStatus;
}) {
  const classes = {
    PENDING:
      "bg-amber-50 text-amber-700",
    PAID:
      "bg-emerald-50 text-emerald-700",
    FAILED:
      "bg-red-50 text-red-700",
    REFUNDED:
      "bg-blue-50 text-blue-700",
  }[value];

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${classes}`}
    >
      {formatStatus(value)}
    </span>
  );
}

function PageButton({
  children,
  disabled,
  onClick,
}: {
  children:
    React.ReactNode;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex h-10 items-center gap-1 rounded-xl border border-black/[0.08] px-3 text-sm font-medium text-neutral-700 hover:bg-neutral-100 disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function formatStatus(
  value: string
) {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase()
    );
}

function formatINR(
  value: number
) {
  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }
  ).format(value);
}

function formatDate(
  value: string
) {
  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(
    new Date(value)
  );
}