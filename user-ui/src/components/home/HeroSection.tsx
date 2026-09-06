import Link from "next/link";

import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#f4f1eb]">
      {/* Decorative background */}

      <div className="absolute -right-24 -top-28 h-[420px] w-[420px] rounded-full bg-white/60 blur-3xl" />

      <div className="absolute -bottom-48 left-[35%] h-[430px] w-[430px] rounded-full bg-[#ded6c8]/50 blur-3xl" />

      <div className="relative mx-auto grid min-h-[620px] max-w-[1440px] items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-10 lg:py-20">
        {/* LEFT */}

        <div className="relative z-10 max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 py-2 backdrop-blur">
            <Sparkles className="h-4 w-4" />

            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-700">
              New season collection
            </span>
          </div>

          <h1 className="max-w-3xl text-4xl font-semibold leading-[1.04] tracking-[-0.04em] text-neutral-950 sm:text-5xl md:text-6xl lg:text-[72px]">
            Discover pieces
            <span className="block font-light italic text-neutral-500">
              worth keeping.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-7 text-neutral-600 sm:text-lg">
            Explore thoughtfully selected
            fashion, beauty, electronics and
            everyday essentials from sellers
            across Eshop.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="#featured"
              className="group inline-flex items-center gap-3 rounded-full bg-neutral-950 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              Shop collection

              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="#new-arrivals"
              className="inline-flex items-center rounded-full border border-neutral-300 bg-white/60 px-6 py-3.5 text-sm font-semibold text-neutral-900 backdrop-blur transition hover:bg-white"
            >
              New arrivals
            </Link>
          </div>

          {/* TRUST */}

          <div className="mt-10 flex flex-wrap gap-x-7 gap-y-4 border-t border-black/10 pt-7">
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <Truck className="h-4 w-4 text-neutral-900" />
              Fast delivery
            </div>

            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <ShieldCheck className="h-4 w-4 text-neutral-900" />
              Secure checkout
            </div>

            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <Sparkles className="h-4 w-4 text-neutral-900" />
              Curated deals
            </div>
          </div>
        </div>

        {/* RIGHT VISUAL */}

        <div className="relative hidden min-h-[500px] lg:block">
          <div className="absolute inset-8 rounded-[44px] bg-neutral-950 shadow-2xl" />

          <div className="absolute left-0 top-5 w-[58%] rounded-[32px] bg-[#d8c7b3] p-7 shadow-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-600">
              Style edit
            </p>

            <p className="mt-24 text-4xl font-light leading-tight text-neutral-950">
              Modern
              <br />
              essentials.
            </p>

            <div className="mt-8 h-[130px] rounded-[24px] bg-[#eee4d8]" />
          </div>

          <div className="absolute bottom-0 right-0 w-[60%] rounded-[34px] bg-white p-7 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                Eshop picks
              </span>

              <span className="rounded-full bg-neutral-950 px-3 py-1 text-xs font-semibold text-white">
                Explore
              </span>
            </div>

            <div className="mt-6 space-y-3">
              <div className="h-20 rounded-2xl bg-neutral-100" />

              <div className="grid grid-cols-2 gap-3">
                <div className="h-24 rounded-2xl bg-[#e5ddd2]" />

                <div className="h-24 rounded-2xl bg-neutral-200" />
              </div>
            </div>
          </div>

          <div className="absolute right-7 top-10 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium text-white backdrop-blur">
            Premium marketplace
          </div>
        </div>
      </div>
    </section>
  );
}