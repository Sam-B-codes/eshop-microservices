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
  Loader2,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  useAuthContext,
} from "@/context/AuthContext";

import {
  useShop,
} from "@/context/ShopContext";

// ======================================================
// CART PAGE
// ======================================================

export default function CartPage() {
  const router = useRouter();

  const {
    user,
    loading: authLoading,
  } = useAuthContext();

  const {
    cart,
    cartLoading,
    cartMutating,
    updateCartQuantity,
    removeFromCart,
    clearCart,
  } = useShop();

  const [
    updatingProductId,
    setUpdatingProductId,
  ] = useState<string | null>(
    null
  );

  const [
    removingProductId,
    setRemovingProductId,
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
    return <CartSkeleton />;
  }

  // ====================================================
  // NOT LOGGED IN
  // ====================================================

  if (!user) {
    return (
      <main className="min-h-[75vh] bg-[#f8f8f6] px-4 py-16 sm:px-6">
        <div className="mx-auto flex max-w-xl flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
            <ShoppingBag
              size={25}
            />
          </div>

          <p className="mt-7 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
            Your cart
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
            Sign in to view
            your cart
          </h1>

          <p className="mt-4 max-w-md text-sm leading-6 text-neutral-500">
            Your saved cart is
            connected to your
            account, so you can
            continue shopping from
            where you left off.
          </p>

          <Link
            href="/login?returnUrl=%2Fcart"
            className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-black px-7 text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            Sign in
          </Link>

          <Link
            href="/products"
            className="mt-4 text-sm font-semibold text-neutral-600 transition hover:text-black"
          >
            Continue shopping
          </Link>
        </div>
      </main>
    );
  }

  // ====================================================
  // CART LOADING
  // ====================================================

  if (cartLoading) {
    return <CartSkeleton />;
  }

  // ====================================================
  // QUANTITY UPDATE
  // ====================================================

  const handleQuantityChange =
    async (
      productId: string,
      quantity: number
    ) => {
      if (
        quantity < 1 ||
        cartMutating
      ) {
        return;
      }

      try {
        setError("");

        setUpdatingProductId(
          productId
        );

        await updateCartQuantity(
          productId,
          quantity
        );
      } catch (error) {
        console.error(
          "Failed to update cart quantity:",
          error
        );

        setError(
          "We couldn't update the quantity. Please try again."
        );
      } finally {
        setUpdatingProductId(
          null
        );
      }
    };

  // ====================================================
  // REMOVE PRODUCT
  // ====================================================

  const handleRemove =
    async (
      productId: string
    ) => {
      if (cartMutating) {
        return;
      }

      try {
        setError("");

        setRemovingProductId(
          productId
        );

        await removeFromCart(
          productId
        );
      } catch (error) {
        console.error(
          "Failed to remove cart item:",
          error
        );

        setError(
          "We couldn't remove this item. Please try again."
        );
      } finally {
        setRemovingProductId(
          null
        );
      }
    };

  // ====================================================
  // CLEAR CART
  // ====================================================

  const handleClearCart =
    async () => {
      if (
        clearing ||
        cartMutating
      ) {
        return;
      }

      const confirmed =
        window.confirm(
          "Remove all items from your cart?"
        );

      if (!confirmed) {
        return;
      }

      try {
        setError("");

        setClearing(true);

        await clearCart();
      } catch (error) {
        console.error(
          "Failed to clear cart:",
          error
        );

        setError(
          "We couldn't clear your cart. Please try again."
        );
      } finally {
        setClearing(false);
      }
    };

  // ====================================================
  // EMPTY CART
  // ====================================================

  if (
    cart.items.length ===
    0
  ) {
    return (
      <main className="min-h-[75vh] bg-[#f8f8f6] px-4 py-16 sm:px-6 lg:py-20">
        <div className="mx-auto flex max-w-xl flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-black/5 bg-white shadow-sm">
            <ShoppingBag
              size={30}
              strokeWidth={1.7}
            />
          </div>

          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
            Your cart
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
            Your bag is empty
          </h1>

          <p className="mt-4 max-w-md text-sm leading-6 text-neutral-500">
            Discover something
            you&apos;ll love and
            add it to your cart.
            Your selections will
            appear here.
          </p>

          <Link
            href="/products"
            className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-black px-7 text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            Explore products

            <ArrowRight
              size={17}
            />
          </Link>
        </div>
      </main>
    );
  }

  // ====================================================
  // CART TOTALS
  // ====================================================

  const availableItems =
    cart.items.filter(
      (item) =>
        item.product.available &&
        item.product
          .quantityAvailable
    );

  const unavailableItems =
    cart.items.filter(
      (item) =>
        !item.product.available ||
        !item.product
          .quantityAvailable
    );

  const checkoutSubtotal =
    availableItems.reduce(
      (
        total,
        item
      ) =>
        total +
        item.product
          .salePrice *
          item.quantity,
      0
    );

  const hasCheckoutItems =
    availableItems.length > 0;

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
              Shopping bag
            </p>

            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-neutral-950 sm:text-5xl">
              Your cart
            </h1>

            <p className="mt-3 text-sm text-neutral-500">
              {cart.itemCount}{" "}
              {cart.itemCount === 1
                ? "item"
                : "items"}{" "}
              in your bag
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              void handleClearCart()
            }
            disabled={
              clearing ||
              cartMutating
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

            Clear cart
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
            CART LAYOUT
        ====================================== */}

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] xl:gap-12">
          {/* ===================================
              ITEMS
          ==================================== */}

          <section className="space-y-4">
            {cart.items.map(
              (item) => {
                const {
                  product,
                } = item;

                const image =
                  product
                    .images?.[0]
                    ?.url ||
                  "/placeholder-product.png";

                const unavailable =
                  !product.available;

                const insufficientStock =
                  product.available &&
                  !product
                    .quantityAvailable;

                const updating =
                  updatingProductId ===
                  product.id;

                const removing =
                  removingProductId ===
                  product.id;

                return (
                  <article
                    key={
                      item.id
                    }
                    className={`overflow-hidden rounded-[28px] border bg-white p-4 shadow-sm transition sm:p-5 ${
                      unavailable ||
                      insufficientStock
                        ? "border-amber-200"
                        : "border-black/5"
                    }`}
                  >
                    <div className="flex gap-4 sm:gap-6">
                      {/* IMAGE */}

                      <Link
                        href={`/products/${product.slug}`}
                        className="relative h-28 w-24 shrink-0 overflow-hidden rounded-2xl bg-neutral-100 sm:h-36 sm:w-32"
                      >
                        <Image
                          src={
                            image
                          }
                          alt={
                            product.title
                          }
                          fill
                          sizes="128px"
                          className="object-cover"
                        />
                      </Link>

                      {/* CONTENT */}

                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium uppercase tracking-[0.14em] text-neutral-400">
                              {product.brand ||
                                product.category}
                            </p>

                            <Link
                              href={`/products/${product.slug}`}
                            >
                              <h2 className="mt-1 line-clamp-2 text-base font-semibold leading-6 text-neutral-950 transition hover:text-neutral-600 sm:text-lg">
                                {
                                  product.title
                                }
                              </h2>
                            </Link>

                            <p className="mt-1 text-xs text-neutral-400">
                              {
                                product.category
                              }
                            </p>
                          </div>

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
                              cartMutating
                            }
                            aria-label={`Remove ${product.title} from cart`}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-neutral-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {removing ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2
                                size={
                                  17
                                }
                              />
                            )}
                          </button>
                        </div>

                        {/* AVAILABILITY */}

                        {unavailable ? (
                          <div className="mt-3 w-fit rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600">
                            Currently
                            unavailable
                          </div>
                        ) : insufficientStock ? (
                          <div className="mt-3 w-fit rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                            Only{" "}
                            {
                              product.stock
                            }{" "}
                            available —
                            reduce quantity
                          </div>
                        ) : (
                          <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                            <Check
                              size={
                                14
                              }
                            />

                            In stock
                          </div>
                        )}

                        {/* BOTTOM */}

                        <div className="mt-auto flex flex-col gap-3 pt-4 sm:flex-row sm:items-end sm:justify-between">
                          {/* QUANTITY */}

                          <div>
                            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                              Quantity
                            </p>

                            <div className="inline-flex items-center rounded-full border border-black/10 bg-neutral-50 p-1">
                              <button
                                type="button"
                                onClick={() =>
                                  void handleQuantityChange(
                                    product.id,
                                    item.quantity -
                                      1
                                  )
                                }
                                disabled={
                                  item.quantity <=
                                    1 ||
                                  updating ||
                                  cartMutating
                                }
                                aria-label="Decrease quantity"
                                className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
                              >
                                <Minus
                                  size={
                                    14
                                  }
                                />
                              </button>

                              <span className="w-9 text-center text-sm font-semibold text-neutral-900">
                                {updating ? (
                                  <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                                ) : (
                                  item.quantity
                                )}
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  void handleQuantityChange(
                                    product.id,
                                    item.quantity +
                                      1
                                  )
                                }
                                disabled={
                                  updating ||
                                  cartMutating ||
                                  !product.available ||
                                  item.quantity >=
                                    product.stock
                                }
                                aria-label="Increase quantity"
                                className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
                              >
                                <Plus
                                  size={
                                    14
                                  }
                                />
                              </button>
                            </div>
                          </div>

                          {/* PRICE */}

                          <div className="sm:text-right">
                            <div className="flex items-center gap-2 sm:justify-end">
                              <span className="text-lg font-bold tracking-tight text-neutral-950">
                                ₹
                                {item.lineTotal.toLocaleString(
                                  "en-IN"
                                )}
                              </span>
                            </div>

                            {product.price !==
                              product.salePrice && (
                              <p className="mt-1 text-xs text-neutral-400">
                                ₹
                                {product.salePrice.toLocaleString(
                                  "en-IN"
                                )}{" "}
                                each
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              }
            )}
          </section>

          {/* ===================================
              ORDER SUMMARY
          ==================================== */}

          <aside className="h-fit lg:sticky lg:top-6">
            <div className="rounded-[30px] border border-black/5 bg-white p-6 shadow-sm sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                Summary
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-950">
                Order summary
              </h2>

              <div className="mt-7 space-y-4">
                <SummaryRow
                  label="Items"
                  value={`${cart.itemCount}`}
                />

                <SummaryRow
                  label="Subtotal"
                  value={`₹${checkoutSubtotal.toLocaleString(
                    "en-IN"
                  )}`}
                />

                <SummaryRow
                  label="Delivery"
                  value="Calculated at checkout"
                />
              </div>

              <div className="my-6 border-t border-black/10" />

              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-neutral-950">
                    Estimated total
                  </p>

                  <p className="mt-1 text-xs text-neutral-400">
                    Taxes calculated
                    at checkout
                  </p>
                </div>

                <p className="text-2xl font-bold tracking-tight text-neutral-950">
                  ₹
                  {checkoutSubtotal.toLocaleString(
                    "en-IN"
                  )}
                </p>
              </div>

              {/* UNAVAILABLE WARNING */}

              {unavailableItems.length >
                0 && (
                <div className="mt-6 rounded-2xl bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">
                  {
                    unavailableItems.length
                  }{" "}
                  {unavailableItems.length ===
                  1
                    ? "item needs"
                    : "items need"}{" "}
                  attention before
                  checkout.
                </div>
              )}

              {/* CHECKOUT */}

              <button
                type="button"
                disabled={
                  !hasCheckoutItems ||
                  unavailableItems.length >
                    0
                }
                onClick={() =>
                  router.push(
                    "/checkout"
                  )
                }
                className="mt-6 flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-black px-6 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
              >
                Proceed to checkout

                <ArrowRight
                  size={17}
                />
              </button>

              {unavailableItems.length >
                0 && (
                <p className="mt-3 text-center text-xs leading-5 text-neutral-400">
                  Update or remove
                  unavailable items
                  before continuing.
                </p>
              )}

              {/* SECURITY */}

              <div className="mt-7 space-y-3 border-t border-black/10 pt-6">
                <SummaryFeature
                  icon={
                    <ShieldCheck
                      size={
                        17
                      }
                    />
                  }
                  title="Secure checkout"
                  description="Your purchase is protected"
                />

                <SummaryFeature
                  icon={
                    <Truck
                      size={
                        17
                      }
                    />
                  }
                  title="Reliable delivery"
                  description="Shipping calculated at checkout"
                />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

// ======================================================
// SUMMARY ROW
// ======================================================

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-neutral-500">
        {label}
      </span>

      <span className="text-right font-semibold text-neutral-900">
        {value}
      </span>
    </div>
  );
}

// ======================================================
// SUMMARY FEATURE
// ======================================================

function SummaryFeature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-neutral-900">
        {icon}
      </span>

      <div>
        <p className="text-xs font-semibold text-neutral-900">
          {title}
        </p>

        <p className="mt-0.5 text-[11px] leading-5 text-neutral-400">
          {description}
        </p>
      </div>
    </div>
  );
}

// ======================================================
// CART SKELETON
// ======================================================

function CartSkeleton() {
  return (
    <main className="min-h-screen bg-[#f8f8f6]">
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8 lg:pt-14">
        <div className="border-b border-black/10 pb-8">
          <div className="h-4 w-32 animate-pulse rounded bg-neutral-200" />

          <div className="mt-7 h-4 w-24 animate-pulse rounded bg-neutral-200" />

          <div className="mt-3 h-12 w-52 animate-pulse rounded bg-neutral-200" />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] xl:gap-12">
          <div className="space-y-4">
            {Array.from({
              length: 3,
            }).map(
              (_, index) => (
                <div
                  key={index}
                  className="flex gap-5 rounded-[28px] border border-black/5 bg-white p-5"
                >
                  <div className="h-36 w-32 shrink-0 animate-pulse rounded-2xl bg-neutral-200" />

                  <div className="flex-1 space-y-3 py-2">
                    <div className="h-3 w-24 animate-pulse rounded bg-neutral-200" />

                    <div className="h-5 w-3/5 animate-pulse rounded bg-neutral-200" />

                    <div className="h-4 w-20 animate-pulse rounded bg-neutral-200" />

                    <div className="mt-8 h-10 w-32 animate-pulse rounded-full bg-neutral-200" />
                  </div>
                </div>
              )
            )}
          </div>

          <div className="h-[430px] animate-pulse rounded-[30px] bg-neutral-200" />
        </div>
      </div>
    </main>
  );
}