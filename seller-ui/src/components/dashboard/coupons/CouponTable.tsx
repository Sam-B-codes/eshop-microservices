"use client";

import { useEffect, useState } from "react";

import { toast } from "sonner";

import {
  TicketPercent,
} from "lucide-react";

import {
  deleteCoupon,
  getCoupons,
} from "@/services/coupon.service";

import {
  Coupon,
  CouponsResponse,
} from "@/types/coupon";

import CouponRow from "./CouponRow";

export default function CouponTable() {
  const [coupons, setCoupons] =
    useState<Coupon[]>([]);

  const [loading, setLoading] =
    useState(true);

  const loadCoupons =
    async () => {
      try {
        setLoading(true);

        const data: CouponsResponse =
          await getCoupons();

        setCoupons(
          data.coupons || []
        );
      } catch (error) {
        console.error(
          "Failed to load coupons:",
          error
        );

        toast.error(
          "Failed to load coupons. Please try again."
        );

        setCoupons([]);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleDelete =
    async (id: string) => {
      try {
        await deleteCoupon(id);

        setCoupons(
          (
            currentCoupons
          ) =>
            currentCoupons.filter(
              (coupon) =>
                coupon.id !== id
            )
        );

        toast.success(
          "Coupon deleted successfully."
        );
      } catch (
        error: any
      ) {
        console.error(
          "Delete coupon error:",
          error
        );

        const message =
          error?.response?.data
            ?.message ||
          "Failed to delete coupon.";

        toast.error(message);
      }
    };

  if (loading) {
    return (
      <div className="flex min-h-[220px] items-center justify-center rounded-[26px] border border-black/[0.06] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.035)]">
        <div className="text-center">
          <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-neutral-200 border-t-[#0b1220]" />

          <p className="mt-3 text-xs font-medium text-neutral-500">
            Loading coupons...
          </p>
        </div>
      </div>
    );
  }

  if (
    coupons.length === 0
  ) {
    return (
      <div className="flex min-h-[260px] flex-col items-center justify-center rounded-[26px] border border-black/[0.06] bg-white px-6 text-center shadow-[0_12px_40px_rgba(0,0,0,0.035)]">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-500">
          <TicketPercent className="h-5 w-5" />
        </div>

        <h3 className="mt-4 text-base font-semibold text-neutral-950">
          No coupons found
        </h3>

        <p className="mt-2 max-w-sm text-sm leading-6 text-neutral-500">
          Create your first
          discount coupon and it
          will appear here.
        </p>
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-[26px] border border-black/[0.06] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.035)]">
      <div className="flex items-center justify-between gap-4 border-b border-black/[0.06] px-5 py-5 sm:px-6">
        <div>
          <h2 className="text-sm font-semibold text-neutral-950">
            Coupon catalog
          </h2>

          <p className="mt-1 text-xs text-neutral-500">
            Manage active,
            upcoming and expired
            discount codes.
          </p>
        </div>

        <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-[10px] font-semibold text-neutral-600">
          {coupons.length}{" "}
          {coupons.length === 1
            ? "coupon"
            : "coupons"}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="border-b border-black/[0.06] bg-neutral-50/80">
            <tr>
              <th className="px-6 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                Coupon
              </th>

              <th className="px-6 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                Discount
              </th>

              <th className="px-6 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                Minimum order
              </th>

              <th className="px-6 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                Usage
              </th>

              <th className="px-6 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                Status
              </th>

              <th className="px-6 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {coupons.map(
              (coupon) => (
                <CouponRow
                  key={
                    coupon.id
                  }
                  coupon={
                    coupon
                  }
                  onDelete={
                    handleDelete
                  }
                />
              )
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}