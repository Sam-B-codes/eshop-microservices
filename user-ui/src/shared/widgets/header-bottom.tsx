"use client";

import Link from "next/link";

import { ChevronDown, ChevronRight, Grid2X2 } from "lucide-react";

import { navItems } from "@/configs/constants";

interface HeaderBottomProps {
  mobileMenuOpen?: boolean;
  closeMobileMenu?: () => void;
}

/* =====================================================
   BROWSE CATEGORIES
===================================================== */

const browseCategories = [
  {
    label: "Electronics",
    category: "Electronics",
  },
  {
    label: "Fashion",
    category: "Clothing",
  },
  {
    label: "Shoes",
    category: "Shoes",
  },
  {
    label: "Beauty",
    category: "Beauty",
  },
];

export default function HeaderBottom({
  mobileMenuOpen = false,
  closeMobileMenu,
}: HeaderBottomProps) {
  return (
    <>
      {/* =====================================================
          DESKTOP NAVIGATION
      ===================================================== */}

      <div className="sticky top-0 z-[60] hidden border-b border-neutral-200/80 bg-white/95 backdrop-blur-xl lg:block">
        <div className="mx-auto flex h-[58px] max-w-[1440px] items-center px-10">
          {/* =================================================
              CATEGORY DROPDOWN
          ================================================= */}

          <div className="group relative h-full">
            <button
              type="button"
              className="flex h-full items-center gap-2.5 border-r border-neutral-200 pr-8 text-sm font-semibold text-neutral-950 transition hover:text-neutral-500"
            >
              <Grid2X2 className="h-[17px] w-[17px]" />

              <span>Shop categories</span>

              <ChevronDown className="h-4 w-4 transition-transform duration-200 group-hover:rotate-180" />
            </button>

            {/* =============================================
                CATEGORY DROPDOWN
            ============================================= */}

            <div className="invisible absolute left-0 top-full z-[80] w-[270px] translate-y-2 pt-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
              <div className="overflow-hidden rounded-[22px] border border-neutral-200 bg-white p-2 shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
                <div className="px-3 pb-2 pt-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                    Browse
                  </p>
                </div>

                {browseCategories.map((item) => (
                  <Link
                    key={item.category}
                    href={`/products?category=${encodeURIComponent(
                      item.category,
                    )}`}
                    className="group/category flex items-center justify-between rounded-xl px-3 py-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 hover:text-neutral-950"
                  >
                    <span>{item.label}</span>

                    <ChevronRight className="h-4 w-4 text-neutral-300 transition-transform group-hover/category:translate-x-0.5 group-hover/category:text-neutral-600" />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* =================================================
              MAIN NAV
          ================================================= */}

          <nav className="ml-8 flex h-full items-center gap-7">
            {navItems.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                onClick={() => {
                  if (item.external && typeof window !== "undefined") {
                    window.location.href = item.href;
                  }
                }}
                className="group relative flex h-full items-center text-sm font-medium text-neutral-600 transition hover:text-neutral-950"
              >
                {item.title}

                <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-neutral-950 transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* =================================================
              RIGHT MESSAGE
          ================================================= */}

          <div className="ml-auto hidden items-center gap-2 xl:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

            <p className="text-xs font-medium text-neutral-500">
              Fresh deals available
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          MOBILE NAVIGATION
      ===================================================== */}

      <div
        className={`relative z-[60] overflow-hidden border-b border-neutral-200 bg-white transition-all duration-300 lg:hidden ${
          mobileMenuOpen
            ? "max-h-[600px] opacity-100"
            : "max-h-0 border-b-0 opacity-0"
        }`}
      >
        <div className="px-4 pb-6 pt-2 sm:px-6">
          {/* =================================================
              MOBILE NAV LINKS
          ================================================= */}

          <div className="border-b border-neutral-100 pb-4">
            <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
              Navigation
            </p>

            <nav className="flex flex-col">
              {navItems.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  onClick={() => {
                    closeMobileMenu?.();

                    if (item.external && typeof window !== "undefined") {
                      window.location.href = item.href;
                    }
                  }}
                  className="flex min-h-12 items-center justify-between rounded-xl px-2 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100"
                >
                  {item.title}

                  <ChevronRight className="h-4 w-4 text-neutral-300" />
                </Link>
              ))}
            </nav>
          </div>

          {/* =================================================
              MOBILE CATEGORIES
          ================================================= */}

          <div className="pt-5">
            <div className="mb-3 flex items-center gap-2 px-2">
              <Grid2X2 className="h-4 w-4 text-neutral-400" />

              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
                Categories
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {browseCategories.map((item) => (
                <Link
                  key={item.category}
                  href={`/products?category=${encodeURIComponent(
                    item.category,
                  )}`}
                  onClick={closeMobileMenu}
                  className="flex min-h-11 items-center rounded-xl bg-neutral-50 px-3 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100 hover:text-neutral-950"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
