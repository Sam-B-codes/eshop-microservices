"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  ArrowRight,
  BarChart3,
  Eye,
  EyeOff,
  Globe2,
  Lock,
  Mail,
  Package,
  Phone,
  ShieldCheck,
  Store,
  User,
} from "lucide-react";

import { useRouter } from "next/navigation";

import { registerSeller } from "@/services/auth";
import SellerOnboardingSteps from "./SellerOnboardingSteps";

type FormData = {
  name: string;
  email: string;
  phone_number: string;
  country: string;
  password: string;
  confirmPassword: string;
};

export default function SignupPage() {
  const router = useRouter();

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [
    serverError,
    setServerError,
  ] = useState<string | null>(
    null
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<FormData>();

  const password =
    watch("password");

  // ====================================================
  // CREATE SELLER ACCOUNT
  // ====================================================

  const onSubmit = async (
    data: FormData
  ) => {
    try {
      setServerError(
        null
      );

      const sellerData = {
        name:
          data.name.trim(),

        email:
          data.email.trim(),

        password:
          data.password,

        phone_number:
          data.phone_number.trim(),

        country:
          data.country.trim(),
      };

      await registerSeller(
        sellerData
      );

      // Save seller data for OTP verification.
      sessionStorage.setItem(
        "sellerSignupData",
        JSON.stringify(
          sellerData
        )
      );

      router.push(
        "/verify-otp"
      );
    } catch (
      error: any
    ) {
      setServerError(
        error.response?.data
          ?.message ||
          "Unable to create your seller account. Please try again."
      );
    }
  };

  return (
    <main className="min-h-screen bg-[#0b1220]">
      <div className="grid min-h-screen lg:grid-cols-[0.9fr_1.1fr]">
        {/* ===============================================
            SELLER BRAND PANEL
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

          {/* Brand */}

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

          {/* Main content */}

          <div className="relative z-10 max-w-xl py-16">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Start selling
            </p>

            <h1 className="mt-6 text-5xl font-semibold leading-[1.06] tracking-[-0.045em] text-white xl:text-[58px]">
              Build your business on Eshop.
            </h1>

            <p className="mt-6 max-w-lg text-base leading-7 text-slate-400">
              Create your seller
              account, set up your
              store and start managing
              products from one
              professional workspace.
            </p>

            {/* Feature cards */}

            <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4 backdrop-blur-sm">
                <Package className="h-5 w-5 text-slate-300" />

                <p className="mt-4 text-sm font-semibold text-white">
                  Products
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Build your catalog
                </p>
              </div>

              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4 backdrop-blur-sm">
                <BarChart3 className="h-5 w-5 text-slate-300" />

                <p className="mt-4 text-sm font-semibold text-white">
                  Growth
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Track performance
                </p>
              </div>

              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4 backdrop-blur-sm">
                <ShieldCheck className="h-5 w-5 text-slate-300" />

                <p className="mt-4 text-sm font-semibold text-white">
                  Secure
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Protected selling
                </p>
              </div>
            </div>
          </div>

          <p className="relative z-10 text-xs text-slate-600">
            Eshop Seller Center
          </p>
        </section>

        {/* ===============================================
            REGISTRATION SIDE
        ================================================ */}

        <section className="relative flex min-h-screen justify-center overflow-hidden bg-[#f7f7f5] px-4 py-10 sm:px-6 lg:px-10 xl:px-16">
          {/* Background */}

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
          >
            <div className="absolute -right-40 top-10 h-96 w-96 rounded-full bg-white blur-3xl" />

            <div className="absolute -bottom-40 left-0 h-96 w-96 rounded-full bg-[#e8e8e4] blur-3xl" />
          </div>

          <div className="relative my-auto w-full max-w-[620px]">
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
                    strokeWidth={
                      1.8
                    }
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
                INTRO
            ============================================ */}

            <div className="mb-7">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
                Seller registration
              </p>

              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-[44px] sm:leading-[1.05]">
                Create your seller account
              </h2>

              <p className="mt-4 max-w-lg text-sm leading-6 text-neutral-500">
                Start your seller
                journey by creating
                your account. We&apos;ll
                verify your email
                before setting up your
                store.
              </p>
            </div>

            {/* ===========================================
                REGISTRATION CARD
            ============================================ */}

            <div className="rounded-[30px] border border-black/[0.06] bg-white p-5 shadow-[0_20px_60px_rgba(0,0,0,0.06)] sm:p-8">
              {/* Onboarding progress */}

              <div className="mb-7 border-b border-black/[0.07] pb-7">
                <SellerOnboardingSteps
                  currentStep={1}
                />
              </div>

              <form
                onSubmit={handleSubmit(
                  onSubmit
                )}
                className="space-y-5"
              >
                {/* =====================================
                    NAME + EMAIL
                ====================================== */}

                <div className="grid gap-5 sm:grid-cols-2">
                  {/* Name */}

                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2 block text-sm font-semibold text-neutral-800"
                    >
                      Full name
                    </label>

                    <div
                      className={`flex min-h-14 items-center rounded-2xl border bg-white px-4 transition duration-200 focus-within:ring-4 ${
                        errors.name
                          ? "border-red-300 focus-within:border-red-400 focus-within:ring-red-50"
                          : "border-black/10 focus-within:border-black/40 focus-within:ring-black/[0.03]"
                      }`}
                    >
                      <User
                        className="h-[19px] w-[19px] shrink-0 text-neutral-400"
                        strokeWidth={
                          1.8
                        }
                      />

                      <input
                        id="name"
                        type="text"
                        autoComplete="name"
                        placeholder="Your full name"
                        className="ml-3 min-w-0 flex-1 bg-transparent text-sm text-neutral-950 outline-none placeholder:text-neutral-400"
                        {...register(
                          "name",
                          {
                            required:
                              "Name is required",

                            minLength: {
                              value: 2,
                              message:
                                "Please enter your full name",
                            },
                          }
                        )}
                      />
                    </div>

                    {errors.name && (
                      <p className="mt-2 text-xs font-medium text-red-600">
                        {
                          errors.name
                            .message
                        }
                      </p>
                    )}
                  </div>

                  {/* Email */}

                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-semibold text-neutral-800"
                    >
                      Email address
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
                        strokeWidth={
                          1.8
                        }
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
                </div>

                {/* =====================================
                    PHONE + COUNTRY
                ====================================== */}

                <div className="grid gap-5 sm:grid-cols-2">
                  {/* Phone */}

                  <div>
                    <label
                      htmlFor="phone_number"
                      className="mb-2 block text-sm font-semibold text-neutral-800"
                    >
                      Phone number
                    </label>

                    <div
                      className={`flex min-h-14 items-center rounded-2xl border bg-white px-4 transition duration-200 focus-within:ring-4 ${
                        errors.phone_number
                          ? "border-red-300 focus-within:border-red-400 focus-within:ring-red-50"
                          : "border-black/10 focus-within:border-black/40 focus-within:ring-black/[0.03]"
                      }`}
                    >
                      <Phone
                        className="h-[19px] w-[19px] shrink-0 text-neutral-400"
                        strokeWidth={
                          1.8
                        }
                      />

                      <input
                        id="phone_number"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="+91 98765 43210"
                        className="ml-3 min-w-0 flex-1 bg-transparent text-sm text-neutral-950 outline-none placeholder:text-neutral-400"
                        {...register(
                          "phone_number",
                          {
                            required:
                              "Phone number is required",

                            minLength: {
                              value: 7,
                              message:
                                "Please enter a valid phone number",
                            },
                          }
                        )}
                      />
                    </div>

                    {errors.phone_number && (
                      <p className="mt-2 text-xs font-medium text-red-600">
                        {
                          errors
                            .phone_number
                            .message
                        }
                      </p>
                    )}
                  </div>

                  {/* Country */}

                  <div>
                    <label
                      htmlFor="country"
                      className="mb-2 block text-sm font-semibold text-neutral-800"
                    >
                      Country
                    </label>

                    <div
                      className={`flex min-h-14 items-center rounded-2xl border bg-white px-4 transition duration-200 focus-within:ring-4 ${
                        errors.country
                          ? "border-red-300 focus-within:border-red-400 focus-within:ring-red-50"
                          : "border-black/10 focus-within:border-black/40 focus-within:ring-black/[0.03]"
                      }`}
                    >
                      <Globe2
                        className="h-[19px] w-[19px] shrink-0 text-neutral-400"
                        strokeWidth={
                          1.8
                        }
                      />

                      <input
                        id="country"
                        type="text"
                        autoComplete="country-name"
                        placeholder="India"
                        className="ml-3 min-w-0 flex-1 bg-transparent text-sm text-neutral-950 outline-none placeholder:text-neutral-400"
                        {...register(
                          "country",
                          {
                            required:
                              "Country is required",
                          }
                        )}
                      />
                    </div>

                    {errors.country && (
                      <p className="mt-2 text-xs font-medium text-red-600">
                        {
                          errors.country
                            .message
                        }
                      </p>
                    )}
                  </div>
                </div>

                {/* =====================================
                    PASSWORD
                ====================================== */}

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-neutral-800"
                  >
                    Password
                  </label>

                  <div
                    className={`flex min-h-14 items-center rounded-2xl border bg-white px-4 transition duration-200 focus-within:ring-4 ${
                      errors.password
                        ? "border-red-300 focus-within:border-red-400 focus-within:ring-red-50"
                        : "border-black/10 focus-within:border-black/40 focus-within:ring-black/[0.03]"
                    }`}
                  >
                    <Lock
                      className="h-[19px] w-[19px] shrink-0 text-neutral-400"
                      strokeWidth={
                        1.8
                      }
                    />

                    <input
                      id="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      autoComplete="new-password"
                      placeholder="Create a password"
                      className="ml-3 min-w-0 flex-1 bg-transparent text-sm text-neutral-950 outline-none placeholder:text-neutral-400"
                      {...register(
                        "password",
                        {
                          required:
                            "Password is required",

                          minLength: {
                            value: 8,

                            message:
                              "Password must be at least 8 characters",
                          },
                        }
                      )}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (
                            current
                          ) =>
                            !current
                        )
                      }
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-950"
                    >
                      {showPassword ? (
                        <EyeOff
                          size={18}
                        />
                      ) : (
                        <Eye
                          size={18}
                        />
                      )}
                    </button>
                  </div>

                  {errors.password && (
                    <p className="mt-2 text-xs font-medium text-red-600">
                      {
                        errors.password
                          .message
                      }
                    </p>
                  )}

                  <p className="mt-2 text-[11px] leading-5 text-neutral-400">
                    Use at least 8
                    characters for
                    your password.
                  </p>
                </div>

                {/* =====================================
                    CONFIRM PASSWORD
                ====================================== */}

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-semibold text-neutral-800"
                  >
                    Confirm password
                  </label>

                  <div
                    className={`flex min-h-14 items-center rounded-2xl border bg-white px-4 transition duration-200 focus-within:ring-4 ${
                      errors.confirmPassword
                        ? "border-red-300 focus-within:border-red-400 focus-within:ring-red-50"
                        : "border-black/10 focus-within:border-black/40 focus-within:ring-black/[0.03]"
                    }`}
                  >
                    <Lock
                      className="h-[19px] w-[19px] shrink-0 text-neutral-400"
                      strokeWidth={
                        1.8
                      }
                    />

                    <input
                      id="confirmPassword"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      autoComplete="new-password"
                      placeholder="Enter your password again"
                      className="ml-3 min-w-0 flex-1 bg-transparent text-sm text-neutral-950 outline-none placeholder:text-neutral-400"
                      {...register(
                        "confirmPassword",
                        {
                          required:
                            "Please confirm your password",

                          validate: (
                            value
                          ) =>
                            value ===
                              password ||
                            "Passwords do not match",
                        }
                      )}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (
                            current
                          ) =>
                            !current
                        )
                      }
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                      className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-950"
                    >
                      {showConfirmPassword ? (
                        <EyeOff
                          size={18}
                        />
                      ) : (
                        <Eye
                          size={18}
                        />
                      )}
                    </button>
                  </div>

                  {errors.confirmPassword && (
                    <p className="mt-2 text-xs font-medium text-red-600">
                      {
                        errors
                          .confirmPassword
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
                    CREATE ACCOUNT
                ====================================== */}

                <button
                  type="submit"
                  disabled={
                    isSubmitting
                  }
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

                      Creating account...
                    </>
                  ) : (
                    <>
                      Create seller account

                      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </form>

              {/* =======================================
                  LOGIN
              ======================================== */}

              <div className="mt-7 border-t border-black/[0.07] pt-6 text-center">
                <p className="text-sm text-neutral-500">
                  Already have a
                  seller account?{" "}
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
                SECURITY
            ========================================== */}

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-neutral-400">
              <ShieldCheck className="h-3.5 w-3.5" />

              <span>
                Secure seller
                registration
              </span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}