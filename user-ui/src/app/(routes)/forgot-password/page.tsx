"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  ArrowLeft,
  ArrowRight,
  Mail,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { forgotPassword } from "@/services/auth";

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
  // SEND RESET OTP
  // ====================================================

  const onSubmit = async (
    data: FormData
  ) => {
    try {
      setServerError("");

      const email =
        data.email.trim();

      await forgotPassword({
        email,
      });

      router.push(
        `/forgot-password/verify-otp?email=${encodeURIComponent(
          email
        )}`
      );
    } catch (error: any) {
      setServerError(
        error.response?.data
          ?.message ||
          "Unable to send the verification code. Please try again."
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
          CONTAINER
      ================================================ */}

      <div className="relative mx-auto w-full max-w-[520px]">
        {/* =============================================
            BACK
        ============================================== */}

        <Link
          href="/login"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-neutral-500 transition hover:text-neutral-950"
        >
          <ArrowLeft
            size={17}
          />

          Back to login
        </Link>

        {/* =============================================
            INTRO
        ============================================== */}

        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-black/[0.06] bg-white shadow-sm">
            <Mail
              className="h-6 w-6 text-neutral-900"
              strokeWidth={
                1.8
              }
            />
          </div>

          <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
            Account recovery
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-[44px] sm:leading-[1.05]">
            Forgot your password?
          </h1>

          <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-neutral-500">
            Enter the email
            address connected to
            your account and
            we&apos;ll send you a
            verification code.
          </p>
        </div>

        {/* =============================================
            CARD
        ============================================== */}

        <div className="mt-8 rounded-[30px] border border-black/[0.06] bg-white p-5 shadow-[0_20px_60px_rgba(0,0,0,0.06)] sm:p-8">
          <form
            onSubmit={handleSubmit(
              onSubmit
            )}
            className="space-y-5"
          >
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
                SEND OTP
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

          {/* ===========================================
              LOGIN
          ============================================ */}

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

        {/* =============================================
            HELP
        ============================================== */}

        <p className="mt-6 text-center text-xs leading-5 text-neutral-400">
          We&apos;ll only use this
          email to verify your
          account and help you reset
          your password.
        </p>
      </div>
    </main>
  );
}