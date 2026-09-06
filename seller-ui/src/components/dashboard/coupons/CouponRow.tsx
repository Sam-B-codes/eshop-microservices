"use client";

import Link from "next/link";

import {
  Pencil,
  Trash2,
} from "lucide-react";

import { Coupon } from "@/types/coupon";

import { formatINR } from "@/utils/currency";

interface CouponRowProps {
  coupon: Coupon;
  onDelete: (
    id: string
  ) => void;
}

export default function CouponRow({
  coupon,
  onDelete,
}: CouponRowProps) {
  const discount =
    coupon.discountType ===
    "PERCENTAGE"
      ? `${coupon.discountValue}%`
      : formatINR(
          coupon.discountValue
        );

  const expiryDate =
    new Date(
      coupon.expiryDate
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );

  const isExpired =
    new Date(
      coupon.expiryDate
    ) < new Date();

  const isActive =
    coupon.isActive &&
    !isExpired;

  return (
    <tr className="border-b border-black/[0.05] transition last:border-b-0 hover:bg-neutral-50/60">
      <td className="px-6 py-5">
        <div>
          <p className="text-sm font-semibold text-neutral-950">
            {coupon.code}
          </p>

          {coupon.description && (
            <p className="mt-1 max-w-[260px] truncate text-xs text-neutral-500">
              {
                coupon.description
              }
            </p>
          )}

          <p className="mt-1.5 text-[10px] font-medium text-neutral-400">
            Expires{" "}
            {expiryDate}
          </p>
        </div>
      </td>

      <td className="px-6 py-5">
        <span className="text-sm font-semibold text-neutral-900">
          {discount}
        </span>
      </td>

      <td className="px-6 py-5 text-xs font-medium text-neutral-600">
        {coupon.minimumOrderValue
          ? formatINR(
              coupon.minimumOrderValue
            )
          : "No minimum"}
      </td>

      <td className="px-6 py-5">
        <p className="text-xs font-semibold text-neutral-700">
          {
            coupon.usedCount
          }

          {coupon.usageLimit
            ? ` / ${coupon.usageLimit}`
            : ""}
        </p>
      </td>

      <td className="px-6 py-5">
        <span
          className={`inline-flex rounded-full border px-3 py-1.5 text-[10px] font-semibold ${
            isActive
              ? "border-emerald-100 bg-emerald-50 text-emerald-700"
              : "border-red-100 bg-red-50 text-red-700"
          }`}
        >
          {isActive
            ? "Active"
            : isExpired
              ? "Expired"
              : "Inactive"}
        </span>
      </td>

      <td className="px-6 py-5">
        <div className="flex justify-end gap-2">
          <Link
            href={`/dashboard/coupons/${coupon.id}`}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-black/[0.08] bg-white px-3 text-[11px] font-semibold text-neutral-600 transition hover:bg-neutral-50 hover:text-neutral-950"
          >
            <Pencil className="h-3.5 w-3.5" />

            Edit
          </Link>

          <button
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  "Are you sure you want to delete this coupon?"
                )
              ) {
                onDelete(
                  coupon.id
                );
              }
            }}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-red-100 bg-white px-3 text-[11px] font-semibold text-red-600 transition hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" />

            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}