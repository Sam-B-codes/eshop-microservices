"use client";

import { BadgePercent, IndianRupee, TrendingUp } from "lucide-react";
import { useFormContext } from "react-hook-form";

import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";

import { ProductFormValues } from "@/schema/product.schema";

export default function PricingSection() {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<ProductFormValues>();

  const price = Number(watch("price")) || 0;
  const discount = Number(watch("discountPrice")) || 0;

  const saving =
    price > discount && discount > 0
      ? price - discount
      : 0;

  const percentage =
    price > 0 && discount > 0
      ? Math.round(((price - discount) / price) * 100)
      : 0;

  return (
    <Card className="overflow-hidden bg-slate-100 border border-slate-200">

      {/* Header */}
      <div className="flex items-center gap-4 border-b border-slate-200 bg-slate-50 px-8 py-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
          <IndianRupee className="h-6 w-6 text-emerald-600" />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Pricing
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Set pricing and discounts for your product.
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="space-y-8 p-8">

        <div className="grid gap-6 md:grid-cols-2">

          <Input
            type="number"
            label="Regular Price"
            placeholder="₹ 999"
            {...register("price", {
              valueAsNumber: true,
            })}
            error={errors.price?.message}
          />

          <Input
            type="number"
            label="Sale Price"
            placeholder="₹ 799"
            {...register("discountPrice", {
              valueAsNumber: true,
            })}
            error={errors.discountPrice?.message}
          />

        </div>

        {price > 0 && discount > 0 && (
          <div className="grid gap-5 md:grid-cols-3">

            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
              <div className="flex items-center gap-3">
                <BadgePercent className="text-emerald-600" size={20} />

                <div>
                  <p className="text-xs uppercase text-slate-500">
                    Discount
                  </p>

                  <h3 className="text-xl font-bold text-emerald-700">
                    {percentage}%
                  </h3>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-5">
              <div className="flex items-center gap-3">
                <IndianRupee className="text-indigo-600" size={20} />

                <div>
                  <p className="text-xs uppercase text-slate-500">
                    Customer Saves
                  </p>

                  <h3 className="text-xl font-bold text-indigo-700">
                    ₹ {saving}
                  </h3>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-orange-200 bg-orange-50 p-5">
              <div className="flex items-center gap-3">
                <TrendingUp className="text-orange-600" size={20} />

                <div>
                  <p className="text-xs uppercase text-slate-500">
                    Final Price
                  </p>

                  <h3 className="text-xl font-bold text-orange-700">
                    ₹ {discount}
                  </h3>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </Card>
  );
}