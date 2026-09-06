"use client";

import { Eye, Package2 } from "lucide-react";
import { useFormContext } from "react-hook-form";

import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";

import { ProductFormValues } from "@/schema/product.schema";

export default function GeneralInfo() {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<ProductFormValues>();

  const title = watch("title") || "";
  const description =
    watch("description") || "";
  const brand = watch("brand") || "";

  return (
    <section className="overflow-hidden rounded-[26px] border border-black/[0.06] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.035)]">
      {/* Header */}

      <div className="flex items-center gap-4 border-b border-black/[0.06] px-5 py-5 sm:px-6">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-neutral-100 text-[#0b1220]">
          <Package2
            className="h-5 w-5"
            strokeWidth={1.8}
          />
        </div>

        <div>
          <h2 className="text-base font-semibold tracking-[-0.02em] text-neutral-950">
            General information
          </h2>

          <p className="mt-1 text-xs leading-5 text-neutral-500">
            Add the basic details customers will
            see first.
          </p>
        </div>
      </div>

      {/* Body */}

      <div className="space-y-6 p-5 sm:p-6">
        {/* Product Title */}

        <div>
          <Input
            label="Product Title"
            placeholder="Nike Air Max 270"
            {...register("title")}
            error={errors.title?.message}
          />

          <div className="mt-2 flex justify-end">
            <span
              className={`text-[11px] font-medium ${
                title.length > 120
                  ? "text-red-500"
                  : "text-neutral-400"
              }`}
            >
              {title.length}/120
            </span>
          </div>
        </div>

        {/* Brand */}

        <Input
          label="Brand"
          placeholder="Nike"
          {...register("brand")}
          error={errors.brand?.message}
        />

        {/* Description */}

        <div>
          <Textarea
            rows={7}
            label="Product Description"
            placeholder="Describe the product, key features, materials and benefits..."
            {...register("description")}
            error={errors.description?.message}
          />

          <div className="mt-2 flex justify-end">
            <span
              className={`text-[11px] font-medium ${
                description.length > 1000
                  ? "text-red-500"
                  : "text-neutral-400"
              }`}
            >
              {description.length}/1000
            </span>
          </div>
        </div>

        {/* Live Preview */}

        <div className="rounded-[22px] border border-black/[0.06] bg-neutral-50/80 p-5">
          <div className="mb-4 flex items-center gap-2">
            <Eye
              className="h-4 w-4 text-neutral-500"
              strokeWidth={1.8}
            />

            <p className="text-xs font-semibold text-neutral-700">
              Customer preview
            </p>
          </div>

          <div className="rounded-2xl border border-black/[0.06] bg-white p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
              {brand || "Brand"}
            </p>

            <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-neutral-950">
              {title || "Your product title"}
            </h3>

            <p className="mt-3 text-sm leading-6 text-neutral-500">
              {description ||
                "Your product description will appear here as you type."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}