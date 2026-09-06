"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";

import axios from "axios";

import {
  ArrowLeft,
  CalendarDays,
  Check,
    Star,
  Clock3,
  Copy,
  CreditCard,
  ExternalLink,
  Mail,
  MapPin,
  Package,
  Phone,
  ReceiptText,
  RefreshCw,
  ShoppingBag,
  Store,
 
} from "lucide-react";

import {
  getOrderById,
} from "@/services/order.service";

import type {
  Order,
  OrderItem,
  OrderStatus,
  PaymentStatus,
  SellerFulfilment,
  SellerOrderStatus,
} from "@/types/order";

// ======================================================
// TYPES
// ======================================================

interface UserOrderDetailsProps {
  orderId: string;
}

interface SellerGroup {
  sellerId: string;
  items: OrderItem[];
  fulfilment: SellerFulfilment | null;
}

// ======================================================
// FULFILMENT STEPS
// ======================================================

const FULFILMENT_STEPS: Array<{
  status: SellerOrderStatus;
  label: string;
  description: string;
}> = [
  {
    status: "CONFIRMED",
    label: "Confirmed",
    description: "Payment received",
  },
  {
    status: "PROCESSING",
    label: "Processing",
    description: "Preparing your package",
  },
  {
    status: "SHIPPED",
    label: "Shipped",
    description: "Handed to the carrier",
  },
  {
    status: "DELIVERED",
    label: "Delivered",
    description: "Delivered to you",
  },
];

// ======================================================
// MAIN COMPONENT
// ======================================================

export default function UserOrderDetails({
  orderId,
}: UserOrderDetailsProps) {
  const [order, setOrder] =
    useState<Order | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [copied, setCopied] =
    useState(false);

  // ====================================================
  // LOAD ORDER
  // ====================================================

  const loadOrder = useCallback(
    async (refresh = false) => {
      const normalizedOrderId =
        orderId.trim();

      if (!normalizedOrderId) {
        setError("Order ID is missing.");
        setLoading(false);
        return;
      }

      try {
        if (refresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response =
          await getOrderById(
            normalizedOrderId
          );

        setOrder(response.order);
      } catch (loadError) {
        console.error(
          "Failed to load order details:",
          loadError
        );

        if (
          axios.isAxiosError(
            loadError
          )
        ) {
          const message =
            loadError.response
              ?.data?.message;

          setError(
            typeof message === "string"
              ? message
              : "Unable to load this order."
          );
        } else if (
          loadError instanceof Error
        ) {
          setError(loadError.message);
        } else {
          setError(
            "Unable to load this order."
          );
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [orderId]
  );

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "auto",
    });

    void loadOrder();
  }, [loadOrder]);

  // ====================================================
  // COPY ORDER ID
  // ====================================================

  const copyOrderId = async () => {
    if (!order) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        order.id
      );

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch (copyError) {
      console.error(
        "Unable to copy order ID:",
        copyError
      );
    }
  };

  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {
    return <OrderDetailsSkeleton />;
  }

  // ====================================================
  // ERROR
  // ====================================================

  if (error || !order) {
    return (
      <OrderErrorState
        message={
          error ||
          "We could not find this order."
        }
        onRetry={() =>
          void loadOrder()
        }
      />
    );
  }

  // ====================================================
  // SELLER GROUPS
  // ====================================================

  const sellerGroups =
    buildSellerGroups(order);

  return (
    <div className="min-w-0">
      {/* BACK BUTTON */}

      <Link
        href="/profile/orders"
        className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-500 transition hover:text-neutral-950"
      >
        <ArrowLeft
          className="h-4 w-4"
          strokeWidth={1.8}
        />

        Back to orders
      </Link>

      {/* ORDER HEADER */}

      <section className="mt-6 overflow-hidden rounded-[32px] border border-black/[0.06] bg-white shadow-[0_14px_45px_rgba(0,0,0,0.03)]">
        <div className="relative overflow-hidden px-6 py-8 sm:px-8 lg:px-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
          >
            <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full bg-[#dce5df]/70 blur-3xl" />

            <div className="absolute -bottom-36 left-1/3 h-64 w-64 rounded-full bg-[#ead7dc]/55 blur-3xl" />
          </div>

          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
                Order details
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <h1 className="break-all text-3xl font-semibold tracking-[-0.05em] text-neutral-950 sm:text-4xl">
                  #{getShortOrderId(order.id)}
                </h1>

                <StatusBadge
                  status={order.status}
                />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-neutral-500">
                <span className="inline-flex items-center gap-2">
                  <CalendarDays
                    className="h-4 w-4"
                    strokeWidth={1.7}
                  />

                  Placed on{" "}
                  {formatDateTime(
                    order.createdAt
                  )}
                </span>

                <span className="inline-flex items-center gap-2">
                  <ShoppingBag
                    className="h-4 w-4"
                    strokeWidth={1.7}
                  />

                  {getTotalQuantity(
                    order.items
                  )}{" "}
                  {getTotalQuantity(
                    order.items
                  ) === 1
                    ? "item"
                    : "items"}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={copyOrderId}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-black/[0.08] bg-white px-5 text-sm font-semibold text-neutral-700 transition hover:border-black/[0.14] hover:bg-[#f7f5f1]"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Copy
                    className="h-4 w-4"
                    strokeWidth={1.8}
                  />
                )}

                {copied
                  ? "Copied"
                  : "Copy ID"}
              </button>

              <button
                type="button"
                onClick={() =>
                  void loadOrder(true)
                }
                disabled={refreshing}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-neutral-950 px-5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    refreshing
                      ? "animate-spin"
                      : ""
                  }`}
                  strokeWidth={1.8}
                />

                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* PAYMENT STATUS */}

        <div className="grid border-t border-black/[0.06] bg-[#fbfaf8] sm:grid-cols-3">
          <HeaderStat
            icon={
              <CreditCard className="h-[18px] w-[18px]" />
            }
            label="Payment"
            value={formatStatus(
              order.paymentStatus
            )}
            accent={
              order.paymentStatus ===
              "PAID"
            }
          />

          <HeaderStat
            icon={
              <Package className="h-[18px] w-[18px]" />
            }
            label="Fulfilment"
            value={formatStatus(
              order.status
            )}
            accent={
              order.status ===
              "DELIVERED"
            }
          />

          <HeaderStat
            icon={
              <ReceiptText className="h-[18px] w-[18px]" />
            }
            label="Order total"
            value={formatCurrency(
              order.totalAmount
            )}
            accent
          />
        </div>
      </section>

      {/* SELLER FULFILMENTS */}

      <section className="mt-8">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
            Delivery journey
          </p>

          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-3xl">
            Your packages
          </h2>

          <p className="mt-2 text-sm leading-6 text-neutral-500">
            Products from different sellers may arrive
            separately.
          </p>
        </div>

        <div className="mt-6 space-y-5">
          {sellerGroups.map(
            (group, index) => (
              <SellerPackage
                key={group.sellerId}
                group={group}
                packageNumber={
                  index + 1
                }
                fallbackStatus={
                  order.status
                }
              />
            )
          )}
        </div>
      </section>

      {/* INFORMATION GRID */}

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* LEFT COLUMN */}

        <div className="space-y-6">
          <OrderItemsCard
  items={order.items}
  paymentStatus={
    order.paymentStatus
  }
  sellerOrders={
    order.sellerOrders ??
    []
  }
/>

          <DeliveryAddressCard
            order={order}
          />
        </div>

        {/* RIGHT COLUMN */}

        <aside className="space-y-6">
          <PaymentSummaryCard
            order={order}
          />

          <ContactCard
            email={order.contactEmail}
            phone={order.contactPhone}
          />

          <Link
            href="/products"
            className="flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-neutral-950 px-6 text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            Continue shopping

            <ExternalLink
              className="h-4 w-4"
              strokeWidth={1.8}
            />
          </Link>
        </aside>
      </div>
    </div>
  );
}

// ======================================================
// SELLER PACKAGE
// ======================================================

function SellerPackage({
  group,
  packageNumber,
  fallbackStatus,
}: {
  group: SellerGroup;
  packageNumber: number;
  fallbackStatus: OrderStatus;
}) {
  const fulfilment =
    group.fulfilment;

  const status =
    fulfilment?.status ??
    fallbackStatus;

  const sellerName =
    fulfilment?.seller
      ?.shopName ||
    fulfilment?.seller
      ?.name ||
    `Seller ${packageNumber}`;

  const trackingNumber =
    fulfilment?.trackingNumber;

  const shippingCarrier =
    fulfilment?.shippingCarrier;

  return (
    <article className="overflow-hidden rounded-[30px] border border-black/[0.06] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.025)]">
      <div className="flex flex-col gap-5 border-b border-black/[0.06] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-[#e7ddd0] text-neutral-700">
            <Store
              className="h-5 w-5"
              strokeWidth={1.7}
            />
          </div>

          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
              Package {packageNumber}
            </p>

            <h3 className="mt-1 truncate text-base font-semibold text-neutral-950">
              {sellerName}
            </h3>
          </div>
        </div>

        <StatusBadge
          status={status}
        />
      </div>

      <div className="px-6 py-7">
        <FulfilmentTimeline
          status={status}
          fulfilment={fulfilment}
        />

        {(trackingNumber ||
          shippingCarrier) && (
          <div className="mt-7 grid gap-3 border-t border-black/[0.06] pt-6 sm:grid-cols-2">
            <TrackingDetail
              label="Shipping carrier"
              value={
                shippingCarrier ||
                "Not provided"
              }
            />

            <TrackingDetail
              label="Tracking number"
              value={
                trackingNumber ||
                "Not provided"
              }
            />
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-black/[0.06] pt-6">
          {group.items
            .slice(0, 4)
            .map((item) => (
              <div
                key={item.id}
                className="relative h-12 w-12 overflow-hidden rounded-[14px] bg-[#f1efeb]"
                title={
                  item.productTitle
                }
              >
                {item.productImage ? (
                  <Image
                    src={
                      item.productImage
                    }
                    alt={
                      item.productTitle
                    }
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-neutral-300">
                    <ShoppingBag className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}

          <p className="text-xs text-neutral-500">
            {group.items.length}{" "}
            {group.items.length === 1
              ? "product"
              : "products"}{" "}
            in this package
          </p>
        </div>
      </div>
    </article>
  );
}

// ======================================================
// FULFILMENT TIMELINE
// ======================================================

function FulfilmentTimeline({
  status,
  fulfilment,
}: {
  status: OrderStatus;
  fulfilment: SellerFulfilment | null;
}) {
  if (
    status === "CANCELLED"
  ) {
    return (
      <div className="rounded-[22px] border border-red-100 bg-red-50 px-5 py-4">
        <p className="text-sm font-semibold text-red-700">
          This package was cancelled
        </p>

        {fulfilment?.cancelledAt && (
          <p className="mt-1 text-xs text-red-500">
            Cancelled on{" "}
            {formatDateTime(
              fulfilment.cancelledAt
            )}
          </p>
        )}
      </div>
    );
  }

  const activeIndex =
    getStatusIndex(status);

  return (
    <div className="grid gap-5 sm:grid-cols-4">
      {FULFILMENT_STEPS.map(
        (step, index) => {
          const complete =
            index <= activeIndex;

          const timestamp =
            getStepTimestamp(
              step.status,
              fulfilment
            );

          return (
            <div
              key={step.status}
              className="relative"
            >
              {index <
                FULFILMENT_STEPS.length -
                  1 && (
                <div
                  className={`absolute left-6 top-5 hidden h-px w-[calc(100%-24px)] sm:block ${
                    index <
                    activeIndex
                      ? "bg-emerald-400"
                      : "bg-neutral-200"
                  }`}
                />
              )}

              <div
                className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border ${
                  complete
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : "border-neutral-200 bg-[#f7f5f1] text-neutral-400"
                }`}
              >
                {complete ? (
                  <Check
                    className="h-4 w-4"
                    strokeWidth={2}
                  />
                ) : (
                  <Clock3
                    className="h-4 w-4"
                    strokeWidth={1.7}
                  />
                )}
              </div>

              <p
                className={`mt-3 text-sm font-semibold ${
                  complete
                    ? "text-neutral-950"
                    : "text-neutral-400"
                }`}
              >
                {step.label}
              </p>

              <p className="mt-1 text-xs leading-5 text-neutral-500">
                {step.description}
              </p>

              <p className="mt-2 text-[11px] text-neutral-400">
                {timestamp
                  ? formatDateTime(
                      timestamp
                    )
                  : complete
                    ? "Completed"
                    : "Pending"}
              </p>
            </div>
          );
        }
      )}
    </div>
  );
}


// ======================================================
// ORDER ITEMS CARD
// ======================================================

function OrderItemsCard({
  items,
  paymentStatus,
  sellerOrders,
}: {
  items: OrderItem[];
  paymentStatus: PaymentStatus;
  sellerOrders: SellerFulfilment[];
}) {
  const canReviewItem = (
    item: OrderItem
  ): boolean => {
    if (
      paymentStatus !== "PAID"
    ) {
      return false;
    }

    return sellerOrders.some(
      (fulfilment) =>
        fulfilment.sellerId ===
          item.sellerId &&
        fulfilment.status ===
          "DELIVERED"
    );
  };

  return (
    <section className="rounded-[30px] border border-black/[0.06] bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.025)] sm:p-8">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-[15px] bg-[#dce4df] text-neutral-700">
          <Package
            className="h-5 w-5"
            strokeWidth={1.7}
          />
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-neutral-400">
            Purchase
          </p>

          <h2 className="mt-1 text-lg font-semibold text-neutral-950">
            Order items
          </h2>
        </div>
      </div>

      <div className="mt-6 divide-y divide-black/[0.06]">
        {items.map((item) => {
          const reviewAvailable =
            canReviewItem(item);

          return (
            <article
              key={item.id}
              className="flex gap-4 py-5 first:pt-0 last:pb-0"
            >
              <Link
                href={`/products/${encodeURIComponent(
                  item.productSlug
                )}`}
                className="relative h-24 w-20 shrink-0 overflow-hidden rounded-[18px] bg-[#f1efeb]"
              >
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
                    className="object-cover transition duration-300 hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-neutral-300">
                    <ShoppingBag
                      className="h-5 w-5"
                      strokeWidth={1.7}
                    />
                  </div>
                )}
              </Link>

              <div className="min-w-0 flex-1">
                <Link
                  href={`/products/${encodeURIComponent(
                    item.productSlug
                  )}`}
                  className="line-clamp-2 text-sm font-semibold leading-5 text-neutral-950 transition hover:text-neutral-600"
                >
                  {item.productTitle}
                </Link>

                {item.productSku && (
                  <p className="mt-1 text-xs text-neutral-400">
                    SKU:{" "}
                    {item.productSku}
                  </p>
                )}

                <p className="mt-3 text-xs text-neutral-500">
                  {formatCurrency(
                    item.unitPrice
                  )}{" "}
                  × {item.quantity}
                </p>

                {reviewAvailable && (
                  <Link
                    href={`/products/${encodeURIComponent(
                      item.productSlug
                    )}#reviews`}
                    className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 text-xs font-semibold text-amber-700 transition hover:bg-amber-100"
                  >
                    <Star
                      className="h-3.5 w-3.5"
                      strokeWidth={1.8}
                    />

                    Review product
                  </Link>
                )}
              </div>

              <p className="shrink-0 text-sm font-semibold text-neutral-950">
                {formatCurrency(
                  item.lineTotal
                )}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

// ======================================================
// PAYMENT SUMMARY
// ======================================================

function PaymentSummaryCard({
  order,
}: {
  order: Order;
}) {
  return (
    <section className="rounded-[30px] border border-black/[0.06] bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.025)]">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-[15px] bg-[#ead7dc] text-neutral-700">
          <ReceiptText
            className="h-5 w-5"
            strokeWidth={1.7}
          />
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-neutral-400">
            Payment
          </p>

          <h2 className="mt-1 text-lg font-semibold text-neutral-950">
            Order summary
          </h2>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <SummaryRow
          label="Subtotal"
          value={formatCurrency(
            order.subtotal
          )}
        />

        <SummaryRow
          label="Discount"
          value={
            order.discount > 0
              ? `−${formatCurrency(order.discount)}`
              : "—"
          }
          highlight={
            order.discount > 0
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
            order.shippingAmount > 0
              ? formatCurrency(
                  order.shippingAmount
                )
              : "Free"
          }
        />
      </div>

      <div className="my-5 border-t border-black/[0.07]" />

      <div className="flex items-end justify-between gap-4">
        <p className="text-sm font-semibold text-neutral-950">
          Total paid
        </p>

        <p className="text-2xl font-semibold tracking-[-0.04em] text-neutral-950">
          {formatCurrency(
            order.totalAmount
          )}
        </p>
      </div>

      {order.paymentProvider && (
        <div className="mt-5 rounded-[18px] bg-[#f7f5f1] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
            Payment method
          </p>

          <p className="mt-1 text-sm font-semibold capitalize text-neutral-800">
            {order.paymentProvider}
          </p>
        </div>
      )}

      {order.paymentId && (
        <div className="mt-3 rounded-[18px] bg-[#f7f5f1] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
            Payment reference
          </p>

          <p className="mt-1 break-all text-xs font-medium leading-5 text-neutral-700">
            {order.paymentId}
          </p>
        </div>
      )}
    </section>
  );
}

// ======================================================
// DELIVERY ADDRESS
// ======================================================

function DeliveryAddressCard({
  order,
}: {
  order: Order;
}) {
  return (
    <section className="rounded-[30px] border border-black/[0.06] bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.025)] sm:p-8">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-[#d9e1e6] text-neutral-700">
          <MapPin
            className="h-5 w-5"
            strokeWidth={1.7}
          />
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-neutral-400">
            Delivery
          </p>

          <h2 className="mt-1 text-lg font-semibold text-neutral-950">
            Shipping address
          </h2>
        </div>
      </div>

      <div className="mt-6 rounded-[22px] bg-[#f7f5f1] p-5">
        <p className="text-sm font-semibold text-neutral-950">
          {order.shippingFullName}
        </p>

        <address className="mt-3 not-italic text-sm leading-7 text-neutral-600">
          {order.shippingAddressLine1}

          {order.shippingAddressLine2 && (
            <>
              <br />
              {order.shippingAddressLine2}
            </>
          )}

          <br />

          {order.shippingCity},{" "}
          {order.shippingState}{" "}
          {order.shippingPostalCode}

          <br />

          {order.shippingCountry}
        </address>
      </div>
    </section>
  );
}

// ======================================================
// CONTACT CARD
// ======================================================

function ContactCard({
  email,
  phone,
}: {
  email: string;
  phone: string;
}) {
  return (
    <section className="rounded-[30px] border border-black/[0.06] bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.025)]">
      <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-neutral-400">
        Contact
      </p>

      <h2 className="mt-2 text-lg font-semibold text-neutral-950">
        Delivery updates
      </h2>

      <div className="mt-5 space-y-3">
        <a
          href={`mailto:${email}`}
          className="flex items-center gap-3 rounded-[18px] bg-[#f7f5f1] px-4 py-3 text-sm text-neutral-700 transition hover:bg-[#eeeae4]"
        >
          <Mail
            className="h-4 w-4 shrink-0 text-neutral-400"
            strokeWidth={1.7}
          />

          <span className="min-w-0 truncate">
            {email}
          </span>
        </a>

        <a
          href={`tel:${phone}`}
          className="flex items-center gap-3 rounded-[18px] bg-[#f7f5f1] px-4 py-3 text-sm text-neutral-700 transition hover:bg-[#eeeae4]"
        >
          <Phone
            className="h-4 w-4 shrink-0 text-neutral-400"
            strokeWidth={1.7}
          />

          <span>{phone}</span>
        </a>
      </div>
    </section>
  );
}

// ======================================================
// SMALL COMPONENTS
// ======================================================

function HeaderStat({
  icon,
  label,
  value,
  accent = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-black/[0.06] px-6 py-5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] ${
          accent
            ? "bg-emerald-50 text-emerald-700"
            : "bg-neutral-100 text-neutral-600"
        }`}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
          {label}
        </p>

        <p className="mt-1 truncate text-sm font-semibold text-neutral-950">
          {value}
        </p>
      </div>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: OrderStatus | SellerOrderStatus;
}) {
  const styles: Record<
    OrderStatus,
    string
  > = {
    PENDING_PAYMENT:
      "border-amber-200 bg-amber-50 text-amber-700",
    CONFIRMED:
      "border-blue-200 bg-blue-50 text-blue-700",
    PROCESSING:
      "border-violet-200 bg-violet-50 text-violet-700",
    SHIPPED:
      "border-sky-200 bg-sky-50 text-sky-700",
    DELIVERED:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
    CANCELLED:
      "border-red-200 bg-red-50 text-red-700",
  };

  return (
    <span
      className={`inline-flex w-fit items-center rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${styles[status]}`}
    >
      {formatStatus(status)}
    </span>
  );
}

function TrackingDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[18px] bg-[#f7f5f1] px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
        {label}
      </p>

      <p className="mt-1 break-all text-sm font-semibold text-neutral-800">
        {value}
      </p>
    </div>
  );
}

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
// ERROR STATE
// ======================================================

function OrderErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex min-h-[430px] flex-col items-center justify-center rounded-[32px] border border-black/[0.06] bg-white px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#ead7dc] text-neutral-700">
        <ReceiptText
          className="h-7 w-7"
          strokeWidth={1.7}
        />
      </div>

      <h1 className="mt-6 text-2xl font-semibold tracking-[-0.04em] text-neutral-950">
        Unable to load order
      </h1>

      <p className="mt-3 max-w-sm text-sm leading-6 text-neutral-500">
        {message}
      </p>

      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link
          href="/profile/orders"
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-black/[0.08] px-5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100"
        >
          <ArrowLeft className="h-4 w-4" />

          Back to orders
        </Link>

        <button
          type="button"
          onClick={onRetry}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-neutral-950 px-5 text-sm font-semibold text-white transition hover:bg-neutral-800"
        >
          <RefreshCw className="h-4 w-4" />

          Try again
        </button>
      </div>
    </div>
  );
}

// ======================================================
// SKELETON
// ======================================================

function OrderDetailsSkeleton() {
  return (
    <div className="min-w-0 animate-pulse">
      <div className="h-5 w-32 rounded-full bg-neutral-200" />

      <div className="mt-6 h-[270px] rounded-[32px] bg-white" />

      <div className="mt-8 h-8 w-52 rounded-xl bg-neutral-200" />

      <div className="mt-6 h-[330px] rounded-[30px] bg-white" />

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="h-[520px] rounded-[30px] bg-white" />

        <div className="h-[420px] rounded-[30px] bg-white" />
      </div>
    </div>
  );
}

// ======================================================
// HELPERS
// ======================================================

function buildSellerGroups(
  order: Order
): SellerGroup[] {
  const fulfilments =
    order.sellerOrders ?? [];

  const sellerIds =
    Array.from(
      new Set(
        order.items.map(
          (item) => item.sellerId
        )
      )
    );

  return sellerIds.map(
    (sellerId) => ({
      sellerId,

      items: order.items.filter(
        (item) =>
          item.sellerId === sellerId
      ),

      fulfilment:
        fulfilments.find(
          (item) =>
            item.sellerId === sellerId
        ) ?? null,
    })
  );
}

function getStatusIndex(
  status: OrderStatus
): number {
  return FULFILMENT_STEPS.findIndex(
    (step) =>
      step.status === status
  );
}

function getStepTimestamp(
  status: SellerOrderStatus,
  fulfilment: SellerFulfilment | null
): string | null {
  if (!fulfilment) {
    return null;
  }

  switch (status) {
    case "CONFIRMED":
      return fulfilment.createdAt;

    case "PROCESSING":
      return fulfilment.processingAt;

    case "SHIPPED":
      return fulfilment.shippedAt;

    case "DELIVERED":
      return fulfilment.deliveredAt;

    default:
      return null;
  }
}

function getTotalQuantity(
  items: OrderItem[]
): number {
  return items.reduce(
    (total, item) =>
      total + item.quantity,
    0
  );
}

function getShortOrderId(
  orderId: string
): string {
  return orderId
    .slice(-8)
    .toUpperCase();
}

function formatStatus(
  value: string
): string {
  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase()
    );
}

function formatCurrency(
  value: number
): string {
  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }
  ).format(value);
}

function formatDateTime(
  value: string
): string {
  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(date);
}