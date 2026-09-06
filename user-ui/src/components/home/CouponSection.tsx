"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Check,
  Copy,
  TicketPercent,
} from "lucide-react";

import { getPublicCoupons } from "@/services/coupon.service";

import { PublicCoupon } from "@/types/coupon";

function formatDiscount(
  coupon: PublicCoupon
) {
  if (
    coupon.discountType ===
    "PERCENTAGE"
  ) {
    return `${coupon.discountValue}% OFF`;
  }

  return `₹${coupon.discountValue.toLocaleString(
    "en-IN"
  )} OFF`;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(new Date(date));
}

export default function CouponSection() {
  const [coupons, setCoupons] =
    useState<PublicCoupon[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(false);

  const [copiedCode, setCopiedCode] =
    useState<string | null>(null);

  useEffect(() => {
    const loadCoupons =
      async () => {
        try {
          setLoading(true);
          setError(false);

          const response =
            await getPublicCoupons();

          setCoupons(
            response.coupons.slice(
              0,
              3
            )
          );
        } catch (error) {
          console.error(
            "Failed to load coupons:",
            error
          );

          setError(true);
        } finally {
          setLoading(false);
        }
      };

    loadCoupons();
  }, []);

  const handleCopy = async (
    code: string
  ) => {
    try {
      await navigator.clipboard.writeText(
        code
      );

      setCopiedCode(code);

      window.setTimeout(() => {
        setCopiedCode(null);
      }, 1800);
    } catch (error) {
      console.error(
        "Failed to copy coupon:",
        error
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | NO ACTIVE COUPONS
  |--------------------------------------------------------------------------
  */

  if (
    !loading &&
    !error &&
    coupons.length === 0
  ) {
    return null;
  }

  return (
    <section className="bg-[#faf9f7] py-12 sm:py-14 lg:py-16">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        {/* SECTION HEADER */}

        <div className="mb-8 max-w-2xl sm:mb-10">
          <div className="mb-3 flex items-center gap-2">
            <TicketPercent className="h-4 w-4 text-neutral-500" />

            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-400">
              Exclusive offers
            </p>
          </div>

          <h2 className="text-3xl font-semibold tracking-[-0.03em] text-neutral-950 sm:text-4xl">
            A little extra,
            <span className="text-neutral-400">
              {" "}
              on us.
            </span>
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-500 sm:text-base">
            Discover active offers
            available from sellers
            across Eshop.
          </p>
        </div>

        {/* LOADING */}

        {loading && (
          <CouponSkeleton />
        )}

        {/* ERROR */}

        {!loading && error && (
          <div className="rounded-[28px] border border-neutral-200 bg-white px-6 py-12 text-center">
            <p className="text-sm font-medium text-neutral-700">
              Offers couldn't be
              loaded right now.
            </p>

            <p className="mt-2 text-xs text-neutral-400">
              Please try again later.
            </p>
          </div>
        )}

        {/* ONE COUPON */}

        {!loading &&
          !error &&
          coupons.length === 1 && (
            <SingleCouponCard
              coupon={coupons[0]}
              copied={
                copiedCode ===
                coupons[0].code
              }
              onCopy={handleCopy}
            />
          )}

        {/* TWO COUPONS */}

        {!loading &&
          !error &&
          coupons.length === 2 && (
            <div className="grid gap-5 md:grid-cols-2">
              {coupons.map(
                (coupon) => (
                  <StandardCouponCard
                    key={coupon.id}
                    coupon={coupon}
                    copied={
                      copiedCode ===
                      coupon.code
                    }
                    onCopy={
                      handleCopy
                    }
                  />
                )
              )}
            </div>
          )}

        {/* THREE OR MORE */}

        {!loading &&
          !error &&
          coupons.length >= 3 && (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {coupons.map(
                (coupon) => (
                  <StandardCouponCard
                    key={coupon.id}
                    coupon={coupon}
                    copied={
                      copiedCode ===
                      coupon.code
                    }
                    onCopy={
                      handleCopy
                    }
                  />
                )
              )}
            </div>
          )}
      </div>
    </section>
  );
}

/*
|--------------------------------------------------------------------------
| SINGLE COUPON
|--------------------------------------------------------------------------
|
| Wide editorial-style banner.
| Prevents large empty space when only
| one seller coupon exists.
|
*/

interface CouponCardProps {
  coupon: PublicCoupon;

  copied: boolean;

  onCopy: (
    code: string
  ) => Promise<void>;
}

function SingleCouponCard({
  coupon,
  copied,
  onCopy,
}: CouponCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-[36px] bg-neutral-950 text-white shadow-sm">
      {/* Decorative glow */}

      <div className="absolute -right-20 -top-28 h-[380px] w-[380px] rounded-full bg-white/10 blur-3xl" />

      <div className="absolute -bottom-36 left-[30%] h-[360px] w-[360px] rounded-full bg-white/5 blur-3xl" />

      {/* Decorative lines */}

      <div className="absolute right-[28%] top-1/2 hidden h-[180%] w-px -translate-y-1/2 rotate-[25deg] bg-white/10 lg:block" />

      <div className="absolute right-[22%] top-1/2 hidden h-[180%] w-px -translate-y-1/2 rotate-[25deg] bg-white/10 lg:block" />

      <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_0.7fr] lg:items-center lg:p-10 xl:p-12">
        {/* LEFT */}

        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
              <TicketPercent className="h-4 w-4" />
            </span>

            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
              Limited-time offer
            </p>
          </div>

          <h3 className="mt-6 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
            {formatDiscount(
              coupon
            )}
          </h3>

          {coupon.description && (
            <p className="mt-4 max-w-xl text-sm leading-6 text-white/55 sm:text-base">
              {coupon.description}
            </p>
          )}

          {/* CONDITIONS */}

          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-xs text-white/45 sm:text-sm">
            {coupon.minimumOrderValue !=
              null && (
              <p>
                Min. order{" "}
                <span className="font-medium text-white/75">
                  ₹
                  {coupon.minimumOrderValue.toLocaleString(
                    "en-IN"
                  )}
                </span>
              </p>
            )}

            {coupon.maximumDiscount !=
              null && (
              <p>
                Max. saving{" "}
                <span className="font-medium text-white/75">
                  ₹
                  {coupon.maximumDiscount.toLocaleString(
                    "en-IN"
                  )}
                </span>
              </p>
            )}

            <p>
              Valid until{" "}
              <span className="font-medium text-white/75">
                {formatDate(
                  coupon.expiryDate
                )}
              </span>
            </p>
          </div>
        </div>

        {/* RIGHT CODE PANEL */}

        <div className="lg:flex lg:justify-end">
          <div className="w-full rounded-[28px] border border-white/10 bg-white/[0.07] p-5 backdrop-blur-xl sm:p-6 lg:max-w-[390px]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/35">
              Your offer code
            </p>

            <div className="mt-5 flex items-center gap-3">
              <div className="min-w-0 flex-1 rounded-2xl border border-dashed border-white/20 bg-black/20 px-5 py-4">
                <p className="truncate font-mono text-lg font-semibold tracking-[0.16em] sm:text-xl">
                  {coupon.code}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  onCopy(
                    coupon.code
                  )
                }
                aria-label={`Copy coupon ${coupon.code}`}
                className="flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-2xl bg-white text-neutral-950 transition hover:bg-neutral-200"
              >
                {copied ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <Copy className="h-5 w-5" />
                )}
              </button>
            </div>

            <p className="mt-4 text-xs leading-5 text-white/35">
              Copy this code and use
              it when the eligible
              seller's products are
              purchased.
            </p>

            {copied && (
              <p className="mt-3 text-xs font-semibold text-white">
                Code copied
                successfully.
              </p>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

/*
|--------------------------------------------------------------------------
| STANDARD COUPON CARD
|--------------------------------------------------------------------------
*/

function StandardCouponCard({
  coupon,
  copied,
  onCopy,
}: CouponCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-[30px] bg-neutral-950 p-6 text-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-7">
      <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-white/10 blur-3xl" />

      <div className="absolute -bottom-24 -left-20 h-52 w-52 rounded-full bg-white/5 blur-3xl" />

      <div className="relative">
        {/* TOP */}

        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/40">
              Limited offer
            </p>

            <h3 className="mt-3 text-3xl font-semibold tracking-tight">
              {formatDiscount(
                coupon
              )}
            </h3>
          </div>

          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10">
            <TicketPercent className="h-5 w-5" />
          </span>
        </div>

        {/* DESCRIPTION */}

        {coupon.description && (
          <p className="mt-4 line-clamp-2 min-h-[48px] text-sm leading-6 text-white/55">
            {coupon.description}
          </p>
        )}

        {/* CODE */}

        <div className="mt-6 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">
              Use code
            </p>

            <p className="mt-1 truncate font-mono text-sm font-semibold tracking-[0.18em]">
              {coupon.code}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              onCopy(coupon.code)
            }
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-neutral-950 transition hover:bg-neutral-200"
            aria-label={`Copy coupon ${coupon.code}`}
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* CONDITIONS */}

        <div className="mt-5 space-y-2 border-t border-white/10 pt-5 text-xs text-white/45">
          {coupon.minimumOrderValue !=
            null && (
            <p>
              Minimum order: ₹
              {coupon.minimumOrderValue.toLocaleString(
                "en-IN"
              )}
            </p>
          )}

          {coupon.maximumDiscount !=
            null && (
            <p>
              Maximum discount: ₹
              {coupon.maximumDiscount.toLocaleString(
                "en-IN"
              )}
            </p>
          )}

          <p>
            Valid until{" "}
            {formatDate(
              coupon.expiryDate
            )}
          </p>

          {copied && (
            <p className="pt-1 font-semibold text-white">
              Code copied.
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

/*
|--------------------------------------------------------------------------
| LOADING SKELETON
|--------------------------------------------------------------------------
*/

function CouponSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-[36px] bg-neutral-200 p-6 sm:p-8 lg:p-10">
      <div className="grid gap-8 lg:grid-cols-[1fr_0.7fr] lg:items-center">
        <div>
          <div className="h-4 w-36 animate-pulse rounded-full bg-neutral-300" />

          <div className="mt-6 h-12 w-48 animate-pulse rounded-2xl bg-neutral-300" />

          <div className="mt-5 h-4 w-full max-w-lg animate-pulse rounded-full bg-neutral-300" />

          <div className="mt-3 h-4 w-3/4 max-w-md animate-pulse rounded-full bg-neutral-300" />

          <div className="mt-7 flex gap-4">
            <div className="h-4 w-28 animate-pulse rounded-full bg-neutral-300" />

            <div className="h-4 w-28 animate-pulse rounded-full bg-neutral-300" />
          </div>
        </div>

        <div className="h-[160px] animate-pulse rounded-[28px] bg-neutral-300" />
      </div>
    </div>
  );
}