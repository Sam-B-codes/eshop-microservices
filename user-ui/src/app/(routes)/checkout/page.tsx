"use client";

import {
  FormEvent,
  useState,
} from "react";

import axios from "axios";

import Link from "next/link";

import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  Truck,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  toast,
} from "sonner";

import {
  useAuthContext,
} from "@/context/AuthContext";

import {
  useShop,
} from "@/context/ShopContext";

import CheckoutItems from "@/components/checkout/CheckoutItems";

import CouponInput from "@/components/checkout/CouponInput";

import ShippingAddressForm from "@/components/checkout/ShippingAddressForm";

import {
  getPublicCoupons,
  validateCheckoutCoupon,
} from "@/services/coupon.service";

import {
  createOrder,
} from "@/services/order.service";

import {
  createPaymentOrder,
  verifyPayment,
} from "@/services/payment.service";

import {
  loadRazorpayScript,
} from "@/lib/razorpay";

import {
  AppliedCoupon,
  CheckoutFormErrors,
  CheckoutFormValues,
} from "@/types/checkout";

import {
  CreateOrderData,
} from "@/types/order";

import {
  RazorpayPaymentSuccessResponse,
} from "@/types/payment";

// ======================================================
// INITIAL FORM
// ======================================================

const INITIAL_FORM: CheckoutFormValues = {
  email: "",
  phone: "",

  fullName: "",

  addressLine1: "",
  addressLine2: "",

  city: "",
  state: "",
  postalCode: "",

  country: "India",
};

// ======================================================
// CHECKOUT PAGE
// ======================================================

export default function CheckoutPage() {
  const router = useRouter();

  const {
    user,
    loading: authLoading,
  } = useAuthContext();

  const {
    cart,
    cartLoading,
  } = useShop();

  const [
    values,
    setValues,
  ] =
    useState<CheckoutFormValues>(
      INITIAL_FORM
    );

  const [
    errors,
    setErrors,
  ] =
    useState<CheckoutFormErrors>(
      {}
    );

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  // ====================================================
  // COUPON STATE
  // ====================================================

  const [
    couponLoading,
    setCouponLoading,
  ] = useState(false);

  const [
    couponError,
    setCouponError,
  ] = useState("");

  const [
    appliedCoupon,
    setAppliedCoupon,
  ] =
    useState<AppliedCoupon | null>(
      null
    );

  const [
    couponDiscount,
    setCouponDiscount,
  ] = useState(0);

  // ====================================================
  // FIELD CHANGE
  // ====================================================

  const handleChange = (
    field: keyof CheckoutFormValues,
    value: string
  ) => {
    setValues(
      (current) => ({
        ...current,
        [field]: value,
      })
    );

    if (errors[field]) {
      setErrors(
        (current) => ({
          ...current,
          [field]: undefined,
        })
      );
    }
  };

  // ====================================================
  // VALIDATION
  // ====================================================

  const validateForm = () => {
    const nextErrors: CheckoutFormErrors =
      {};

    const email =
      values.email.trim();

    const phone =
      values.phone.replace(
        /\D/g,
        ""
      );

    if (!email) {
      nextErrors.email =
        "Email address is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
      )
    ) {
      nextErrors.email =
        "Enter a valid email address.";
    }

    if (!phone) {
      nextErrors.phone =
        "Phone number is required.";
    } else if (
      phone.length < 10 ||
      phone.length > 13
    ) {
      nextErrors.phone =
        "Enter a valid phone number.";
    }

    if (
      !values.fullName.trim()
    ) {
      nextErrors.fullName =
        "Full name is required.";
    }

    if (
      !values.addressLine1.trim()
    ) {
      nextErrors.addressLine1 =
        "Delivery address is required.";
    }

    if (!values.city.trim()) {
      nextErrors.city =
        "City is required.";
    }

    if (!values.state.trim()) {
      nextErrors.state =
        "State is required.";
    }

    if (
      !/^[1-9][0-9]{5}$/.test(
        values.postalCode.trim()
      )
    ) {
      nextErrors.postalCode =
        "Enter a valid 6-digit PIN code.";
    }

    if (
      !values.country.trim()
    ) {
      nextErrors.country =
        "Country is required.";
    }

    setErrors(nextErrors);

    return (
      Object.keys(
        nextErrors
      ).length === 0
    );
  };

  // ====================================================
  // SELLER SUBTOTAL
  // ====================================================

  const getSellerSubtotal = (
    sellerId: string
  ) => {
    return cart.items.reduce(
      (
        total,
        item
      ) => {
        if (
          item.product.sellerId !==
          sellerId
        ) {
          return total;
        }

        return (
          total +
          item.product.salePrice *
            item.quantity
        );
      },
      0
    );
  };

  // ====================================================
  // APPLY COUPON
  // ====================================================

  const handleApplyCoupon =
    async (
      code: string
    ) => {
      if (
        couponLoading
      ) {
        return;
      }

      try {
        setCouponLoading(
          true
        );

        setCouponError("");

        const publicResponse =
          await getPublicCoupons();

        const matchingCoupons =
          publicResponse.coupons.filter(
            (coupon) =>
              coupon.code
                .trim()
                .toUpperCase() ===
              code
                .trim()
                .toUpperCase()
          );

        if (
          matchingCoupons.length ===
          0
        ) {
          throw new Error(
            "Invalid coupon code"
          );
        }

        const applicableCoupons =
          matchingCoupons.filter(
            (coupon) =>
              getSellerSubtotal(
                coupon.sellerId
              ) > 0
          );

        if (
          applicableCoupons.length ===
          0
        ) {
          throw new Error(
            "This coupon does not apply to products in your cart."
          );
        }

        const coupon =
          applicableCoupons[0];

        const sellerSubtotal =
          getSellerSubtotal(
            coupon.sellerId
          );

        if (
          sellerSubtotal <= 0
        ) {
          throw new Error(
            "This coupon does not apply to products in your cart."
          );
        }

        const result =
          await validateCheckoutCoupon(
            {
              code:
                coupon.code,

              sellerId:
                coupon.sellerId,

              orderAmount:
                sellerSubtotal,
            }
          );

        setAppliedCoupon(
          result.coupon
        );

        setCouponDiscount(
          result.discount
        );

        setCouponError("");
      } catch (error) {
        console.error(
          "Failed to apply coupon:",
          error
        );

        setAppliedCoupon(
          null
        );

        setCouponDiscount(
          0
        );

        if (
          axios.isAxiosError(
            error
          )
        ) {
          const message =
            error.response
              ?.data?.message;

          setCouponError(
            typeof message ===
              "string"
              ? message
              : "Unable to apply this coupon."
          );

          return;
        }

        if (
          error instanceof Error
        ) {
          setCouponError(
            error.message
          );

          return;
        }

        setCouponError(
          "Unable to apply this coupon."
        );
      } finally {
        setCouponLoading(
          false
        );
      }
    };

  // ====================================================
  // REMOVE COUPON
  // ====================================================

  const handleRemoveCoupon =
    () => {
      setAppliedCoupon(
        null
      );

      setCouponDiscount(
        0
      );

      setCouponError("");
    };

  // ====================================================
  // VERIFY RAZORPAY CALLBACK
  // ====================================================

  const handlePaymentSuccess =
    async (
      internalOrderId: string,
      expectedRazorpayOrderId: string,
      response: RazorpayPaymentSuccessResponse
    ) => {
      try {
        // ----------------------------------------------
        // Client-side sanity check.
        //
        // Backend remains authoritative.
        // ----------------------------------------------

        if (
          response.razorpay_order_id !==
          expectedRazorpayOrderId
        ) {
          throw new Error(
            "Payment order verification failed."
          );
        }

        // ----------------------------------------------
        // Send Razorpay callback data to our backend.
        //
        // The frontend does NOT mark anything PAID.
        // ----------------------------------------------

        const verification =
          await verifyPayment({
            internalOrderId,

            razorpayPaymentId:
              response.razorpay_payment_id,

            razorpaySignature:
              response.razorpay_signature,
          });

        if (
          !verification.success ||
          !verification.verified
        ) {
          throw new Error(
            "Payment could not be verified."
          );
        }

        console.log(
          "Payment verified:",
          verification
        );

        toast.success(
          "Payment verified successfully."
        );

        // ----------------------------------------------
        // IMPORTANT:
        //
        // We do NOT clear the cart from the browser here.
        //
        // Cart cleanup, stock reduction and coupon usage
        // must be handled authoritatively by backend
        // order finalization.
        // ----------------------------------------------

        router.push(
          `/order-success?orderId=${encodeURIComponent(
            internalOrderId
          )}`
        );
      } catch (error) {
        console.error(
          "Payment verification failed:",
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

          toast.error(
            typeof message ===
              "string"
              ? message
              : "Payment verification failed."
          );

          return;
        }

        if (
          error instanceof Error
        ) {
          toast.error(
            error.message
          );

          return;
        }

        toast.error(
          "Payment verification failed."
        );
      } finally {
        setSubmitting(false);
      }
    };

  // ====================================================
  // CREATE ORDER + OPEN RAZORPAY CHECKOUT
  // ====================================================

  const handleSubmit =
    async (
      event: FormEvent
    ) => {
      event.preventDefault();

      if (
        submitting ||
        couponLoading
      ) {
        return;
      }

      if (!validateForm()) {
        return;
      }

      try {
        setSubmitting(true);

        // ----------------------------------------------
        // STEP 1:
        // Create/reuse internal pending order.
        //
        // Browser sends no authoritative pricing data.
        // ----------------------------------------------

        const payload: CreateOrderData =
          {
            email:
              values.email.trim(),

            phone:
              values.phone.replace(
                /\D/g,
                ""
              ),

            shippingAddress: {
              fullName:
                values.fullName.trim(),

              addressLine1:
                values.addressLine1.trim(),

              addressLine2:
                values.addressLine2.trim(),

              city:
                values.city.trim(),

              state:
                values.state.trim(),

              postalCode:
                values.postalCode.trim(),

              country:
                values.country.trim(),
            },

            coupon:
              appliedCoupon
                ? {
                    code:
                      appliedCoupon.code,

                    sellerId:
                      appliedCoupon.sellerId,
                  }
                : null,
          };

        const orderResult =
          await createOrder(
            payload
          );

        const internalOrder =
          orderResult.order;

        console.log(
          "Pending order created:",
          internalOrder
        );

        console.log(
          "Authoritative checkout total:",
          internalOrder.totalAmount
        );

        console.log(
          "Internal Order ID:",
          internalOrder.id
        );

        // ----------------------------------------------
        // STEP 2:
        // Create/reuse Razorpay order.
        // ----------------------------------------------

        const paymentResult =
          await createPaymentOrder(
            {
              orderId:
                internalOrder.id,
            }
          );

        const payment =
          paymentResult.payment;

        console.log(
          "Razorpay payment order created:",
          payment
        );

        // ----------------------------------------------
        // STEP 3:
        // Load Razorpay's official Checkout script.
        // ----------------------------------------------

        const scriptLoaded =
          await loadRazorpayScript();

        if (!scriptLoaded) {
          throw new Error(
            "Unable to load Razorpay Checkout. Please check your internet connection and try again."
          );
        }

        if (
          !window.Razorpay
        ) {
          throw new Error(
            "Razorpay Checkout is unavailable."
          );
        }

        // ----------------------------------------------
        // STEP 4:
        // Cross-check the authoritative amount returned
        // by Order Service against Payment Service.
        //
        // This is only a sanity check. Backend remains
        // authoritative.
        // ----------------------------------------------

        const expectedAmountInPaise =
          Math.round(
            internalOrder.totalAmount *
              100
          );

        if (
          payment.amount !==
          expectedAmountInPaise
        ) {
          throw new Error(
            "Payment amount mismatch. Please try again."
          );
        }

        // ----------------------------------------------
        // STEP 5:
        // Create Razorpay Checkout instance.
        // ----------------------------------------------

        const razorpay =
          new window.Razorpay({
            key:
              payment.keyId,

            amount:
              payment.amount,

            currency:
              payment.currency,

            name:
              "Eshop",

            description:
              "Order payment",

            order_id:
              payment.razorpayOrderId,

            prefill: {
              name:
                values.fullName.trim(),

              email:
                values.email.trim(),

              contact:
                values.phone.replace(
                  /\D/g,
                  ""
                ),
            },

            notes: {
              internalOrderId:
                internalOrder.id,
            },

            theme: {
              color:
                "#000000",
            },

            handler: async (
              response
            ) => {
              await handlePaymentSuccess(
                internalOrder.id,
                payment.razorpayOrderId,
                response
              );
            },

            modal: {
              ondismiss: () => {
                setSubmitting(
                  false
                );

                toast.info(
                  "Payment was cancelled."
                );
              },
            },
          });

        // ----------------------------------------------
        // STEP 6:
        // Listen for payment failures.
        // ----------------------------------------------

        razorpay.on(
          "payment.failed",
          (response) => {
            console.error(
              "Razorpay payment failed:",
              response
            );

            setSubmitting(
              false
            );

            toast.error(
              "Payment failed. Please try again."
            );
          }
        );

        // ----------------------------------------------
        // STEP 7:
        // Open Razorpay Test Checkout.
        //
        // With rzp_test_* credentials this is a
        // simulated payment. No real money is charged.
        // ----------------------------------------------

        razorpay.open();
      } catch (error) {
        console.error(
          "Checkout payment preparation failed:",
          error
        );

        setSubmitting(false);

        if (
          axios.isAxiosError(
            error
          )
        ) {
          const message =
            error.response
              ?.data?.message;

          toast.error(
            typeof message ===
              "string"
              ? message
              : "Unable to prepare payment."
          );

          return;
        }

        if (
          error instanceof Error
        ) {
          toast.error(
            error.message
          );

          return;
        }

        toast.error(
          "Unable to prepare payment."
        );
      }
    };

  // ====================================================
  // LOADING
  // ====================================================

  if (
    authLoading ||
    cartLoading
  ) {
    return <CheckoutSkeleton />;
  }

  // ====================================================
  // NOT AUTHENTICATED
  // ====================================================

  if (!user) {
    return (
      <main className="min-h-[75vh] bg-[#f8f8f6] px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-lg text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
            Checkout
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-950">
            Sign in to continue
          </h1>

          <p className="mt-4 text-sm leading-6 text-neutral-500">
            Your checkout is connected to your
            account and shopping cart.
          </p>

          <Link
            href="/login?returnUrl=%2Fcheckout"
            className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-black px-7 text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            Sign in
          </Link>
        </div>
      </main>
    );
  }

  // ====================================================
  // EMPTY CART
  // ====================================================

  if (
    cart.items.length === 0
  ) {
    return (
      <main className="min-h-[75vh] bg-[#f8f8f6] px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-lg text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
            Checkout
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-950">
            Your cart is empty
          </h1>

          <p className="mt-4 text-sm leading-6 text-neutral-500">
            Add something to your cart before
            starting checkout.
          </p>

          <Link
            href="/products"
            className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-black px-7 text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            Explore products
          </Link>
        </div>
      </main>
    );
  }

  // ====================================================
  // CHECK AVAILABILITY
  // ====================================================

  const invalidItems =
    cart.items.filter(
      (item) =>
        !item.product.available ||
        !item.product
          .quantityAvailable
    );

  if (
    invalidItems.length > 0
  ) {
    return (
      <main className="min-h-[75vh] bg-[#f8f8f6] px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-lg text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
            Cart update required
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-950">
            Review your cart
          </h1>

          <p className="mt-4 text-sm leading-6 text-neutral-500">
            One or more products are unavailable
            or do not have enough stock for the
            selected quantity.
          </p>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/cart"
              )
            }
            className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-black px-7 text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            Return to cart
          </button>
        </div>
      </main>
    );
  }

  // ====================================================
  // ESTIMATED TOTALS
  // ====================================================

  const subtotal =
    cart.items.reduce(
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

  const total =
    Math.max(
      subtotal -
        couponDiscount,
      0
    );

  return (
    <main className="min-h-screen bg-[#f8f8f6]">
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8 lg:pt-12">
        {/* =============================================
            HEADER
        ============================================== */}

        <header className="border-b border-black/10 pb-7">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 transition hover:text-black"
          >
            <ArrowLeft
              size={16}
            />

            Back to cart
          </Link>

          <div className="mt-7">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
              Secure checkout
            </p>

            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-neutral-950 sm:text-5xl">
              Checkout
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-500">
              Complete your delivery details and
              review your order before continuing
              to payment.
            </p>
          </div>
        </header>

        {/* =============================================
            FORM
        ============================================== */}

        <form
          onSubmit={
            handleSubmit
          }
          noValidate
          className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_390px] xl:gap-12"
        >
          {/* LEFT */}

          <div className="space-y-6">
            <ShippingAddressForm
              values={values}
              errors={errors}
              onChange={
                handleChange
              }
            />

            <CheckoutItems
              cart={cart}
            />
          </div>

          {/* RIGHT */}

          <aside className="lg:sticky lg:top-6">
            <div className="rounded-[30px] border border-black/5 bg-white p-6 shadow-sm sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                Summary
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-950">
                Order summary
              </h2>

              {/* =======================================
                  COUPON
              ======================================== */}

              <div className="mt-7">
                <p className="mb-2 text-xs font-semibold text-neutral-700">
                  Promo code
                </p>

                <CouponInput
                  appliedCode={
                    appliedCoupon?.code
                  }
                  loading={
                    couponLoading
                  }
                  error={
                    couponError
                  }
                  discount={
                    couponDiscount
                  }
                  onApply={
                    handleApplyCoupon
                  }
                  onRemove={
                    handleRemoveCoupon
                  }
                />
              </div>

              <div className="my-6 border-t border-black/10" />

              {/* =======================================
                  TOTALS
              ======================================== */}

              <div className="space-y-4">
                <SummaryRow
                  label="Items"
                  value={`${cart.itemCount}`}
                />

                <SummaryRow
                  label="Subtotal"
                  value={`₹${subtotal.toLocaleString(
                    "en-IN"
                  )}`}
                />

                <SummaryRow
                  label="Delivery"
                  value="Calculated next"
                />

                <SummaryRow
                  label="Discount"
                  value={
                    couponDiscount >
                    0
                      ? `−₹${couponDiscount.toLocaleString(
                          "en-IN"
                        )}`
                      : "—"
                  }
                  highlight={
                    couponDiscount >
                    0
                  }
                />
              </div>

              <div className="my-6 border-t border-black/10" />

              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-neutral-950">
                    Estimated total
                  </p>

                  <p className="mt-1 text-xs leading-5 text-neutral-400">
                    Final amount will be verified
                    securely before payment.
                  </p>
                </div>

                <p className="shrink-0 text-2xl font-bold tracking-tight text-neutral-950">
                  ₹
                  {total.toLocaleString(
                    "en-IN"
                  )}
                </p>
              </div>

              {/* =======================================
                  CONTINUE
              ======================================== */}

              <button
                type="submit"
                disabled={
                  submitting ||
                  couponLoading
                }
                className="mt-7 flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-black px-6 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />

                    Processing payment...
                  </>
                ) : (
                  <>
                    Continue to payment

                    <ArrowRight
                      size={17}
                    />
                  </>
                )}
              </button>

              {/* =======================================
                  SECURITY
              ======================================== */}

              <div className="mt-7 space-y-4 border-t border-black/10 pt-6">
                <Feature
                  icon={
                    <LockKeyhole
                      size={17}
                    />
                  }
                  title="Secure checkout"
                  description="Your checkout information is protected."
                />

                <Feature
                  icon={
                    <ShieldCheck
                      size={17}
                    />
                  }
                  title="Verified totals"
                  description="Pricing, stock and coupons are rechecked before payment."
                />

                <Feature
                  icon={
                    <Truck
                      size={17}
                    />
                  }
                  title="Delivery details"
                  description="Shipping is confirmed before your order is placed."
                />
              </div>
            </div>
          </aside>
        </form>
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
// FEATURE
// ======================================================

function Feature({
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
// SKELETON
// ======================================================

function CheckoutSkeleton() {
  return (
    <main className="min-h-screen bg-[#f8f8f6]">
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        <div className="border-b border-black/10 pb-8">
          <div className="h-4 w-28 animate-pulse rounded bg-neutral-200" />

          <div className="mt-7 h-12 w-56 animate-pulse rounded bg-neutral-200" />

          <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-neutral-200" />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_390px]">
          <div className="space-y-6">
            <div className="h-60 animate-pulse rounded-[28px] bg-neutral-200" />

            <div className="h-[460px] animate-pulse rounded-[28px] bg-neutral-200" />
          </div>

          <div className="h-[540px] animate-pulse rounded-[30px] bg-neutral-200" />
        </div>
      </div>
    </main>
  );
}