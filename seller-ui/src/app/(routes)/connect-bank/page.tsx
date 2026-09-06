"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowRight,
  BadgeIndianRupee,
  CheckCircle2,
  Landmark,
  LockKeyhole,
  ShieldCheck,
  Store,
  WalletCards,
} from "lucide-react";

import SellerOnboardingSteps from "@/components/auth/SellerOnboardingSteps";
import { connectSellerBank } from "@/services/auth";

export default function ConnectBankPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleConnect = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response =
        await connectSellerBank();

      setSuccess(
        response.data.message ||
          "Payment account connected successfully."
      );

      window.setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          "Unable to connect your payment account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0b1220]">
      <div className="grid min-h-screen lg:grid-cols-[0.9fr_1.1fr]">
        {/* ===============================================
            SELLER BRAND SIDE
        ================================================ */}

        <section className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
          >
            <div className="absolute -left-32 -top-32 h-[430px] w-[430px] rounded-full bg-white/[0.04] blur-3xl" />

            <div className="absolute -bottom-40 right-0 h-[500px] w-[500px] rounded-full bg-slate-600/[0.08] blur-3xl" />

            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:48px_48px]" />
          </div>

          {/* Brand */}

          <div className="relative z-10">
            <div className="inline-flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white text-[#0b1220] shadow-lg">
                <Store
                  className="h-5 w-5"
                  strokeWidth={2}
                />
              </div>

              <div>
                <p className="text-xl font-semibold tracking-[-0.03em] text-white">
                  Eshop
                </p>

                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Seller
                </p>
              </div>
            </div>
          </div>

          {/* Main content */}

          <div className="relative z-10 max-w-xl py-16">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Payments
            </p>

            <h1 className="mt-6 text-5xl font-semibold leading-[1.06] tracking-[-0.045em] text-white xl:text-[58px]">
              Get ready to receive payments.
            </h1>

            <p className="mt-6 max-w-lg text-base leading-7 text-slate-400">
              Complete your seller onboarding by connecting your payment account for future settlements and transactions.
            </p>

            <div className="mt-10 space-y-3">
              <div className="flex items-start gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06]">
                  <WalletCards className="h-5 w-5 text-slate-300" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">
                    Receive payments
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Prepare your seller account for customer transactions.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06]">
                  <ShieldCheck className="h-5 w-5 text-slate-300" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">
                    Secure onboarding
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Payment integration stays separated from your store credentials.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p className="relative z-10 text-xs text-slate-600">
            Eshop Seller Center
          </p>
        </section>

        {/* ===============================================
            CONNECT PAYMENT SIDE
        ================================================ */}

        <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f7f7f5] px-4 py-10 sm:px-6 lg:px-10 xl:px-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
          >
            <div className="absolute -right-40 top-10 h-96 w-96 rounded-full bg-white blur-3xl" />

            <div className="absolute -bottom-40 left-0 h-96 w-96 rounded-full bg-[#e8e8e4] blur-3xl" />
          </div>

          <div className="relative w-full max-w-[580px]">
            {/* ===========================================
                INTRO
            ============================================ */}

            <div className="mb-7">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
                Step 3 of 3
              </p>

              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-[44px] sm:leading-[1.05]">
                Connect payments
              </h2>

              <p className="mt-4 max-w-lg text-sm leading-6 text-neutral-500">
                Complete the final step of your seller setup so your account is ready for payment processing.
              </p>
            </div>

            {/* ===========================================
                CARD
            ============================================ */}

            <div className="rounded-[30px] border border-black/[0.06] bg-white p-5 shadow-[0_20px_60px_rgba(0,0,0,0.06)] sm:p-8">
              <div className="mb-7 border-b border-black/[0.07] pb-7">
                <SellerOnboardingSteps
                  currentStep={3}
                />
              </div>

              {/* Icon */}

              <div className="text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[26px] border border-black/[0.06] bg-neutral-50">
                  <Landmark
                    className="h-8 w-8 text-neutral-950"
                    strokeWidth={1.7}
                  />
                </div>

                <h3 className="mt-6 text-2xl font-semibold tracking-[-0.025em] text-neutral-950">
                  Connect your payment account
                </h3>

                <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-neutral-500">
                  Connect Razorpay to prepare your seller account for receiving payments from Eshop orders.
                </p>
              </div>

              {/* =========================================
                  INFORMATION
              ========================================== */}

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-black/[0.06] bg-neutral-50 p-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm">
                    <BadgeIndianRupee
                      className="h-4 w-4 text-neutral-800"
                      strokeWidth={1.8}
                    />
                  </div>

                  <p className="mt-4 text-sm font-semibold text-neutral-900">
                    Seller settlements
                  </p>

                  <p className="mt-1 text-xs leading-5 text-neutral-500">
                    Prepare your account for future payment settlements.
                  </p>
                </div>

                <div className="rounded-2xl border border-black/[0.06] bg-neutral-50 p-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm">
                    <LockKeyhole
                      className="h-4 w-4 text-neutral-800"
                      strokeWidth={1.8}
                    />
                  </div>

                  <p className="mt-4 text-sm font-semibold text-neutral-900">
                    Secure connection
                  </p>

                  <p className="mt-1 text-xs leading-5 text-neutral-500">
                    Your payment setup is handled separately from your store login.
                  </p>
                </div>
              </div>

              {/* =========================================
                  ERROR
              ========================================== */}

              {error && (
                <div
                  role="alert"
                  className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
                >
                  {error}
                </div>
              )}

              {/* =========================================
                  SUCCESS
              ========================================== */}

              {success && (
                <div
                  role="status"
                  className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-5 text-emerald-700"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />

                  <span>
                    {success}
                  </span>
                </div>
              )}

              {/* =========================================
                  CONNECT BUTTON
              ========================================== */}

              <button
                type="button"
                onClick={() =>
                  void handleConnect()
                }
                disabled={
                  loading ||
                  Boolean(success)
                }
                className="group mt-7 flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-[#0b1220] px-6 text-sm font-semibold text-white transition duration-200 hover:bg-[#172033] disabled:cursor-not-allowed disabled:bg-neutral-300"
              >
                {loading ? (
                  <>
                    <svg
                      className="h-4 w-4 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />

                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>

                    Connecting...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Connected
                  </>
                ) : (
                  <>
                    Connect Razorpay
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </>
                )}
              </button>

              <div className="mt-5 flex items-center justify-center gap-2 text-xs text-neutral-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                Secure payment setup
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}