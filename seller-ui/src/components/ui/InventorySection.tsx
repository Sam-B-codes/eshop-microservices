"use client";

import { useFormContext } from "react-hook-form";

import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  PackageX,
} from "lucide-react";

import Input from "@/components/ui/Input";

import { ProductFormValues } from "@/schema/product.schema";

export default function InventorySection() {
  const {
    register,
    watch,
    formState: { errors },
  } =
    useFormContext<ProductFormValues>();

  const stock =
    Number(watch("stock")) || 0;

  const stockConfig =
    stock === 0
      ? {
          label:
            "Out of stock",

          description:
            "Customers cannot purchase this product while stock is zero.",

          icon: PackageX,

          container:
            "border-red-100 bg-red-50/60",

          iconBox:
            "bg-red-100 text-red-600",

          labelColor:
            "text-red-700",

          dot: "bg-red-500",
        }
      : stock <= 10
        ? {
            label:
              "Low stock",

            description:
              "Inventory is running low. Consider restocking soon.",

            icon:
              AlertTriangle,

            container:
              "border-amber-100 bg-amber-50/60",

            iconBox:
              "bg-amber-100 text-amber-700",

            labelColor:
              "text-amber-700",

            dot:
              "bg-amber-500",
          }
        : {
            label:
              "In stock",

            description:
              "Inventory level looks healthy.",

            icon:
              CheckCircle2,

            container:
              "border-emerald-100 bg-emerald-50/60",

            iconBox:
              "bg-emerald-100 text-emerald-700",

            labelColor:
              "text-emerald-700",

            dot:
              "bg-emerald-500",
          };

  const StatusIcon =
    stockConfig.icon;

  return (
    <section className="overflow-hidden rounded-[26px] border border-black/[0.06] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.035)]">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex items-center gap-4 border-b border-black/[0.06] px-5 py-5 sm:px-6">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-neutral-100 text-[#0b1220]">
          <Boxes
            className="h-5 w-5"
            strokeWidth={1.8}
          />
        </div>

        <div>
          <h2 className="text-base font-semibold tracking-[-0.02em] text-neutral-950">
            Inventory
          </h2>

          <p className="mt-1 text-xs leading-5 text-neutral-500">
            Manage product stock
            and inventory
            identification.
          </p>
        </div>
      </div>

      {/* ======================================================
          BODY
      ====================================================== */}

      <div className="space-y-6 p-5 sm:p-6">
        <div className="grid gap-5 md:grid-cols-2">
          <Input
            label="SKU"
            placeholder="SKU-10001"
            {...register(
              "sku"
            )}
            error={
              errors.sku
                ?.message
            }
          />

          <Input
            label="Stock quantity"
            type="number"
            min={0}
            placeholder="50"
            {...register(
              "stock",
              {
                valueAsNumber:
                  true,
              }
            )}
            error={
              errors.stock
                ?.message
            }
          />
        </div>

        {/* ====================================================
            INVENTORY SUMMARY
        ==================================================== */}

        <div
          className={`rounded-[20px] border p-4 sm:p-5 ${stockConfig.container}`}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${stockConfig.iconBox}`}
              >
                <StatusIcon
                  className="h-[18px] w-[18px]"
                  strokeWidth={
                    1.8
                  }
                />
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
                  Inventory
                  status
                </p>

                <div className="mt-1 flex items-center gap-2">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${stockConfig.dot}`}
                  />

                  <p
                    className={`text-sm font-semibold ${stockConfig.labelColor}`}
                  >
                    {
                      stockConfig.label
                    }
                  </p>
                </div>

                <p className="mt-1 max-w-sm text-[11px] leading-5 text-neutral-500">
                  {
                    stockConfig.description
                  }
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-black/[0.05] bg-white/80 px-5 py-3 sm:text-right">
              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-neutral-400">
                Available
              </p>

              <p className="mt-1 text-xl font-semibold tracking-[-0.03em] text-neutral-950">
                {stock}

                <span className="ml-1 text-xs font-medium text-neutral-400">
                  units
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}