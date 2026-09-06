"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  FileText,
  Loader2,
  Package,
  Plus,
  XCircle,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  getRecentSellerProducts,
  getSellerDashboardStats,
} from "@/services/dashboard.service";

import {
  DashboardProduct,
  SellerDashboardStats,
} from "@/types/dashboard";

import { formatINR } from "@/utils/currency";

export default function DashboardPage() {
  const router = useRouter();

  const [stats, setStats] =
    useState<SellerDashboardStats | null>(
      null
    );

  const [products, setProducts] =
    useState<DashboardProduct[]>([]);

  const [loading, setLoading] =
    useState(true);

  /* ============================================================
     LOAD DASHBOARD
  ============================================================ */

  useEffect(() => {
    const loadDashboard =
      async () => {
        try {
          setLoading(true);

          const [
            statsResponse,
            productsResponse,
          ] =
            await Promise.all([
              getSellerDashboardStats(),
              getRecentSellerProducts(),
            ]);

          setStats(
            statsResponse.stats
          );

          setProducts(
            productsResponse
          );
        } catch (
          error: any
        ) {
          console.error(
            "Dashboard loading error:",
            error
          );

          toast.error(
            error?.response?.data
              ?.message ||
              "Failed to load dashboard"
          );
        } finally {
          setLoading(false);
        }
      };

    void loadDashboard();
  }, []);

  /* ============================================================
     LOADING
  ============================================================ */

  if (loading) {
    return (
      <div className="flex min-h-[520px] items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-black/[0.06] bg-white shadow-sm">
            <Loader2 className="h-5 w-5 animate-spin text-neutral-700" />
          </div>

          <p className="mt-4 text-sm font-medium text-neutral-500">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ========================================================
          PAGE HEADER
      ======================================================== */}

      <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
            Store overview
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-[34px]">
            Seller Dashboard
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500">
            Track your products,
            inventory status and recent
            store activity.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            router.push(
              "/dashboard/products/create"
            )
          }
          className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-full bg-[#0b1220] px-5 text-sm font-semibold text-white transition hover:bg-[#172033] sm:self-auto"
        >
          <Plus className="h-4 w-4" />

          Add product
        </button>
      </section>

      {/* ========================================================
          STATS
      ======================================================== */}

      <section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <StatCard
            title="Total products"
            value={
              stats?.totalProducts ??
              0
            }
            description="Products in your store"
            icon={Package}
            variant="default"
          />

          <StatCard
            title="Published"
            value={
              stats?.publishedProducts ??
              0
            }
            description="Visible to customers"
            icon={CheckCircle2}
            variant="success"
          />

          <StatCard
            title="Draft products"
            value={
              stats?.draftProducts ??
              0
            }
            description="Waiting to publish"
            icon={FileText}
            variant="muted"
          />

          <StatCard
            title="Low stock"
            value={
              stats?.lowStockProducts ??
              0
            }
            description="Need attention"
            icon={AlertTriangle}
            variant="warning"
          />

          <StatCard
            title="Out of stock"
            value={
              stats?.outOfStockProducts ??
              0
            }
            description="Currently unavailable"
            icon={XCircle}
            variant="danger"
          />
        </div>
      </section>

      {/* ========================================================
          RECENT PRODUCTS
      ======================================================== */}

      <section className="overflow-hidden rounded-[26px] border border-black/[0.06] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.035)]">
        {/* Header */}

        <div className="flex items-center justify-between gap-4 border-b border-black/[0.06] px-5 py-5 sm:px-6">
          <div>
            <h2 className="text-base font-semibold tracking-[-0.02em] text-neutral-950">
              Recent products
            </h2>

            <p className="mt-1 text-xs text-neutral-500">
              Your latest product
              activity
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/dashboard/products"
              )
            }
            className="group inline-flex items-center gap-2 text-sm font-semibold text-neutral-700 transition hover:text-neutral-950"
          >
            View all

            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* ======================================================
            EMPTY STATE
        ====================================================== */}

        {products.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100">
              <Package className="h-6 w-6 text-neutral-400" />
            </div>

            <h3 className="mt-5 text-sm font-semibold text-neutral-950">
              No products yet
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-neutral-500">
              Start building your
              catalog by adding your
              first product.
            </p>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/dashboard/products/create"
                )
              }
              className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[#0b1220] px-5 text-sm font-semibold text-white transition hover:bg-[#172033]"
            >
              <Plus className="h-4 w-4" />

              Create product
            </button>
          </div>
        ) : (
          /* ====================================================
             PRODUCT LIST
          ==================================================== */

          <div className="divide-y divide-black/[0.05]">
            {products.map(
              (product) => {
                const hasDiscount =
                  product.discountPrice !=
                    null &&
                  product.discountPrice >=
                    0 &&
                  product.discountPrice <
                    product.price;

                return (
                  <div
                    key={product.id}
                    className="group flex items-center gap-4 px-5 py-4 transition hover:bg-neutral-50 sm:px-6"
                  >
                    {/* ==========================================
                        PRODUCT
                    ========================================== */}

                    <div className="flex min-w-0 flex-1 items-center gap-4">
                      {/* Image */}

                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-black/[0.05] bg-neutral-100">
                        {product
                          .images
                          ?.length >
                        0 ? (
                          <img
                            src={
                              product
                                .images[0]
                                .url
                            }
                            alt={
                              product.title
                            }
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Package className="h-5 w-5 text-neutral-300" />
                          </div>
                        )}
                      </div>

                      {/* Information */}

                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-neutral-950">
                          {
                            product.title
                          }
                        </h3>

                        <p className="mt-1 truncate text-xs text-neutral-500">
                          {
                            product.category
                          }
                        </p>

                        {/* Mobile Information */}

                        <div className="mt-2 flex flex-wrap items-center gap-2 sm:hidden">
                          <span className="text-xs font-semibold text-neutral-800">
                            {formatINR(
                              hasDiscount
                                ? product.discountPrice
                                : product.price
                            )}
                          </span>

                          <ProductStatusBadge
                            status={
                              product.status
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* ==========================================
                        PRICE
                    ========================================== */}

                    <div className="hidden min-w-[120px] sm:block">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
                        Price
                      </p>

                      {hasDiscount ? (
                        <>
                          <p className="mt-1 text-sm font-semibold text-neutral-950">
                            {formatINR(
                              product.discountPrice
                            )}
                          </p>

                          <p className="mt-0.5 text-xs text-neutral-400 line-through">
                            {formatINR(
                              product.price
                            )}
                          </p>
                        </>
                      ) : (
                        <p className="mt-1 text-sm font-semibold text-neutral-950">
                          {formatINR(
                            product.price
                          )}
                        </p>
                      )}
                    </div>

                    {/* ==========================================
                        STOCK
                    ========================================== */}

                    <div className="hidden min-w-[80px] md:block">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
                        Stock
                      </p>

                      <div className="mt-1 flex items-center gap-2">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            product.stock ===
                            0
                              ? "bg-red-500"
                              : product.stock <=
                                  10
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                          }`}
                        />

                        <p
                          className={`text-sm font-semibold ${
                            product.stock ===
                            0
                              ? "text-red-600"
                              : product.stock <=
                                  10
                                ? "text-amber-600"
                                : "text-neutral-800"
                          }`}
                        >
                          {
                            product.stock
                          }
                        </p>
                      </div>
                    </div>

                    {/* ==========================================
                        STATUS
                    ========================================== */}

                    <div className="hidden min-w-[110px] justify-end sm:flex">
                      <ProductStatusBadge
                        status={
                          product.status
                        }
                      />
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </section>

      {/* ========================================================
          INVENTORY HEALTH
      ======================================================== */}

      <section>
        <div className="mb-4">
          <h2 className="text-base font-semibold tracking-[-0.02em] text-neutral-950">
            Inventory health
          </h2>

          <p className="mt-1 text-xs text-neutral-500">
            Products that may require
            restocking.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <InventoryCard
            title="Low stock"
            description="Products approaching low inventory"
            value={
              stats?.lowStockProducts ??
              0
            }
            icon={AlertTriangle}
            variant="warning"
            actionLabel="Review inventory"
            onClick={() =>
              router.push(
                "/dashboard/products"
              )
            }
          />

          <InventoryCard
            title="Out of stock"
            description="Products currently unavailable"
            value={
              stats?.outOfStockProducts ??
              0
            }
            icon={XCircle}
            variant="danger"
            actionLabel="View products"
            onClick={() =>
              router.push(
                "/dashboard/products"
              )
            }
          />
        </div>
      </section>
    </div>
  );
}

/* ============================================================
   STAT CARD
============================================================ */

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  variant,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ElementType;
  variant:
    | "default"
    | "success"
    | "muted"
    | "warning"
    | "danger";
}) {
  const styles = {
    default: {
      icon:
        "bg-neutral-100 text-neutral-800",
      value:
        "text-neutral-950",
    },

    success: {
      icon:
        "bg-emerald-50 text-emerald-600",
      value:
        "text-neutral-950",
    },

    muted: {
      icon:
        "bg-slate-100 text-slate-600",
      value:
        "text-neutral-950",
    },

    warning: {
      icon:
        "bg-amber-50 text-amber-600",
      value:
        "text-amber-700",
    },

    danger: {
      icon:
        "bg-red-50 text-red-600",
      value:
        "text-red-700",
    },
  };

  return (
    <div className="group rounded-[24px] border border-black/[0.06] bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.025)] transition duration-200 hover:-translate-y-0.5 hover:border-black/[0.1] hover:shadow-[0_14px_40px_rgba(0,0,0,0.05)]">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${styles[variant].icon}`}
      >
        <Icon
          className="h-[18px] w-[18px]"
          strokeWidth={1.8}
        />
      </div>

      <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
        {title}
      </p>

      <p
        className={`mt-2 text-[30px] font-semibold tracking-[-0.04em] ${styles[variant].value}`}
      >
        {value}
      </p>

      <p className="mt-1 text-xs leading-5 text-neutral-500">
        {description}
      </p>
    </div>
  );
}

/* ============================================================
   PRODUCT STATUS BADGE
============================================================ */

function ProductStatusBadge({
  status,
}: {
  status: string;
}) {
  const normalizedStatus =
    status?.toUpperCase();

  if (
    normalizedStatus ===
    "PUBLISHED"
  ) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

        Published
      </span>
    );
  }

  if (
    normalizedStatus ===
    "OUT_OF_STOCK"
  ) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-semibold text-red-700">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />

        Out of stock
      </span>
    );
  }

  if (
    normalizedStatus ===
    "ARCHIVED"
  ) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-semibold text-neutral-600">
        <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />

        Archived
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-700">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />

      Draft
    </span>
  );
}

/* ============================================================
   INVENTORY CARD
============================================================ */

function InventoryCard({
  title,
  description,
  value,
  icon: Icon,
  variant,
  actionLabel,
  onClick,
}: {
  title: string;
  description: string;
  value: number;
  icon: React.ElementType;
  variant:
    | "warning"
    | "danger";
  actionLabel: string;
  onClick: () => void;
}) {
  const styles = {
    warning: {
      container:
        "border-amber-200/70 bg-amber-50/50",
      icon:
        "bg-amber-100 text-amber-700",
      value:
        "text-amber-800",
    },

    danger: {
      container:
        "border-red-200/70 bg-red-50/50",
      icon:
        "bg-red-100 text-red-700",
      value:
        "text-red-800",
    },
  };

  return (
    <div
      className={`rounded-[24px] border p-5 sm:p-6 ${styles[variant].container}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${styles[variant].icon}`}
          >
            <Icon
              className="h-5 w-5"
              strokeWidth={1.8}
            />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-neutral-950">
              {title}
            </h3>

            <p className="mt-1 text-xs leading-5 text-neutral-500">
              {description}
            </p>
          </div>
        </div>

        <p
          className={`text-3xl font-semibold tracking-[-0.04em] ${styles[variant].value}`}
        >
          {value}
        </p>
      </div>

      <div className="mt-5 border-t border-black/[0.05] pt-4">
        <button
          type="button"
          onClick={onClick}
          className="group inline-flex items-center gap-2 text-xs font-semibold text-neutral-700 transition hover:text-neutral-950"
        >
          {actionLabel}

          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}