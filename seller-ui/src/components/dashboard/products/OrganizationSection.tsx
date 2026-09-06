"use client";

import { useFormContext } from "react-hook-form";

import {
  Check,
  FolderKanban,
} from "lucide-react";

import { ProductFormValues } from "@/schema/product.schema";

const categories = [
  "Shoes",
  "Clothing",
  "Electronics",
  "Accessories",
  "Beauty",
  "Home",
];

export default function OrganizationSection() {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<ProductFormValues>();

  const selectedCategory =
    watch("category");

  return (
    <section className="overflow-hidden rounded-[26px] border border-black/[0.06] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.035)]">
      {/* Header */}

      <div className="flex items-center gap-3 border-b border-black/[0.06] px-5 py-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-neutral-100 text-[#0b1220]">
          <FolderKanban
            className="h-[18px] w-[18px]"
            strokeWidth={1.8}
          />
        </div>

        <div>
          <h2 className="text-sm font-semibold text-neutral-950">
            Organization
          </h2>

          <p className="mt-1 text-xs leading-5 text-neutral-500">
            Help customers discover this product.
          </p>
        </div>
      </div>

      {/* Body */}

      <div className="p-5">
        <label className="mb-3 block text-xs font-semibold text-neutral-700">
          Category
        </label>

        <div className="grid grid-cols-2 gap-2.5">
          {categories.map((item) => {
            const selected =
              selectedCategory === item;

            return (
              <button
                key={item}
                type="button"
                onClick={() =>
                  setValue(
                    "category",
                    item,
                    {
                      shouldValidate: true,
                      shouldDirty: true,
                    }
                  )
                }
                className={`relative flex min-h-11 items-center justify-center rounded-xl border px-3 text-xs font-semibold transition ${
                  selected
                    ? "border-[#0b1220] bg-[#0b1220] text-white"
                    : "border-black/[0.08] bg-white text-neutral-600 hover:border-black/[0.16] hover:bg-neutral-50 hover:text-neutral-950"
                }`}
              >
                {item}

                {selected && (
                  <Check className="absolute right-2.5 h-3.5 w-3.5" />
                )}
              </button>
            );
          })}
        </div>

        {errors.category && (
          <p className="mt-2 text-xs font-medium text-red-500">
            {errors.category.message}
          </p>
        )}

        <div className="mt-4 rounded-xl bg-neutral-50 px-4 py-3">
          <p className="text-[11px] leading-5 text-neutral-500">
            Select the category that most closely
            matches your product.
          </p>
        </div>
      </div>
    </section>
  );
}