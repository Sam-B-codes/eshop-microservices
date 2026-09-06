"use client";

import {
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Heart,
  Loader2,
  ShoppingBag,
  Trash2,
} from "lucide-react";

import {
  useAuthContext,
} from "@/context/AuthContext";

import {
  useShop,
} from "@/context/ShopContext";

// ======================================================
// WISHLIST PAGE
// ======================================================

export default function WishlistPage() {
  const {
    user,
    loading: authLoading,
  } = useAuthContext();

  const {
    wishlist,
    wishlistLoading,
    wishlistMutating,
    addToCart,
    removeFromWishlist,
    clearWishlist,
  } = useShop();

  const [
    removingProductId,
    setRemovingProductId,
  ] = useState<string | null>(
    null
  );

  const [
    addingProductId,
    setAddingProductId,
  ] = useState<string | null>(
    null
  );

  const [
    addedProductId,
    setAddedProductId,
  ] = useState<string | null>(
    null
  );

  const [
    clearing,
    setClearing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  // ====================================================
  // AUTH LOADING
  // ====================================================

  if (authLoading) {
    return (
      <WishlistSkeleton />
    );
  }

  // ====================================================
  // LOGGED OUT
  // ====================================================

  if (!user) {
    return (
      <main className="min-h-[75vh] bg-[#f8f8f6] px-4 py-16 sm:px-6">
        <div className="mx-auto flex max-w-xl flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-black/5 bg-white shadow-sm">
            <Heart
              size={25}
              strokeWidth={1.8}
            />
          </div>

          <p className="mt-7 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
            Your wishlist
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
            Sign in to see
            your favourites
          </h1>

          <p className="mt-4 max-w-md text-sm leading-6 text-neutral-500">
            Save the products you
            love and return to them
            whenever you&apos;re
            ready to shop.
          </p>

          <Link
            href="/login?returnUrl=%2Fwishlist"
            className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-black px-7 text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            Sign in
          </Link>

          <Link
            href="/products"
            className="mt-4 text-sm font-semibold text-neutral-600 transition hover:text-black"
          >
            Explore products
          </Link>
        </div>
      </main>
    );
  }

  // ====================================================
  // WISHLIST LOADING
  // ====================================================

  if (wishlistLoading) {
    return (
      <WishlistSkeleton />
    );
  }

  // ====================================================
  // REMOVE ITEM
  // ====================================================

  const handleRemove =
    async (
      productId: string
    ) => {
      if (
        wishlistMutating ||
        removingProductId
      ) {
        return;
      }

      try {
        setError("");

        setRemovingProductId(
          productId
        );

        await removeFromWishlist(
          productId
        );
      } catch (error) {
        console.error(
          "Failed to remove wishlist item:",
          error
        );

        setError(
          "We couldn't remove this product from your wishlist."
        );
      } finally {
        setRemovingProductId(
          null
        );
      }
    };

  // ====================================================
  // ADD TO CART
  // ====================================================

  const handleAddToCart =
    async (
      productId: string,
      available: boolean
    ) => {
      if (
        !available ||
        addingProductId
      ) {
        return;
      }

      try {
        setError("");

        setAddingProductId(
          productId
        );

        setAddedProductId(
          null
        );

        await addToCart(
          productId,
          1
        );

        setAddedProductId(
          productId
        );

        window.setTimeout(
          () => {
            setAddedProductId(
              (
                current
              ) =>
                current ===
                productId
                  ? null
                  : current
            );
          },
          1800
        );
      } catch (error) {
        console.error(
          "Failed to add wishlist item to cart:",
          error
        );

        setError(
          "We couldn't add this product to your cart."
        );
      } finally {
        setAddingProductId(
          null
        );
      }
    };

  // ====================================================
  // CLEAR WISHLIST
  // ====================================================

  const handleClearWishlist =
    async () => {
      if (
        clearing ||
        wishlistMutating
      ) {
        return;
      }

      const confirmed =
        window.confirm(
          "Remove all products from your wishlist?"
        );

      if (!confirmed) {
        return;
      }

      try {
        setError("");

        setClearing(true);

        await clearWishlist();
      } catch (error) {
        console.error(
          "Failed to clear wishlist:",
          error
        );

        setError(
          "We couldn't clear your wishlist. Please try again."
        );
      } finally {
        setClearing(false);
      }
    };

  // ====================================================
  // EMPTY WISHLIST
  // ====================================================

  if (
    wishlist.items.length ===
    0
  ) {
    return (
      <main className="min-h-[75vh] bg-[#f8f8f6] px-4 py-16 sm:px-6 lg:py-20">
        <div className="mx-auto flex max-w-xl flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-black/5 bg-white shadow-sm">
            <Heart
              size={30}
              strokeWidth={1.7}
            />
          </div>

          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
            Your wishlist
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
            Nothing saved yet
          </h1>

          <p className="mt-4 max-w-md text-sm leading-6 text-neutral-500">
            Keep track of the
            products you love.
            Tap the heart on any
            product to save it
            here.
          </p>

          <Link
            href="/products"
            className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-black px-7 text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            Discover products

            <ArrowRight
              size={17}
            />
          </Link>
        </div>
      </main>
    );
  }

  // ====================================================
  // COUNTS
  // ====================================================

  const availableCount =
    wishlist.items.filter(
      (item) =>
        item.product.available
    ).length;

  const unavailableCount =
    wishlist.items.length -
    availableCount;

  return (
    <main className="min-h-screen bg-[#f8f8f6]">
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8 lg:pt-14">
        {/* =====================================
            PAGE HEADER
        ====================================== */}

        <div className="flex flex-col gap-5 border-b border-black/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 transition hover:text-black"
            >
              <ArrowLeft
                size={16}
              />

              Continue shopping
            </Link>

            <p className="mt-7 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
              Saved for later
            </p>

            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-neutral-950 sm:text-5xl">
              Your wishlist
            </h1>

            <p className="mt-3 text-sm text-neutral-500">
              {
                wishlist.itemCount
              }{" "}
              {wishlist.itemCount ===
              1
                ? "product"
                : "products"}{" "}
              saved
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              void handleClearWishlist()
            }
            disabled={
              clearing ||
              wishlistMutating
            }
            className="inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-neutral-500 transition hover:bg-white hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {clearing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2
                size={16}
              />
            )}

            Clear wishlist
          </button>
        </div>

        {/* =====================================
            ERROR
        ====================================== */}

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          >
            {error}
          </div>
        )}

        {/* =====================================
            SUMMARY
        ====================================== */}

        <div className="mt-8 flex flex-wrap gap-3">
          <div className="rounded-full border border-black/5 bg-white px-4 py-2 text-xs font-semibold text-neutral-600 shadow-sm">
            {
              wishlist.itemCount
            }{" "}
            saved
          </div>

          {availableCount >
            0 && (
            <div className="rounded-full bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700">
              {
                availableCount
              }{" "}
              available
            </div>
          )}

          {unavailableCount >
            0 && (
            <div className="rounded-full bg-red-50 px-4 py-2 text-xs font-semibold text-red-600">
              {
                unavailableCount
              }{" "}
              unavailable
            </div>
          )}
        </div>

        {/* =====================================
            WISHLIST GRID
        ====================================== */}

        <section className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {wishlist.items.map(
            (item) => {
              const {
                product,
              } = item;

              const image =
                product
                  .images?.[0]
                  ?.url ||
                "/placeholder-product.png";

              const removing =
                removingProductId ===
                product.id;

              const adding =
                addingProductId ===
                product.id;

              const added =
                addedProductId ===
                product.id;

              return (
                <article
                  key={
                    item.id
                  }
                  className="group overflow-hidden rounded-[28px] border border-black/5 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  {/* =================================
                      IMAGE
                  ================================== */}

                  <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
                    <Link
                      href={`/products/${product.slug}`}
                      className="block h-full w-full"
                    >
                      <Image
                        src={
                          image
                        }
                        alt={
                          product.title
                        }
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </Link>

                    {/* REMOVE */}

                    <button
                      type="button"
                      onClick={() =>
                        void handleRemove(
                          product.id
                        )
                      }
                      disabled={
                        removing ||
                        wishlistMutating
                      }
                      aria-label={`Remove ${product.title} from wishlist`}
                      className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-neutral-700 shadow-sm backdrop-blur transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {removing ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Heart
                          className="h-5 w-5"
                          fill="currentColor"
                        />
                      )}
                    </button>

                    {/* DISCOUNT */}

                    {product.hasDiscount &&
                      product.discountPercentage >
                        0 && (
                        <span className="absolute left-3 top-3 rounded-full bg-black px-3 py-1.5 text-xs font-semibold text-white shadow-sm">
                          -
                          {
                            product.discountPercentage
                          }
                          %
                        </span>
                      )}

                    {/* AVAILABILITY */}

                    {!product.available && (
                      <div className="absolute inset-x-3 bottom-3 rounded-2xl bg-white/95 px-4 py-3 text-center text-xs font-semibold text-red-600 shadow-sm backdrop-blur">
                        Currently
                        unavailable
                      </div>
                    )}
                  </div>

                  {/* =================================
                      CONTENT
                  ================================== */}

                  <div className="p-5">
                    <p className="truncate text-xs font-medium uppercase tracking-[0.15em] text-neutral-400">
                      {product.brand ||
                        product.category}
                    </p>

                    <Link
                      href={`/products/${product.slug}`}
                    >
                      <h2 className="mt-2 line-clamp-2 min-h-[48px] text-base font-semibold leading-6 text-neutral-950 transition hover:text-neutral-600">
                        {
                          product.title
                        }
                      </h2>
                    </Link>

                    {/* PRICE */}

                    <div className="mt-4 flex flex-wrap items-end gap-2">
                      <span className="text-xl font-bold tracking-tight text-neutral-950">
                        ₹
                        {product.salePrice.toLocaleString(
                          "en-IN"
                        )}
                      </span>

                      {product.hasDiscount && (
                        <span className="pb-0.5 text-sm text-neutral-400 line-through">
                          ₹
                          {product.price.toLocaleString(
                            "en-IN"
                          )}
                        </span>
                      )}
                    </div>

                    {/* STOCK */}

                    <div className="mt-3">
                      {product.available ? (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                          <Check
                            size={14}
                          />

                          In stock
                        </div>
                      ) : (
                        <p className="text-xs font-semibold text-red-600">
                          Out of stock
                        </p>
                      )}
                    </div>

                    {/* =================================
                        ADD TO CART
                    ================================== */}

                    <button
                      type="button"
                      onClick={() =>
                        void handleAddToCart(
                          product.id,
                          product.available
                        )
                      }
                      disabled={
                        !product.available ||
                        adding
                      }
                      className={`mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold text-white transition disabled:cursor-not-allowed ${
                        added
                          ? "bg-emerald-600"
                          : "bg-black hover:bg-neutral-800 disabled:bg-neutral-300"
                      }`}
                    >
                      {adding ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />

                          Adding...
                        </>
                      ) : added ? (
                        <>
                          <Check className="h-4 w-4" />

                          Added to cart
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="h-4 w-4" />

                          {product.available
                            ? "Add to cart"
                            : "Unavailable"}
                        </>
                      )}
                    </button>
                  </div>
                </article>
              );
            }
          )}
        </section>
      </div>
    </main>
  );
}

// ======================================================
// WISHLIST SKELETON
// ======================================================

function WishlistSkeleton() {
  return (
    <main className="min-h-screen bg-[#f8f8f6]">
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8 lg:pt-14">
        <div className="border-b border-black/10 pb-8">
          <div className="h-4 w-32 animate-pulse rounded bg-neutral-200" />

          <div className="mt-7 h-4 w-28 animate-pulse rounded bg-neutral-200" />

          <div className="mt-3 h-12 w-64 animate-pulse rounded bg-neutral-200" />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({
            length: 4,
          }).map(
            (_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-[28px] border border-black/5 bg-white"
              >
                <div className="aspect-[4/5] animate-pulse bg-neutral-200" />

                <div className="space-y-3 p-5">
                  <div className="h-3 w-24 animate-pulse rounded bg-neutral-200" />

                  <div className="h-5 w-4/5 animate-pulse rounded bg-neutral-200" />

                  <div className="h-5 w-28 animate-pulse rounded bg-neutral-200" />

                  <div className="mt-5 h-12 w-full animate-pulse rounded-full bg-neutral-200" />
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </main>
  );
}