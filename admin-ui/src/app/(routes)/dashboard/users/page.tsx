"use client";

import { useCallback, useEffect, useState } from "react";

import axios from "axios";

import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  ShieldOff,
  UserCheck,
  Users,
  X,
} from "lucide-react";

import { useRouter } from "next/navigation";

import { useAdminContext } from "@/context/AdminContext";

import {
  getAdminUsers,
  updateAdminUserStatus,
} from "@/services/admin-user.service";

import { AdminUser, AdminUserPagination, UserStatus } from "@/types/admin-user";

import UserStatusFilter from "@/components/dashboard/UserStatusFilter";

const PAGE_LIMIT = 10;

const initialPagination: AdminUserPagination = {
  page: 1,
  limit: PAGE_LIMIT,
  totalUsers: 0,
  totalPages: 0,
  hasPreviousPage: false,
  hasNextPage: false,
};

export default function AdminUsersPage() {
  const router = useRouter();

  const { clearAdmin } = useAdminContext();

  const [users, setUsers] = useState<AdminUser[]>([]);

  const [pagination, setPagination] =
    useState<AdminUserPagination>(initialPagination);

  const [searchInput, setSearchInput] = useState("");

  const [search, setSearch] = useState("");

  const [status, setStatus] = useState<UserStatus | "">("");

  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const [error, setError] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearch(searchInput.trim());

      setPage(1);
    }, 400);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [searchInput]);

  const handleApiError = useCallback(
    (requestError: unknown, fallback: string) => {
      if (axios.isAxiosError(requestError)) {
        if (requestError.response?.status === 401) {
          clearAdmin();

          router.replace("/login");

          return;
        }

        const message = requestError.response?.data?.message;

        setError(typeof message === "string" ? message : fallback);

        return;
      }

      setError(fallback);
    },
    [clearAdmin, router],
  );

  const loadUsers = useCallback(
    async (refresh = false) => {
      try {
        if (refresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await getAdminUsers({
          page,
          limit: PAGE_LIMIT,
          search: search || undefined,
          status: status || undefined,
        });

        setUsers(response.users);

        setPagination(response.pagination);
      } catch (requestError) {
        handleApiError(requestError, "Unable to load customers.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [handleApiError, page, search, status],
  );

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const handleStatusChange = async (user: AdminUser) => {
    const nextStatus: UserStatus =
      user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";

    const action = nextStatus === "SUSPENDED" ? "suspend" : "reactivate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${user.name}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingUserId(user.id);

      setError("");
      setSuccessMessage("");

      const response = await updateAdminUserStatus(user.id, nextStatus);

      setUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          currentUser.id === user.id ? response.user : currentUser,
        ),
      );

      setSuccessMessage(response.message);

      window.setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (requestError) {
      handleApiError(requestError, `Unable to ${action} customer.`);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setStatus("");
    setPage(1);
  };

  const hasFilters = Boolean(search || status);

  return (
    <div className="mx-auto w-full max-w-[1500px]">
      <section className="relative overflow-hidden rounded-[32px] bg-[#080d19] px-6 py-8 text-white shadow-[0_22px_70px_rgba(8,13,25,0.16)] sm:px-8 lg:px-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-blue-500/15 blur-3xl" />

          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px]" />
        </div>

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Customer management
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
              Users
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
              Review customer accounts, order activity and account access across
              the marketplace.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.05] px-5 py-3">
            <p className="text-2xl font-semibold">{pagination.totalUsers}</p>

            <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-slate-500">
              Matching users
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 overflow-hidden rounded-[28px] border border-black/[0.06] bg-white shadow-[0_12px_40px_rgba(15,23,42,0.035)]">
        <div className="flex flex-col gap-4 border-b border-black/[0.06] p-5 sm:p-6 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-neutral-400" />

            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by name or email..."
              className="min-h-12 w-full rounded-2xl border border-black/[0.08] bg-neutral-50 pl-11 pr-4 text-sm text-neutral-950 outline-none transition focus:border-black/30 focus:bg-white focus:ring-4 focus:ring-black/[0.03]"
            />
          </div>

          <UserStatusFilter
            value={status}
            onChange={(nextStatus) => {
              setStatus(nextStatus);

              setPage(1);
            }}
          />

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-black/[0.08] px-4 text-sm font-semibold text-neutral-600 transition hover:bg-neutral-100"
            >
              <X className="h-4 w-4" />
              Clear
            </button>
          )}

          <button
            type="button"
            onClick={() => void loadUsers(true)}
            disabled={refreshing}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#080d19] px-5 text-sm font-semibold text-white transition hover:bg-[#151d2e] disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        {successMessage && (
          <div className="mx-5 mt-5 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 sm:mx-6">
            <UserCheck className="h-4 w-4" />
            {successMessage}
          </div>
        )}

        {error && (
          <div className="mx-5 mt-5 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:mx-6">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[420px] items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-neutral-500" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex min-h-[420px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100">
              <Users className="h-6 w-6 text-neutral-400" />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-neutral-950">
              No users found
            </h2>

            <p className="mt-2 text-sm text-neutral-500">
              Try changing your search or status filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px]">
              <thead>
                <tr className="border-b border-black/[0.06] bg-neutral-50/80 text-left">
                  <Heading>Customer</Heading>

                  <Heading>Status</Heading>

                  <Heading>Orders</Heading>

                  <Heading>Joined</Heading>

                  <Heading alignRight>Action</Heading>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => {
                  const updating = updatingUserId === user.id;

                  return (
                    <tr
                      key={user.id}
                      className="border-b border-black/[0.05] last:border-0 hover:bg-neutral-50/70"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-600">
                            <CircleUserRound className="h-5 w-5" />
                          </div>

                          <div className="min-w-0">
                            <p className="max-w-[220px] truncate text-sm font-semibold text-neutral-950">
                              {user.name}
                            </p>

                            <p className="mt-1 max-w-[220px] truncate text-xs text-neutral-400">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge status={user.status} />
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-neutral-800">
                          {user.orderCount}
                        </p>

                        <p className="mt-1 text-[11px] text-neutral-400">
                          Total orders
                        </p>
                      </td>

                      <td className="px-6 py-4 text-sm text-neutral-500">
                        {formatDate(user.createdAt)}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          disabled={updating}
                          onClick={() => void handleStatusChange(user)}
                          className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                            user.status === "ACTIVE"
                              ? "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                              : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          }`}
                        >
                          {updating ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : user.status === "ACTIVE" ? (
                            <ShieldOff className="h-4 w-4" />
                          ) : (
                            <ShieldCheck className="h-4 w-4" />
                          )}

                          {updating
                            ? "Updating..."
                            : user.status === "ACTIVE"
                              ? "Suspend"
                              : "Reactivate"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && pagination.totalPages > 1 && (
          <div className="flex flex-col gap-4 border-t border-black/[0.06] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-xs text-neutral-500">
              Page {pagination.page} of {pagination.totalPages}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!pagination.hasPreviousPage}
                onClick={() => setPage((current) => Math.max(current - 1, 1))}
                className="flex h-10 items-center gap-1 rounded-xl border border-black/[0.08] px-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>

              <button
                type="button"
                disabled={!pagination.hasNextPage}
                onClick={() => setPage((current) => current + 1)}
                className="flex h-10 items-center gap-1 rounded-xl border border-black/[0.08] px-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
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
  children: React.ReactNode;
  alignRight?: boolean;
}) {
  return (
    <th
      className={`px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400 ${
        alignRight ? "text-right" : ""
      }`}
    >
      {children}
    </th>
  );
}

function StatusBadge({ status }: { status: UserStatus }) {
  const active = status === "ACTIVE";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
        active ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-emerald-500" : "bg-red-500"
        }`}
      />

      {active ? "Active" : "Suspended"}
    </span>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
