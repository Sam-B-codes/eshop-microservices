"use client";

import Link from "next/link";

import {
  Plus,
  Search,
  X,
} from "lucide-react";

interface ProductToolbarProps {
  search: string;
  setSearch: React.Dispatch<
    React.SetStateAction<string>
  >;
}

export default function ProductToolbar({
  search,
  setSearch,
}: ProductToolbarProps) {
  return (
    <section className="rounded-[24px] border border-black/[0.06] bg-white p-4 shadow-[0_10px_30px_rgba(0,0,0,0.025)] sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* =============================================
            SEARCH
        ============================================== */}

        <div className="relative w-full sm:max-w-[460px]">
          <Search
            className="absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-neutral-400"
            strokeWidth={1.8}
          />

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search products, brand or category..."
            className="h-12 w-full rounded-2xl border border-black/[0.08] bg-neutral-50 pl-11 pr-11 text-sm text-neutral-950 outline-none transition placeholder:text-neutral-400 hover:border-black/[0.12] focus:border-black/25 focus:bg-white focus:ring-4 focus:ring-black/[0.025]"
          />

          {search && (
            <button
              type="button"
              onClick={() =>
                setSearch("")
              }
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl text-neutral-400 transition hover:bg-neutral-200/70 hover:text-neutral-950"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* =============================================
            ADD PRODUCT
        ============================================== */}

        <Link
          href="/dashboard/products/create"
          className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-[#0b1220] px-5 text-sm font-semibold text-white transition hover:bg-[#172033]"
        >
          <Plus
            className="h-4 w-4"
            strokeWidth={2}
          />

          Add product
        </Link>
      </div>
    </section>
  );
}