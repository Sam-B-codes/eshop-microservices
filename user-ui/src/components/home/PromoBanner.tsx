"use client";

import Link from "next/link";

import {
  ArrowRight,
  Sparkles,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import { getPublicProducts } from "@/services/product.service";

export default function PromoBanner() {
  const [maxDiscount, setMaxDiscount] =
    useState<number | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const loadMaximumDiscount =
      async () => {
        try {
          setLoading(true);

          const response =
            await getPublicProducts({
              page: 1,
              limit: 50,
              sort: "newest",
            });

          /*
           * Find the highest REAL discount
           * among published products.
           *
           * Product Service already prevents
           * DRAFT products from reaching this
           * public endpoint.
           */

          const discounts =
            response.products
              .filter(
                (product) =>
                  product.available &&
                  product.hasDiscount &&
                  product.discountPercentage >
                    0
              )
              .map(
                (product) =>
                  product.discountPercentage
              );

          if (discounts.length === 0) {
            setMaxDiscount(null);
            return;
          }

          const highestDiscount =
            Math.max(...discounts);

          setMaxDiscount(
            Math.round(
              highestDiscount
            )
          );
        } catch (error) {
          console.error(
            "Failed to load promotional discount:",
            error
          );

          setMaxDiscount(null);
        } finally {
          setLoading(false);
        }
      };

    loadMaximumDiscount();
  }, []);

  return (
    <section className="bg-white py-6 sm:py-8 lg:py-10">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <div className="relative overflow-hidden rounded-[36px] bg-neutral-950 px-6 py-10 text-white sm:px-10 sm:py-12 lg:px-14 lg:py-14">
          {/* =========================
              BACKGROUND GLOW
          ========================= */}

          <div className="absolute -right-24 -top-36 h-[400px] w-[400px] rounded-full bg-white/10 blur-3xl" />

          <div className="absolute -bottom-40 left-[30%] h-[360px] w-[360px] rounded-full bg-white/5 blur-3xl" />

          {/* =========================
              DECORATIVE LINES
          ========================= */}

          <div className="absolute right-[12%] top-1/2 hidden h-[180%] w-px -translate-y-1/2 rotate-[28deg] bg-white/10 lg:block" />

          <div className="absolute right-[21%] top-1/2 hidden h-[180%] w-px -translate-y-1/2 rotate-[28deg] bg-white/10 lg:block" />

          <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_0.7fr]">
            {/* =========================
                LEFT CONTENT
            ========================= */}

            <div className="max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur">
                <Sparkles className="h-4 w-4" />

                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
                  Limited offers
                </span>
              </div>

              <h2 className="text-3xl font-semibold leading-tight tracking-[-0.035em] sm:text-4xl lg:text-5xl">
                Premium finds.

                <span className="block font-light text-white/55">
                  Better prices.
                </span>
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-6 text-white/60 sm:text-base">
                Discover selected
                products with special
                pricing across fashion,
                technology, beauty and
                more.
              </p>

              <div className="mt-8">
                <Link
                  href="/products"
                  className="group inline-flex items-center gap-3 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-200"
                >
                  Explore offers

                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* =========================
                RIGHT OFFER CARD
            ========================= */}

            <div className="relative hidden min-h-[210px] lg:block">
              <div className="absolute right-0 top-0 w-[78%] rounded-[30px] border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/40">
                      Current offers
                    </p>

                    {/* REAL DISCOUNT */}

                    {loading ? (
                      <div className="mt-3 h-8 w-40 animate-pulse rounded-lg bg-white/10" />
                    ) : maxDiscount !==
                      null ? (
                      <p className="mt-2 text-2xl font-semibold">
                        Up to{" "}
                        {maxDiscount}% off
                      </p>
                    ) : (
                      <p className="mt-2 text-2xl font-semibold">
                        Special offers
                      </p>
                    )}
                  </div>

                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-neutral-950">
                    SALE
                  </span>
                </div>

                {/* DECORATIVE PRODUCT BLOCKS */}

                <div className="mt-8 grid grid-cols-3 gap-3">
                  <div className="h-20 rounded-2xl bg-white/10" />

                  <div className="h-20 rounded-2xl bg-white/15" />

                  <div className="h-20 rounded-2xl bg-white/10" />
                </div>
              </div>

              <div className="absolute bottom-0 left-0 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-xl">
                <p className="text-xs uppercase tracking-[0.18em] text-white/40">
                  Discover
                </p>

                <p className="mt-1 text-sm font-medium text-white/90">
                  Fresh offers from
                  Eshop sellers
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}