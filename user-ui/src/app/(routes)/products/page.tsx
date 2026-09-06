"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import ProductCard from "@/components/home/ProductCard";

import {
  getPublicProductFilters,
  getPublicProducts,
} from "@/services/product.service";

import {
  Product,
  ProductAvailability,
  ProductPagination,
  ProductSort,
  PublicProductFilters,
  PublicProductQuery,
} from "@/types/product";

const DEFAULT_LIMIT = 12;

const SORT_OPTIONS: {
  label: string;
  value: ProductSort;
}[] = [
  {
    label: "Newest",
    value: "newest",
  },
  {
    label: "Price: Low to High",
    value: "price-low",
  },
  {
    label: "Price: High to Low",
    value: "price-high",
  },
];

const formatPrice = (
  value: number
) => {
  return `₹${value.toLocaleString(
    "en-IN"
  )}`;
};

function ProductsContent() {
  const router = useRouter();
  const searchParams =
    useSearchParams();

  const [products, setProducts] =
    useState<Product[]>([]);

  const [filters, setFilters] =
    useState<PublicProductFilters | null>(
      null
    );

  const [pagination, setPagination] =
    useState<ProductPagination>({
      total: 0,
      page: 1,
      limit: DEFAULT_LIMIT,
      pages: 0,
    });

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [
    mobileFiltersOpen,
    setMobileFiltersOpen,
  ] = useState(false);

  const [sortOpen, setSortOpen] =
    useState(false);

  const [
    minPriceInput,
    setMinPriceInput,
  ] = useState("");

  const [
    maxPriceInput,
    setMaxPriceInput,
  ] = useState("");

  /* =====================================================
     URL FILTER STATE
  ===================================================== */

  const page = Math.max(
    Number(
      searchParams.get("page")
    ) || 1,
    1
  );

  const search =
    searchParams
      .get("search")
      ?.trim() || "";

  const category =
    searchParams
      .get("category")
      ?.trim() || "";

  const brand =
    searchParams
      .get("brand")
      ?.trim() || "";

  const availabilityParam =
    searchParams.get(
      "availability"
    );

  const availability:
    | ProductAvailability
    | undefined =
    availabilityParam ===
      "IN_STOCK" ||
    availabilityParam ===
      "OUT_OF_STOCK"
      ? availabilityParam
      : undefined;

  const sortParam =
    searchParams.get("sort");

  const sort: ProductSort =
    sortParam ===
      "price-low" ||
    sortParam ===
      "price-high" ||
    sortParam === "newest"
      ? sortParam
      : "newest";

  const parsedMinPrice =
    searchParams.get("minPrice");

  const parsedMaxPrice =
    searchParams.get("maxPrice");

  const minPrice =
    parsedMinPrice !== null &&
    Number.isFinite(
      Number(parsedMinPrice)
    )
      ? Number(parsedMinPrice)
      : undefined;

  const maxPrice =
    parsedMaxPrice !== null &&
    Number.isFinite(
      Number(parsedMaxPrice)
    )
      ? Number(parsedMaxPrice)
      : undefined;

  /* =====================================================
     UPDATE URL QUERY
  ===================================================== */

  const updateQuery =
    useCallback(
      (
        updates: Record<
          string,
          | string
          | number
          | undefined
          | null
        >
      ) => {
        const params =
          new URLSearchParams(
            searchParams.toString()
          );

        Object.entries(
          updates
        ).forEach(
          ([key, value]) => {
            if (
              value === undefined ||
              value === null ||
              value === ""
            ) {
              params.delete(key);
            } else {
              params.set(
                key,
                String(value)
              );
            }
          }
        );

        router.push(
          `/products${
            params.toString()
              ? `?${params.toString()}`
              : ""
          }`
        );
      },
      [router, searchParams]
    );

  const clearAllFilters =
    () => {
      router.push("/products");
    };

  /* =====================================================
     LOAD PRODUCTS
  ===================================================== */

  const loadProducts =
    useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        const query: PublicProductQuery =
          {
            page,
            limit: DEFAULT_LIMIT,
            search:
              search ||
              undefined,
            category:
              category ||
              undefined,
            brand:
              brand ||
              undefined,
            minPrice,
            maxPrice,
            availability,
            sort,
          };

        const response =
          await getPublicProducts(
            query
          );

        setProducts(
          response.products
        );

        setPagination(
          response.pagination
        );
      } catch (error) {
        console.error(
          "Failed to load products:",
          error
        );

        setError(
          "We couldn’t load the products right now."
        );
      } finally {
        setLoading(false);
      }
    }, [
      page,
      search,
      category,
      brand,
      minPrice,
      maxPrice,
      availability,
      sort,
    ]);

  /* =====================================================
     LOAD FILTER METADATA
  ===================================================== */

  const loadFilters =
    useCallback(async () => {
      try {
        const response =
          await getPublicProductFilters();

        setFilters(
          response.filters
        );
      } catch (error) {
        console.error(
          "Failed to load product filters:",
          error
        );
      }
    }, []);

  useEffect(() => {
    loadFilters();
  }, [loadFilters]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    setMinPriceInput(
      minPrice !== undefined
        ? String(minPrice)
        : ""
    );

    setMaxPriceInput(
      maxPrice !== undefined
        ? String(maxPrice)
        : ""
    );
  }, [
    minPrice,
    maxPrice,
  ]);

  useEffect(() => {
    setMobileFiltersOpen(false);
  }, [
    category,
    brand,
    availability,
    minPrice,
    maxPrice,
    sort,
  ]);

  /* =====================================================
     ACTIVE FILTER COUNT
  ===================================================== */

  const activeFilterCount =
    useMemo(() => {
      let count = 0;

      if (category) count++;
      if (brand) count++;
      if (
        minPrice !==
        undefined
      ) {
        count++;
      }

      if (
        maxPrice !==
        undefined
      ) {
        count++;
      }

      if (availability)
        count++;

      if (search) count++;

      return count;
    }, [
      category,
      brand,
      minPrice,
      maxPrice,
      availability,
      search,
    ]);

  /* =====================================================
     PAGE TITLE
  ===================================================== */

  const pageTitle =
    useMemo(() => {
      if (search) {
        return `Results for “${search}”`;
      }

      if (category) {
        return category;
      }

      return "Shop all products";
    }, [
      search,
      category,
    ]);

  /* =====================================================
     PRICE FILTER
  ===================================================== */

  const applyPriceRange =
    () => {
      const nextMin =
        minPriceInput.trim() ===
        ""
          ? undefined
          : Number(
              minPriceInput
            );

      const nextMax =
        maxPriceInput.trim() ===
        ""
          ? undefined
          : Number(
              maxPriceInput
            );

      if (
        nextMin !==
          undefined &&
        (!Number.isFinite(
          nextMin
        ) ||
          nextMin < 0)
      ) {
        return;
      }

      if (
        nextMax !==
          undefined &&
        (!Number.isFinite(
          nextMax
        ) ||
          nextMax < 0)
      ) {
        return;
      }

      if (
        nextMin !==
          undefined &&
        nextMax !==
          undefined &&
        nextMin > nextMax
      ) {
        return;
      }

      updateQuery({
        minPrice: nextMin,
        maxPrice: nextMax,
        page: 1,
      });
    };

  const removeFilter = (
    key: string
  ) => {
    updateQuery({
      [key]: undefined,
      page: 1,
    });
  };

  /* =====================================================
     FILTER PANEL
  ===================================================== */

  const renderFilterPanel =
    () => (
      <div className="space-y-8">
        {/* CATEGORY */}

        <div>
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-neutral-950">
              Category
            </h3>

            {category && (
              <button
                type="button"
                onClick={() =>
                  removeFilter(
                    "category"
                  )
                }
                className="text-xs font-medium text-neutral-500 transition hover:text-neutral-950"
              >
                Clear
              </button>
            )}
          </div>

          <div className="mt-4 space-y-2">
            {filters?.categories.map(
              (item) => {
                const selected =
                  item.toLowerCase() ===
                  category.toLowerCase();

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() =>
                      updateQuery({
                        category:
                          selected
                            ? undefined
                            : item,
                        page: 1,
                      })
                    }
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition ${
                      selected
                        ? "bg-neutral-950 font-medium text-white"
                        : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950"
                    }`}
                  >
                    <span>
                      {item}
                    </span>

                    {selected && (
                      <span className="text-xs">
                        ✓
                      </span>
                    )}
                  </button>
                );
              }
            )}
          </div>
        </div>

        {/* BRAND */}

        <div className="border-t border-neutral-200 pt-7">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-neutral-950">
              Brand
            </h3>

            {brand && (
              <button
                type="button"
                onClick={() =>
                  removeFilter(
                    "brand"
                  )
                }
                className="text-xs font-medium text-neutral-500 transition hover:text-neutral-950"
              >
                Clear
              </button>
            )}
          </div>

          <div className="mt-4 max-h-64 space-y-1 overflow-y-auto pr-1">
            {filters?.brands.map(
              (item) => {
                const selected =
                  item.toLowerCase() ===
                  brand.toLowerCase();

                return (
                  <label
                    key={item}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-950"
                  >
                    <input
                      type="radio"
                      name="brand"
                      checked={
                        selected
                      }
                      onChange={() =>
                        updateQuery({
                          brand:
                            item,
                          page: 1,
                        })
                      }
                      className="h-4 w-4 accent-black"
                    />

                    <span className="truncate">
                      {item}
                    </span>
                  </label>
                );
              }
            )}
          </div>
        </div>

        {/* PRICE */}

        <div className="border-t border-neutral-200 pt-7">
          <h3 className="text-sm font-semibold text-neutral-950">
            Price
          </h3>

          {filters && (
            <p className="mt-1 text-xs text-neutral-400">
              {formatPrice(
                filters
                  .priceRange
                  .min
              )}{" "}
              –{" "}
              {formatPrice(
                filters
                  .priceRange
                  .max
              )}
            </p>
          )}

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-500">
                Min
              </label>

              <input
                type="number"
                min="0"
                value={
                  minPriceInput
                }
                onChange={(
                  event
                ) =>
                  setMinPriceInput(
                    event
                      .target
                      .value
                  )
                }
                placeholder={
                  filters
                    ? String(
                        filters
                          .priceRange
                          .min
                      )
                    : "0"
                }
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-500">
                Max
              </label>

              <input
                type="number"
                min="0"
                value={
                  maxPriceInput
                }
                onChange={(
                  event
                ) =>
                  setMaxPriceInput(
                    event
                      .target
                      .value
                  )
                }
                placeholder={
                  filters
                    ? String(
                        filters
                          .priceRange
                          .max
                      )
                    : "10000"
                }
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={
              applyPriceRange
            }
            className="mt-3 w-full rounded-xl border border-neutral-950 px-4 py-2.5 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-950 hover:text-white"
          >
            Apply price
          </button>
        </div>

        {/* AVAILABILITY */}

        <div className="border-t border-neutral-200 pt-7">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-neutral-950">
              Availability
            </h3>

            {availability && (
              <button
                type="button"
                onClick={() =>
                  removeFilter(
                    "availability"
                  )
                }
                className="text-xs font-medium text-neutral-500 transition hover:text-neutral-950"
              >
                Clear
              </button>
            )}
          </div>

          <div className="mt-4 space-y-2">
            <button
              type="button"
              onClick={() =>
                updateQuery({
                  availability:
                    availability ===
                    "IN_STOCK"
                      ? undefined
                      : "IN_STOCK",
                  page: 1,
                })
              }
              className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm transition ${
                availability ===
                "IN_STOCK"
                  ? "bg-neutral-950 text-white"
                  : "bg-neutral-50 text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              <span>
                In stock
              </span>

              <span className="text-xs opacity-70">
                {filters
                  ?.availability
                  .inStock ?? 0}
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                updateQuery({
                  availability:
                    availability ===
                    "OUT_OF_STOCK"
                      ? undefined
                      : "OUT_OF_STOCK",
                  page: 1,
                })
              }
              className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm transition ${
                availability ===
                "OUT_OF_STOCK"
                  ? "bg-neutral-950 text-white"
                  : "bg-neutral-50 text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              <span>
                Out of stock
              </span>

              <span className="text-xs opacity-70">
                {filters
                  ?.availability
                  .outOfStock ??
                  0}
              </span>
            </button>
          </div>
        </div>
      </div>
    );

  return (
    <main className="min-h-screen bg-[#fafafa]">
      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-[1500px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-400">
            Eshop collection
          </p>

          <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="max-w-4xl text-3xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-4xl lg:text-5xl">
                {pageTitle}
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-500 sm:text-base">
                Discover
                thoughtfully selected
                products from our
                marketplace, with easy
                filtering and
                effortless browsing.
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <span className="font-semibold text-neutral-950">
                {
                  pagination.total
                }
              </span>

              {pagination.total ===
              1
                ? "product"
                : "products"}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* =================================================
            TOOLBAR
        ================================================= */}

        <div className="mb-6 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            {/* MOBILE FILTER BUTTON */}

            <button
              type="button"
              onClick={() =>
                setMobileFiltersOpen(
                  true
                )
              }
              className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-900 shadow-sm lg:hidden"
            >
              <Filter className="h-4 w-4" />

              Filters

              {activeFilterCount >
                0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-neutral-950 px-1.5 text-[10px] text-white">
                  {
                    activeFilterCount
                  }
                </span>
              )}
            </button>

            {/* SORT */}

            <div className="ml-auto flex items-center gap-3">
              <div className="hidden items-center gap-2 text-sm text-neutral-500 sm:flex">
                <SlidersHorizontal className="h-4 w-4" />
                Sort by
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setSortOpen(
                      (
                        current
                      ) =>
                        !current
                    )
                  }
                  aria-haspopup="listbox"
                  aria-expanded={
                    sortOpen
                  }
                  className="flex min-w-[190px] items-center justify-between gap-4 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-800 shadow-sm transition hover:border-neutral-300 hover:bg-neutral-50"
                >
                  <span className="truncate">
                    {
                      SORT_OPTIONS.find(
                        (
                          option
                        ) =>
                          option.value ===
                          sort
                      )?.label
                    }
                  </span>

                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-neutral-400 transition-transform duration-200 ${
                      sortOpen
                        ? "rotate-180"
                        : ""
                    }`}
                  />
                </button>

                {sortOpen && (
                  <>
                    {/* CLICK OUTSIDE */}

                    <button
                      type="button"
                      aria-label="Close sort menu"
                      onClick={() =>
                        setSortOpen(
                          false
                        )
                      }
                      className="fixed inset-0 z-40 cursor-default"
                    />

                    {/* DROPDOWN */}

                    <div
                      role="listbox"
                      className="absolute right-0 top-[calc(100%+8px)] z-50 w-[230px] overflow-hidden rounded-2xl border border-neutral-200 bg-white p-1.5 shadow-[0_18px_50px_rgba(0,0,0,0.12)]"
                    >
                      <div className="px-3 pb-2 pt-2">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                          Sort products
                        </p>
                      </div>

                      {SORT_OPTIONS.map(
                        (
                          option
                        ) => {
                          const selected =
                            option.value ===
                            sort;

                          return (
                            <button
                              key={
                                option.value
                              }
                              type="button"
                              role="option"
                              aria-selected={
                                selected
                              }
                              onClick={() => {
                                updateQuery(
                                  {
                                    sort:
                                      option.value,
                                    page: 1,
                                  }
                                );

                                setSortOpen(
                                  false
                                );
                              }}
                              className={`flex w-full items-center justify-between gap-4 rounded-xl px-3 py-3 text-left text-sm transition ${
                                selected
                                  ? "bg-neutral-950 font-semibold text-white"
                                  : "font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950"
                              }`}
                            >
                              <span>
                                {
                                  option.label
                                }
                              </span>

                              {selected && (
                                <Check className="h-4 w-4 shrink-0" />
                              )}
                            </button>
                          );
                        }
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* =================================================
              ACTIVE FILTER CHIPS
          ================================================= */}

          {activeFilterCount >
            0 && (
            <div className="flex flex-wrap items-center gap-2">
              {search && (
                <FilterChip
                  label={`Search: ${search}`}
                  onRemove={() =>
                    removeFilter(
                      "search"
                    )
                  }
                />
              )}

              {category && (
                <FilterChip
                  label={
                    category
                  }
                  onRemove={() =>
                    removeFilter(
                      "category"
                    )
                  }
                />
              )}

              {brand && (
                <FilterChip
                  label={brand}
                  onRemove={() =>
                    removeFilter(
                      "brand"
                    )
                  }
                />
              )}

              {minPrice !==
                undefined && (
                <FilterChip
                  label={`Min ${formatPrice(
                    minPrice
                  )}`}
                  onRemove={() =>
                    removeFilter(
                      "minPrice"
                    )
                  }
                />
              )}

              {maxPrice !==
                undefined && (
                <FilterChip
                  label={`Max ${formatPrice(
                    maxPrice
                  )}`}
                  onRemove={() =>
                    removeFilter(
                      "maxPrice"
                    )
                  }
                />
              )}

              {availability && (
                <FilterChip
                  label={
                    availability ===
                    "IN_STOCK"
                      ? "In stock"
                      : "Out of stock"
                  }
                  onRemove={() =>
                    removeFilter(
                      "availability"
                    )
                  }
                />
              )}

              <button
                type="button"
                onClick={
                  clearAllFilters
                }
                className="ml-1 text-xs font-semibold text-neutral-500 underline-offset-4 transition hover:text-neutral-950 hover:underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* =====================================================
            MAIN GRID
        ===================================================== */}

        <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)]">
          {/* DESKTOP FILTERS */}

          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="mb-7 flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-neutral-500" />

                <h2 className="font-semibold text-neutral-950">
                  Filters
                </h2>
              </div>

              {renderFilterPanel()}
            </div>
          </aside>

          {/* PRODUCTS */}

          <section className="min-w-0">
            {loading ? (
              <ProductsSkeleton />
            ) : error ? (
              <ErrorState
                message={error}
                onRetry={
                  loadProducts
                }
              />
            ) : products.length ===
              0 ? (
              <EmptyState
                onClear={
                  clearAllFilters
                }
              />
            ) : (
              <>
                <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
                  {products.map(
                    (product) => (
                      <ProductCard
                        key={
                          product.id
                        }
                        product={
                          product
                        }
                      />
                    )
                  )}
                </div>

                {pagination.pages >
                  1 && (
                  <Pagination
                    page={
                      pagination.page
                    }
                    pages={
                      pagination.pages
                    }
                    onChange={(
                      nextPage
                    ) => {
                      updateQuery({
                        page:
                          nextPage,
                      });

                      window.scrollTo(
                        {
                          top: 0,
                          behavior:
                            "smooth",
                        }
                      );
                    }}
                  />
                )}
              </>
            )}
          </section>
        </div>
      </div>

      {/* =====================================================
          MOBILE FILTER DRAWER
      ===================================================== */}

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <button
            type="button"
            aria-label="Close filters"
            onClick={() =>
              setMobileFiltersOpen(
                false
              )
            }
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
          />

          <div className="absolute inset-y-0 right-0 flex w-[88%] max-w-sm flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-5">
              <div>
                <h2 className="text-lg font-semibold text-neutral-950">
                  Filters
                </h2>

                <p className="mt-0.5 text-xs text-neutral-500">
                  Refine your
                  collection
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setMobileFiltersOpen(
                    false
                  )
                }
                className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-6">
              {renderFilterPanel()}
            </div>

            <div className="border-t border-neutral-200 bg-white p-4">
              <button
                type="button"
                onClick={() =>
                  setMobileFiltersOpen(
                    false
                  )
                }
                className="w-full rounded-2xl bg-neutral-950 px-5 py-3.5 text-sm font-semibold text-white"
              >
                View{" "}
                {
                  pagination.total
                }{" "}
                products
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

/* =====================================================
   FILTER CHIP
===================================================== */

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 shadow-sm">
      {label}

      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label}`}
        className="rounded-full text-neutral-400 transition hover:text-neutral-950"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </span>
  );
}

/* =====================================================
   PRODUCTS SKELETON
===================================================== */

function ProductsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({
        length: 9,
      }).map(
        (_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-3xl border border-neutral-200 bg-white"
          >
            <div className="aspect-[4/5] animate-pulse bg-neutral-200" />

            <div className="space-y-3 p-5">
              <div className="h-3 w-24 animate-pulse rounded bg-neutral-200" />

              <div className="h-5 w-4/5 animate-pulse rounded bg-neutral-200" />

              <div className="h-5 w-2/5 animate-pulse rounded bg-neutral-200" />
            </div>
          </div>
        )
      )}
    </div>
  );
}

/* =====================================================
   ERROR STATE
===================================================== */

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex min-h-[460px] flex-col items-center justify-center rounded-3xl border border-neutral-200 bg-white px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100">
        <Search className="h-6 w-6 text-neutral-500" />
      </div>

      <h2 className="mt-5 text-xl font-semibold text-neutral-950">
        Something went wrong
      </h2>

      <p className="mt-2 max-w-md text-sm leading-6 text-neutral-500">
        {message}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-6 rounded-xl bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
      >
        Try again
      </button>
    </div>
  );
}

/* =====================================================
   EMPTY STATE
===================================================== */

function EmptyState({
  onClear,
}: {
  onClear: () => void;
}) {
  return (
    <div className="flex min-h-[460px] flex-col items-center justify-center rounded-3xl border border-dashed border-neutral-300 bg-white px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100">
        <Search className="h-6 w-6 text-neutral-500" />
      </div>

      <h2 className="mt-5 text-xl font-semibold text-neutral-950">
        No products found
      </h2>

      <p className="mt-2 max-w-md text-sm leading-6 text-neutral-500">
        Try changing your
        category, brand, price
        range or availability
        filters.
      </p>

      <button
        type="button"
        onClick={onClear}
        className="mt-6 rounded-xl bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
      >
        Clear all filters
      </button>
    </div>
  );
}

/* =====================================================
   PAGINATION
===================================================== */

function Pagination({
  page,
  pages,
  onChange,
}: {
  page: number;
  pages: number;
  onChange: (
    page: number
  ) => void;
}) {
  const pageNumbers =
    Array.from(
      {
        length: pages,
      },
      (_, index) =>
        index + 1
    );

  return (
    <nav
      aria-label="Product pagination"
      className="mt-12 flex flex-wrap items-center justify-center gap-2 border-t border-neutral-200 pt-8"
    >
      <button
        type="button"
        disabled={page <= 1}
        onClick={() =>
          onChange(page - 1)
        }
        className="flex h-10 items-center gap-1 rounded-xl border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-700 transition hover:border-neutral-950 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" />
        Prev
      </button>

      {pageNumbers.map(
        (
          pageNumber
        ) => (
          <button
            type="button"
            key={pageNumber}
            onClick={() =>
              onChange(
                pageNumber
              )
            }
            className={`flex h-10 min-w-10 items-center justify-center rounded-xl px-3 text-sm font-semibold transition ${
              page ===
              pageNumber
                ? "bg-neutral-950 text-white"
                : "border border-neutral-200 bg-white text-neutral-700 hover:border-neutral-950"
            }`}
          >
            {pageNumber}
          </button>
        )
      )}

      <button
        type="button"
        disabled={
          page >= pages
        }
        onClick={() =>
          onChange(page + 1)
        }
        className="flex h-10 items-center gap-1 rounded-xl border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-700 transition hover:border-neutral-950 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next

        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}

function ProductsPageFallback() {
  return (
    <main className="min-h-screen bg-[#fafafa]">
      <section className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-[1500px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="h-3 w-32 animate-pulse rounded bg-neutral-200" />

          <div className="mt-4 h-12 max-w-xl animate-pulse rounded-xl bg-neutral-200" />

          <div className="mt-4 h-5 max-w-2xl animate-pulse rounded bg-neutral-100" />
        </div>
      </section>

      <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
        <ProductsSkeleton />
      </div>
    </main>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsPageFallback />}>
      <ProductsContent />
    </Suspense>
  );
}