"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowRight,
  CalendarDays,
 
  Heart,
  Mail,
  Package,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  UserRound,
} from "lucide-react";

import {
  useAuthContext,
} from "@/context/AuthContext";

import {
  getUserOrders,
} from "@/services/order.service";

import type {
  UserOrderSummary,
} from "@/types/order";

// ======================================================
// PROFILE PAGE
// ======================================================

export default function ProfilePage() {
  const {
    user,
    loading: authLoading,
  } = useAuthContext();

  const [recentOrders, setRecentOrders] =
    useState<UserOrderSummary[]>([]);

  const [totalOrders, setTotalOrders] =
    useState(0);

  const [ordersLoading, setOrdersLoading] =
    useState(true);

  const [ordersError, setOrdersError] =
    useState(false);

  // ====================================================
  // USER DISPLAY DATA
  // ====================================================

  const firstName =
    user?.name
      ?.trim()
      .split(" ")[0] ||
    "there";

  const initials = useMemo(() => {
    if (!user?.name) {
      return "U";
    }

    return (
      user.name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) =>
          part
            .charAt(0)
            .toUpperCase()
        )
        .join("") || "U"
    );
  }, [user?.name]);

  // ====================================================
  // LOAD RECENT PAID ORDERS
  // ====================================================

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      setRecentOrders([]);
      setTotalOrders(0);
      setOrdersLoading(false);
      return;
    }

    let active = true;

    const loadRecentOrders =
      async () => {
        try {
          setOrdersLoading(true);
          setOrdersError(false);

          const response =
            await getUserOrders({
              page: 1,
              limit: 3,
              paymentStatus:
                "PAID",
            });

          if (!active) {
            return;
          }

          setRecentOrders(
            response.orders || []
          );

          setTotalOrders(
            response.pagination
              ?.totalOrders || 0
          );
        } catch (error) {
          console.error(
            "Failed to load profile orders:",
            error
          );

          if (!active) {
            return;
          }

          setRecentOrders([]);
          setTotalOrders(0);
          setOrdersError(true);
        } finally {
          if (active) {
            setOrdersLoading(false);
          }
        }
      };

    void loadRecentOrders();

    return () => {
      active = false;
    };
  }, [authLoading, user]);

  // ====================================================
  // AUTH LOADING
  // ====================================================

  if (authLoading) {
    return <ProfileSkeleton />;
  }

  // ====================================================
  // NOT AUTHENTICATED
  // ====================================================

  if (!user) {
    return <SignedOutState />;
  }

  return (
    <div className="min-w-0 space-y-8">
      {/* WELCOME */}

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.7fr)]">
        <article className="relative overflow-hidden rounded-[30px] border border-black/[0.06] bg-white px-6 py-8 shadow-[0_12px_40px_rgba(0,0,0,0.025)] sm:px-8 sm:py-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
          >
            <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#ead7dc]/70 blur-3xl" />

            <div className="absolute -bottom-32 right-1/3 h-56 w-56 rounded-full bg-[#dce5df]/60 blur-3xl" />
          </div>

          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-neutral-950 text-lg font-semibold text-white">
              {initials}
            </div>

            <p className="mt-7 text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
              Account overview
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-neutral-950 sm:text-4xl">
              Welcome back,{" "}
              {firstName}.
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-7 text-neutral-500">
              Your orders, saved products,
              and account information are
              ready whenever you need them.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/profile/orders"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-neutral-950 px-6 text-sm font-semibold text-white transition hover:bg-neutral-800"
              >
                View my orders

                <ArrowRight
                  className="h-4 w-4"
                  strokeWidth={1.8}
                />
              </Link>

              <Link
                href="/wishlist"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-black/[0.09] bg-white px-6 text-sm font-semibold text-neutral-800 transition hover:bg-[#f7f5f1]"
              >
                <Heart
                  className="h-4 w-4"
                  strokeWidth={1.8}
                />

                My wishlist
              </Link>
            </div>
          </div>
        </article>

        {/* ACCOUNT IDENTITY */}

        <article className="rounded-[30px] border border-black/[0.06] bg-[#d9e1e6] p-6 sm:p-8">
          <div className="flex h-full min-h-[250px] flex-col justify-between">
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-[15px] bg-white/70 text-neutral-700">
                <UserRound
                  className="h-5 w-5"
                  strokeWidth={1.7}
                />
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.07] bg-white/60 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-600">
                <ShieldCheck
                  className="h-3.5 w-3.5"
                  strokeWidth={1.8}
                />

                Customer
              </span>
            </div>

            <div className="mt-10">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
                Signed in as
              </p>

              <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-neutral-950">
                {user.name}
              </h3>

              <p className="mt-2 break-all text-sm text-neutral-600">
                {user.email}
              </p>
            </div>
          </div>
        </article>
      </section>

      {/* QUICK INFORMATION */}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <QuickCard
          icon={
            <Package
              className="h-5 w-5"
              strokeWidth={1.7}
            />
          }
          label="Paid orders"
          value={
            ordersLoading
              ? "—"
              : String(totalOrders)
          }
          description="Completed purchases in your account"
          background="bg-[#ead7dc]"
          href="/profile/orders"
        />

        <QuickCard
          icon={
            <Heart
              className="h-5 w-5"
              strokeWidth={1.7}
            />
          }
          label="Saved items"
          value="Wishlist"
          description="Return to products you loved"
          background="bg-[#dce5df]"
          href="/wishlist"
        />

        <QuickCard
          icon={
            <Sparkles
              className="h-5 w-5"
              strokeWidth={1.7}
            />
          }
          label="Discover"
          value="New arrivals"
          description="Explore the latest Eshop collection"
          background="bg-[#e7ddd0]"
          href="/products"
        />
      </section>

      {/* ACCOUNT AND RECENT ORDERS */}

      <section className="grid items-start gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        {/* ACCOUNT DETAILS */}

        <article className="rounded-[30px] border border-black/[0.06] bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.025)]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[15px] bg-[#eee7dd] text-neutral-700">
              <UserRound
                className="h-5 w-5"
                strokeWidth={1.7}
              />
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-neutral-400">
                Personal
              </p>

              <h2 className="mt-1 text-lg font-semibold text-neutral-950">
                Account information
              </h2>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <InformationRow
              icon={
                <UserRound
                  className="h-4 w-4"
                  strokeWidth={1.7}
                />
              }
              label="Full name"
              value={user.name}
            />

            <InformationRow
              icon={
                <Mail
                  className="h-4 w-4"
                  strokeWidth={1.7}
                />
              }
              label="Email address"
              value={user.email}
            />

            <InformationRow
              icon={
                <ShieldCheck
                  className="h-4 w-4"
                  strokeWidth={1.7}
                />
              }
              label="Account status"
              value="Active"
              positive
            />
          </div>

          <p className="mt-5 text-xs leading-5 text-neutral-400">
            Your contact and delivery
            information is securely saved
            with each individual order.
          </p>
        </article>

        {/* RECENT ORDERS */}

        <article className="overflow-hidden rounded-[30px] border border-black/[0.06] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.025)]">
          <div className="flex items-center justify-between gap-4 border-b border-black/[0.06] px-6 py-5 sm:px-7">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-neutral-400">
                Purchases
              </p>

              <h2 className="mt-1 text-lg font-semibold text-neutral-950">
                Recent orders
              </h2>
            </div>

            <Link
              href="/profile/orders"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 transition hover:text-neutral-950"
            >
              View all

              <ArrowRight
                className="h-3.5 w-3.5"
                strokeWidth={1.8}
              />
            </Link>
          </div>

          <div className="px-6 py-2 sm:px-7">
            {ordersLoading ? (
              <RecentOrdersSkeleton />
            ) : ordersError ? (
              <div className="flex min-h-[220px] flex-col items-center justify-center py-8 text-center">
                <Package
                  className="h-6 w-6 text-neutral-300"
                  strokeWidth={1.7}
                />

                <p className="mt-3 text-sm font-semibold text-neutral-700">
                  Unable to load recent orders
                </p>

                <Link
                  href="/profile/orders"
                  className="mt-4 text-xs font-semibold text-neutral-950 underline underline-offset-4"
                >
                  Open order history
                </Link>
              </div>
            ) : recentOrders.length === 0 ? (
              <EmptyRecentOrders />
            ) : (
              <div className="divide-y divide-black/[0.06]">
                {recentOrders.map(
                  (order) => (
                    <RecentOrderRow
                      key={order.id}
                      order={order}
                    />
                  )
                )}
              </div>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}

// ======================================================
// QUICK CARD
// ======================================================

function QuickCard({
  icon,
  label,
  value,
  description,
  background,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
  background: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className={`group rounded-[26px] border border-black/[0.05] p-5 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(0,0,0,0.05)] sm:p-6 ${background}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-white/70 text-neutral-700">
          {icon}
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/70 text-neutral-700 transition group-hover:translate-x-0.5">
          <ArrowRight
            className="h-4 w-4"
            strokeWidth={1.8}
          />
        </div>
      </div>

      <p className="mt-7 text-[10px] font-semibold uppercase tracking-[0.17em] text-neutral-500">
        {label}
      </p>

      <p className="mt-2 text-xl font-semibold tracking-[-0.035em] text-neutral-950">
        {value}
      </p>

      <p className="mt-2 text-xs leading-5 text-neutral-600">
        {description}
      </p>
    </Link>
  );
}

// ======================================================
// INFORMATION ROW
// ======================================================

function InformationRow({
  icon,
  label,
  value,
  positive = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-[18px] bg-[#f7f5f1] p-4">
      <div className="flex items-center gap-2 text-neutral-400">
        {icon}

        <p className="text-[10px] font-semibold uppercase tracking-[0.14em]">
          {label}
        </p>
      </div>

      <p
        className={`mt-2 break-words text-sm font-semibold ${
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
// RECENT ORDER ROW
// ======================================================

function RecentOrderRow({
  order,
}: {
  order: UserOrderSummary;
}) {
  return (
    <Link
      href={`/profile/orders/${encodeURIComponent(order.id)}`}
      className="group flex flex-col gap-4 py-5 transition sm:flex-row sm:items-center"
    >
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-[#f1eee9] text-neutral-600">
          <ShoppingBag
            className="h-5 w-5"
            strokeWidth={1.7}
          />
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-neutral-950">
            #
            {getShortOrderId(
              order.id
            )}
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-400">
            <span>
              {order.totalQuantity}{" "}
              {order.totalQuantity === 1
                ? "item"
                : "items"}
            </span>

            <span className="inline-flex items-center gap-1">
              <CalendarDays
                className="h-3 w-3"
                strokeWidth={1.7}
              />

              {formatDate(
                order.createdAt
              )}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-5 pl-15 sm:pl-0">
        <div className="text-left sm:text-right">
          <p className="text-sm font-semibold text-neutral-950">
            {formatCurrency(
              order.totalAmount
            )}
          </p>

          <p
            className={`mt-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${
              order.status ===
              "DELIVERED"
                ? "text-emerald-700"
                : "text-neutral-500"
            }`}
          >
            {formatStatus(
              order.status
            )}
          </p>
        </div>

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/[0.07] text-neutral-500 transition group-hover:bg-neutral-950 group-hover:text-white">
          <ArrowRight
            className="h-3.5 w-3.5"
            strokeWidth={1.8}
          />
        </div>
      </div>
    </Link>
  );
}

// ======================================================
// EMPTY RECENT ORDERS
// ======================================================

function EmptyRecentOrders() {
  return (
    <div className="flex min-h-[250px] flex-col items-center justify-center py-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-[#ead7dc] text-neutral-700">
        <ShoppingBag
          className="h-6 w-6"
          strokeWidth={1.7}
        />
      </div>

      <h3 className="mt-4 text-base font-semibold text-neutral-950">
        No purchases yet
      </h3>

      <p className="mt-2 max-w-xs text-sm leading-6 text-neutral-500">
        Your recently completed orders
        will appear here.
      </p>

      <Link
        href="/products"
        className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-full bg-neutral-950 px-5 text-xs font-semibold text-white transition hover:bg-neutral-800"
      >
        Start shopping

        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

// ======================================================
// SIGNED OUT STATE
// ======================================================

function SignedOutState() {
  return (
    <div className="flex min-h-[440px] flex-col items-center justify-center rounded-[32px] border border-black/[0.06] bg-white px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#ead7dc] text-neutral-700">
        <UserRound
          className="h-7 w-7"
          strokeWidth={1.7}
        />
      </div>

      <h2 className="mt-6 text-2xl font-semibold tracking-[-0.04em] text-neutral-950">
        Sign in to your account
      </h2>

      <p className="mt-3 max-w-sm text-sm leading-6 text-neutral-500">
        Sign in to view your purchases,
        saved products, and account details.
      </p>

      <Link
        href="/login"
        className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-full bg-neutral-950 px-7 text-sm font-semibold text-white transition hover:bg-neutral-800"
      >
        Sign in

        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

// ======================================================
// SKELETONS
// ======================================================

function ProfileSkeleton() {
  return (
    <div className="min-w-0 animate-pulse space-y-8">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.7fr)]">
        <div className="h-[350px] rounded-[30px] bg-white" />
        <div className="h-[350px] rounded-[30px] bg-neutral-200" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map(
          (item) => (
            <div
              key={item}
              className="h-[190px] rounded-[26px] bg-neutral-200"
            />
          )
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <div className="h-[380px] rounded-[30px] bg-white" />
        <div className="h-[380px] rounded-[30px] bg-white" />
      </div>
    </div>
  );
}

function RecentOrdersSkeleton() {
  return (
    <div className="divide-y divide-black/[0.05]">
      {[1, 2, 3].map(
        (item) => (
          <div
            key={item}
            className="flex items-center gap-4 py-5"
          >
            <div className="h-11 w-11 animate-pulse rounded-[15px] bg-neutral-100" />

            <div className="flex-1">
              <div className="h-4 w-32 animate-pulse rounded-full bg-neutral-100" />
              <div className="mt-2 h-3 w-44 animate-pulse rounded-full bg-neutral-100" />
            </div>

            <div className="h-9 w-20 animate-pulse rounded-full bg-neutral-100" />
          </div>
        )
      )}
    </div>
  );
}

// ======================================================
// FORMATTERS
// ======================================================

function getShortOrderId(
  orderId: string
): string {
  return orderId
    .slice(-8)
    .toUpperCase();
}

function formatStatus(
  status: string
): string {
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase()
    );
}

function formatDate(
  value: string
): string {
  const date = new Date(value);

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