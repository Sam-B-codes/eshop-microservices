"use client";

import clsx from "clsx";
import Link from "next/link";

import {
  ChevronLeft,
  ShieldCheck,
  Store,
} from "lucide-react";

import SidebarItem from "./SidebarItem";

import {
  logoutItem,
  sidebarItems,
} from "@/constants/sidebar";

import { useSeller } from "@/hooks/useSeller";

interface SidebarProps {
  collapsed?: boolean;
  onCollapse?: () => void;
}

export default function Sidebar({
  collapsed = false,
  onCollapse,
}: SidebarProps) {
  const {
    seller,
    loading,
  } = useSeller();

  // ====================================================
  // SELLER HELPERS
  // ====================================================

  const sellerName =
    seller?.name || "Seller";

  const shopName =
    seller?.shopName ||
    "Your store";

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
      .join("") || "S";

  return (
    <aside
      className={clsx(
        "relative flex h-dvh shrink-0 flex-col overflow-hidden border-r border-white/[0.06] bg-[#0b1220] transition-[width] duration-300 ease-in-out",
        collapsed
          ? "w-[88px]"
          : "w-[264px]"
      )}
    >
      {/* ===============================================
          SUBTLE BACKGROUND
      ================================================ */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full bg-white/[0.025] blur-3xl" />

        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:42px_42px]" />
      </div>

      {/* ===============================================
          COLLAPSE BUTTON
      ================================================ */}

      {onCollapse && (
        <button
          type="button"
          onClick={onCollapse}
          aria-label={
            collapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
          }
          className="absolute -right-3 top-[30px] z-50 hidden h-7 w-7 items-center justify-center rounded-full border border-white/[0.1] bg-[#111827] text-slate-400 shadow-[0_6px_20px_rgba(0,0,0,0.25)] transition hover:border-white/[0.18] hover:bg-[#172033] hover:text-white lg:flex"
        >
          <ChevronLeft
            className={clsx(
              "h-3.5 w-3.5 transition-transform duration-300",
              collapsed &&
                "rotate-180"
            )}
            strokeWidth={2}
          />
        </button>
      )}

      {/* ===============================================
          BRAND
      ================================================ */}

      <div
        className={clsx(
          "relative z-10 flex h-[76px] shrink-0 items-center border-b border-white/[0.05]",
          collapsed
            ? "justify-center px-3"
            : "px-5"
        )}
      >
        <Link
          href="/dashboard"
          aria-label="Eshop Seller Dashboard"
          className={clsx(
            "flex min-w-0 items-center",
            collapsed
              ? "justify-center"
              : "gap-3"
          )}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white text-[#0b1220] shadow-sm">
            <Store
              className="h-[18px] w-[18px]"
              strokeWidth={2}
            />
          </div>

          {!collapsed && (
            <div className="min-w-0">
              <p className="text-[17px] font-semibold tracking-[-0.03em] text-white">
                Eshop
              </p>

              <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-600">
                Seller Center
              </p>
            </div>
          )}
        </Link>
      </div>

      {/* ===============================================
          SELLER CARD
      ================================================ */}

      <div
        className={clsx(
          "relative z-10 shrink-0 transition-all duration-300",
          collapsed
            ? "px-3 pb-3 pt-4"
            : "px-4 pb-3 pt-4"
        )}
      >
        {collapsed ? (
          <div
            className="group relative flex justify-center"
            title={
              loading
                ? "Loading seller..."
                : sellerName
            }
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.06] text-xs font-bold text-white">
              {loading
                ? "..."
                : initials}
            </div>

            {/* Collapsed tooltip */}

            {!loading && (
              <div className="pointer-events-none absolute left-[calc(100%+14px)] top-1/2 z-[70] hidden -translate-y-1/2 whitespace-nowrap rounded-xl border border-white/[0.08] bg-[#111827] px-3 py-2 shadow-xl group-hover:block">
                <p className="text-xs font-semibold text-white">
                  {sellerName}
                </p>

                <p className="mt-0.5 text-[10px] text-slate-500">
                  {shopName}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-[18px] border border-white/[0.06] bg-white/[0.035] p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-xs font-bold text-[#0b1220]">
                {loading
                  ? "..."
                  : initials}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-100">
                  {loading
                    ? "Loading..."
                    : sellerName}
                </p>

                <p className="mt-0.5 truncate text-[11px] text-slate-500">
                  {loading
                    ? "Seller account"
                    : shopName}
                </p>
              </div>
            </div>

            {!loading &&
              seller?.isOnboarded && (
                <div className="mt-3 flex items-center gap-1.5 border-t border-white/[0.05] pt-3">
                  <ShieldCheck
                    className="h-3.5 w-3.5 text-emerald-400"
                    strokeWidth={1.8}
                  />

                  <span className="text-[10px] font-medium text-emerald-400">
                    Verified seller
                  </span>
                </div>
              )}
          </div>
        )}
      </div>

      {/* ===============================================
          NAVIGATION
      ================================================ */}

      <nav
  className={clsx(
    "relative z-10 min-h-0 flex-1 overflow-y-auto overflow-x-hidden py-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
    collapsed
      ? "px-3"
      : "px-4"
  )}
>
        {!collapsed && (
          <p className="mb-2 px-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-700">
            Workspace
          </p>
        )}

        <div className="space-y-1">
          {sidebarItems.map(
            (item) => (
              <SidebarItem
                key={
                  item.title
                }
                {...item}
                collapsed={
                  collapsed
                }
              />
            )
          )}
        </div>
      </nav>

      {/* ===============================================
          LOGOUT / BOTTOM
      ================================================ */}

      <div
        className={clsx(
          "relative z-10 shrink-0 border-t border-white/[0.06] py-3",
          collapsed
            ? "px-3"
            : "px-4"
        )}
      >
        <SidebarItem
          {...logoutItem}
          collapsed={collapsed}
          danger
        />

        {!collapsed && (
          <p className="mt-3 px-3 text-[9px] tracking-wide text-slate-700">
            Eshop Seller Center
          </p>
        )}
      </div>
    </aside>
  );
}