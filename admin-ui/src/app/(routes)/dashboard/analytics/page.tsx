"use client";

import axios from "axios";

import {
  ArrowDownRight,
  ArrowUpRight,
  BadgeIndianRupee,
  CalendarDays,
  IndianRupee,
  Loader2,
  Package,
  ReceiptText,
  RefreshCw,
  Store,
  TrendingUp,
  Users,
  WalletCards,
} from "lucide-react";

import { useCallback, useEffect, useState } from "react";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getAdminAnalytics } from "@/services/analytics.service";

import {
  AdminAnalyticsResponse,
  AnalyticsDistributionItem,
  AnalyticsRange,
} from "@/types/analytics";

const RANGE_OPTIONS: Array<{
  label: string;
  value: AnalyticsRange;
}> = [
  {
    label: "7 days",
    value: "7D",
  },
  {
    label: "30 days",
    value: "30D",
  },
  {
    label: "90 days",
    value: "90D",
  },
  {
    label: "1 year",
    value: "1Y",
  },
];

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState<AnalyticsRange>("30D");

  const [analytics, setAnalytics] = useState<AdminAnalyticsResponse | null>(
    null,
  );

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAdminAnalytics(range);

      setAnalytics(response);
    } catch (requestError) {
      console.error("Failed to load analytics:", requestError);

      setError(
        getErrorMessage(requestError, "Unable to load marketplace analytics."),
      );
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    void loadAnalytics();
  }, [loadAnalytics]);

  return (
    <div className="space-y-7">
      <section className="overflow-hidden rounded-[30px] border border-black/[0.06] bg-white shadow-[0_18px_60px_rgba(15,23,42,0.05)]">
        <div className="flex flex-col gap-6 px-6 py-7 sm:px-8 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
              Marketplace intelligence
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-[36px]">
              Analytics
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
              Track marketplace revenue, growth, operations and seller
              performance from one unified view.
            </p>

            {analytics && (
              <div className="mt-4 inline-flex items-center gap-2 text-xs text-neutral-400">
                <CalendarDays className="h-3.5 w-3.5" />

                {formatDate(analytics.period.startDate)}
                {" – "}
                {formatDate(analytics.period.endDate)}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex rounded-2xl border border-black/[0.07] bg-neutral-50 p-1">
              {RANGE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setRange(option.value)}
                  className={`rounded-xl px-3 py-2 text-xs font-semibold transition sm:px-4 ${
                    range === option.value
                      ? "bg-neutral-950 text-white shadow-sm"
                      : "text-neutral-500 hover:text-neutral-950"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => void loadAnalytics()}
              disabled={loading}
              aria-label="Refresh analytics"
              className="flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-black/[0.08] px-4 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && !analytics ? (
        <AnalyticsSkeleton />
      ) : analytics ? (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Paid revenue"
              value={formatINR(analytics.overview.revenue)}
              change={analytics.overview.revenueChange}
              icon={<IndianRupee />}
            />

            <MetricCard
              label="Platform fees"
              value={formatINR(analytics.overview.platformFees)}
              change={analytics.overview.platformFeeChange}
              icon={<BadgeIndianRupee />}
            />

            <MetricCard
              label="Orders"
              value={String(analytics.overview.orders)}
              change={analytics.overview.orderChange}
              icon={<ReceiptText />}
            />

            <MetricCard
              label="Average order value"
              value={formatINR(analytics.overview.averageOrderValue)}
              icon={<TrendingUp />}
            />
          </section>

          <section className="grid gap-4 sm:grid-cols-3">
            <CompactMetric
              label="Seller earnings"
              value={formatINR(analytics.overview.sellerEarnings)}
              icon={<WalletCards />}
            />

            <CompactMetric
              label="New customers"
              value={String(analytics.overview.newUsers)}
              change={analytics.overview.userChange}
              icon={<Users />}
            />

            <CompactMetric
              label="New sellers"
              value={String(analytics.overview.newSellers)}
              change={analytics.overview.sellerChange}
              icon={<Store />}
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(340px,0.75fr)]">
            <ChartCard
              eyebrow="Financial performance"
              title="Revenue trend"
              description="Paid order revenue and marketplace fees"
            >
              <ResponsiveContainer width="100%" height={330}>
                <AreaChart
                  data={analytics.trend}
                  margin={{
                    top: 12,
                    right: 12,
                    left: -12,
                    bottom: 0,
                  }}
                >
                  <defs>
                    <linearGradient
                      id="revenueGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#111827"
                        stopOpacity={0.24}
                      />
                      <stop offset="95%" stopColor="#111827" stopOpacity={0} />
                    </linearGradient>

                    <linearGradient
                      id="feeGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="4 4"
                    vertical={false}
                    stroke="#e5e7eb"
                  />

                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "#9ca3af",
                      fontSize: 11,
                    }}
                    minTickGap={24}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "#9ca3af",
                      fontSize: 11,
                    }}
                    tickFormatter={compactCurrency}
                  />

                  <Tooltip content={<RevenueTooltip />} />

                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#111827"
                    strokeWidth={2.5}
                    fill="url(#revenueGradient)"
                  />

                  <Area
                    type="monotone"
                    dataKey="platformFees"
                    name="Platform fees"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#feeGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              eyebrow="Marketplace activity"
              title="Order volume"
              description="Orders created during the selected period"
            >
              <ResponsiveContainer width="100%" height={330}>
                <BarChart
                  data={analytics.trend}
                  margin={{
                    top: 12,
                    right: 4,
                    left: -28,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="4 4"
                    vertical={false}
                    stroke="#e5e7eb"
                  />

                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "#9ca3af",
                      fontSize: 10,
                    }}
                    minTickGap={22}
                  />

                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "#9ca3af",
                      fontSize: 11,
                    }}
                  />

                  <Tooltip
                    cursor={{
                      fill: "rgba(17,24,39,0.04)",
                    }}
                    content={<OrderTooltip />}
                  />

                  <Bar
                    dataKey="orders"
                    fill="#111827"
                    radius={[8, 8, 2, 2]}
                    maxBarSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </section>

          <section className="grid gap-6 xl:grid-cols-3">
            <DistributionCard
              title="Products"
              icon={<Package />}
              items={analytics.distributions.products}
            />

            <DistributionCard
              title="Orders"
              icon={<ReceiptText />}
              items={analytics.distributions.orders}
            />

            <DistributionCard
              title="Settlements"
              icon={<WalletCards />}
              items={analytics.distributions.settlements}
            />
          </section>

          <section className="overflow-hidden rounded-[30px] border border-black/[0.06] bg-white shadow-[0_18px_60px_rgba(15,23,42,0.05)]">
            <div className="border-b border-black/[0.06] px-6 py-5 sm:px-7">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                Seller performance
              </p>

              <h2 className="mt-1 text-xl font-semibold tracking-tight text-neutral-950">
                Top-performing shops
              </h2>
            </div>

            {analytics.topShops.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <Store className="mx-auto h-8 w-8 text-neutral-300" />

                <p className="mt-3 text-sm font-semibold text-neutral-800">
                  No seller activity in this period
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px]">
                  <thead>
                    <tr className="border-b border-black/[0.06] bg-neutral-50/70 text-left">
                      {[
                        "Shop",
                        "Settlements",
                        "Gross value",
                        "Platform fees",
                        "Seller earnings",
                      ].map((heading) => (
                        <th
                          key={heading}
                          className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {analytics.topShops.map((shop, index) => (
                      <tr
                        key={shop.sellerId}
                        className="border-b border-black/[0.05] last:border-0 hover:bg-neutral-50/70"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-950 text-xs font-semibold text-white">
                              {index + 1}
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-neutral-950">
                                {shop.shopName || shop.sellerName}
                              </p>

                              {shop.shopName && (
                                <p className="mt-0.5 text-xs text-neutral-400">
                                  {shop.sellerName}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5 text-sm font-semibold text-neutral-700">
                          {shop.orderCount}
                        </td>

                        <td className="px-6 py-5 text-sm font-semibold text-neutral-950">
                          {formatINR(shop.grossAmount)}
                        </td>

                        <td className="px-6 py-5 text-sm font-semibold text-emerald-700">
                          {formatINR(shop.platformFees)}
                        </td>

                        <td className="px-6 py-5 text-sm font-semibold text-neutral-950">
                          {formatINR(shop.sellerEarnings)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}

function MetricCard({
  label,
  value,
  change,
  icon,
}: {
  label: string;
  value: string;
  change?: number;
  icon: React.ReactNode;
}) {
  return (
    <article className="rounded-[26px] border border-black/[0.06] bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-950 text-white [&>svg]:h-5 [&>svg]:w-5">
          {icon}
        </div>

        {change !== undefined && <ChangeBadge value={change} />}
      </div>

      <p className="mt-5 text-xs font-medium text-neutral-500">{label}</p>

      <p className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-neutral-950">
        {value}
      </p>
    </article>
  );
}

function CompactMetric({
  label,
  value,
  change,
  icon,
}: {
  label: string;
  value: string;
  change?: number;
  icon: React.ReactNode;
}) {
  return (
    <article className="flex items-center gap-4 rounded-[24px] border border-black/[0.06] bg-white p-5">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-700 [&>svg]:h-5 [&>svg]:w-5">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs text-neutral-500">{label}</p>

        <p className="mt-1 text-lg font-semibold text-neutral-950">{value}</p>
      </div>

      {change !== undefined && (
        <div className="ml-auto">
          <ChangeBadge value={change} />
        </div>
      )}
    </article>
  );
}

function ChangeBadge({ value }: { value: number }) {
  const positive = value >= 0;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
        positive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
      }`}
    >
      {positive ? (
        <ArrowUpRight className="h-3 w-3" />
      ) : (
        <ArrowDownRight className="h-3 w-3" />
      )}
      {Math.abs(value)}%
    </span>
  );
}

function ChartCard({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="min-w-0 rounded-[30px] border border-black/[0.06] bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.05)] sm:p-7">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
        {eyebrow}
      </p>

      <h2 className="mt-1 text-xl font-semibold tracking-tight text-neutral-950">
        {title}
      </h2>

      <p className="mt-1 text-xs text-neutral-500">{description}</p>

      <div className="mt-7 min-w-0">{children}</div>
    </section>
  );
}

function DistributionCard({
  title,
  icon,
  items,
}: {
  title: string;
  icon: React.ReactNode;
  items: AnalyticsDistributionItem[];
}) {
  const total = items.reduce((sum, item) => sum + item.value, 0);

  return (
    <article className="rounded-[28px] border border-black/[0.06] bg-white p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-700 [&>svg]:h-4 [&>svg]:w-4">
          {icon}
        </div>

        <div>
          <p className="font-semibold text-neutral-950">{title}</p>

          <p className="text-xs text-neutral-400">{total} total records</p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {items.map((item) => {
          const percentage = total > 0 ? (item.value / total) * 100 : 0;

          return (
            <div key={item.label}>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-medium text-neutral-600">
                  {formatLabel(item.label)}
                </span>

                <span className="text-xs font-semibold text-neutral-950">
                  {item.value}
                </span>
              </div>

              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                <div
                  className="h-full rounded-full bg-neutral-950"
                  style={{
                    width: `${percentage}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}

interface TooltipPayloadItem {
  name?: string;
  value?: number;
  payload?: {
    label?: string;
    revenue?: number;
    platformFees?: number;
    orders?: number;
  };
}

function RevenueTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0].payload;

  return (
    <div className="rounded-2xl border border-black/[0.07] bg-white p-4 shadow-xl">
      <p className="text-xs font-semibold text-neutral-950">{point?.label}</p>

      <p className="mt-2 text-xs text-neutral-500">
        Revenue:{" "}
        <span className="font-semibold text-neutral-950">
          {formatINR(point?.revenue || 0)}
        </span>
      </p>

      <p className="mt-1 text-xs text-neutral-500">
        Fees:{" "}
        <span className="font-semibold text-emerald-700">
          {formatINR(point?.platformFees || 0)}
        </span>
      </p>
    </div>
  );
}

function OrderTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0].payload;

  return (
    <div className="rounded-2xl border border-black/[0.07] bg-white px-4 py-3 shadow-xl">
      <p className="text-xs font-semibold text-neutral-950">{point?.label}</p>

      <p className="mt-1 text-xs text-neutral-500">
        {point?.orders || 0} orders
      </p>
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({
          length: 4,
        }).map((_, index) => (
          <div
            key={index}
            className="h-40 animate-pulse rounded-[26px] bg-neutral-200"
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="h-[430px] animate-pulse rounded-[30px] bg-neutral-200" />
        <div className="h-[430px] animate-pulse rounded-[30px] bg-neutral-200" />
      </div>

      <div className="flex items-center justify-center py-4 text-neutral-400">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading analytics
      </div>
    </div>
  );
}

function formatINR(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

function compactCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;

    if (typeof message === "string") {
      return message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}
