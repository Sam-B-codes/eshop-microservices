import Link from "next/link";

import {
  Plus,
} from "lucide-react";

import CouponTable from "@/components/dashboard/coupons/CouponTable";

export default function CouponsPage() {
  return (
    <div className="min-w-0 space-y-7">
      <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
            Promotions
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-[34px]">
            Coupons
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500">
            Create and manage
            discount coupons for
            your customers.
          </p>
        </div>

        <Link
          href="/dashboard/coupons/create"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#0b1220] px-5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(11,18,32,0.1)] transition hover:bg-[#172033]"
        >
          <Plus className="h-4 w-4" />

          Create coupon
        </Link>
      </section>

      <CouponTable />
    </div>
  );
}