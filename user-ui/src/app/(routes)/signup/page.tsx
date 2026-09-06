"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FcGoogle } from "react-icons/fc";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { registerUser } from "@/services/auth";

type FormData = {
  name: string;
  email: string;
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
  ] = useState("");

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
  // REGISTER
  // ====================================================

  const onSubmit = async (
    data: FormData
  ) => {
    try {
      setServerError("");

      await registerUser({
        name: data.name.trim(),
        email: data.email.trim(),
        password: data.password,
      });

      // Save registration information temporarily
      // for the OTP verification page.
      sessionStorage.setItem(
        "signupData",
        JSON.stringify({
          name: data.name.trim(),
          email: data.email.trim(),
          password: data.password,
        })
      );

      router.push(
        "/signup/verify-otp"
      );
    } catch (error: any) {
      setServerError(
        error.response?.data
          ?.message ||
          "Unable to create your account. Please try again."
      );
    }
  };

  return (
    <main className="relative min-h-[calc(100vh-100px)] overflow-hidden bg-[#f7f7f5] px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
      {/* ===============================================
          BACKGROUND
      ================================================ */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-32 top-12 h-80 w-80 rounded-full bg-white blur-3xl" />

        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-[#ecece8] blur-3xl" />
      </div>

      {/* ===============================================
          AUTH CONTAINER
      ================================================ */}

      <div className="relative mx-auto w-full max-w-[540px]">
        {/* =============================================
            INTRO
        ============================================== */}

        <div className="mb-8 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
            Join Eshop
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-[44px] sm:leading-[1.05]">
            Create your account
          </h1>

          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-neutral-500">
            Create an account to
            save your favourites,
            manage your cart and
            enjoy a smoother
            shopping experience.
          </p>
        </div>

        {/* =============================================
            CARD
        ============================================== */}

        <div className="rounded-[30px] border border-black/[0.06] bg-white p-5 shadow-[0_20px_60px_rgba(0,0,0,0.06)] sm:p-8">
          {/* ===========================================
              GOOGLE
          ============================================ */}

          <button
            type="button"
            className="flex min-h-14 w-full items-center justify-center gap-3 rounded-full border border-black/10 bg-white px-5 text-sm font-semibold text-neutral-900 transition duration-200 hover:border-black/20 hover:bg-neutral-50"
          >
            <FcGoogle
              size={21}
            />

            Continue with Google
          </button>

          {/* ===========================================
              DIVIDER
          ============================================ */}

          <div className="my-7 flex items-center gap-4">
            <div className="h-px flex-1 bg-black/[0.08]" />

            <span className="text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
              Or continue with
              email
            </span>

            <div className="h-px flex-1 bg-black/[0.08]" />
          </div>

          {/* ===========================================
              FORM
          ============================================ */}

          <form
            onSubmit={handleSubmit(
              onSubmit
            )}
            className="space-y-5"
          >
            {/* =========================================
                NAME
            ========================================== */}

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
                  placeholder="Enter your full name"
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

            {/* =========================================
                EMAIL
            ========================================== */}

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
                  placeholder="you@example.com"
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

            {/* =========================================
                PASSWORD
            ========================================== */}

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
                      (current) =>
                        !current
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-900"
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

            {/* =========================================
                CONFIRM PASSWORD
            ========================================== */}

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
                      (current) =>
                        !current
                    )
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                  className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-900"
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

            {/* =========================================
                SERVER ERROR
            ========================================== */}

            {serverError && (
              <div
                role="alert"
                className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
              >
                {serverError}
              </div>
            )}

            {/* =========================================
                CREATE ACCOUNT
            ========================================== */}

            <button
              type="submit"
              disabled={
                isSubmitting
              }
              className="group flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-neutral-950 px-6 text-sm font-semibold text-white transition duration-200 hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-400"
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
                  Create account

                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                  />
                </>
              )}
            </button>
          </form>

          {/* ===========================================
              LOGIN LINK
          ============================================ */}

          <div className="mt-7 border-t border-black/[0.07] pt-6 text-center">
            <p className="text-sm text-neutral-500">
              Already have an
              account?{" "}
              <Link
                href="/login"
                className="font-semibold text-neutral-950 underline-offset-4 transition hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* =============================================
            TERMS
        ============================================== */}

        <p className="mt-6 text-center text-xs leading-5 text-neutral-400">
          By creating an account,
          you agree to Eshop&apos;s
          Terms of Service and
          Privacy Policy.
        </p>
      </div>
    </main>
  );
}