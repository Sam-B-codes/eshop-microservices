"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import axios from "axios";
import Image from "next/image";

import {
  AlertTriangle,
  ArrowLeft,
 
  CircleDollarSign,
  CreditCard,
  ImageIcon,
  Loader2,
  MapPin,
  Package,

  RefreshCw,
  Store,
  Truck,
  UserRound,
  WalletCards,
} from "lucide-react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import {
  useAdminContext,
} from "@/context/AdminContext";

import {
  getAdminOrderById,
} from "@/services/admin-order.service";

import {
  AdminOrderDetails,
} from "@/types/admin-order";

export default function AdminOrderDetailsPage() {
  const params =
    useParams();

  const router =
    useRouter();

  const {
    clearAdmin,
  } = useAdminContext();

  const orderIdValue =
    params.orderId;

  const orderId =
    Array.isArray(
      orderIdValue
    )
      ? orderIdValue[0]
      : orderIdValue;

  const [
    order,
    setOrder,
  ] =
    useState<AdminOrderDetails | null>(
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

  const loadOrder =
    useCallback(
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
            await getAdminOrderById(
              orderId
            );

          setOrder(
            response.order
          );
        } catch (
          requestError
        ) {
          if (
            axios.isAxiosError(
              requestError
            )
          ) {
            if (
              requestError.response
                ?.status === 401
            ) {
              clearAdmin();

              router.replace(
                "/login"
              );

              return;
            }

            const message =
              requestError.response
                ?.data?.message;

            setError(
              typeof message ===
                "string"
                ? message
                : "Unable to load order."
            );
          } else {
            setError(
              "Unable to load order."
            );
          }
        } finally {
          setLoading(false);
        }
      },
      [
        clearAdmin,
        orderId,
        router,
      ]
    );

  useEffect(() => {
    void loadOrder();
  }, [loadOrder]);

  if (loading) {
    return (
      <div className="flex min-h-[600px] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-neutral-500" />
      </div>
    );
  }

  if (
    error ||
    !order
  ) {
    return (
      <div className="flex min-h-[600px] flex-col items-center justify-center rounded-[30px] border border-red-100 bg-white px-6 text-center">
        <AlertTriangle className="h-8 w-8 text-red-500" />

        <h1 className="mt-4 text-xl font-semibold">
          Unable to load order
        </h1>

        <p className="mt-2 text-sm text-neutral-500">
          {error}
        </p>

        <button
          type="button"
          onClick={() =>
            void loadOrder()
          }
          className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#080d19] px-6 text-sm font-semibold text-white"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1500px]">
      <button
        type="button"
        onClick={() =>
          router.push(
            "/dashboard/orders"
          )
        }
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-neutral-500 transition hover:text-neutral-950"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to orders
      </button>

      <section className="relative overflow-hidden rounded-[32px] bg-[#080d19] px-6 py-8 text-white shadow-[0_22px_70px_rgba(8,13,25,0.16)] sm:px-8 lg:px-10">
        <div
          aria-hidden="true"
          className="absolute -right-20 -top-32 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl"
        />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Marketplace order
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.045em]">
              Order #
              {order.id.slice(
                -8
              )}
            </h1>

            <p className="mt-3 text-sm text-slate-400">
              Placed{" "}
              {formatDateTime(
                order.createdAt
              )}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <StatusBadge
              value={
                order.status
              }
            />

            <StatusBadge
              value={
                order.paymentStatus
              }
              payment
            />
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          icon={
            CircleDollarSign
          }
          label="Order total"
          value={formatINR(
            order.totalAmount
          )}
        />

        <Metric
          icon={Package}
          label="Items"
          value={String(
            order.items.reduce(
              (
                total,
                item
              ) =>
                total +
                item.quantity,
              0
            )
          )}
        />

        <Metric
          icon={Store}
          label="Sellers"
          value={String(
            order.sellerOrders
              .length
          )}
        />

        <Metric
          icon={WalletCards}
          label="Settlements"
          value={String(
            order.sellerSettlements
              .length
          )}
        />
      </section>

      <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <Card
            title="Order items"
            icon={Package}
          >
            <div className="divide-y divide-black/[0.06]">
              {order.items.map(
                (item) => (
                  <div
                    key={
                      item.id
                    }
                    className="flex gap-4 py-5 first:pt-0 last:pb-0"
                  >
                    <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-2xl bg-neutral-100">
                      {item.productImage ? (
                        <Image
                          src={
                            item.productImage
                          }
                          alt={
                            item.productTitle
                          }
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <ImageIcon className="h-5 w-5 text-neutral-300" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-neutral-950">
                        {
                          item.productTitle
                        }
                      </p>

                      <p className="mt-1 text-xs text-neutral-400">
                        {item.productSku
                          ? `SKU: ${item.productSku}`
                          : "No SKU"}
                      </p>

                      <p className="mt-2 text-xs text-neutral-500">
                        {formatINR(
                          item.unitPrice
                        )}
                        {" × "}
                        {
                          item.quantity
                        }
                      </p>
                    </div>

                    <p className="text-sm font-semibold text-neutral-950">
                      {formatINR(
                        item.lineTotal
                      )}
                    </p>
                  </div>
                )
              )}
            </div>
          </Card>

          <Card
            title="Seller fulfilments"
            icon={Store}
          >
            <div className="space-y-4">
              {order.sellerOrders.map(
                (
                  sellerOrder
                ) => (
                  <div
                    key={
                      sellerOrder.id
                    }
                    className="rounded-[22px] border border-black/[0.06] bg-neutral-50 p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-neutral-950">
                          {sellerOrder
                            .seller
                            .shopName ||
                            sellerOrder
                              .seller
                              .name}
                        </p>

                        <p className="mt-1 text-xs text-neutral-400">
                          {
                            sellerOrder
                              .seller
                              .email
                          }
                        </p>
                      </div>

                      <StatusBadge
                        value={
                          sellerOrder.status
                        }
                      />
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      <SmallValue
                        label="Subtotal"
                        value={formatINR(
                          sellerOrder.subtotal
                        )}
                      />

                      <SmallValue
                        label="Discount"
                        value={formatINR(
                          sellerOrder.discount
                        )}
                      />

                      <SmallValue
                        label="Seller total"
                        value={formatINR(
                          sellerOrder.totalAmount
                        )}
                      />
                    </div>

                    {(sellerOrder.trackingNumber ||
                      sellerOrder.shippingCarrier) && (
                      <div className="mt-4 flex items-center gap-2 border-t border-black/[0.06] pt-4 text-xs text-neutral-500">
                        <Truck className="h-4 w-4" />

                        {sellerOrder.shippingCarrier ||
                          "Carrier unavailable"}

                        {sellerOrder.trackingNumber &&
                          ` · ${sellerOrder.trackingNumber}`}
                      </div>
                    )}

                    {sellerOrder.settlement && (
                      <div className="mt-4 rounded-2xl bg-white p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-neutral-800">
                            Settlement
                          </p>

                          <StatusBadge
                            value={
                              sellerOrder
                                .settlement
                                .status
                            }
                          />
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                          <SmallValue
                            label="Platform fee"
                            value={formatINR(
                              sellerOrder
                                .settlement
                                .platformFee
                            )}
                          />

                          <SmallValue
                            label="Fee rate"
                            value={`${sellerOrder.settlement.platformFeeRate}%`}
                          />

                          <SmallValue
                            label="Seller earnings"
                            value={formatINR(
                              sellerOrder
                                .settlement
                                .sellerEarnings
                            )}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          </Card>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-28">
          <Card
            title="Payment summary"
            icon={CreditCard}
          >
            <div className="space-y-4">
              <SummaryRow
                label="Subtotal"
                value={formatINR(
                  order.subtotal
                )}
              />

              <SummaryRow
                label="Discount"
                value={
                  order.discount > 0
                    ? `−${formatINR(
                        order.discount
                      )}`
                    : "—"
                }
              />

              <SummaryRow
                label="Delivery"
                value={
                  order.shippingAmount >
                  0
                    ? formatINR(
                        order.shippingAmount
                      )
                    : "Free"
                }
              />

              {order.couponCode && (
                <SummaryRow
                  label={`Coupon (${order.couponCode})`}
                  value={formatINR(
                    order.couponDiscount
                  )}
                />
              )}
            </div>

            <div className="my-5 border-t border-black/[0.08]" />

            <div className="flex items-end justify-between gap-4">
              <p className="text-sm font-semibold">
                Total
              </p>

              <p className="text-2xl font-semibold">
                {formatINR(
                  order.totalAmount
                )}
              </p>
            </div>

            {order.paymentId && (
              <Reference
                label="Payment reference"
                value={
                  order.paymentId
                }
              />
            )}

            {order.paymentOrderId && (
              <Reference
                label="Provider order"
                value={
                  order.paymentOrderId
                }
              />
            )}
          </Card>

          <Card
            title="Customer"
            icon={UserRound}
          >
            <p className="text-sm font-semibold text-neutral-950">
              {order.user.name}
            </p>

            <p className="mt-1 text-xs text-neutral-500">
              {order.user.email}
            </p>

            <div className="mt-4">
              <StatusBadge
                value={
                  order.user.status
                }
              />
            </div>

            <div className="mt-5 border-t border-black/[0.06] pt-5">
              <p className="text-xs font-semibold text-neutral-800">
                Contact
              </p>

              <p className="mt-2 text-xs text-neutral-500">
                {order.contactEmail}
              </p>

              <p className="mt-1 text-xs text-neutral-500">
                {order.contactPhone}
              </p>
            </div>
          </Card>

          <Card
            title="Shipping address"
            icon={MapPin}
          >
            <p className="text-sm font-semibold text-neutral-950">
              {
                order.shippingFullName
              }
            </p>

            <address className="mt-3 not-italic text-xs leading-5 text-neutral-500">
              {
                order.shippingAddressLine1
              }

              {order.shippingAddressLine2 &&
                `, ${order.shippingAddressLine2}`}

              <br />

              {order.shippingCity},{" "}
              {order.shippingState}{" "}
              {
                order.shippingPostalCode
              }

              <br />

              {
                order.shippingCountry
              }
            </address>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function Card({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon:
    React.ComponentType<{
      className?: string;
    }>;
  children:
    React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-black/[0.06] bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.035)]">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-950">
          {title}
        </h2>

        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-100">
          <Icon className="h-4 w-4" />
        </div>
      </div>

      {children}
    </section>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon:
    React.ComponentType<{
      className?: string;
    }>;
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-[24px] border border-black/[0.06] bg-white p-5">
      <Icon className="h-5 w-5 text-neutral-400" />

      <p className="mt-5 text-2xl font-semibold text-neutral-950">
        {value}
      </p>

      <p className="mt-1 text-xs text-neutral-400">
        {label}
      </p>
    </article>
  );
}

function SmallValue({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.12em] text-neutral-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-neutral-800">
        {value}
      </p>
    </div>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-neutral-500">
        {label}
      </span>

      <span className="font-semibold text-neutral-900">
        {value}
      </span>
    </div>
  );
}

function Reference({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="mt-4 rounded-2xl bg-neutral-50 p-4">
      <p className="text-[10px] uppercase tracking-[0.12em] text-neutral-400">
        {label}
      </p>

      <p className="mt-1 break-all text-xs font-medium text-neutral-700">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({
  value,
  payment = false,
}: {
  value: string;
  payment?: boolean;
}) {
  const successful = [
    "ACTIVE",
    "PAID",
    "DELIVERED",
    "SETTLED",
  ].includes(value);

  const failed = [
    "SUSPENDED",
    "FAILED",
    "CANCELLED",
  ].includes(value);

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${
        successful
          ? "bg-emerald-50 text-emerald-700"
          : failed
            ? "bg-red-50 text-red-700"
            : payment
              ? "bg-amber-50 text-amber-700"
              : "bg-blue-50 text-blue-700"
      }`}
    >
      {formatStatus(value)}
    </span>
  );
}

function formatStatus(
  value: string
) {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase()
    );
}

function formatINR(
  value: number
) {
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
) {
  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(
    new Date(value)
  );
}