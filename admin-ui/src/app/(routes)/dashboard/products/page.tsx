"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import axios from "axios";
import Image from "next/image";

import {
  AlertTriangle,
  Archive,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Loader2,
  Package,
  RefreshCw,
  Search,
  Send,
  Store,
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
  getAdminProducts,
  updateAdminProductStatus,
} from "@/services/admin-product.service";

import {
  AdminProduct,
  AdminProductPagination,
  ProductStatus,
  ProductStockFilter,
} from "@/types/admin-product";

const PAGE_LIMIT = 10;

type StatusFilter =
  | ""
  | ProductStatus;

type StockFilter =
  | ""
  | ProductStockFilter;

const statusOptions:
  AdminFilterOption<StatusFilter>[] =
  [
    {
      label: "All statuses",
      description:
        "Every catalog status",
      value: "",
      dotClassName:
        "bg-neutral-300",
    },
    {
      label: "Published",
      description:
        "Visible to customers",
      value: "PUBLISHED",
      dotClassName:
        "bg-emerald-500",
    },
    {
      label: "Draft",
      description:
        "Unpublished listings",
      value: "DRAFT",
      dotClassName:
        "bg-amber-500",
    },
    {
      label: "Out of stock",
      description:
        "Unavailable inventory",
      value:
        "OUT_OF_STOCK",
      dotClassName:
        "bg-red-500",
    },
    {
      label: "Archived",
      description:
        "Removed from catalog",
      value: "ARCHIVED",
      dotClassName:
        "bg-neutral-500",
    },
  ];

const stockOptions:
  AdminFilterOption<StockFilter>[] =
  [
    {
      label: "All stock",
      description:
        "Every inventory level",
      value: "",
      dotClassName:
        "bg-neutral-300",
    },
    {
      label: "In stock",
      description:
        "More than 10 units",
      value: "IN_STOCK",
      dotClassName:
        "bg-emerald-500",
    },
    {
      label: "Low stock",
      description:
        "Between 1 and 10 units",
      value: "LOW_STOCK",
      dotClassName:
        "bg-amber-500",
    },
    {
      label: "Out of stock",
      description:
        "No available units",
      value:
        "OUT_OF_STOCK",
      dotClassName:
        "bg-red-500",
    },
  ];

const initialPagination:
  AdminProductPagination = {
    page: 1,
    limit: PAGE_LIMIT,
    totalProducts: 0,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  };

export default function AdminProductsPage() {
  const router =
    useRouter();

  const {
    clearAdmin,
  } = useAdminContext();

  const [
    products,
    setProducts,
  ] = useState<
    AdminProduct[]
  >([]);

  const [
    pagination,
    setPagination,
  ] =
    useState<AdminProductPagination>(
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
    stock,
    setStock,
  ] =
    useState<StockFilter>(
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
    updatingProductId,
    setUpdatingProductId,
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

  const loadProducts =
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
            await getAdminProducts({
              page,
              limit:
                PAGE_LIMIT,

              search:
                search ||
                undefined,

              status:
                status ||
                undefined,

              stock:
                stock ||
                undefined,
            });

          setProducts(
            response.products
          );

          setPagination(
            response.pagination
          );
        } catch (
          requestError
        ) {
          handleError(
            requestError,
            "Unable to load products."
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [
        handleError,
        page,
        search,
        status,
        stock,
      ]
    );

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const handleStatusUpdate =
    async (
      product: AdminProduct,
      nextStatus:
        ProductStatus
    ) => {
      const action =
        nextStatus ===
        "ARCHIVED"
          ? "archive"
          : "publish";

      if (
        !window.confirm(
          `Are you sure you want to ${action} "${product.title}"?`
        )
      ) {
        return;
      }

      try {
        setUpdatingProductId(
          product.id
        );

        setError("");
        setSuccess("");

        const response =
          await updateAdminProductStatus(
            product.id,
            nextStatus
          );

        setProducts(
          (current) =>
            current.map(
              (item) =>
                item.id ===
                product.id
                  ? {
                      ...item,

                      status:
                        response
                          .product
                          .status,

                      updatedAt:
                        response
                          .product
                          .updatedAt,
                    }
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
          `Unable to ${action} product.`
        );
      } finally {
        setUpdatingProductId(
          null
        );
      }
    };

  const clearFilters =
    () => {
      setSearchInput("");
      setSearch("");
      setStatus("");
      setStock("");
      setPage(1);
    };

  const hasFilters =
    Boolean(
      search ||
        status ||
        stock
    );

  return (
    <div className="mx-auto w-full max-w-[1500px]">
      <section className="relative overflow-hidden rounded-[32px] bg-[#080d19] px-6 py-8 text-white shadow-[0_22px_70px_rgba(8,13,25,0.16)] sm:px-8 lg:px-10">
        <div
          aria-hidden="true"
          className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl"
        />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Catalog operations
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
              Products
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
              Monitor products from
              every seller, review
              inventory health and
              control catalog
              visibility.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.05] px-5 py-3">
            <p className="text-2xl font-semibold">
              {
                pagination.totalProducts
              }
            </p>

            <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-slate-500">
              Matching products
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
              placeholder="Search product, brand, SKU, category or seller..."
              className="min-h-12 w-full rounded-2xl border border-black/[0.08] bg-neutral-50 pl-11 pr-4 text-sm outline-none focus:border-black/30 focus:bg-white focus:ring-4 focus:ring-black/[0.03]"
            />
          </div>

          <AdminFilterDropdown
            value={status}
            label="Product status"
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
            value={stock}
            label="Stock health"
            options={
              stockOptions
            }
            onChange={(
              value
            ) => {
              setStock(value);
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
              void loadProducts(
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
            message={success}
            success
          />
        )}

        {error && (
          <Message
            message={error}
          />
        )}

        {loading ? (
          <div className="flex min-h-[450px] items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-neutral-500" />
          </div>
        ) : products.length ===
          0 ? (
          <div className="flex min-h-[450px] flex-col items-center justify-center px-6 text-center">
            <Package className="h-8 w-8 text-neutral-300" />

            <h2 className="mt-4 text-lg font-semibold text-neutral-950">
              No products found
            </h2>

            <p className="mt-2 text-sm text-neutral-500">
              Try changing your
              search or filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr className="border-b border-black/[0.06] bg-neutral-50/80 text-left">
                  <Heading>
                    Product
                  </Heading>

                  <Heading>
                    Seller
                  </Heading>

                  <Heading>
                    Price
                  </Heading>

                  <Heading>
                    Inventory
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
                {products.map(
                  (product) => (
                    <ProductRow
                      key={
                        product.id
                      }
                      product={
                        product
                      }
                      updating={
                        updatingProductId ===
                        product.id
                      }
                      onStatusUpdate={(
                        nextStatus
                      ) =>
                        void handleStatusUpdate(
                          product,
                          nextStatus
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
                      (current) =>
                        Math.max(
                          current -
                            1,
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
                      (current) =>
                        current +
                        1
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

function ProductRow({
  product,
  updating,
  onStatusUpdate,
}: {
  product: AdminProduct;
  updating: boolean;
  onStatusUpdate: (
    status: ProductStatus
  ) => void;
}) {
  const canPublish =
    product.status !==
      "PUBLISHED" &&
    product.stock > 0;

  return (
    <tr className="border-b border-black/[0.05] last:border-0 hover:bg-neutral-50/70">
      <td className="px-6 py-4">
        <div className="flex min-w-[280px] items-center gap-4">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-black/[0.06] bg-neutral-100">
            {product.image ? (
              <Image
                src={
                  product.image
                }
                alt={
                  product.title
                }
                fill
                sizes="56px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <ImageIcon className="h-5 w-5 text-neutral-300" />
              </div>
            )}
          </div>

          <div className="min-w-0">
            <p className="max-w-[250px] truncate text-sm font-semibold text-neutral-950">
              {product.title}
            </p>

            <p className="mt-1 text-xs text-neutral-400">
              {product.brand ||
                "No brand"}
              {" · "}
              {product.category}
            </p>

            {product.sku && (
              <p className="mt-1 text-[10px] text-neutral-400">
                SKU:{" "}
                {product.sku}
              </p>
            )}
          </div>
        </div>
      </td>

      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <Store className="h-4 w-4 text-neutral-400" />

          <div>
            <p className="max-w-[180px] truncate text-sm font-medium text-neutral-800">
              {product.shopName ||
                product.sellerName}
            </p>

            <p className="mt-1 max-w-[180px] truncate text-[10px] text-neutral-400">
              {
                product.sellerName
              }
            </p>
          </div>
        </div>
      </td>

      <td className="px-6 py-4">
        <p className="text-sm font-semibold text-neutral-950">
          {formatINR(
            product.salePrice
          )}
        </p>

        {product.salePrice <
          product.price && (
          <p className="mt-1 text-xs text-neutral-400 line-through">
            {formatINR(
              product.price
            )}
          </p>
        )}
      </td>

      <td className="px-6 py-4">
        <StockBadge
          stock={
            product.stock
          }
        />
      </td>

      <td className="px-6 py-4">
        <ProductStatusBadge
          status={
            product.status
          }
        />
      </td>

      <td className="px-6 py-4 text-right">
        {updating ? (
          <button
            type="button"
            disabled
            className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-neutral-100 px-4 text-xs font-semibold text-neutral-500"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            Updating...
          </button>
        ) : canPublish ? (
          <button
            type="button"
            onClick={() =>
              onStatusUpdate(
                "PUBLISHED"
              )
            }
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
          >
            <Send className="h-4 w-4" />
            Publish
          </button>
        ) : product.status ===
          "PUBLISHED" ? (
          <button
            type="button"
            onClick={() =>
              onStatusUpdate(
                "ARCHIVED"
              )
            }
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-xs font-semibold text-red-700 hover:bg-red-100"
          >
            <Archive className="h-4 w-4" />
            Archive
          </button>
        ) : (
          <span className="text-xs text-neutral-400">
            Stock required
          </span>
        )}
      </td>
    </tr>
  );
}

function ProductStatusBadge({
  status,
}: {
  status: ProductStatus;
}) {
  const classes = {
    PUBLISHED:
      "bg-emerald-50 text-emerald-700",
    DRAFT:
      "bg-amber-50 text-amber-700",
    OUT_OF_STOCK:
      "bg-red-50 text-red-700",
    ARCHIVED:
      "bg-neutral-100 text-neutral-600",
  }[status];

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${classes}`}
    >
      {formatStatus(status)}
    </span>
  );
}

function StockBadge({
  stock,
}: {
  stock: number;
}) {
  const classes =
    stock <= 0
      ? "bg-red-50 text-red-700"
      : stock <= 10
        ? "bg-amber-50 text-amber-700"
        : "bg-emerald-50 text-emerald-700";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${classes}`}
    >
      {stock} units
    </span>
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
        <Package className="h-4 w-4" />
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

function formatStatus(
  value: string
) {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase()
    );
}

function formatINR(
  value: number
) {
  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }
  ).format(value);
}