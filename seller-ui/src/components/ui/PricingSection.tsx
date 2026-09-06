"use client";

import { useFormContext } from "react-hook-form";

import {
  BadgePercent,
  IndianRupee,
  TrendingDown,
} from "lucide-react";

import Input from "@/components/ui/Input";

import { ProductFormValues } from "@/schema/product.schema";
import { formatINR } from "@/utils/currency";

export default function PricingSection() {
  const {
    register,
    watch,
    formState: { errors },
  } =
    useFormContext<ProductFormValues>();

  const price =
    Number(watch("price")) || 0;

  const discount =
    Number(
      watch("discountPrice")
    ) || 0;

  const hasValidDiscount =
    price > 0 &&
    discount > 0 &&
    discount < price;

  const saving =
    hasValidDiscount
      ? price - discount
      : 0;

  const percentage =
    hasValidDiscount
      ? Math.round(
          ((price - discount) /
            price) *
            100
        )
      : 0;

  return (
    <section className="overflow-hidden rounded-[26px] border border-black/[0.06] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.035)]">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex items-center gap-4 border-b border-black/[0.06] px-5 py-5 sm:px-6">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
          <IndianRupee
            className="h-5 w-5"
            strokeWidth={1.8}
          />
        </div>

        <div>
          <h2 className="text-base font-semibold tracking-[-0.02em] text-neutral-950">
            Pricing
          </h2>

          <p className="mt-1 text-xs leading-5 text-neutral-500">
            Set the regular and
            discounted selling
            price.
          </p>
        </div>
      </div>

      {/* ======================================================
          BODY
      ====================================================== */}

      <div className="space-y-6 p-5 sm:p-6">
        <div className="grid gap-5 md:grid-cols-2">
          <Input
            type="number"
            min={0}
            step="0.01"
            label="Regular price (₹)"
            placeholder="999"
            {...register(
              "price",
              {
                valueAsNumber:
                  true,
              }
            )}
            error={
              errors.price
                ?.message
            }
          />

          <Input
            type="number"
            min={0}
            step="0.01"
            label="Sale price (₹)"
            placeholder="799"
            {...register(
              "discountPrice",
              {
                valueAsNumber:
                  true,
              }
            )}
            error={
              errors
                .discountPrice
                ?.message
            }
          />
        </div>

        {price > 0 &&
          discount > 0 &&
          !hasValidDiscount && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="text-xs font-medium leading-5 text-amber-700">
                Sale price must be
                lower than the
                regular price.
              </p>
            </div>
          )}

        {hasValidDiscount && (
          <div className="grid gap-3 sm:grid-cols-3">
            {/* Discount */}

            <div className="rounded-2xl border border-black/[0.05] bg-neutral-50 p-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <BadgePercent className="h-4 w-4" />
              </div>

              <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
                Discount
              </p>

              <p className="mt-1 text-xl font-semibold tracking-[-0.03em] text-neutral-950">
                {percentage}%
              </p>
            </div>

            {/* Savings */}

            <div className="rounded-2xl border border-black/[0.05] bg-neutral-50 p-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-200/70 text-neutral-700">
                <TrendingDown className="h-4 w-4" />
              </div>

              <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
                Customer saves
              </p>

              <p className="mt-1 text-xl font-semibold tracking-[-0.03em] text-neutral-950">
                {formatINR(
                  saving
                )}
              </p>
            </div>

            {/* Final Price */}

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <IndianRupee className="h-4 w-4" />
              </div>

              <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-emerald-700/60">
                Final price
              </p>

              <p className="mt-1 text-xl font-semibold tracking-[-0.03em] text-emerald-800">
                {formatINR(
                  discount
                )}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}