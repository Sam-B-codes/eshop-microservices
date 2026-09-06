"use client";

import { useFormContext } from "react-hook-form";

import {
  Check,
  CheckCircle2,
  Circle,
  Eye,
  Save,
} from "lucide-react";

import { ProductFormValues } from "@/schema/product.schema";

interface PublishCardProps {
  onSaveDraft: () => Promise<void>;
}

export default function PublishCard({
  onSaveDraft,
}: PublishCardProps) {
  const {
    watch,
    formState: {
      isSubmitting,
    },
  } =
    useFormContext<ProductFormValues>();

  const values = watch();

  /* ============================================================
     CHECKLIST
  ============================================================ */

  const checklist = [
    {
      title:
        "General information",
      done:
        !!values.title &&
        !!values.description,
    },

    {
      title: "Images",
      done:
        !!values.images &&
        values.images.length >
          0,
    },

    {
      title: "Pricing",
      done:
        Number(
          values.price
        ) > 0,
    },

    {
      title: "Inventory",
      done:
        Number(
          values.stock
        ) > 0,
    },

    {
      title: "Category",
      done:
        !!values.category,
    },
  ];

  /* ============================================================
     PROGRESS
  ============================================================ */

  const completed =
    checklist.filter(
      (item) => item.done
    ).length;

  const percentage =
    Math.round(
      (completed /
        checklist.length) *
        100
    );

  const ready =
    percentage === 100;

  return (
    <section className="overflow-hidden rounded-[26px] border border-black/[0.06] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.035)]">
      {/* Header */}

      <div className="border-b border-black/[0.06] px-5 py-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-neutral-950">
              Publishing readiness
            </h2>

            <p className="mt-1 text-xs leading-5 text-neutral-500">
              Review product completeness before
              publishing.
            </p>
          </div>

          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
              ready
                ? "bg-emerald-50 text-emerald-600"
                : "bg-neutral-100 text-neutral-500"
            }`}
          >
            {ready ? (
              <Check className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5">
        {/* Completion */}

        <div>
          <div className="mb-2.5 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-neutral-500">
              Completion
            </span>

            <span className="text-[11px] font-semibold text-neutral-900">
              {completed}/
              {
                checklist.length
              }
            </span>
          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                ready
                  ? "bg-emerald-500"
                  : "bg-[#0b1220]"
              }`}
              style={{
                width: `${percentage}%`,
              }}
            />
          </div>

          <p className="mt-2 text-right text-[10px] font-medium text-neutral-400">
            {percentage}%
            complete
          </p>
        </div>

        {/* Checklist */}

        <div className="rounded-2xl border border-black/[0.05] bg-neutral-50/80 p-4">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
            Checklist
          </p>

          <div className="space-y-3">
            {checklist.map(
              (item) => (
                <div
                  key={
                    item.title
                  }
                  className="flex items-center justify-between gap-3"
                >
                  <span
                    className={`text-xs font-medium ${
                      item.done
                        ? "text-neutral-700"
                        : "text-neutral-400"
                    }`}
                  >
                    {
                      item.title
                    }
                  </span>

                  {item.done ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  ) : (
                    <Circle className="h-4 w-4 shrink-0 text-neutral-300" />
                  )}
                </div>
              )
            )}
          </div>
        </div>

        {/* Visibility */}

        <div className="rounded-2xl border border-black/[0.05] bg-white p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-neutral-100">
              <Eye
                className="h-4 w-4 text-neutral-500"
                strokeWidth={1.8}
              />
            </div>

            <div>
              <p className="text-xs font-semibold text-neutral-800">
                Store visibility
              </p>

              <p className="mt-1 text-[11px] leading-5 text-neutral-500">
                Draft products remain hidden.
                Publishing makes the product
                available to customers.
              </p>
            </div>
          </div>
        </div>

        {/* Save Draft */}

        <button
          type="button"
          onClick={
            onSaveDraft
          }
          disabled={
            isSubmitting
          }
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-black/[0.09] bg-white text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50 hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save
            className="h-4 w-4"
            strokeWidth={1.8}
          />

          Save as draft
        </button>
      </div>
    </section>
  );
}