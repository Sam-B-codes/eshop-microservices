"use client";

import {
  Suspense,
  useEffect,
  useState,
} from "react";

import axios from "axios";

import Image from "next/image";

import Link from "next/link";

import {
  ArrowRight,
  Check,
  CheckCircle2,
  CreditCard,
  Loader2,
  MapPin,
  PackageCheck,
  ReceiptText,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";

import {
  useSearchParams,
} from "next/navigation";

import {
  getOrderById,
} from "@/services/order.service";

import {
  Order,
} from "@/types/order";

// ======================================================
// ORDER SUCCESS PAGE
// ======================================================

function OrderSuccessContent() {
  const searchParams =
    useSearchParams();

  const orderId =
    searchParams.get(
      "orderId"
    );

  const [
    order,
    setOrder,
  ] =
    useState<Order | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  // ====================================================
  // LOAD AUTHORITATIVE ORDER
  // ====================================================

  useEffect(() => {
    const loadOrder =
      async () => {
        if (!orderId) {
          setError(
            "Order ID is missing."
          );

          setLoading(false);

          return;
        }

        try {
          setLoading(true);

          setError("");

          const response =
            await getOrderById(
              orderId
            );

          setOrder(
            response.order
          );
        } catch (error) {
          console.error(
            "Failed to load order:",
            error
          );

          if (
            axios.isAxiosError(
              error
            )
          ) {
            const message =
              error.response
                ?.data?.message;

            setError(
              typeof message ===
                "string"
                ? message
                : "Unable to load your order."
            );
          } else if (
            error instanceof Error
          ) {
            setError(
              error.message
            );
          } else {
            setError(
              "Unable to load your order."
            );
          }
        } finally {
          setLoading(false);
        }
      };

    void loadOrder();
  }, [orderId]);

  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {
    return (
      <OrderSuccessSkeleton />
    );
  }

  // ====================================================
  // ERROR
  // ====================================================

  if (
    error ||
    !order
  ) {
    return (
      <main className="min-h-[75vh] bg-[#f8f8f6] px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-lg rounded-[32px] border border-black/5 bg-white p-8 text-center shadow-sm sm:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100">
            <ReceiptText
              className="h-6 w-6 text-neutral-700"
            />
          </div>

          <h1 className="mt-6 text-3xl font-semibold tracking-tight text-neutral-950">
            Unable to load order
          </h1>

          <p className="mt-3 text-sm leading-6 text-neutral-500">
            {error ||
              "We couldn't find this order."}
          </p>

          <Link
            href="/products"
            className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-black px-7 text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            Continue shopping

            <ArrowRight
              size={16}
            />
          </Link>
        </div>
      </main>
    );
  }

  // ====================================================
  // PAYMENT STATE
  // ====================================================

  const paymentSuccessful =
    order.paymentStatus ===
      "PAID" &&
    order.status !==
      "PENDING_PAYMENT";

  // ====================================================
  // SUCCESS PAGE
  // ====================================================

  return (
    <main className="min-h-screen bg-[#f8f8f6]">
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6 lg:px-8 lg:pt-14">
        {/* =============================================
            SUCCESS HERO
        ============================================== */}

        <section className="overflow-hidden rounded-[36px] border border-black/5 bg-white shadow-sm">
          <div className="px-6 py-10 text-center sm:px-10 sm:py-14">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
              {paymentSuccessful ? (
                <CheckCircle2 className="h-10 w-10 text-emerald-600" />
              ) : (
                <Loader2 className="h-9 w-9 animate-spin text-neutral-700" />
              )}
            </div>

            <p className="mt-7 text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">
              {paymentSuccessful
                ? "Payment confirmed"
                : "Order received"}
            </p>

            <h1 className="mx-auto mt-3 max-w-2xl text-4xl font-semibold tracking-tight text-neutral-950 sm:text-5xl">
              {paymentSuccessful
                ? "Thank you for your order."
                : "We're confirming your payment."}
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-neutral-500">
              {paymentSuccessful
                ? "Your payment has been verified securely and your order has been confirmed."
                : "Your order exists, but payment confirmation is still being processed."}
            </p>

            <div className="mt-7 inline-flex max-w-full items-center gap-2 rounded-full border border-black/10 bg-[#fafaf9] px-4 py-2 text-xs text-neutral-500">
              <ReceiptText
                size={14}
              />

              <span>
                Order
              </span>

              <span className="max-w-[220px] truncate font-semibold text-neutral-900">
                #{order.id}
              </span>
            </div>
          </div>

          {/* ===========================================
              STATUS BAR
          ============================================ */}

          <div className="grid border-t border-black/10 sm:grid-cols-3">
            <StatusCell
              icon={
                <ShieldCheck
                  size={18}
                />
              }
              label="Payment"
              value={
                order.paymentStatus
              }
              success={
                order.paymentStatus ===
                "PAID"
              }
            />

            <StatusCell
              icon={
                <PackageCheck
                  size={18}
                />
              }
              label="Order status"
              value={
                formatStatus(
                  order.status
                )
              }
              success={
                order.status ===
                  "CONFIRMED" ||
                order.status ===
                  "PROCESSING" ||
                order.status ===
                  "SHIPPED" ||
                order.status ===
                  "DELIVERED"
              }
            />

            <StatusCell
              icon={
                <CreditCard
                  size={18}
                />
              }
              label="Amount paid"
              value={`₹${order.totalAmount.toLocaleString(
                "en-IN"
              )}`}
              success={
                order.paymentStatus ===
                "PAID"
              }
            />
          </div>
        </section>

        {/* =============================================
            CONTENT
        ============================================== */}

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          {/* ===========================================
              ORDER ITEMS
          ============================================ */}

          <section className="rounded-[30px] border border-black/5 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                  Your purchase
                </p>

                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-950">
                  Order items
                </h2>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-100">
                <ShoppingBag
                  size={19}
                />
              </div>
            </div>

            <div className="mt-7 divide-y divide-black/10">
              {order.items.map(
                (item) => (
                  <div
                    key={
                      item.id
                    }
                    className="flex gap-4 py-5 first:pt-0 last:pb-0"
                  >
                    <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-2xl bg-neutral-100">
                      {item.productImage ? (
                        <Image
                          src={
                            item.productImage
                          }
                          alt={
                            item.productTitle
                          }
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-neutral-300">
                          <ShoppingBag
                            size={22}
                          />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-neutral-950">
                        {
                          item.productTitle
                        }
                      </p>

                      {item.productSku && (
                        <p className="mt-1 text-xs text-neutral-400">
                          SKU{" "}
                          {
                            item.productSku
                          }
                        </p>
                      )}

                      <p className="mt-3 text-xs text-neutral-500">
                        ₹
                        {item.unitPrice.toLocaleString(
                          "en-IN"
                        )}
                        {" × "}
                        {
                          item.quantity
                        }
                      </p>
                    </div>

                    <p className="shrink-0 text-sm font-semibold text-neutral-950">
                      ₹
                      {item.lineTotal.toLocaleString(
                        "en-IN"
                      )}
                    </p>
                  </div>
                )
              )}
            </div>
          </section>

          {/* ===========================================
              RIGHT COLUMN
          ============================================ */}

          <aside className="space-y-6">
            {/* =========================================
                PAYMENT SUMMARY
            ========================================== */}

            <section className="rounded-[30px] border border-black/5 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                Payment
              </p>

              <h2 className="mt-2 text-xl font-semibold tracking-tight text-neutral-950">
                Order summary
              </h2>

              <div className="mt-6 space-y-4">
                <SummaryRow
                  label="Subtotal"
                  value={`₹${order.subtotal.toLocaleString(
                    "en-IN"
                  )}`}
                />

                <SummaryRow
                  label="Discount"
                  value={
                    order.discount >
                    0
                      ? `−₹${order.discount.toLocaleString(
                          "en-IN"
                        )}`
                      : "—"
                  }
                  highlight={
                    order.discount >
                    0
                  }
                />

                {order.couponCode && (
                  <SummaryRow
                    label={`Coupon (${order.couponCode})`}
                    value="Applied"
                    highlight
                  />
                )}

                <SummaryRow
                  label="Delivery"
                  value={
                    order.shippingAmount >
                    0
                      ? `₹${order.shippingAmount.toLocaleString(
                          "en-IN"
                        )}`
                      : "Free"
                  }
                />
              </div>

              <div className="my-5 border-t border-black/10" />

              <div className="flex items-end justify-between gap-4">
                <span className="text-sm font-semibold text-neutral-950">
                  Total paid
                </span>

                <span className="text-2xl font-bold tracking-tight text-neutral-950">
                  ₹
                  {order.totalAmount.toLocaleString(
                    "en-IN"
                  )}
                </span>
              </div>

              {order.paymentId && (
                <div className="mt-5 rounded-2xl bg-[#f8f8f6] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                    Payment reference
                  </p>

                  <p className="mt-1 break-all text-xs font-medium text-neutral-700">
                    {
                      order.paymentId
                    }
                  </p>
                </div>
              )}
            </section>

            {/* =========================================
                DELIVERY
            ========================================== */}

            <section className="rounded-[30px] border border-black/5 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100">
                  <MapPin
                    size={17}
                  />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
                    Delivering to
                  </p>

                  <p className="mt-2 text-sm font-semibold text-neutral-950">
                    {
                      order.shippingFullName
                    }
                  </p>

                  <address className="mt-2 not-italic text-xs leading-5 text-neutral-500">
                    {
                      order.shippingAddressLine1
                    }

                    {order.shippingAddressLine2 &&
                      `, ${order.shippingAddressLine2}`}

                    <br />

                    {
                      order.shippingCity
                    }
                    ,{" "}
                    {
                      order.shippingState
                    }{" "}
                    {
                      order.shippingPostalCode
                    }

                    <br />

                    {
                      order.shippingCountry
                    }
                  </address>
                </div>
              </div>

              <div className="mt-5 flex items-start gap-3 border-t border-black/10 pt-5">
                <Truck
                  className="mt-0.5 shrink-0 text-neutral-700"
                  size={17}
                />

                <p className="text-xs leading-5 text-neutral-500">
                  We'll use this address for your delivery updates and shipment.
                </p>
              </div>
            </section>

            {/* =========================================
                ACTION
            ========================================== */}

            <Link
              href="/products"
              className="flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-black px-6 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              Continue shopping

              <ArrowRight
                size={17}
              />
            </Link>
          </aside>
        </div>

        {/* =============================================
            CONFIRMATION FOOTER
        ============================================== */}

        {paymentSuccessful && (
          <div className="mt-8 flex items-center justify-center gap-2 text-center text-xs text-neutral-400">
            <Check
              size={14}
              className="text-emerald-600"
            />

            Your payment was verified securely before this confirmation was shown.
          </div>
        )}
      </div>
    </main>
  );
}

// ======================================================
// FORMAT STATUS
// ======================================================

function formatStatus(
  value: string
) {
  return value
    .replace(
      /_/g,
      " "
    )
    .toLowerCase()
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase()
    );
}

// ======================================================
// STATUS CELL
// ======================================================

function StatusCell({
  icon,
  label,
  value,
  success = false,
}: {
  icon: React.ReactNode;

  label: string;

  value: string;

  success?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-black/10 px-6 py-5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
          success
            ? "bg-emerald-50 text-emerald-700"
            : "bg-neutral-100 text-neutral-700"
        }`}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[11px] font-medium text-neutral-400">
          {label}
        </p>

        <p
          className={`mt-0.5 truncate text-sm font-semibold ${
            success
              ? "text-emerald-700"
              : "text-neutral-950"
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

// ======================================================
// SUMMARY ROW
// ======================================================

function SummaryRow({
  label,
  value,
  highlight = false,
}: {
  label: string;

  value: string;

  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-neutral-500">
        {label}
      </span>

      <span
        className={`text-right font-semibold ${
          highlight
            ? "text-emerald-700"
            : "text-neutral-900"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

// ======================================================
// SKELETON
// ======================================================

function OrderSuccessSkeleton() {
  return (
    <main className="min-h-screen bg-[#f8f8f6]">
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6 lg:px-8 lg:pt-14">
        <div className="h-[360px] animate-pulse rounded-[36px] bg-neutral-200" />

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="h-[430px] animate-pulse rounded-[30px] bg-neutral-200" />

          <div className="space-y-6">
            <div className="h-[320px] animate-pulse rounded-[30px] bg-neutral-200" />

            <div className="h-[220px] animate-pulse rounded-[30px] bg-neutral-200" />
          </div>
        </div>
      </div>
    </main>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<OrderSuccessSkeleton />}>
      <OrderSuccessContent />
    </Suspense>
  );
}