"use client";

import axios from "axios";

import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Loader2,
  RefreshCw,
  Search,
  Store,
  TicketPercent,
  Trash2,
  Users,
  X,
  Zap,
} from "lucide-react";

import { useCallback, useEffect, useState } from "react";

import {
  deleteAdminCoupon,
  getAdminCoupons,
  getAdminCouponSummary,
  updateAdminCouponStatus,
} from "@/services/coupon.service";

import {
  AdminCoupon,
  AdminCouponPagination,
  AdminCouponState,
  AdminCouponSummary,
  CouponDiscountType,
} from "@/types/coupon";

const PAGE_LIMIT = 10;

const EMPTY_SUMMARY: AdminCouponSummary = {
  totalCoupons: 0,
  activeCoupons: 0,
  inactiveCoupons: 0,
  expiredCoupons: 0,
  exhaustedCoupons: 0,
  totalRedemptions: 0,
};

const EMPTY_PAGINATION: AdminCouponPagination = {
  page: 1,
  limit: PAGE_LIMIT,
  total: 0,
  pages: 0,
};

const STATE_OPTIONS: Array<{
  label: string;
  value: "" | AdminCouponState;
}> = [
  {
    label: "All coupon states",
    value: "",
  },
  {
    label: "Active",
    value: "ACTIVE",
  },
  {
    label: "Inactive",
    value: "INACTIVE",
  },
  {
    label: "Expired",
    value: "EXPIRED",
  },
  {
    label: "Exhausted",
    value: "EXHAUSTED",
  },
];

const TYPE_OPTIONS: Array<{
  label: string;
  value: "" | CouponDiscountType;
}> = [
  {
    label: "All discount types",
    value: "",
  },
  {
    label: "Percentage",
    value: "PERCENTAGE",
  },
  {
    label: "Fixed amount",
    value: "FIXED",
  },
];

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);

  const [summary, setSummary] = useState<AdminCouponSummary>(EMPTY_SUMMARY);

  const [pagination, setPagination] =
    useState<AdminCouponPagination>(EMPTY_PAGINATION);

  const [page, setPage] = useState(1);

  const [searchInput, setSearchInput] = useState("");

  const [search, setSearch] = useState("");

  const [state, setState] = useState<"" | AdminCouponState>("");

  const [discountType, setDiscountType] = useState<"" | CouponDiscountType>("");

  const [loading, setLoading] = useState(true);

  const [summaryLoading, setSummaryLoading] = useState(true);

  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<AdminCoupon | null>(null);

  const loadSummary = useCallback(async () => {
    try {
      setSummaryLoading(true);

      const response = await getAdminCouponSummary();

      setSummary(response.summary);
    } catch (requestError) {
      console.error("Failed to load coupon summary:", requestError);
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  const loadCoupons = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAdminCoupons({
        page,
        limit: PAGE_LIMIT,
        search: search || undefined,
        state: state || undefined,
        discountType: discountType || undefined,
      });

      setCoupons(response.coupons);
      setPagination(response.pagination);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to load coupons."));
    } finally {
      setLoading(false);
    }
  }, [page, search, state, discountType]);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    void loadCoupons();
  }, [loadCoupons]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  const refreshData = async () => {
    await Promise.all([loadCoupons(), loadSummary()]);
  };

  const handleStatusChange = async (coupon: AdminCoupon) => {
    try {
      setUpdatingId(coupon.id);
      setError("");
      setSuccess("");

      await updateAdminCouponStatus(coupon.id, !coupon.isActive);

      setSuccess(
        coupon.isActive
          ? `${coupon.code} was deactivated.`
          : `${coupon.code} was activated.`,
      );

      await refreshData();
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to update coupon."));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      setUpdatingId(deleteTarget.id);
      setError("");
      setSuccess("");

      await deleteAdminCoupon(deleteTarget.id);

      setSuccess(`${deleteTarget.code} was deleted permanently.`);

      setDeleteTarget(null);

      if (coupons.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await refreshData();
      }
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to delete coupon."));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <>
      <div className="space-y-7">
        <section className="overflow-hidden rounded-[30px] border border-black/[0.06] bg-white shadow-[0_18px_60px_rgba(15,23,42,0.05)]">
          <div className="flex flex-col gap-5 px-6 py-7 sm:px-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
                Marketplace promotions
              </p>

              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-[36px]">
                Coupon management
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
                Monitor seller promotions, coupon redemptions and campaign
                availability across the marketplace.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void refreshData()}
              disabled={loading || summaryLoading}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-black/[0.09] px-5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  loading || summaryLoading ? "animate-spin" : ""
                }`}
              />
              Refresh data
            </button>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <SummaryCard
            label="Total coupons"
            value={summary.totalCoupons}
            icon={<TicketPercent />}
            loading={summaryLoading}
          />

          <SummaryCard
            label="Active"
            value={summary.activeCoupons}
            icon={<Zap />}
            loading={summaryLoading}
            tone="emerald"
          />

          <SummaryCard
            label="Inactive"
            value={summary.inactiveCoupons}
            icon={<Clock3 />}
            loading={summaryLoading}
          />

          <SummaryCard
            label="Expired"
            value={summary.expiredCoupons}
            icon={<AlertCircle />}
            loading={summaryLoading}
            tone="red"
          />

          <SummaryCard
            label="Redemptions"
            value={summary.totalRedemptions}
            icon={<Users />}
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
          <div className="flex flex-col gap-4 border-b border-black/[0.06] px-6 py-5">
            <div>
              <h2 className="text-lg font-semibold text-neutral-950">
                Marketplace coupons
              </h2>

              <p className="mt-1 text-xs text-neutral-500">
                {pagination.total} coupon records
              </p>
            </div>

            <div className="flex flex-col gap-3 xl:flex-row">
              <div className="relative xl:flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />

                <input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search coupon, seller, email or shop..."
                  className="min-h-11 w-full rounded-2xl border border-black/[0.08] bg-neutral-50 pl-11 pr-4 text-sm outline-none transition focus:border-black/30 focus:bg-white"
                />
              </div>

              <FilterDropdown
                value={state}
                options={STATE_OPTIONS}
                onChange={(value) => {
                  setState(value as "" | AdminCouponState);
                  setPage(1);
                }}
              />

              <FilterDropdown
                value={discountType}
                options={TYPE_OPTIONS}
                onChange={(value) => {
                  setDiscountType(value as "" | CouponDiscountType);
                  setPage(1);
                }}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px]">
              <thead>
                <tr className="border-b border-black/[0.06] bg-neutral-50/80 text-left">
                  {[
                    "Coupon",
                    "Seller",
                    "Discount",
                    "Conditions",
                    "Usage",
                    "Expiry",
                    "Status",
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
                ) : coupons.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-20 text-center">
                      <TicketPercent className="mx-auto h-9 w-9 text-neutral-300" />

                      <p className="mt-4 font-semibold text-neutral-900">
                        No coupons found
                      </p>

                      <p className="mt-1 text-sm text-neutral-500">
                        Try changing your search or filters.
                      </p>
                    </td>
                  </tr>
                ) : (
                  coupons.map((coupon) => (
                    <CouponRow
                      key={coupon.id}
                      coupon={coupon}
                      updating={updatingId === coupon.id}
                      onStatusChange={() => void handleStatusChange(coupon)}
                      onDelete={() => setDeleteTarget(coupon)}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-4 border-t border-black/[0.06] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-neutral-500">
              Page {pagination.page} of {Math.max(pagination.pages, 1)}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => setPage((current) => Math.max(current - 1, 1))}
                className="flex h-10 items-center gap-2 rounded-xl border border-black/[0.08] px-4 text-sm font-semibold text-neutral-700 disabled:opacity-40"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </button>

              <button
                type="button"
                disabled={
                  page >= pagination.pages || pagination.pages === 0 || loading
                }
                onClick={() => setPage((current) => current + 1)}
                className="flex h-10 items-center gap-2 rounded-xl bg-neutral-950 px-4 text-sm font-semibold text-white disabled:opacity-40"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      </div>

      {deleteTarget && (
        <DeleteCouponModal
          coupon={deleteTarget}
          deleting={updatingId === deleteTarget.id}
          onClose={() => {
            if (!updatingId) {
              setDeleteTarget(null);
            }
          }}
          onConfirm={() => void handleDelete()}
        />
      )}
    </>
  );
}

function CouponRow({
  coupon,
  updating,
  onStatusChange,
  onDelete,
}: {
  coupon: AdminCoupon;
  updating: boolean;
  onStatusChange: () => void;
  onDelete: () => void;
}) {
  const canActivate = coupon.state === "INACTIVE";

  const canDeactivate = coupon.state === "ACTIVE";

  return (
    <tr className="border-b border-black/[0.05] last:border-b-0 hover:bg-neutral-50/70">
      <td className="px-6 py-5">
        <div>
          <span className="inline-flex rounded-lg bg-neutral-950 px-2.5 py-1 font-mono text-xs font-semibold tracking-wider text-white">
            {coupon.code}
          </span>

          <p className="mt-2 max-w-[180px] truncate text-xs text-neutral-400">
            {coupon.description || "No description"}
          </p>
        </div>
      </td>

      <td className="px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100">
            <Store className="h-4 w-4 text-neutral-600" />
          </div>

          <div>
            <p className="max-w-[160px] truncate text-sm font-semibold text-neutral-900">
              {coupon.seller.shopName || coupon.seller.name}
            </p>

            <p className="mt-0.5 max-w-[170px] truncate text-[11px] text-neutral-400">
              {coupon.seller.email}
            </p>
          </div>
        </div>
      </td>

      <td className="px-6 py-5">
        <p className="text-sm font-semibold text-neutral-950">
          {coupon.discountType === "PERCENTAGE"
            ? `${coupon.discountValue}%`
            : formatINR(coupon.discountValue)}
        </p>

        <p className="mt-1 text-[11px] text-neutral-400">
          {coupon.discountType === "PERCENTAGE" ? "Percentage" : "Fixed amount"}
        </p>
      </td>

      <td className="px-6 py-5 text-xs text-neutral-500">
        <p>
          Minimum:{" "}
          <span className="font-semibold text-neutral-800">
            {coupon.minimumOrderValue !== null
              ? formatINR(coupon.minimumOrderValue)
              : "None"}
          </span>
        </p>

        <p className="mt-1">
          Maximum:{" "}
          <span className="font-semibold text-neutral-800">
            {coupon.maximumDiscount !== null
              ? formatINR(coupon.maximumDiscount)
              : "None"}
          </span>
        </p>
      </td>

      <td className="px-6 py-5">
        <p className="text-sm font-semibold text-neutral-900">
          {coupon.usedCount}
          <span className="font-normal text-neutral-400">
            {" "}
            / {coupon.usageLimit ?? "Unlimited"}
          </span>
        </p>

        {coupon.usageLimit !== null && (
          <div className="mt-2 h-1.5 w-24 overflow-hidden rounded-full bg-neutral-100">
            <div
              className="h-full rounded-full bg-neutral-950"
              style={{
                width: `${Math.min(
                  (coupon.usedCount / Math.max(coupon.usageLimit, 1)) * 100,
                  100,
                )}%`,
              }}
            />
          </div>
        )}
      </td>

      <td className="px-6 py-5 text-xs font-medium text-neutral-600">
        {formatDate(coupon.expiryDate)}
      </td>

      <td className="px-6 py-5">
        <CouponStatusBadge state={coupon.state} />
      </td>

      <td className="px-6 py-5">
        {updating ? (
          <Loader2 className="h-4 w-4 animate-spin text-neutral-500" />
        ) : (
          <div className="flex gap-2">
            {(canActivate || canDeactivate) && (
              <button
                type="button"
                onClick={onStatusChange}
                className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                  canActivate
                    ? "bg-neutral-950 text-white hover:bg-neutral-800"
                    : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                }`}
              >
                {canActivate ? "Activate" : "Deactivate"}
              </button>
            )}

            <button
              type="button"
              onClick={onDelete}
              aria-label={`Delete ${coupon.code}`}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600 transition hover:bg-red-100"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}

function CouponStatusBadge({ state }: { state: AdminCouponState }) {
  const styles: Record<AdminCouponState, string> = {
    ACTIVE: "bg-emerald-50 text-emerald-700",
    INACTIVE: "bg-neutral-100 text-neutral-600",
    EXPIRED: "bg-red-50 text-red-700",
    EXHAUSTED: "bg-amber-50 text-amber-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${styles[state]}`}
    >
      {formatStatus(state)}
    </span>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  loading,
  tone = "dark",
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  loading: boolean;
  tone?: "dark" | "emerald" | "red";
}) {
  const iconStyle = {
    dark: "bg-neutral-950 text-white",
    emerald: "bg-emerald-50 text-emerald-700",
    red: "bg-red-50 text-red-700",
  }[tone];

  return (
    <article className="rounded-[24px] border border-black/[0.06] bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.04)]">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-2xl [&>svg]:h-4 [&>svg]:w-4 ${iconStyle}`}
      >
        {icon}
      </div>

      <p className="mt-4 text-xs text-neutral-500">{label}</p>

      {loading ? (
        <div className="mt-2 h-7 w-16 animate-pulse rounded bg-neutral-200" />
      ) : (
        <p className="mt-1 text-2xl font-semibold tracking-tight text-neutral-950">
          {value}
        </p>
      )}
    </article>
  );
}

function FilterDropdown({
  value,
  options,
  onChange,
}: {
  value: string;
  options: Array<{
    label: string;
    value: string;
  }>;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const label =
    options.find((option) => option.value === value)?.label || options[0].label;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex min-h-11 w-full min-w-[190px] items-center justify-between gap-4 rounded-2xl border border-black/[0.08] bg-white px-4 text-sm font-semibold text-neutral-700"
      >
        {label}

        <ChevronDown
          className={`h-4 w-4 text-neutral-400 transition ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close filter"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />

          <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-full min-w-[220px] rounded-2xl border border-black/[0.07] bg-white p-1.5 shadow-[0_18px_50px_rgba(0,0,0,0.13)]">
            {options.map((option) => (
              <button
                key={option.value || "ALL"}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition ${
                  value === option.value
                    ? "bg-neutral-950 font-semibold text-white"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950"
                }`}
              >
                {option.label}

                {value === option.value && <Check className="h-4 w-4" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function DeleteCouponModal({
  coupon,
  deleting,
  onClose,
  onConfirm,
}: {
  coupon: AdminCoupon;
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close delete modal"
        onClick={onClose}
        className="absolute inset-0 bg-neutral-950/50 backdrop-blur-sm"
      />

      <div className="relative w-full max-w-md rounded-[28px] bg-white p-7 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          disabled={deleting}
          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50">
          <Trash2 className="h-5 w-5 text-red-600" />
        </div>

        <h2 className="mt-5 text-xl font-semibold text-neutral-950">
          Delete coupon?
        </h2>

        <p className="mt-2 text-sm leading-6 text-neutral-500">
          Coupon{" "}
          <span className="font-semibold text-neutral-900">{coupon.code}</span>{" "}
          will be permanently removed. Existing order snapshots will remain
          unchanged.
        </p>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="min-h-11 flex-1 rounded-full border border-black/[0.09] text-sm font-semibold"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-red-600 text-sm font-semibold text-white disabled:opacity-50"
          >
            {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
            Delete permanently
          </button>
        </div>
      </div>
    </div>
  );
}

function LoadingRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, row) => (
        <tr key={row} className="border-b border-black/[0.05]">
          {Array.from({ length: 8 }).map((__, column) => (
            <td key={column} className="px-6 py-5">
              <div className="h-4 animate-pulse rounded bg-neutral-200" />
            </td>
          ))}
        </tr>
      ))}
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function formatStatus(value: string) {
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
