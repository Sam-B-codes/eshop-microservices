"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  ArrowLeft,
  ArrowRight,
  KeyRound,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Store,
} from "lucide-react";

import { sellerForgotPassword } from "@/services/auth";

type FormData = {
  email: string;
};

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [
    serverError,
    setServerError,
  ] = useState("");

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<FormData>();

  // ====================================================
  // SEND FORGOT PASSWORD OTP
  // ====================================================

  const onSubmit = async (
    data: FormData
  ) => {
    try {
      setServerError("");

      const email =
        data.email.trim();

      await sellerForgotPassword({
        email,
      });

      // Save email for OTP verification page.
      sessionStorage.setItem(
        "sellerForgotPassword",
        JSON.stringify({
          email,
        })
      );

      router.push(
        "/verify-forgot-password"
      );
    } catch (
      error: any
    ) {
      setServerError(
        error.response?.data
          ?.message ||
          "Unable to send the verification code. Please try again."
      );
    }
  };

  return (
    <main className="min-h-screen bg-[#0b1220]">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        {/* ===============================================
            SELLER BRAND SIDE
        ================================================ */}

        <section className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
          {/* Background */}

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
          >
            <div className="absolute -left-32 -top-32 h-[430px] w-[430px] rounded-full bg-white/[0.04] blur-3xl" />

            <div className="absolute -bottom-40 right-0 h-[500px] w-[500px] rounded-full bg-slate-600/[0.08] blur-3xl" />

            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:48px_48px]" />
          </div>

          {/* Logo */}

          <div className="relative z-10">
            <Link
              href="/"
              className="inline-flex items-center gap-3"
            >
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
            </Link>
          </div>

          {/* Content */}

          <div className="relative z-10 max-w-xl py-16">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Account recovery
            </p>

            <h1 className="mt-6 text-5xl font-semibold leading-[1.06] tracking-[-0.045em] text-white xl:text-[58px]">
              Recover access to your Seller Center.
            </h1>

            <p className="mt-6 max-w-lg text-base leading-7 text-slate-400">
              We&apos;ll verify your
              seller email before
              allowing you to create a
              new password for your
              account.
            </p>

            {/* Security information */}

            <div className="mt-10 space-y-3">
              <div className="flex items-start gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4 backdrop-blur-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06]">
                  <Mail className="h-5 w-5 text-slate-300" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">
                    Email verification
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    A verification code
                    will be sent to your
                    registered seller
                    email.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4 backdrop-blur-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06]">
                  <LockKeyhole className="h-5 w-5 text-slate-300" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">
                    Secure recovery
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Your password can
                    only be changed
                    after successful
                    verification.
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
            FORGOT PASSWORD SIDE
        ================================================ */}

        <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f7f7f5] px-4 py-12 sm:px-6 lg:px-10 xl:px-16">
          {/* Background */}

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
          >
            <div className="absolute -right-40 top-10 h-96 w-96 rounded-full bg-white blur-3xl" />

            <div className="absolute -bottom-40 left-0 h-96 w-96 rounded-full bg-[#e8e8e4] blur-3xl" />
          </div>

          <div className="relative w-full max-w-[500px]">
            {/* ===========================================
                MOBILE LOGO
            ============================================ */}

            <div className="mb-8 lg:hidden">
              <Link
                href="/"
                className="inline-flex items-center gap-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-950 text-white">
                  <Store
                    className="h-5 w-5"
                    strokeWidth={1.8}
                  />
                </div>

                <div>
                  <p className="text-lg font-semibold tracking-tight text-neutral-950">
                    Eshop
                  </p>

                  <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
                    Seller
                  </p>
                </div>
              </Link>
            </div>

            {/* ===========================================
                BACK
            ============================================ */}

            <Link
              href="/login"
              className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-neutral-500 transition hover:text-neutral-950"
            >
              <ArrowLeft className="h-4 w-4" />

              Back to sign in
            </Link>

            {/* ===========================================
                INTRO
            ============================================ */}

            <div className="mb-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
                Account recovery
              </p>

              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-[44px] sm:leading-[1.05]">
                Forgot your password?
              </h2>

              <p className="mt-4 max-w-md text-sm leading-6 text-neutral-500">
                Enter the email
                associated with your
                seller account and
                we&apos;ll send you a
                verification code.
              </p>
            </div>

            {/* ===========================================
                CARD
            ============================================ */}

            <div className="rounded-[30px] border border-black/[0.06] bg-white p-5 shadow-[0_20px_60px_rgba(0,0,0,0.06)] sm:p-8">
              {/* Recovery icon */}

              <div className="mb-7 flex items-center gap-4 border-b border-black/[0.07] pb-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-neutral-100">
                  <KeyRound
                    className="h-5 w-5 text-neutral-900"
                    strokeWidth={1.8}
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-neutral-950">
                    Reset seller password
                  </p>

                  <p className="mt-1 text-xs leading-5 text-neutral-500">
                    We&apos;ll first
                    verify that this
                    account belongs to
                    you.
                  </p>
                </div>
              </div>

              <form
                onSubmit={handleSubmit(
                  onSubmit
                )}
                className="space-y-5"
              >
                {/* =====================================
                    EMAIL
                ====================================== */}

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-neutral-800"
                  >
                    Seller email
                  </label>

                  <div
                    className={`flex min-h-14 items-center rounded-2xl border bg-white px-4 transition duration-200 focus-within:ring-4 ${
                      errors.email
                        ? "border-red-300 focus-within:border-red-400 focus-within:ring-red-50"
                        : "border-black/10 focus-within:border-black/40 focus-within:ring-black/[0.03]"
                    }`}
                  >
                    <Mail
                      className="h-[19px] w-[19px] shrink-0 text-neutral-400"
                      strokeWidth={1.8}
                    />

                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="seller@example.com"
                      className="ml-3 min-w-0 flex-1 bg-transparent text-sm text-neutral-950 outline-none placeholder:text-neutral-400"
                      {...register(
                        "email",
                        {
                          required:
                            "Email is required",

                          pattern: {
                            value:
                              /^\S+@\S+\.\S+$/,

                            message:
                              "Please enter a valid email address",
                          },
                        }
                      )}
                    />
                  </div>

                  {errors.email && (
                    <p className="mt-2 text-xs font-medium text-red-600">
                      {
                        errors.email
                          .message
                      }
                    </p>
                  )}
                </div>

                {/* =====================================
                    SERVER ERROR
                ====================================== */}

                {serverError && (
                  <div
                    role="alert"
                    className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
                  >
                    {serverError}
                  </div>
                )}

                {/* =====================================
                    SUBMIT
                ====================================== */}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-[#0b1220] px-6 text-sm font-semibold text-white transition duration-200 hover:bg-[#172033] disabled:cursor-not-allowed disabled:bg-neutral-400"
                >
                  {isSubmitting ? (
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

                      Sending code...
                    </>
                  ) : (
                    <>
                      Send verification code

                      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </form>

              {/* =======================================
                  LOGIN LINK
              ======================================== */}

              <div className="mt-7 border-t border-black/[0.07] pt-6 text-center">
                <p className="text-sm text-neutral-500">
                  Remember your
                  password?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-neutral-950 underline-offset-4 transition hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>

            {/* =========================================
                SECURITY MESSAGE
            ========================================== */}

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-neutral-400">
              <ShieldCheck className="h-3.5 w-3.5" />

              <span>
                Secure seller account
                recovery
              </span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}