"use client";

import {
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import { toast } from "sonner";

import {
  BadgePercent,
  CalendarDays,
  Loader2,
  Save,
  TicketPercent,
} from "lucide-react";

import {
  createCoupon,
  getCouponById,
  updateCoupon,
} from "@/services/coupon.service";

import { Coupon } from "@/types/coupon";

interface CouponFormProps {
  couponId?: string;
}

export default function CouponForm({
  couponId,
}: CouponFormProps) {
  const router = useRouter();

  const isEdit =
    Boolean(couponId);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    fetching,
    setFetching,
  ] = useState(isEdit);

  const [form, setForm] =
    useState({
      code: "",
      description: "",
      discountType:
        "PERCENTAGE",
      discountValue: "",
      minimumOrderValue:
        "",
      maximumDiscount: "",
      usageLimit: "",
      expiryDate: "",
    });

  /* ============================================================
     LOAD COUPON
  ============================================================ */

  useEffect(() => {
    if (!couponId) {
      return;
    }

    const loadCoupon =
      async () => {
        try {
          setFetching(true);

          const response =
            await getCouponById(
              couponId
            );

          const coupon: Coupon =
            response.coupon;

          setForm({
            code:
              coupon.code ||
              "",

            description:
              coupon.description ||
              "",

            discountType:
              coupon.discountType,

            discountValue:
              String(
                coupon.discountValue
              ),

            minimumOrderValue:
              coupon.minimumOrderValue !==
              undefined
                ? String(
                    coupon.minimumOrderValue
                  )
                : "",

            maximumDiscount:
              coupon.maximumDiscount !==
              undefined
                ? String(
                    coupon.maximumDiscount
                  )
                : "",

            usageLimit:
              coupon.usageLimit !==
              undefined
                ? String(
                    coupon.usageLimit
                  )
                : "",

            expiryDate:
              coupon.expiryDate
                ? new Date(
                    coupon.expiryDate
                  )
                    .toISOString()
                    .slice(
                      0,
                      16
                    )
                : "",
          });
        } catch (
          error: any
        ) {
          console.error(
            "Failed to load coupon:",
            error
          );

          toast.error(
            error?.response?.data
              ?.message ||
              "Failed to load coupon."
          );

          router.push(
            "/dashboard/coupons"
          );
        } finally {
          setFetching(false);
        }
      };

    loadCoupon();
  }, [
    couponId,
    router,
  ]);

  /* ============================================================
     CHANGE
  ============================================================ */

  const handleChange = (
    e: React.ChangeEvent<
      | HTMLInputElement
      | HTMLTextAreaElement
      | HTMLSelectElement
    >
  ) => {
    setForm(
      (current) => ({
        ...current,
        [e.target.name]:
          e.target.value,
      })
    );
  };

  /* ============================================================
     SUBMIT
  ============================================================ */

  const handleSubmit =
    async (
      e: React.FormEvent
    ) => {
      e.preventDefault();

      try {
        setLoading(true);

        if (
          !form.code.trim()
        ) {
          toast.error(
            "Coupon code is required."
          );

          return;
        }

        if (
          !form.discountValue
        ) {
          toast.error(
            "Discount value is required."
          );

          return;
        }

        if (
          !form.expiryDate
        ) {
          toast.error(
            "Expiry date is required."
          );

          return;
        }

        const payload = {
          code: form.code
            .trim()
            .toUpperCase(),

          description:
            form.description.trim() ||
            undefined,

          discountType:
            form.discountType as
              | "PERCENTAGE"
              | "FIXED",

          discountValue:
            Number(
              form.discountValue
            ),

          minimumOrderValue:
            form.minimumOrderValue
              ? Number(
                  form.minimumOrderValue
                )
              : undefined,

          maximumDiscount:
            form.maximumDiscount
              ? Number(
                  form.maximumDiscount
                )
              : undefined,

          usageLimit:
            form.usageLimit
              ? Number(
                  form.usageLimit
                )
              : undefined,

          expiryDate:
            new Date(
              form.expiryDate
            ).toISOString(),
        };

        if (
          isEdit &&
          couponId
        ) {
          await updateCoupon(
            couponId,
            payload
          );

          toast.success(
            "Coupon updated successfully!"
          );
        } else {
          await createCoupon(
            payload
          );

          toast.success(
            "Coupon created successfully!"
          );
        }

        router.push(
          "/dashboard/coupons"
        );
      } catch (
        error: any
      ) {
        console.error(
          "Coupon submit error:",
          error
        );

        toast.error(
          error?.response?.data
            ?.message ||
            `Failed to ${
              isEdit
                ? "update"
                : "create"
            } coupon.`
        );
      } finally {
        setLoading(false);
      }
    };

  /* ============================================================
     LOADING
  ============================================================ */

  if (fetching) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-[28px] border border-black/[0.06] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.035)]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-[#0b1220]" />

          <p className="text-xs font-medium text-neutral-500">
            Loading coupon...
          </p>
        </div>
      </div>
    );
  }

  const fieldClass =
    "h-12 w-full rounded-2xl border border-black/[0.08] bg-neutral-50 px-4 text-sm text-neutral-950 outline-none transition placeholder:text-neutral-400 hover:border-black/[0.13] focus:border-black/25 focus:bg-white focus:ring-4 focus:ring-black/[0.025]";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* ======================================================
          BASIC INFORMATION
      ====================================================== */}

      <section className="overflow-hidden rounded-[26px] border border-black/[0.06] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.035)]">
        <div className="flex items-center gap-4 border-b border-black/[0.06] px-5 py-5 sm:px-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-100 text-[#0b1220]">
            <TicketPercent className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-base font-semibold text-neutral-950">
              Basic information
            </h2>

            <p className="mt-1 text-xs text-neutral-500">
              Define the coupon
              code and customer-facing
              description.
            </p>
          </div>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          <div>
            <label className="mb-2 block text-xs font-semibold text-neutral-700">
              Coupon code
            </label>

            <input
              name="code"
              value={form.code}
              onChange={
                handleChange
              }
              placeholder="SAVE20"
              className={
                fieldClass
              }
            />

            <p className="mt-2 text-[10px] text-neutral-400">
              Codes are saved in
              uppercase automatically.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-neutral-700">
              Description
            </label>

            <textarea
              name="description"
              value={
                form.description
              }
              onChange={
                handleChange
              }
              rows={4}
              placeholder="20% off on orders above ₹500"
              className="w-full resize-none rounded-2xl border border-black/[0.08] bg-neutral-50 px-4 py-3.5 text-sm leading-6 text-neutral-950 outline-none transition placeholder:text-neutral-400 hover:border-black/[0.13] focus:border-black/25 focus:bg-white focus:ring-4 focus:ring-black/[0.025]"
            />
          </div>
        </div>
      </section>

      {/* ======================================================
          DISCOUNT
      ====================================================== */}

      <section className="overflow-hidden rounded-[26px] border border-black/[0.06] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.035)]">
        <div className="flex items-center gap-4 border-b border-black/[0.06] px-5 py-5 sm:px-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
            <BadgePercent className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-base font-semibold text-neutral-950">
              Discount rules
            </h2>

            <p className="mt-1 text-xs text-neutral-500">
              Configure the
              discount and order
              requirements.
            </p>
          </div>
        </div>

        <div className="grid gap-5 p-5 sm:p-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-semibold text-neutral-700">
              Discount type
            </label>

            <select
              name="discountType"
              value={
                form.discountType
              }
              onChange={
                handleChange
              }
              className={
                fieldClass
              }
            >
              <option value="PERCENTAGE">
                Percentage
              </option>

              <option value="FIXED">
                Fixed amount
              </option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-neutral-700">
              Discount value
            </label>

            <input
              type="number"
              name="discountValue"
              value={
                form.discountValue
              }
              onChange={
                handleChange
              }
              min="0"
              placeholder={
                form.discountType ===
                "PERCENTAGE"
                  ? "20"
                  : "500"
              }
              className={
                fieldClass
              }
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-neutral-700">
              Minimum order value
              (₹)
            </label>

            <input
              type="number"
              name="minimumOrderValue"
              value={
                form.minimumOrderValue
              }
              onChange={
                handleChange
              }
              min="0"
              placeholder="500"
              className={
                fieldClass
              }
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-neutral-700">
              Maximum discount (₹)
            </label>

            <input
              type="number"
              name="maximumDiscount"
              value={
                form.maximumDiscount
              }
              onChange={
                handleChange
              }
              min="0"
              placeholder="1000"
              className={
                fieldClass
              }
            />
          </div>
        </div>
      </section>

      {/* ======================================================
          USAGE
      ====================================================== */}

      <section className="overflow-hidden rounded-[26px] border border-black/[0.06] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.035)]">
        <div className="flex items-center gap-4 border-b border-black/[0.06] px-5 py-5 sm:px-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-100 text-[#0b1220]">
            <CalendarDays className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-base font-semibold text-neutral-950">
              Usage & expiry
            </h2>

            <p className="mt-1 text-xs text-neutral-500">
              Control coupon
              availability and
              validity.
            </p>
          </div>
        </div>

        <div className="grid gap-5 p-5 sm:p-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-semibold text-neutral-700">
              Usage limit
            </label>

            <input
              type="number"
              name="usageLimit"
              value={
                form.usageLimit
              }
              onChange={
                handleChange
              }
              min="1"
              placeholder="100"
              className={
                fieldClass
              }
            />

            <p className="mt-2 text-[10px] text-neutral-400">
              Leave blank for no
              usage limit.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-neutral-700">
              Expiry date
            </label>

            <input
              type="datetime-local"
              name="expiryDate"
              value={
                form.expiryDate
              }
              onChange={
                handleChange
              }
              className={
                fieldClass
              }
            />
          </div>
        </div>
      </section>

      {/* ======================================================
          ACTIONS
      ====================================================== */}

      <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() =>
            router.push(
              "/dashboard/coupons"
            )
          }
          disabled={loading}
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-black/[0.09] bg-white px-6 text-sm font-semibold text-neutral-600 transition hover:bg-neutral-50 hover:text-neutral-950 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex min-h-11 min-w-[170px] items-center justify-center gap-2 rounded-full bg-[#0b1220] px-6 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(11,18,32,0.1)] transition hover:bg-[#172033] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />

              {isEdit
                ? "Updating..."
                : "Creating..."}
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />

              {isEdit
                ? "Update coupon"
                : "Create coupon"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}