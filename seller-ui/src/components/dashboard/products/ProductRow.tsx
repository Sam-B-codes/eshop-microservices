"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Eye,
  ImageIcon,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";

import { useRouter } from "next/navigation";

import { Product } from "@/types/product";
import { formatINR } from "@/utils/currency";

interface ProductRowProps {
  product: Product;
  onDelete: (
    id: string
  ) => Promise<void>;
}

export default function ProductRow({
  product,
  onDelete,
}: ProductRowProps) {
  const router = useRouter();

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const menuRef =
    useRef<HTMLDivElement>(null);

  /* ============================================================
     CLOSE MENU ON OUTSIDE CLICK
  ============================================================ */

  useEffect(() => {
    const handleOutsideClick = (
      event: MouseEvent
    ) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target as Node
        )
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  /* ============================================================
     CLOSE MENU ON ESCAPE
  ============================================================ */

  useEffect(() => {
    const handleEscape = (
      event: KeyboardEvent
    ) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
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

  /* ============================================================
     DELETE PRODUCT
  ============================================================ */

  const handleDelete = async () => {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${product.title}"?`
      );

    if (!confirmed) return;

    try {
      setDeleting(true);

      await onDelete(product.id);
    } finally {
      setDeleting(false);
    }
  };

  /* ============================================================
     PRICE
  ============================================================ */

  const hasDiscount =
    product.discountPrice != null &&
    product.discountPrice >= 0 &&
    product.discountPrice <
      product.price;

  /* ============================================================
     STATUS
  ============================================================ */

  const statusConfig =
    getStatusConfig(product.status);

  return (
    <tr className="group border-b border-black/[0.05] transition last:border-b-0 hover:bg-neutral-50/80">
      {/* PRODUCT */}

      <td className="px-6 py-4">
        <div className="flex min-w-[280px] items-center gap-4">
          {/* Image */}

          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-black/[0.06] bg-neutral-100">
            {product.images &&
            product.images.length > 0 ? (
              <img
                src={product.images[0].url}
                alt={product.title}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <ImageIcon
                  className="h-5 w-5 text-neutral-300"
                  strokeWidth={1.7}
                />
              </div>
            )}
          </div>

          {/* Product Information */}

          <div className="min-w-0">
            <button
              type="button"
              onClick={() =>
                router.push(
                  `/dashboard/products/${product.id}`
                )
              }
              className="block max-w-[260px] truncate text-left text-sm font-semibold text-neutral-950 transition hover:text-neutral-600"
            >
              {product.title}
            </button>

            <p className="mt-1 max-w-[240px] truncate text-xs text-neutral-500">
              {product.brand ||
                "No brand"}
            </p>
          </div>
        </div>
      </td>

      {/* CATEGORY */}

      <td className="px-6 py-4">
        <span className="text-sm font-medium text-neutral-600">
          {product.category}
        </span>
      </td>

      {/* PRICE */}

      <td className="px-6 py-4">
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-neutral-950">
            {formatINR(
              product.price
            )}
          </span>

          {hasDiscount && (
            <span className="mt-1 text-xs font-semibold text-emerald-600">
              {formatINR(
                product.discountPrice
              )}{" "}
              sale
            </span>
          )}
        </div>
      </td>

      {/* STOCK */}

      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              product.stock === 0
                ? "bg-red-500"
                : product.stock <= 10
                  ? "bg-amber-500"
                  : "bg-emerald-500"
            }`}
          />

          <span
            className={`text-sm font-semibold ${
              product.stock === 0
                ? "text-red-600"
                : product.stock <= 10
                  ? "text-amber-600"
                  : "text-neutral-700"
            }`}
          >
            {product.stock}
          </span>
        </div>
      </td>

      {/* STATUS */}

      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusConfig.classes}`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`}
          />

          {statusConfig.label}
        </span>
      </td>

      {/* ACTIONS */}

      <td className="px-6 py-4 text-right">
        <div
          ref={menuRef}
          className="relative inline-block text-left"
        >
          <button
            type="button"
            aria-label={`Actions for ${product.title}`}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() =>
              setMenuOpen(
                (current) =>
                  !current
              )
            }
            className={`flex h-9 w-9 items-center justify-center rounded-xl border transition ${
              menuOpen
                ? "border-black/[0.12] bg-neutral-100 text-neutral-950"
                : "border-transparent text-neutral-400 hover:border-black/[0.07] hover:bg-neutral-100 hover:text-neutral-950"
            }`}
          >
            <MoreHorizontal className="h-[18px] w-[18px]" />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-[calc(100%+8px)] z-[80] w-48 overflow-hidden rounded-2xl border border-black/[0.07] bg-white p-1.5 text-left shadow-[0_18px_50px_rgba(0,0,0,0.14)]"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);

                  router.push(
                    `/dashboard/products/${product.id}`
                  );
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-950"
              >
                <Eye
                  className="h-4 w-4"
                  strokeWidth={1.8}
                />

                View product
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);

                  router.push(
                    `/dashboard/products/${product.id}/edit`
                  );
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-950"
              >
                <Pencil
                  className="h-4 w-4"
                  strokeWidth={1.8}
                />

                Edit product
              </button>

              <div className="my-1 border-t border-black/[0.06]" />

              <button
                type="button"
                role="menuitem"
                disabled={deleting}
                onClick={async () => {
                  setMenuOpen(false);

                  await handleDelete();
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-200 border-t-red-600" />
                ) : (
                  <Trash2
                    className="h-4 w-4"
                    strokeWidth={1.8}
                  />
                )}

                {deleting
                  ? "Deleting..."
                  : "Delete product"}
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

/* ============================================================
   STATUS CONFIG
============================================================ */

function getStatusConfig(
  status: Product["status"]
) {
  switch (status) {
    case "PUBLISHED":
      return {
        label: "Published",
        classes:
          "bg-emerald-50 text-emerald-700",
        dot: "bg-emerald-500",
      };

    case "DRAFT":
      return {
        label: "Draft",
        classes:
          "bg-amber-50 text-amber-700",
        dot: "bg-amber-500",
      };

    case "OUT_OF_STOCK":
      return {
        label: "Out of stock",
        classes:
          "bg-red-50 text-red-700",
        dot: "bg-red-500",
      };

    case "ARCHIVED":
      return {
        label: "Archived",
        classes:
          "bg-neutral-100 text-neutral-600",
        dot: "bg-neutral-400",
      };

    default:
      return {
        label: String(status)
          .replaceAll("_", " ")
          .toLowerCase()
          .replace(
            /^\w/,
            (letter) =>
              letter.toUpperCase()
          ),

        classes:
          "bg-neutral-100 text-neutral-600",

        dot: "bg-neutral-400",
      };
  }
}