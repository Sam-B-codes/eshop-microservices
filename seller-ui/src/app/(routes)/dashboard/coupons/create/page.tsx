import {
  TicketPercent,
} from "lucide-react";

import CouponForm from "@/components/dashboard/coupons/CouponForm";

export default function CreateCouponPage() {
  return (
    <div className="min-w-0 space-y-7">
      <section className="overflow-hidden rounded-[28px] border border-black/[0.06] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.035)]">
        <div className="flex items-start gap-4 px-5 py-6 sm:px-7 sm:py-7 lg:px-8">
          <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-neutral-100 text-[#0b1220] sm:flex">
            <TicketPercent className="h-5 w-5" />
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
              Promotions
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-[34px]">
              Create coupon
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
              Create a discount
              coupon for your
              customers and define
              its usage rules.
            </p>
          </div>
        </div>
      </section>

      <CouponForm />
    </div>
  );
}