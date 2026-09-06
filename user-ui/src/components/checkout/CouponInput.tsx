"use client";

import {
  KeyboardEvent,
  useState,
} from "react";

import {
  Check,
  Loader2,
  Tag,
  X,
} from "lucide-react";

interface CouponInputProps {
  appliedCode?: string;

  loading?: boolean;

  error?: string;

  discount?: number;

  onApply: (
    code: string
  ) => Promise<void>;

  onRemove: () => void;
}

export default function CouponInput({
  appliedCode,
  loading = false,
  error,
  discount = 0,
  onApply,
  onRemove,
}: CouponInputProps) {
  const [
    code,
    setCode,
  ] = useState("");

  // ====================================================
  // APPLY
  // ====================================================

  const handleApply =
    async () => {
      const normalized =
        code
          .trim()
          .toUpperCase();

      if (
        !normalized ||
        loading
      ) {
        return;
      }

      await onApply(
        normalized
      );
    };

  // ====================================================
  // ENTER KEY
  // ====================================================

  const handleKeyDown = (
    event: KeyboardEvent<HTMLInputElement>
  ) => {
    if (
      event.key !== "Enter"
    ) {
      return;
    }

    /*
     * CouponInput lives inside the main checkout form.
     *
     * Prevent Enter here from submitting the entire
     * checkout form. It should only apply the coupon.
     */
    event.preventDefault();

    void handleApply();
  };

  // ====================================================
  // APPLIED
  // ====================================================

  if (appliedCode) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <Check
              size={16}
              strokeWidth={2.2}
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-emerald-800">
              Coupon applied
            </p>

            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold tracking-wide text-neutral-950">
                {appliedCode}
              </span>

              <span className="text-xs font-semibold text-emerald-700">
                −₹
                {discount.toLocaleString(
                  "en-IN"
                )}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={
              onRemove
            }
            aria-label="Remove coupon"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-neutral-400 transition hover:bg-white hover:text-neutral-900"
          >
            <X size={15} />
          </button>
        </div>
      </div>
    );
  }

  // ====================================================
  // INPUT
  // ====================================================

  return (
    <div>
      {/*
       * Do NOT wrap this in <form>.
       *
       * CouponInput is already rendered inside the
       * CheckoutPage form. Nested forms are invalid HTML
       * and cause hydration errors in Next.js.
       */}
      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <Tag
            size={16}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
          />

          <input
            type="text"
            value={code}
            disabled={loading}
            onChange={(
              event
            ) => {
              setCode(
                event.target.value.toUpperCase()
              );
            }}
            onKeyDown={
              handleKeyDown
            }
            placeholder="Coupon code"
            autoComplete="off"
            className="min-h-12 w-full rounded-2xl border border-black/[0.08] bg-[#fafafa] pl-11 pr-4 text-sm font-semibold uppercase tracking-[0.05em] text-neutral-950 outline-none transition placeholder:font-normal placeholder:normal-case placeholder:tracking-normal placeholder:text-neutral-400 focus:border-black/20 focus:bg-white focus:ring-4 focus:ring-black/[0.03] disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>

        <button
          type="button"
          disabled={
            loading ||
            !code.trim()
          }
          onClick={() => {
            void handleApply();
          }}
          className="min-h-12 shrink-0 rounded-2xl bg-neutral-950 px-5 text-xs font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Apply"
          )}
        </button>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-2 text-xs font-medium leading-5 text-red-600"
        >
          {error}
        </p>
      )}
    </div>
  );
}