"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import Link from "next/link";

import {
  ArrowLeft,
  Box,
  Check,
  CheckCircle2,
  Circle,
  Clock3,
  Copy,
  CreditCard,
  Loader2,
  Mail,
  MapPin,
  PackageCheck,
  Phone,
  ReceiptText,
  RefreshCw,
  ShieldCheck,
  Truck,
  User,
} from "lucide-react";

import { toast } from "sonner";

import {
  getSellerOrderDetails,
  updateSellerOrderStatus,
} from "@/services/order.service";

import {
  SellerOrderDetails,
  SellerOrderStatus,
  SellerOrderStatusUpdate,
} from "@/types/order";

interface OrderDetailsDashboardProps {
  orderId: string;
}

// ======================================================
// HELPERS
// ======================================================

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
};

const formatDate = (value: string | null): string => {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

const shortOrderId = (orderId: string): string => {
  return `#${orderId.slice(-8).toUpperCase()}`;
};

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (
      error as {
        response?: {
          data?: {
            message?: unknown;
          };
        };
      }
    ).response;

    if (typeof response?.data?.message === "string") {
      return response.data.message;
    }
  }

  return fallback;
};

// ======================================================
// STATUS
// ======================================================

const STATUS_STYLES: Record<SellerOrderStatus, string> = {
  PENDING_PAYMENT: "bg-amber-50 text-amber-700 ring-amber-600/15",

  CONFIRMED: "bg-blue-50 text-blue-700 ring-blue-600/15",

  PROCESSING: "bg-violet-50 text-violet-700 ring-violet-600/15",

  SHIPPED: "bg-cyan-50 text-cyan-700 ring-cyan-600/15",

  DELIVERED: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",

  CANCELLED: "bg-red-50 text-red-700 ring-red-600/15",
};

const STATUS_LABELS: Record<SellerOrderStatus, string> = {
  PENDING_PAYMENT: "Pending payment",

  CONFIRMED: "Confirmed",

  PROCESSING: "Processing",

  SHIPPED: "Shipped",

  DELIVERED: "Delivered",

  CANCELLED: "Cancelled",
};

function StatusBadge({ status }: { status: SellerOrderStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

// ======================================================
// DETAIL CARD
// ======================================================

function DetailCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof User;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[26px] border border-black/[0.06] bg-white p-5 shadow-[0_12px_40px_rgba(0,0,0,0.035)] sm:p-6">
      <div className="flex items-center gap-3 border-b border-black/[0.06] pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-600">
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
        </div>

        <h2 className="text-sm font-semibold text-neutral-950">{title}</h2>
      </div>

      <div className="pt-5">{children}</div>
    </section>
  );
}

// ======================================================
// LOADING
// ======================================================

function DetailsLoading() {
  return (
    <div className="space-y-6">
      <div className="h-28 animate-pulse rounded-[26px] bg-white" />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.75fr)]">
        <div className="h-[420px] animate-pulse rounded-[26px] bg-white" />

        <div className="space-y-6">
          <div className="h-56 animate-pulse rounded-[26px] bg-white" />
          <div className="h-64 animate-pulse rounded-[26px] bg-white" />
        </div>
      </div>
    </div>
  );
}

// ======================================================
// ORDER DETAILS
// ======================================================

export default function OrderDetailsDashboard({
  orderId,
}: OrderDetailsDashboardProps) {
  const [order, setOrder] = useState<SellerOrderDetails | null>(null);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [updating, setUpdating] = useState(false);

  const [trackingNumber, setTrackingNumber] = useState("");

  const [shippingCarrier, setShippingCarrier] = useState("");

  // ====================================================
  // RESET SCROLL
  // ====================================================

  useEffect(() => {
    document.querySelector("main")?.scrollTo({
      top: 0,
      behavior: "auto",
    });
  }, []);

  // ====================================================
  // LOAD DETAILS
  // ====================================================

  const loadOrder = useCallback(
    async (showRefreshState = false) => {
      try {
        if (showRefreshState) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const data = await getSellerOrderDetails(orderId);

        setOrder(data.order);

        setTrackingNumber(data.order.tracking.trackingNumber || "");

        setShippingCarrier(data.order.tracking.shippingCarrier || "");
      } catch (error) {
        console.error("Failed to load order:", error);

        toast.error(getErrorMessage(error, "Unable to load order details."));

        setOrder(null);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [orderId],
  );

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  // ====================================================
  // NEXT STATUS
  // ====================================================

  const nextStatus = useMemo<SellerOrderStatusUpdate | null>(() => {
    if (!order) {
      return null;
    }

    if (order.status === "CONFIRMED") {
      return "PROCESSING";
    }

    if (order.status === "PROCESSING") {
      return "SHIPPED";
    }

    if (order.status === "SHIPPED") {
      return "DELIVERED";
    }

    return null;
  }, [order]);

  const actionLabel =
    nextStatus === "PROCESSING"
      ? "Start processing"
      : nextStatus === "SHIPPED"
        ? "Mark as shipped"
        : nextStatus === "DELIVERED"
          ? "Mark as delivered"
          : null;

  // ====================================================
  // UPDATE STATUS
  // ====================================================

  const handleStatusUpdate = async () => {
    if (!order || !nextStatus || updating) {
      return;
    }

    const normalizedTracking = trackingNumber.trim();

    const normalizedCarrier = shippingCarrier.trim();

    if (
      nextStatus === "SHIPPED" &&
      (!normalizedTracking || !normalizedCarrier)
    ) {
      toast.error("Enter the tracking number and shipping carrier.");

      return;
    }

    try {
      setUpdating(true);

      await updateSellerOrderStatus(order.id, {
        status: nextStatus,

        ...(nextStatus === "SHIPPED"
          ? {
              trackingNumber: normalizedTracking,

              shippingCarrier: normalizedCarrier,
            }
          : {}),
      });

      toast.success(
        nextStatus === "PROCESSING"
          ? "Order is now being processed."
          : nextStatus === "SHIPPED"
            ? "Order marked as shipped."
            : "Order marked as delivered.",
      );

      await loadOrder(true);
    } catch (error) {
      console.error("Status update failed:", error);

      toast.error(getErrorMessage(error, "Unable to update order status."));
    } finally {
      setUpdating(false);
    }
  };

  // ====================================================
  // COPY ORDER ID
  // ====================================================

  const copyOrderId = async () => {
    try {
      await navigator.clipboard.writeText(orderId);

      toast.success("Order ID copied.");
    } catch {
      toast.error("Unable to copy order ID.");
    }
  };

  if (loading) {
    return <DetailsLoading />;
  }

  if (!order) {
    return (
      <section className="flex min-h-[420px] flex-col items-center justify-center rounded-[26px] border border-black/[0.06] bg-white px-6 text-center shadow-[0_12px_40px_rgba(0,0,0,0.035)]">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-500">
          <Box className="h-6 w-6" />
        </div>

        <h1 className="mt-5 text-xl font-semibold text-neutral-950">
          Order not found
        </h1>

        <p className="mt-2 max-w-md text-sm leading-6 text-neutral-500">
          This order may not exist or may not contain products belonging to your
          store.
        </p>

        <Link
          href="/dashboard/orders"
          className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#0b1220] px-5 text-sm font-semibold text-white transition hover:bg-[#172033]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to orders
        </Link>
      </section>
    );
  }

  const timeline = [
    {
      status: "CONFIRMED",
      label: "Confirmed",
      description: "Payment received",
      date: order.payment.verifiedAt ?? order.createdAt,
      complete: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"].includes(
        order.status,
      ),
    },
    {
      status: "PROCESSING",
      label: "Processing",
      description: "Preparing the package",
      date: order.processingAt,
      complete: ["PROCESSING", "SHIPPED", "DELIVERED"].includes(order.status),
    },
    {
      status: "SHIPPED",
      label: "Shipped",
      description: "Handed to the carrier",
      date: order.shippedAt,
      complete: ["SHIPPED", "DELIVERED"].includes(order.status),
    },
    {
      status: "DELIVERED",
      label: "Delivered",
      description: "Delivered to customer",
      date: order.deliveredAt,
      complete: order.status === "DELIVERED",
    },
  ];

  return (
    <div className="min-w-0 space-y-7">
      {/* PAGE HEADER */}

      <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            href="/dashboard/orders"
            className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-500 transition hover:text-neutral-950"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to orders
          </Link>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <h1 className="font-mono text-2xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-3xl">
              {shortOrderId(order.id)}
            </h1>

            <StatusBadge status={order.status} />
          </div>

          <p className="mt-2 text-sm text-neutral-500">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={copyOrderId}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-black/[0.08] bg-white px-4 text-sm font-semibold text-neutral-700 shadow-sm transition hover:border-black/[0.14] hover:text-neutral-950"
          >
            <Copy className="h-4 w-4" />
            Copy ID
          </button>

          <button
            type="button"
            onClick={() => loadOrder(true)}
            disabled={refreshing}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-black/[0.08] bg-white px-4 text-sm font-semibold text-neutral-700 shadow-sm transition hover:border-black/[0.14] hover:text-neutral-950 disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </section>

      {/* TIMELINE */}

      <section className="rounded-[26px] border border-black/[0.06] bg-white p-5 shadow-[0_12px_40px_rgba(0,0,0,0.035)] sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
            <Clock3 className="h-[18px] w-[18px]" strokeWidth={1.8} />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-neutral-950">
              Fulfilment progress
            </h2>

            <p className="mt-1 text-xs text-neutral-500">
              Seller-specific order timeline
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {timeline.map((step, index) => (
            <div key={step.status} className="relative">
              {index < timeline.length - 1 && (
                <div
                  className={`absolute left-5 top-5 hidden h-px w-[calc(100%-20px)] md:block ${
                    timeline[index + 1].complete
                      ? "bg-emerald-300"
                      : "bg-neutral-200"
                  }`}
                />
              )}

              <div className="relative flex gap-3 md:block">
                <div
                  className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-4 ring-white ${
                    step.complete
                      ? "bg-emerald-500 text-white"
                      : "bg-neutral-100 text-neutral-400"
                  }`}
                >
                  {step.complete ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Circle className="h-4 w-4" />
                  )}
                </div>

                <div className="md:mt-4">
                  <p className="text-sm font-semibold text-neutral-900">
                    {step.label}
                  </p>

                  <p className="mt-1 text-xs text-neutral-500">
                    {step.description}
                  </p>

                  <p className="mt-2 text-[11px] text-neutral-400">
                    {step.date ? formatDate(step.date) : "Pending"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.75fr)]">
        <div className="space-y-6">
          {/* PRODUCTS */}

          <DetailCard title="Your products" icon={PackageCheck}>
            <div className="divide-y divide-black/[0.06]">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 py-5 first:pt-0 last:pb-0"
                >
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-black/[0.06] bg-neutral-100">
                    {item.productImage ? (
                      <img
                        src={item.productImage}
                        alt={item.productTitle}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Box className="h-6 w-6 text-neutral-400" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-neutral-900">
                      {item.productTitle}
                    </p>

                    <p className="mt-1 text-xs text-neutral-400">
                      SKU: {item.productSku || "Not available"}
                    </p>

                    <p className="mt-2 text-xs text-neutral-500">
                      {formatCurrency(item.unitPrice)} × {item.quantity}
                    </p>
                  </div>

                  <p className="shrink-0 text-sm font-semibold text-neutral-950">
                    {formatCurrency(item.lineTotal)}
                  </p>
                </div>
              ))}
            </div>
          </DetailCard>

          {/* STATUS ACTION */}

          <DetailCard title="Manage fulfilment" icon={Truck}>
            {order.status === "PROCESSING" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-semibold text-neutral-700">
                    Shipping carrier
                  </span>

                  <input
                    value={shippingCarrier}
                    onChange={(event) => setShippingCarrier(event.target.value)}
                    placeholder="e.g. Delhivery"
                    className="mt-2 h-11 w-full rounded-2xl border border-black/[0.08] bg-neutral-50 px-4 text-sm outline-none transition focus:border-neutral-300 focus:bg-white focus:ring-4 focus:ring-black/[0.025]"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-semibold text-neutral-700">
                    Tracking number
                  </span>

                  <input
                    value={trackingNumber}
                    onChange={(event) => setTrackingNumber(event.target.value)}
                    placeholder="Enter tracking ID"
                    className="mt-2 h-11 w-full rounded-2xl border border-black/[0.08] bg-neutral-50 px-4 text-sm outline-none transition focus:border-neutral-300 focus:bg-white focus:ring-4 focus:ring-black/[0.025]"
                  />
                </label>
              </div>
            ) : order.tracking.trackingNumber ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-neutral-50 p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                    Carrier
                  </p>

                  <p className="mt-2 text-sm font-semibold text-neutral-900">
                    {order.tracking.shippingCarrier || "Not available"}
                  </p>
                </div>

                <div className="rounded-2xl bg-neutral-50 p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                    Tracking number
                  </p>

                  <p className="mt-2 break-all font-mono text-sm font-semibold text-neutral-900">
                    {order.tracking.trackingNumber}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm leading-6 text-neutral-500">
                Tracking information will will be requested when the order is
                ready to ship.
              </p>
            )}

            {actionLabel ? (
              <button
                type="button"
                onClick={handleStatusUpdate}
                disabled={updating}
                className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#0b1220] px-5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(11,18,32,0.12)] transition hover:bg-[#172033] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {updating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : nextStatus === "PROCESSING" ? (
                  <Box className="h-4 w-4" />
                ) : nextStatus === "SHIPPED" ? (
                  <Truck className="h-4 w-4" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}

                {updating ? "Updating..." : actionLabel}
              </button>
            ) : (
              <div className="mt-5 flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                Fulfilment completed
              </div>
            )}
          </DetailCard>
        </div>

        <aside className="space-y-6">
          {/* CUSTOMER */}

          <DetailCard title="Customer" icon={User}>
            <p className="font-semibold text-neutral-900">
              {order.shippingAddress.fullName}
            </p>

            <div className="mt-4 space-y-3">
              <a
                href={`mailto:${order.contact.email}`}
                className="flex items-center gap-3 text-sm text-neutral-600 transition hover:text-neutral-950"
              >
                <Mail className="h-4 w-4 text-neutral-400" />

                <span className="min-w-0 truncate">{order.contact.email}</span>
              </a>

              <a
                href={`tel:${order.contact.phone}`}
                className="flex items-center gap-3 text-sm text-neutral-600 transition hover:text-neutral-950"
              >
                <Phone className="h-4 w-4 text-neutral-400" />

                {order.contact.phone}
              </a>
            </div>
          </DetailCard>

          {/* ADDRESS */}

          <DetailCard title="Shipping address" icon={MapPin}>
            <address className="not-italic text-sm leading-7 text-neutral-600">
              <p className="font-semibold text-neutral-900">
                {order.shippingAddress.fullName}
              </p>

              <p className="mt-2">{order.shippingAddress.addressLine1}</p>

              {order.shippingAddress.addressLine2 && (
                <p>{order.shippingAddress.addressLine2}</p>
              )}

              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.postalCode}
              </p>

              <p>{order.shippingAddress.country}</p>
            </address>
          </DetailCard>

          {/* PAYMENT */}

          <DetailCard title="Payment" icon={CreditCard}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-neutral-400">Payment status</p>

                <p className="mt-1 text-sm font-semibold text-neutral-900">
                  {order.payment.status}
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-5 space-y-3 border-t border-black/[0.06] pt-5 text-sm">
              <div className="flex justify-between gap-4 text-neutral-500">
                <span>Subtotal</span>

                <span className="font-medium text-neutral-800">
                  {formatCurrency(order.sellerSubtotal)}
                </span>
              </div>

              <div className="flex justify-between gap-4 text-neutral-500">
                <span>Discount</span>

                <span className="font-medium text-emerald-600">
                  −{formatCurrency(order.sellerDiscount)}
                </span>
              </div>

              <div className="flex justify-between gap-4 border-t border-black/[0.06] pt-3">
                <span className="font-semibold text-neutral-900">
                  Your revenue
                </span>

                <span className="font-semibold text-neutral-950">
                  {formatCurrency(order.sellerTotal)}
                </span>
              </div>
            </div>

            {order.couponCode && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-xs font-semibold text-emerald-700">
                <ReceiptText className="h-4 w-4" />
                Coupon: {order.couponCode}
              </div>
            )}
          </DetailCard>
        </aside>
      </div>
    </div>
  );
}
