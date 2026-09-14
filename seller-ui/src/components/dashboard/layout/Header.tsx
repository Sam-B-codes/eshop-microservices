"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ChevronDown,
  Loader2,
  LogOut,
  Menu,
  Settings,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  toast,
} from "sonner";

import SellerNotificationBell from "@/components/notifications/SellerNotificationBell";

import {
  useSellerContext,
} from "@/context/SellerContext";

import {
  logoutSeller,
} from "@/services/auth";

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({
  onMenuClick,
}: HeaderProps) {
  const router =
    useRouter();

  const {
    seller,
    loading,
    clearSeller,
  } = useSellerContext();

  const [
    open,
    setOpen,
  ] = useState(false);

  const [
    loggingOut,
    setLoggingOut,
  ] = useState(false);

  const dropdownRef =
    useRef<HTMLDivElement>(
      null
    );

  // ====================================================
  // NAVIGATE TO SETTINGS
  // ====================================================

  const openSettings = () => {
    setOpen(false);

    router.push(
      "/dashboard/settings"
    );
  };

  // ====================================================
  // LOGOUT
  // ====================================================

  const handleLogout =
    async () => {
      if (loggingOut) {
        return;
      }

      try {
        setLoggingOut(true);

        await logoutSeller();

        clearSeller();

        setOpen(false);

        toast.success(
          "Signed out successfully."
        );

        router.replace(
          "/login"
        );

        router.refresh();
      } catch (error) {
        console.error(
          "Seller logout failed:",
          error
        );

        toast.error(
          "Unable to sign out. Please try again."
        );
      } finally {
        setLoggingOut(false);
      }
    };

  // ====================================================
  // CLOSE DROPDOWN OUTSIDE
  // ====================================================

  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent
    ) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // ====================================================
  // CLOSE DROPDOWN WITH ESCAPE
  // ====================================================

  useEffect(() => {
    const handleEscape = (
      event: KeyboardEvent
    ) => {
      if (
        event.key ===
        "Escape"
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  // ====================================================
  // SELLER DISPLAY DATA
  // ====================================================

  const sellerName =
    seller?.name ||
    "Seller";

  const firstName =
    sellerName
      .trim()
      .split(" ")[0] ||
    "Seller";

  const initials =
    sellerName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((name) =>
        name
          .charAt(0)
          .toUpperCase()
      )
      .join("") ||
    "S";

  const shopName =
    seller?.shopName ||
    "Your store";

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#0b1220]/95 backdrop-blur-xl">
      <div className="flex min-h-[76px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* LEFT */}

        <div className="flex min-w-0 items-center gap-4">
          <button
            type="button"
            onClick={
              onMenuClick
            }
            aria-label="Open navigation menu"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.04] text-slate-300 transition hover:border-white/[0.12] hover:bg-white/[0.07] hover:text-white lg:hidden"
          >
            <Menu
              className="h-5 w-5"
              strokeWidth={1.8}
            />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-lg font-semibold tracking-[-0.025em] text-white sm:text-xl">
                {loading
                  ? "Welcome back"
                  : `Welcome back, ${firstName}`}
              </h1>

              {!loading && (
                <span
                  aria-hidden="true"
                  className="hidden text-lg sm:inline"
                >
                  👋
                </span>
              )}
            </div>

            <p className="mt-1 truncate text-xs text-slate-500 sm:text-sm">
              {loading
                ? "Loading your workspace..."
                : `Managing ${shopName}`}
            </p>
          </div>
        </div>

        {/* RIGHT */}

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {/* NOTIFICATIONS */}

          <SellerNotificationBell />

          {/* ACCOUNT */}

          <div
            ref={
              dropdownRef
            }
            className="relative"
          >
            <button
              type="button"
              onClick={() =>
                setOpen(
                  (current) =>
                    !current
                )
              }
              aria-haspopup="menu"
              aria-expanded={
                open
              }
              className={`flex h-12 items-center gap-3 rounded-2xl border px-2 transition sm:px-3 ${
                open
                  ? "border-white/[0.14] bg-white/[0.08]"
                  : "border-white/[0.07] bg-white/[0.04] hover:border-white/[0.12] hover:bg-white/[0.07]"
              }`}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-xs font-bold text-[#0b1220] shadow-sm">
                {loading
                  ? "..."
                  : initials}
              </div>

              <div className="hidden min-w-0 text-left md:block">
                <p className="max-w-[140px] truncate text-sm font-semibold text-white">
                  {loading
                    ? "Loading..."
                    : sellerName}
                </p>

                <p className="mt-0.5 max-w-[140px] truncate text-[11px] text-slate-500">
                  {loading
                    ? "Seller account"
                    : shopName}
                </p>
              </div>

              <ChevronDown
                className={`hidden h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200 md:block ${
                  open
                    ? "rotate-180"
                    : ""
                }`}
                strokeWidth={1.8}
              />
            </button>

            {/* ACCOUNT DROPDOWN */}

            <div
              role="menu"
              aria-hidden={
                !open
              }
              className={`absolute right-0 top-[calc(100%+10px)] w-[290px] origin-top-right overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#111827] shadow-[0_24px_70px_rgba(0,0,0,0.38)] transition duration-200 ${
                open
                  ? "visible translate-y-0 scale-100 opacity-100"
                  : "pointer-events-none invisible -translate-y-1 scale-[0.98] opacity-0"
              }`}
            >
              {/* SELLER SUMMARY */}

              <div className="border-b border-white/[0.06] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-sm font-bold text-[#0b1220]">
                    {loading
                      ? "..."
                      : initials}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                      {loading
                        ? "Loading seller..."
                        : sellerName}
                    </p>

                    <p className="mt-1 truncate text-xs text-slate-500">
                      {loading
                        ? ""
                        : seller?.email}
                    </p>
                  </div>
                </div>

                {!loading &&
                  seller?.shopName && (
                    <div className="mt-4 rounded-2xl border border-white/[0.05] bg-white/[0.035] px-4 py-3">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                        Store
                      </p>

                      <p className="mt-1 truncate text-sm font-medium text-slate-200">
                        {
                          seller.shopName
                        }
                      </p>
                    </div>
                  )}
              </div>

              {/* ACCOUNT MENU */}

              <div className="p-2">
                <button
                  type="button"
                  role="menuitem"
                  onClick={
                    openSettings
                  }
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-slate-400 transition hover:bg-white/[0.05] hover:text-white"
                >
                  <Settings
                    className="h-[18px] w-[18px]"
                    strokeWidth={1.8}
                  />

                  Account Settings
                </button>
              </div>

              {/* LOGOUT */}

              <div className="border-t border-white/[0.06] p-2">
                <button
                  type="button"
                  role="menuitem"
                  onClick={
                    handleLogout
                  }
                  disabled={
                    loggingOut
                  }
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-red-400 transition hover:bg-red-400/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loggingOut ? (
                    <Loader2 className="h-[18px] w-[18px] animate-spin" />
                  ) : (
                    <LogOut
                      className="h-[18px] w-[18px]"
                      strokeWidth={1.8}
                    />
                  )}

                  {loggingOut
                    ? "Signing out..."
                    : "Sign out"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}