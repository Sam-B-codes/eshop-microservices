"use client";

import {
  useEffect,
  useState,
} from "react";

import { toast } from "sonner";

import {
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Filter,
  Loader2,
  Package,
  X,
} from "lucide-react";

import {
  deleteProduct,
  getProducts,
} from "@/services/product.service";

import {
  Product,
  ProductsResponse,
} from "@/types/product";

import ProductRow from "./ProductRow";

interface ProductTableProps {
  search: string;
}

type StatusFilter =
  | "ALL"
  | "DRAFT"
  | "PUBLISHED";

const ITEMS_PER_PAGE = 10;

export default function ProductTable({
  search,
}: ProductTableProps) {
  const [
    products,
    setProducts,
  ] = useState<Product[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState<StatusFilter>("ALL");

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);

  const [total, setTotal] =
    useState(0);

  const [
    totalPages,
    setTotalPages,
  ] = useState(1);

  // ====================================================
  // LOAD PRODUCTS
  // ====================================================

  const loadProducts =
    async () => {
      try {
        setLoading(true);

        const data: ProductsResponse =
          await getProducts({
            page: currentPage,
            limit:
              ITEMS_PER_PAGE,
            search:
              search.trim() ||
              undefined,
            status:
              statusFilter ===
              "ALL"
                ? undefined
                : statusFilter,
          });

        setProducts(
          data.products || []
        );

        setTotal(
          data.total || 0
        );

        setTotalPages(
          Math.max(
            1,
            data.pages || 1
          )
        );
      } catch (error) {
        console.error(
          "Failed to load products:",
          error
        );

        toast.error(
          "Failed to load products. Please try again."
        );

        setProducts([]);
        setTotal(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

  // ====================================================
  // LOAD ON PAGE / SEARCH / FILTER
  // ====================================================

  useEffect(() => {
    void loadProducts();
  }, [
    currentPage,
    statusFilter,
    search,
  ]);

  // ====================================================
  // RESET PAGE WHEN SEARCH / FILTER CHANGES
  // ====================================================

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  // ====================================================
  // DELETE
  // ====================================================

  const handleDelete =
    async (id: string) => {
      try {
        await deleteProduct(id);

        if (
          products.length ===
            1 &&
          currentPage > 1
        ) {
          setCurrentPage(
            (page) =>
              page - 1
          );
        } else {
          await loadProducts();
        }

        toast.success(
          "Product deleted successfully."
        );
      } catch (
        error: any
      ) {
        console.error(
          "Delete product error:",
          error
        );

        toast.error(
          error?.response?.data
            ?.message ||
            "Failed to delete product."
        );
      }
    };

  // ====================================================
  // RANGE
  // ====================================================

  const startItem =
    total > 0
      ? (currentPage - 1) *
          ITEMS_PER_PAGE +
        1
      : 0;

  const endItem =
    Math.min(
      currentPage *
        ITEMS_PER_PAGE,
      total
    );

  // ====================================================
  // PAGE NUMBERS
  // ====================================================

  const getVisiblePages =
    () => {
      const pages: number[] =
        [];

      const start =
        Math.max(
          1,
          Math.min(
            currentPage - 2,
            totalPages - 4
          )
        );

      const end =
        Math.min(
          totalPages,
          start + 4
        );

      for (
        let page = start;
        page <= end;
        page++
      ) {
        pages.push(page);
      }

      return pages;
    };

  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {
    return (
      <section className="flex min-h-[360px] items-center justify-center rounded-[26px] border border-black/[0.06] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100">
            <Loader2 className="h-5 w-5 animate-spin text-neutral-600" />
          </div>

          <p className="mt-4 text-sm font-medium text-neutral-500">
            Loading products...
          </p>
        </div>
      </section>
    );
  }

  // ====================================================
  // EMPTY STATE
  // ====================================================

  if (
    products.length === 0 &&
    total === 0
  ) {
    return (
      <section className="rounded-[26px] border border-black/[0.06] bg-white px-6 py-16 text-center shadow-[0_12px_40px_rgba(0,0,0,0.03)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100">
          <Package className="h-6 w-6 text-neutral-400" />
        </div>

        <h2 className="mt-5 text-base font-semibold text-neutral-950">
          No products found
        </h2>

        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-neutral-500">
          {search ||
          statusFilter !== "ALL"
            ? "Try changing your search or status filter."
            : "Create your first product to start building your catalog."}
        </p>

        {(search ||
          statusFilter !==
            "ALL") && (
          <button
            type="button"
            onClick={() => {
              setStatusFilter(
                "ALL"
              );
            }}
            className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-black/[0.08] bg-white px-5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 hover:text-neutral-950"
          >
            <X className="h-4 w-4" />

            Clear filter
          </button>
        )}
      </section>
    );
  }

  return (
    <section className="overflow-visible rounded-[26px] border border-black/[0.06] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.035)]">
      {/* ===============================================
          TABLE HEADER
      ================================================ */}

      <div className="flex flex-col gap-4 border-b border-black/[0.06] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h2 className="text-base font-semibold tracking-[-0.02em] text-neutral-950">
            Product catalog
          </h2>

          <p className="mt-1 text-xs text-neutral-500">
            Showing{" "}
            <span className="font-semibold text-neutral-700">
              {startItem}-
              {endItem}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-neutral-700">
              {total}
            </span>{" "}
            product
            {total !== 1
              ? "s"
              : ""}
          </p>
        </div>

        {/* =============================================
            STATUS FILTER
        ============================================== */}

        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-black/[0.07] bg-neutral-50 text-neutral-500">
            <Filter
              className="h-4 w-4"
              strokeWidth={1.8}
            />
          </div>

          <div className="relative">
            <select
              aria-label="Filter products by status"
              value={
                statusFilter
              }
              onChange={(
                event
              ) => {
                setStatusFilter(
                  event.target
                    .value as StatusFilter
                );

                setCurrentPage(
                  1
                );
              }}
              className="h-10 cursor-pointer appearance-none rounded-xl border border-black/[0.08] bg-white py-0 pl-4 pr-10 text-xs font-semibold text-neutral-700 outline-none transition hover:border-black/[0.14] focus:border-black/25 focus:ring-4 focus:ring-black/[0.025]"
            >
              <option value="ALL">
                All statuses
              </option>

              <option value="PUBLISHED">
                Published
              </option>

              <option value="DRAFT">
                Draft
              </option>
            </select>

            <ChevronDown
              className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400"
              strokeWidth={2}
            />
          </div>
        </div>
      </div>

      {/* ===============================================
          ACTIVE FILTER
      ================================================ */}

      {statusFilter !==
        "ALL" && (
        <div className="flex items-center gap-2 border-b border-black/[0.05] bg-neutral-50/70 px-5 py-3 sm:px-6">
          <span className="text-[11px] font-medium text-neutral-400">
            Active filter
          </span>

          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
              statusFilter ===
              "PUBLISHED"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            {statusFilter ===
            "PUBLISHED" ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : (
              <FileText className="h-3 w-3" />
            )}

            {statusFilter ===
            "PUBLISHED"
              ? "Published"
              : "Draft"}
          </span>

          <button
            type="button"
            onClick={() => {
              setStatusFilter(
                "ALL"
              );

              setCurrentPage(
                1
              );
            }}
            className="ml-1 inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-500 transition hover:text-neutral-950"
          >
            <X className="h-3 w-3" />

            Clear
          </button>
        </div>
      )}

      {/* ===============================================
          TABLE
      ================================================ */}

      <div className="overflow-x-auto [scrollbar-width:thin]">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-black/[0.06] bg-neutral-50/80">
              <th className="px-6 py-3.5 text-left text-[10px] font-semibold uppercase tracking-[0.13em] text-neutral-400">
                Product
              </th>

              <th className="px-6 py-3.5 text-left text-[10px] font-semibold uppercase tracking-[0.13em] text-neutral-400">
                Category
              </th>

              <th className="px-6 py-3.5 text-left text-[10px] font-semibold uppercase tracking-[0.13em] text-neutral-400">
                Price
              </th>

              <th className="px-6 py-3.5 text-left text-[10px] font-semibold uppercase tracking-[0.13em] text-neutral-400">
                Stock
              </th>

              <th className="px-6 py-3.5 text-left text-[10px] font-semibold uppercase tracking-[0.13em] text-neutral-400">
                Status
              </th>

              <th className="px-6 py-3.5 text-right text-[10px] font-semibold uppercase tracking-[0.13em] text-neutral-400">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {products.map(
              (product) => (
                <ProductRow
                  key={
                    product.id
                  }
                  product={
                    product
                  }
                  onDelete={
                    handleDelete
                  }
                />
              )
            )}
          </tbody>
        </table>
      </div>

      {/* ===============================================
          PAGINATION
      ================================================ */}

      {totalPages > 1 && (
        <div className="flex flex-col gap-4 border-t border-black/[0.06] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-xs text-neutral-500">
            Page{" "}
            <span className="font-semibold text-neutral-900">
              {
                currentPage
              }
            </span>{" "}
            of{" "}
            <span className="font-semibold text-neutral-900">
              {
                totalPages
              }
            </span>
          </p>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label="Previous page"
              disabled={
                currentPage ===
                1
              }
              onClick={() =>
                setCurrentPage(
                  (page) =>
                    Math.max(
                      1,
                      page - 1
                    )
                )
              }
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-black/[0.08] bg-white px-3 text-xs font-semibold text-neutral-600 transition hover:bg-neutral-50 hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-35"
            >
              <ChevronLeft className="h-3.5 w-3.5" />

              <span className="hidden sm:inline">
                Previous
              </span>
            </button>

            <div className="hidden items-center gap-1 sm:flex">
              {getVisiblePages().map(
                (page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() =>
                      setCurrentPage(
                        page
                      )
                    }
                    aria-label={`Go to page ${page}`}
                    aria-current={
                      currentPage ===
                      page
                        ? "page"
                        : undefined
                    }
                    className={`h-9 min-w-9 rounded-xl px-2 text-xs font-semibold transition ${
                      currentPage ===
                      page
                        ? "bg-[#0b1220] text-white"
                        : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-950"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
            </div>

            <button
              type="button"
              aria-label="Next page"
              disabled={
                currentPage ===
                totalPages
              }
              onClick={() =>
                setCurrentPage(
                  (page) =>
                    Math.min(
                      totalPages,
                      page + 1
                    )
                )
              }
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-black/[0.08] bg-white px-3 text-xs font-semibold text-neutral-600 transition hover:bg-neutral-50 hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-35"
            >
              <span className="hidden sm:inline">
                Next
              </span>

              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}