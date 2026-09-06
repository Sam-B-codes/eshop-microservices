"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import axios from "axios";

import {
  AlertTriangle,
  ArrowUpRight,
  BadgeIndianRupee,
  Boxes,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Package,
  ReceiptText,
  RefreshCw,
  Store,
  TrendingUp,
  Users,
  WalletCards,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  useAdminContext,
} from "@/context/AdminContext";

import {
  getAdminDashboard,
} from "@/services/admin-dashboard.service";

import {
  AdminDashboardResponse,
} from "@/types/admin-dashboard";

export default function AdminDashboardPage() {
  const router =
    useRouter();

  const {
    admin,
    clearAdmin,
  } = useAdminContext();

  const [
    dashboard,
    setDashboard,
  ] =
    useState<AdminDashboardResponse | null>(
      null
    );

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

  const loadDashboard =
    useCallback(
      async (
        refresh = false
      ) => {
        try {
          if (refresh) {
            setRefreshing(true);
          } else {
            setLoading(true);
          }

          setError("");

          const response =
            await getAdminDashboard();

          setDashboard(response);
        } catch (error) {
          console.error(
            "Failed to load Admin dashboard:",
            error
          );

          if (
            axios.isAxiosError(
              error
            )
          ) {
            if (
              error.response
                ?.status === 401
            ) {
              clearAdmin();

              router.replace(
                "/login"
              );

              return;
            }

            const message =
              error.response
                ?.data?.message;

            setError(
              typeof message ===
                "string"
                ? message
                : "Unable to load dashboard statistics."
            );
          } else {
            setError(
              "Unable to load dashboard statistics."
            );
          }
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [
        clearAdmin,
        router,
      ]
    );

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  if (loading) {
    return (
      <DashboardSkeleton />
    );
  }

  if (
    error ||
    !dashboard
  ) {
    return (
      <DashboardError
        message={
          error ||
          "Dashboard information is unavailable."
        }
        onRetry={() =>
          void loadDashboard()
        }
      />
    );
  }

  const {
    summary,
    recentOrders,
  } = dashboard;

  const firstName =
    admin?.name
      .trim()
      .split(/\s+/)[0] ||
    "Admin";

  const mainMetrics = [
    {
      label:
        "Registered users",
      value:
        formatNumber(
          summary.users.total
        ),
      note:
        "Customer accounts",
      icon: Users,
      iconClasses:
        "bg-blue-50 text-blue-700",
    },
    {
      label:
        "Marketplace sellers",
      value:
        formatNumber(
          summary.sellers.total
        ),
      note:
        `${summary.sellers.onboarded} onboarded`,
      icon: Store,
      iconClasses:
        "bg-violet-50 text-violet-700",
    },
    {
      label:
        "Catalog products",
      value:
        formatNumber(
          summary.products.total
        ),
      note:
        `${summary.products.published} published`,
      icon: Package,
      iconClasses:
        "bg-amber-50 text-amber-700",
    },
    {
      label:
        "Platform revenue",
      value:
        formatINR(
          summary.revenue
            .platformFees
        ),
      note:
        "Collected platform fees",
      icon:
        BadgeIndianRupee,
      iconClasses:
        "bg-emerald-50 text-emerald-700",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-[1500px]">
      <section className="relative overflow-hidden rounded-[32px] bg-[#080d19] px-6 py-8 text-white shadow-[0_22px_70px_rgba(8,13,25,0.16)] sm:px-8 sm:py-10 lg:px-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <div className="absolute -right-20 -top-36 h-80 w-80 rounded-full bg-indigo-500/15 blur-3xl" />

          <div className="absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px]" />
        </div>

        <div className="relative flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Platform overview
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
              Welcome back,{" "}
              {firstName}.
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              Monitor marketplace
              performance, seller
              operations and platform
              revenue from one secure
              workspace.
            </p>

            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.05] px-3.5 py-2 text-xs text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Live marketplace data connected
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              void loadDashboard(
                true
              )
            }
            disabled={
              refreshing
            }
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.06] px-5 text-sm font-semibold text-white transition hover:bg-white/[0.1] disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing
                  ? "animate-spin"
                  : ""
              }`}
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh data"}
          </button>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {mainMetrics.map(
          (metric) => {
            const Icon =
              metric.icon;

            return (
              <article
                key={
                  metric.label
                }
                className="rounded-[26px] border border-black/[0.06] bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.035)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl ${metric.iconClasses}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <ArrowUpRight className="h-4 w-4 text-neutral-300" />
                </div>

                <p className="mt-6 text-3xl font-semibold tracking-[-0.04em] text-neutral-950">
                  {metric.value}
                </p>

                <p className="mt-2 text-sm font-semibold text-neutral-800">
                  {metric.label}
                </p>

                <p className="mt-1 text-xs text-neutral-400">
                  {metric.note}
                </p>
              </article>
            );
          }
        )}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
        <article className="overflow-hidden rounded-[28px] border border-black/[0.06] bg-white shadow-[0_12px_40px_rgba(15,23,42,0.035)]">
          <div className="flex items-center justify-between gap-4 border-b border-black/[0.06] px-6 py-6 sm:px-7">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
                Marketplace activity
              </p>

              <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em] text-neutral-950">
                Recent orders
              </h2>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-700">
              <ReceiptText className="h-5 w-5" />
            </div>
          </div>

          {recentOrders.length ===
          0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
              <ReceiptText className="h-7 w-7 text-neutral-300" />

              <p className="mt-4 text-sm font-semibold text-neutral-800">
                No orders available
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead>
                  <tr className="border-b border-black/[0.06] bg-neutral-50/80 text-left">
                    <TableHeading>
                      Order
                    </TableHeading>

                    <TableHeading>
                      Customer
                    </TableHeading>

                    <TableHeading>
                      Status
                    </TableHeading>

                    <TableHeading>
                      Total
                    </TableHeading>

                    <TableHeading>
                      Date
                    </TableHeading>
                  </tr>
                </thead>

                <tbody>
                  {recentOrders.map(
                    (order) => (
                      <tr
                        key={
                          order.id
                        }
                        className="border-b border-black/[0.05] last:border-0 hover:bg-neutral-50/70"
                      >
                        <td className="px-6 py-4">
                          <p className="max-w-[130px] truncate text-sm font-semibold text-neutral-950">
                            #
                            {order.id.slice(
                              -8
                            )}
                          </p>

                          <p className="mt-1 text-[11px] text-neutral-400">
                            {order.itemCount}{" "}
                            {order.itemCount ===
                            1
                              ? "item"
                              : "items"}
                            {" · "}
                            {order.sellerCount}{" "}
                            {order.sellerCount ===
                            1
                              ? "seller"
                              : "sellers"}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <p className="max-w-[170px] truncate text-sm font-medium text-neutral-800">
                            {
                              order.customerName
                            }
                          </p>

                          <p className="mt-1 max-w-[170px] truncate text-[11px] text-neutral-400">
                            {
                              order.customerEmail
                            }
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <StatusBadge
                            value={
                              order.status
                            }
                          />

                          <p className="mt-1.5 text-[10px] font-medium text-neutral-400">
                            Payment:{" "}
                            {formatStatus(
                              order.paymentStatus
                            )}
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
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </article>

        <div className="space-y-6">
          <article className="rounded-[28px] border border-black/[0.06] bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.035)] sm:p-7">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
                  Financial overview
                </p>

                <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em] text-neutral-950">
                  Revenue
                </h2>
              </div>

              <CircleDollarSign className="h-6 w-6 text-emerald-600" />
            </div>

            <div className="mt-7 space-y-4">
              <MetricRow
                icon={TrendingUp}
                label="Paid order revenue"
                value={formatINR(
                  summary.revenue
                    .grossOrderRevenue
                )}
              />

              <MetricRow
                icon={WalletCards}
                label="Seller earnings"
                value={formatINR(
                  summary.revenue
                    .sellerEarnings
                )}
              />

              <MetricRow
                icon={CreditCard}
                label="Platform fees"
                value={formatINR(
                  summary.revenue
                    .platformFees
                )}
                highlight
              />

              <MetricRow
                icon={BadgeIndianRupee}
                label="Seller discounts"
                value={formatINR(
                  summary.revenue
                    .totalDiscounts
                )}
              />
            </div>
          </article>

          <article className="rounded-[28px] border border-black/[0.06] bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.035)] sm:p-7">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
                Inventory health
              </p>

              <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em] text-neutral-950">
                Product status
              </h2>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <MiniStat
                label="Published"
                value={
                  summary.products
                    .published
                }
                icon={
                  CheckCircle2
                }
                classes="bg-emerald-50 text-emerald-700"
              />

              <MiniStat
                label="Drafts"
                value={
                  summary.products
                    .draft
                }
                icon={Boxes}
                classes="bg-blue-50 text-blue-700"
              />

              <MiniStat
                label="Low stock"
                value={
                  summary.products
                    .lowStock
                }
                icon={
                  AlertTriangle
                }
                classes="bg-amber-50 text-amber-700"
              />

              <MiniStat
                label="Out of stock"
                value={
                  summary.products
                    .outOfStock
                }
                icon={Clock3}
                classes="bg-red-50 text-red-700"
              />
            </div>
          </article>

          <article className="rounded-[28px] border border-black/[0.06] bg-[#080d19] p-6 text-white shadow-[0_18px_55px_rgba(8,13,25,0.14)] sm:p-7">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Settlements
            </p>

            <div className="mt-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-3xl font-semibold tracking-[-0.04em]">
                  {
                    summary.settlements
                      .total
                  }
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Total transactions
                </p>
              </div>

              <WalletCards className="h-7 w-7 text-slate-500" />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <DarkMiniStat
                label="Pending"
                value={
                  summary.settlements
                    .pending
                }
              />

              <DarkMiniStat
                label="Settled"
                value={
                  summary.settlements
                    .settled
                }
              />

              <DarkMiniStat
                label="Processing"
                value={
                  summary.settlements
                    .processing
                }
              />

              <DarkMiniStat
                label="Failed"
                value={
                  summary.settlements
                    .failed
                }
              />
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}

function TableHeading({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <th className="px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
      {children}
    </th>
  );
}

function MetricRow({
  icon: Icon,
  label,
  value,
  highlight = false,
}: {
  icon:
    React.ComponentType<{
      className?: string;
    }>;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600">
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs text-neutral-400">
          {label}
        </p>

        <p
          className={`mt-0.5 truncate text-sm font-semibold ${
            highlight
              ? "text-emerald-700"
              : "text-neutral-950"
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  icon: Icon,
  classes,
}: {
  label: string;
  value: number;
  icon:
    React.ComponentType<{
      className?: string;
    }>;
  classes: string;
}) {
  return (
    <div className="rounded-2xl border border-black/[0.05] p-4">
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-xl ${classes}`}
      >
        <Icon className="h-4 w-4" />
      </div>

      <p className="mt-4 text-xl font-semibold text-neutral-950">
        {formatNumber(value)}
      </p>

      <p className="mt-1 text-[11px] text-neutral-400">
        {label}
      </p>
    </div>
  );
}

function DarkMiniStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.04] p-3.5">
      <p className="text-lg font-semibold text-white">
        {formatNumber(value)}
      </p>

      <p className="mt-1 text-[10px] text-slate-500">
        {label}
      </p>
    </div>
  );
}

function StatusBadge({
  value,
}: {
  value: string;
}) {
  const classes =
    getStatusClasses(
      value
    );

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${classes}`}
    >
      {formatStatus(value)}
    </span>
  );
}

function getStatusClasses(
  status: string
) {
  switch (status) {
    case "DELIVERED":
      return "bg-emerald-50 text-emerald-700";

    case "SHIPPED":
      return "bg-blue-50 text-blue-700";

    case "PROCESSING":
      return "bg-violet-50 text-violet-700";

    case "CONFIRMED":
      return "bg-cyan-50 text-cyan-700";

    case "CANCELLED":
      return "bg-red-50 text-red-700";

    default:
      return "bg-amber-50 text-amber-700";
  }
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

function formatNumber(
  value: number
) {
  return new Intl.NumberFormat(
    "en-IN"
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

function DashboardError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex min-h-[520px] flex-col items-center justify-center rounded-[30px] border border-red-100 bg-white px-6 text-center shadow-sm">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
        <AlertTriangle className="h-6 w-6" />
      </div>

      <h1 className="mt-5 text-xl font-semibold text-neutral-950">
        Unable to load dashboard
      </h1>

      <p className="mt-2 max-w-md text-sm leading-6 text-neutral-500">
        {message}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#080d19] px-6 text-sm font-semibold text-white"
      >
        <RefreshCw className="h-4 w-4" />
        Try again
      </button>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1500px] animate-pulse">
      <div className="h-[250px] rounded-[32px] bg-neutral-300" />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({
          length: 4,
        }).map(
          (_, index) => (
            <div
              key={index}
              className="h-[210px] rounded-[26px] bg-white"
            />
          )
        )}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
        <div className="h-[520px] rounded-[28px] bg-white" />

        <div className="h-[520px] rounded-[28px] bg-white" />
      </div>
    </div>
  );
}