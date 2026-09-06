"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import axios from "axios";

import {
  AlertTriangle,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Loader2,
  Package,
  RefreshCw,
  Search,
  ShieldCheck,
  ShieldOff,
  Store,
  TicketPercent,
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
  getAdminSellers,
  updateAdminSellerStatus,
} from "@/services/admin-seller.service";

import {
  AdminSeller,
  AdminSellerPagination,
  SellerOnboardingFilter,
  SellerStatus,
} from "@/types/admin-seller";

const PAGE_LIMIT = 10;

type StatusFilter =
  | ""
  | SellerStatus;

type OnboardingFilter =
  | ""
  | SellerOnboardingFilter;

const statusOptions:
  AdminFilterOption<StatusFilter>[] =
  [
    {
      label: "All statuses",
      description:
        "Every seller account",
      value: "",
      dotClassName:
        "bg-neutral-300",
    },
    {
      label: "Active",
      description:
        "Sellers with access",
      value: "ACTIVE",
      dotClassName:
        "bg-emerald-500",
    },
    {
      label: "Suspended",
      description:
        "Restricted sellers",
      value: "SUSPENDED",
      dotClassName:
        "bg-red-500",
    },
  ];

const onboardingOptions:
  AdminFilterOption<OnboardingFilter>[] =
  [
    {
      label: "All onboarding",
      description:
        "Every setup stage",
      value: "",
      dotClassName:
        "bg-neutral-300",
    },
    {
      label: "Complete",
      description:
        "Ready to sell",
      value: "COMPLETE",
      dotClassName:
        "bg-emerald-500",
    },
    {
      label: "Incomplete",
      description:
        "Setup unfinished",
      value: "INCOMPLETE",
      dotClassName:
        "bg-amber-500",
    },
  ];

const initialPagination:
  AdminSellerPagination = {
    page: 1,
    limit: PAGE_LIMIT,
    totalSellers: 0,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  };

export default function AdminSellersPage() {
  const router =
    useRouter();

  const {
    clearAdmin,
  } = useAdminContext();

  const [
    sellers,
    setSellers,
  ] = useState<
    AdminSeller[]
  >([]);

  const [
    pagination,
    setPagination,
  ] =
    useState<AdminSellerPagination>(
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
    useState<StatusFilter>(
      ""
    );

  const [
    onboarding,
    setOnboarding,
  ] =
    useState<OnboardingFilter>(
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
    updatingSellerId,
    setUpdatingSellerId,
  ] =
    useState<string | null>(
      null
    );

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
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

  const handleError =
    useCallback(
      (
        requestError: unknown,
        fallback: string
      ) => {
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
              : fallback
          );

          return;
        }

        setError(fallback);
      },
      [
        clearAdmin,
        router,
      ]
    );

  const loadSellers =
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
            await getAdminSellers({
              page,
              limit:
                PAGE_LIMIT,
              search:
                search ||
                undefined,
              status:
                status ||
                undefined,
              onboarding:
                onboarding ||
                undefined,
            });

          setSellers(
            response.sellers
          );

          setPagination(
            response.pagination
          );
        } catch (
          requestError
        ) {
          handleError(
            requestError,
            "Unable to load sellers."
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [
        handleError,
        onboarding,
        page,
        search,
        status,
      ]
    );

  useEffect(() => {
    void loadSellers();
  }, [loadSellers]);

  const handleStatusChange =
    async (
      seller: AdminSeller
    ) => {
      const nextStatus:
        SellerStatus =
        seller.status ===
        "ACTIVE"
          ? "SUSPENDED"
          : "ACTIVE";

      const action =
        nextStatus ===
        "SUSPENDED"
          ? "suspend"
          : "reactivate";

      if (
        !window.confirm(
          `Are you sure you want to ${action} ${seller.shopName || seller.name}?`
        )
      ) {
        return;
      }

      try {
        setUpdatingSellerId(
          seller.id
        );

        setError("");
        setSuccess("");

        const response =
          await updateAdminSellerStatus(
            seller.id,
            nextStatus
          );

        setSellers(
          (current) =>
            current.map(
              (item) =>
                item.id ===
                seller.id
                  ? response.seller
                  : item
            )
        );

        setSuccess(
          response.message
        );

        window.setTimeout(
          () =>
            setSuccess(""),
          3000
        );
      } catch (
        requestError
      ) {
        handleError(
          requestError,
          `Unable to ${action} seller.`
        );
      } finally {
        setUpdatingSellerId(
          null
        );
      }
    };

  const clearFilters =
    () => {
      setSearchInput("");
      setSearch("");
      setStatus("");
      setOnboarding("");
      setPage(1);
    };

  const hasFilters =
    Boolean(
      search ||
        status ||
        onboarding
    );

  return (
    <div className="mx-auto w-full max-w-[1500px]">
      <section className="relative overflow-hidden rounded-[32px] bg-[#080d19] px-6 py-8 text-white shadow-[0_22px_70px_rgba(8,13,25,0.16)] sm:px-8 lg:px-10">
        <div
          aria-hidden="true"
          className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-violet-500/15 blur-3xl"
        />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Partner operations
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
              Sellers
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
              Monitor seller
              onboarding, stores,
              inventory and account
              access.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.05] px-5 py-3">
            <p className="text-2xl font-semibold">
              {
                pagination.totalSellers
              }
            </p>

            <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-slate-500">
              Matching sellers
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
              placeholder="Search seller, email or shop..."
              className="min-h-12 w-full rounded-2xl border border-black/[0.08] bg-neutral-50 pl-11 pr-4 text-sm outline-none focus:border-black/30 focus:bg-white focus:ring-4 focus:ring-black/[0.03]"
            />
          </div>

          <AdminFilterDropdown
            value={status}
            label="Seller status"
            options={
              statusOptions
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
              onboarding
            }
            label="Onboarding"
            options={
              onboardingOptions
            }
            onChange={(
              value
            ) => {
              setOnboarding(
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
              void loadSellers(
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

        {success && (
          <Message
            success
            message={success}
          />
        )}

        {error && (
          <Message
            message={error}
          />
        )}

        {loading ? (
          <div className="flex min-h-[430px] items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-neutral-500" />
          </div>
        ) : sellers.length ===
          0 ? (
          <div className="flex min-h-[430px] flex-col items-center justify-center text-center">
            <Store className="h-8 w-8 text-neutral-300" />

            <h2 className="mt-4 text-lg font-semibold">
              No sellers found
            </h2>

            <p className="mt-2 text-sm text-neutral-500">
              Try changing your filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px]">
              <thead>
                <tr className="border-b border-black/[0.06] bg-neutral-50/80 text-left">
                  <Heading>
                    Seller
                  </Heading>
                  <Heading>
                    Onboarding
                  </Heading>
                  <Heading>
                    Catalog
                  </Heading>
                  <Heading>
                    Activity
                  </Heading>
                  <Heading>
                    Status
                  </Heading>
                  <Heading alignRight>
                    Action
                  </Heading>
                </tr>
              </thead>

              <tbody>
                {sellers.map(
                  (seller) => (
                    <SellerRow
                      key={
                        seller.id
                      }
                      seller={
                        seller
                      }
                      updating={
                        updatingSellerId ===
                        seller.id
                      }
                      onStatusChange={() =>
                        void handleStatusChange(
                          seller
                        )
                      }
                    />
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
                      (value) =>
                        Math.max(
                          value - 1,
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
                      (value) =>
                        value + 1
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

function SellerRow({
  seller,
  updating,
  onStatusChange,
}: {
  seller: AdminSeller;
  updating: boolean;
  onStatusChange: () => void;
}) {
  return (
    <tr className="border-b border-black/[0.05] last:border-0 hover:bg-neutral-50/70">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
            <Store className="h-5 w-5" />
          </div>

          <div>
            <p className="max-w-[220px] truncate text-sm font-semibold text-neutral-950">
              {seller.shopName ||
                seller.name}
            </p>

            <p className="mt-1 max-w-[220px] truncate text-xs text-neutral-400">
              {seller.email}
            </p>

            <p className="mt-1 text-[10px] text-neutral-400">
              {seller.category ||
                "Uncategorized"}
              {" · "}
              {seller.country}
            </p>
          </div>
        </div>
      </td>

      <td className="px-6 py-4">
        <StatusPill
          success={
            seller.isOnboarded
          }
          label={
            seller.isOnboarded
              ? "Complete"
              : "Incomplete"
          }
        />

        <div className="mt-2">
          <StatusPill
            success={
              seller.bankConnected
            }
            label={
              seller.bankConnected
                ? "Payments ready"
                : "Bank pending"
            }
          />
        </div>
      </td>

      <td className="px-6 py-4">
        <Stat
          icon={Package}
          value={
            seller.productCount
          }
          label="Products"
        />

        <Stat
          icon={
            TicketPercent
          }
          value={
            seller.couponCount
          }
          label="Coupons"
        />
      </td>

      <td className="px-6 py-4">
        <Stat
          icon={
            CircleDollarSign
          }
          value={
            seller.orderCount
          }
          label="Orders"
        />

        <p className="mt-2 text-[10px] text-neutral-400">
          Joined{" "}
          {formatDate(
            seller.createdAt
          )}
        </p>
      </td>

      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
            seller.status ===
            "ACTIVE"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              seller.status ===
              "ACTIVE"
                ? "bg-emerald-500"
                : "bg-red-500"
            }`}
          />

          {seller.status ===
          "ACTIVE"
            ? "Active"
            : "Suspended"}
        </span>
      </td>

      <td className="px-6 py-4 text-right">
        <button
          type="button"
          disabled={updating}
          onClick={
            onStatusChange
          }
          className={`inline-flex min-h-10 items-center gap-2 rounded-xl px-4 text-xs font-semibold transition disabled:opacity-50 ${
            seller.status ===
            "ACTIVE"
              ? "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
              : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          }`}
        >
          {updating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : seller.status ===
            "ACTIVE" ? (
            <ShieldOff className="h-4 w-4" />
          ) : (
            <ShieldCheck className="h-4 w-4" />
          )}

          {updating
            ? "Updating..."
            : seller.status ===
                "ACTIVE"
              ? "Suspend"
              : "Reactivate"}
        </button>
      </td>
    </tr>
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

function StatusPill({
  success,
  label,
}: {
  success: boolean;
  label: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
        success
          ? "bg-emerald-50 text-emerald-700"
          : "bg-amber-50 text-amber-700"
      }`}
    >
      {success && (
        <BadgeCheck className="h-3 w-3" />
      )}

      {label}
    </span>
  );
}

function Stat({
  icon: Icon,
  value,
  label,
}: {
  icon:
    React.ComponentType<{
      className?: string;
    }>;
  value: number;
  label: string;
}) {
  return (
    <div className="mb-1.5 flex items-center gap-2 text-xs text-neutral-500 last:mb-0">
      <Icon className="h-3.5 w-3.5" />

      <span className="font-semibold text-neutral-800">
        {value}
      </span>

      {label}
    </div>
  );
}

function Message({
  message,
  success = false,
}: {
  message: string;
  success?: boolean;
}) {
  return (
    <div
      className={`mx-5 mt-5 flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm sm:mx-6 ${
        success
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      {success ? (
        <BadgeCheck className="h-4 w-4" />
      ) : (
        <AlertTriangle className="h-4 w-4" />
      )}

      {message}
    </div>
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
      className="flex h-10 items-center gap-1 rounded-xl border border-black/[0.08] px-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
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