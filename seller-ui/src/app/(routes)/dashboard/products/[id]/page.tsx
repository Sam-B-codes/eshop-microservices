"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import Image from "next/image";

import {
  ArrowLeft,
  Boxes,
  ImageIcon,
  Package2,
  Pencil,
  Tag,
  Trash2,
} from "lucide-react";

import { toast } from "sonner";

import {
  deleteProduct,
  getProductById,
} from "@/services/product.service";

import { Product } from "@/types/product";

import { formatINR } from "@/utils/currency";

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const id =
    params.id as string;

  const [
    product,
    setProduct,
  ] =
    useState<Product | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    deleting,
    setDeleting,
  ] = useState(false);

  /* ============================================================
     LOAD PRODUCT
  ============================================================ */

  useEffect(() => {
    const loadProduct =
      async () => {
        try {
          setLoading(true);

          const response =
            await getProductById(
              id
            );

          setProduct(
            response.product
          );
        } catch (error) {
          console.error(
            "Failed to load product:",
            error
          );

          toast.error(
            "Failed to load product."
          );
        } finally {
          setLoading(false);
        }
      };

    if (id) {
      loadProduct();
    }
  }, [id]);

  /* ============================================================
     DELETE PRODUCT
  ============================================================ */

  const handleDelete =
    async () => {
      if (!product) return;

      const confirmed =
        window.confirm(
          `Are you sure you want to delete "${product.title}"?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setDeleting(true);

        await deleteProduct(
          product.id
        );

        toast.success(
          "Product deleted successfully."
        );

        router.push(
          "/dashboard/products"
        );
      } catch (error) {
        console.error(
          "Delete failed:",
          error
        );

        toast.error(
          "Failed to delete product."
        );
      } finally {
        setDeleting(false);
      }
    };

  /* ============================================================
     LOADING
  ============================================================ */

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-[28px] border border-black/[0.06] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.035)]">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-100">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-300 border-t-[#0b1220]" />
          </div>

          <div className="text-center">
            <p className="text-sm font-semibold text-neutral-800">
              Loading product
            </p>

            <p className="mt-1 text-xs text-neutral-400">
              Fetching product
              details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ============================================================
     NOT FOUND
  ============================================================ */

  if (!product) {
    return (
      <div className="min-w-0 space-y-5">
        <button
          type="button"
          onClick={() =>
            router.push(
              "/dashboard/products"
            )
          }
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-500 transition hover:text-neutral-950"
        >
          <ArrowLeft className="h-4 w-4" />

          Back to products
        </button>

        <section className="flex min-h-[340px] flex-col items-center justify-center rounded-[28px] border border-black/[0.06] bg-white px-6 text-center shadow-[0_12px_40px_rgba(0,0,0,0.035)]">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-500">
            <Package2 className="h-5 w-5" />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-neutral-950">
            Product not found
          </h2>

          <p className="mt-2 max-w-sm text-sm leading-6 text-neutral-500">
            This product may have
            been deleted or is no
            longer available.
          </p>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/dashboard/products"
              )
            }
            className="mt-5 rounded-full bg-[#0b1220] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#172033]"
          >
            View products
          </button>
        </section>
      </div>
    );
  }

  /* ============================================================
     PRICING
  ============================================================ */

  const hasDiscount =
    product.discountPrice !=
      null &&
    product.discountPrice >=
      0 &&
    product.discountPrice <
      product.price;

  const finalPrice =
    hasDiscount
      ? product.discountPrice!
      : product.price;

  const savings =
    hasDiscount
      ? product.price -
        finalPrice
      : 0;

  const discountPercentage =
    hasDiscount
      ? Math.round(
          (savings /
            product.price) *
            100
        )
      : 0;

  return (
    <div className="min-w-0 space-y-6">
      {/* ======================================================
          BACK
      ====================================================== */}

      <button
        type="button"
        onClick={() =>
          router.push(
            "/dashboard/products"
          )
        }
        className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-500 transition hover:text-neutral-950"
      >
        <ArrowLeft className="h-4 w-4" />

        Back to products
      </button>

      {/* ======================================================
          HEADER
      ====================================================== */}

      <section className="overflow-hidden rounded-[28px] border border-black/[0.06] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.035)]">
        <div className="flex flex-col gap-6 px-5 py-6 sm:px-7 sm:py-7 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
              Catalog management
            </p>

            <h1 className="mt-2 break-words text-3xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-[34px]">
              {product.title}
            </h1>

            <p className="mt-2 text-sm text-neutral-500">
              Review product
              information, pricing,
              inventory and media.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <StatusBadge
                status={
                  product.status
                }
              />

              <span className="rounded-full border border-black/[0.06] bg-neutral-50 px-3 py-1.5 text-[10px] font-semibold text-neutral-500">
                {
                  product.category
                }
              </span>

              {product.brand && (
                <span className="rounded-full border border-black/[0.06] bg-neutral-50 px-3 py-1.5 text-[10px] font-semibold text-neutral-500">
                  {product.brand}
                </span>
              )}
            </div>
          </div>

          <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row">
            <button
              type="button"
              onClick={() =>
                router.push(
                  `/dashboard/products/${product.id}/edit`
                )
              }
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#0b1220] px-5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(11,18,32,0.1)] transition hover:bg-[#172033]"
            >
              <Pencil className="h-4 w-4" />

              Edit product
            </button>

            <button
              type="button"
              onClick={
                handleDelete
              }
              disabled={deleting}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-red-200 bg-white px-5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />

              {deleting
                ? "Deleting..."
                : "Delete"}
            </button>
          </div>
        </div>
      </section>

      {/* ======================================================
          MAIN
      ====================================================== */}

      <div className="grid min-w-0 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        {/* ====================================================
            LEFT
        ==================================================== */}

        <div className="min-w-0 space-y-6">
          {/* ==================================================
              MEDIA
          ================================================== */}

          <section className="overflow-hidden rounded-[26px] border border-black/[0.06] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.035)]">
            <div className="flex items-center justify-between gap-4 border-b border-black/[0.06] px-5 py-5 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-100 text-[#0b1220]">
                  <ImageIcon className="h-[18px] w-[18px]" />
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-neutral-950">
                    Product media
                  </h2>

                  <p className="mt-1 text-xs text-neutral-500">
                    Images shown to
                    customers.
                  </p>
                </div>
              </div>

              <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-[10px] font-semibold text-neutral-500">
                {product.images
                  ?.length || 0}{" "}
                images
              </span>
            </div>

            <div className="p-5 sm:p-6">
              {product.images &&
              product.images.length >
                0 ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {product.images.map(
                    (
                      image,
                      index
                    ) => (
                      <div
                        key={
                          image.publicId ||
                          index
                        }
                        className="group relative aspect-square overflow-hidden rounded-2xl border border-black/[0.06] bg-neutral-100"
                      >
                        <Image
                          src={
                            image.url
                          }
                          alt={`${product.title} ${index + 1}`}
                          fill
                          sizes="(max-width: 640px) 100vw, 320px"
                          className="object-cover transition duration-300 group-hover:scale-[1.025]"
                        />

                        {index ===
                          0 && (
                          <span className="absolute left-3 top-3 rounded-full bg-[#0b1220] px-2.5 py-1 text-[10px] font-semibold text-white">
                            Primary
                          </span>
                        )}
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="flex min-h-[240px] flex-col items-center justify-center rounded-2xl border border-dashed border-black/[0.1] bg-neutral-50">
                  <ImageIcon className="h-6 w-6 text-neutral-300" />

                  <p className="mt-3 text-xs font-medium text-neutral-400">
                    No product images
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* ==================================================
              DESCRIPTION
          ================================================== */}

          <section className="overflow-hidden rounded-[26px] border border-black/[0.06] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.035)]">
            <div className="flex items-center gap-3 border-b border-black/[0.06] px-5 py-5 sm:px-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-100 text-[#0b1220]">
                <Package2 className="h-[18px] w-[18px]" />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-neutral-950">
                  Description
                </h2>

                <p className="mt-1 text-xs text-neutral-500">
                  Product information
                  shown to customers.
                </p>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <p className="whitespace-pre-line text-sm leading-7 text-neutral-600">
                {product.description}
              </p>
            </div>
          </section>
        </div>

        {/* ====================================================
            RIGHT
        ==================================================== */}

        <aside className="min-w-0 space-y-6 xl:sticky xl:top-6">
          {/* ==================================================
              PRICING
          ================================================== */}

          <section className="overflow-hidden rounded-[26px] border border-black/[0.06] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.035)]">
            <div className="border-b border-black/[0.06] px-5 py-5">
              <h2 className="text-sm font-semibold text-neutral-950">
                Pricing
              </h2>

              <p className="mt-1 text-xs text-neutral-500">
                Customer-facing
                pricing.
              </p>
            </div>

            <div className="p-5">
              {hasDiscount && (
                <p className="text-sm font-medium text-neutral-400 line-through">
                  {formatINR(
                    product.price
                  )}
                </p>
              )}

              <p className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-neutral-950">
                {formatINR(
                  finalPrice
                )}
              </p>

              {hasDiscount && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-semibold text-emerald-700">
                    {
                      discountPercentage
                    }
                    % off
                  </span>

                  <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-[10px] font-semibold text-neutral-600">
                    Save{" "}
                    {formatINR(
                      savings
                    )}
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* ==================================================
              INVENTORY
          ================================================== */}

          <section className="overflow-hidden rounded-[26px] border border-black/[0.06] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.035)]">
            <div className="flex items-center gap-3 border-b border-black/[0.06] px-5 py-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100">
                <Boxes className="h-4 w-4 text-neutral-600" />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-neutral-950">
                  Inventory
                </h2>

                <p className="mt-1 text-xs text-neutral-500">
                  Stock and SKU.
                </p>
              </div>
            </div>

            <div className="space-y-5 p-5">
              <StockCard
                stock={
                  product.stock
                }
              />

              <Detail
                label="SKU"
                value={
                  product.sku ||
                  "No SKU"
                }
              />
            </div>
          </section>

          {/* ==================================================
              ORGANIZATION
          ================================================== */}

          <section className="overflow-hidden rounded-[26px] border border-black/[0.06] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.035)]">
            <div className="border-b border-black/[0.06] px-5 py-5">
              <h2 className="text-sm font-semibold text-neutral-950">
                Organization
              </h2>

              <p className="mt-1 text-xs text-neutral-500">
                Catalog metadata.
              </p>
            </div>

            <div className="space-y-4 p-5">
              <Detail
                label="Category"
                value={
                  product.category
                }
              />

              <Detail
                label="Brand"
                value={
                  product.brand ||
                  "No brand"
                }
              />

              <Detail
                label="Status"
                value={formatStatus(
                  product.status
                )}
              />
            </div>
          </section>

          {/* ==================================================
              TAGS
          ================================================== */}

          <section className="overflow-hidden rounded-[26px] border border-black/[0.06] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.035)]">
            <div className="flex items-center gap-3 border-b border-black/[0.06] px-5 py-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100">
                <Tag className="h-4 w-4 text-neutral-600" />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-neutral-950">
                  Tags
                </h2>

                <p className="mt-1 text-xs text-neutral-500">
                  Search keywords.
                </p>
              </div>
            </div>

            <div className="p-5">
              {product.tags &&
              product.tags.length >
                0 ? (
                <div className="flex flex-wrap gap-2">
                  {product.tags.map(
                    (tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-black/[0.06] bg-neutral-50 px-3 py-1.5 text-[10px] font-semibold text-neutral-600"
                      >
                        #{tag}
                      </span>
                    )
                  )}
                </div>
              ) : (
                <p className="text-xs text-neutral-400">
                  No tags added.
                </p>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

/* ============================================================
   DETAIL ROW
============================================================ */

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-black/[0.05] pb-4 last:border-b-0 last:pb-0">
      <p className="text-xs font-medium text-neutral-400">
        {label}
      </p>

      <p className="max-w-[65%] break-words text-right text-xs font-semibold text-neutral-800">
        {value}
      </p>
    </div>
  );
}

/* ============================================================
   STOCK
============================================================ */

function StockCard({
  stock,
}: {
  stock: number;
}) {
  const config =
    stock === 0
      ? {
          label:
            "Out of stock",
          dot:
            "bg-red-500",
          text:
            "text-red-600",
          background:
            "bg-red-50/60 border-red-100",
        }
      : stock <= 10
        ? {
            label:
              "Low stock",
            dot:
              "bg-amber-500",
            text:
              "text-amber-700",
            background:
              "bg-amber-50/60 border-amber-100",
          }
        : {
            label:
              "In stock",
            dot:
              "bg-emerald-500",
            text:
              "text-emerald-700",
            background:
              "bg-emerald-50/60 border-emerald-100",
          };

  return (
    <div
      className={`rounded-2xl border p-4 ${config.background}`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
        Available
      </p>

      <p className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-neutral-950">
        {stock}

        <span className="ml-1 text-xs font-medium text-neutral-400">
          units
        </span>
      </p>

      <div className="mt-3 flex items-center gap-2">
        <span
          className={`h-1.5 w-1.5 rounded-full ${config.dot}`}
        />

        <span
          className={`text-[11px] font-semibold ${config.text}`}
        >
          {config.label}
        </span>
      </div>
    </div>
  );
}

/* ============================================================
   STATUS BADGE
============================================================ */

function StatusBadge({
  status,
}: {
  status: Product["status"];
}) {
  const style =
    status === "PUBLISHED"
      ? "border-emerald-100 bg-emerald-50 text-emerald-700"
      : status ===
          "OUT_OF_STOCK"
        ? "border-red-100 bg-red-50 text-red-700"
        : status ===
            "ARCHIVED"
          ? "border-black/[0.05] bg-neutral-100 text-neutral-600"
          : "border-amber-100 bg-amber-50 text-amber-700";

  return (
    <span
      className={`rounded-full border px-3 py-1.5 text-[10px] font-semibold ${style}`}
    >
      {formatStatus(
        status
      )}
    </span>
  );
}

/* ============================================================
   STATUS FORMATTER
============================================================ */

function formatStatus(
  status: string
) {
  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase()
    );
}