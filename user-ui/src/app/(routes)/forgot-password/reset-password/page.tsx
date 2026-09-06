"use client";

import {
  Suspense,
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  useForm,
} from "react-hook-form";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
} from "lucide-react";

import {
  resetPassword,
} from "@/services/auth";

type FormData = {
  password: string;
  confirmPassword: string;
};

function ResetPasswordContent() {
  const router =
    useRouter();

  const searchParams =
    useSearchParams();

  const email =
    searchParams.get(
      "email"
    ) || "";

  const otp =
    searchParams.get(
      "otp"
    ) || "";

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

  const [
    successMessage,
    setSuccessMessage,
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
  // RECOVERY DATA GUARD
  // ====================================================

  useEffect(() => {
    if (
      !email ||
      !otp
    ) {
      router.replace(
        "/forgot-password"
      );
    }
  }, [
    email,
    otp,
    router,
  ]);

  // ====================================================
  // RESET PASSWORD
  // ====================================================

  const onSubmit =
    async (
      data: FormData
    ) => {
      if (
        !email ||
        !otp
      ) {
        setServerError(
          "Password recovery information is missing. Please restart the recovery process."
        );

        return;
      }

      try {
        setServerError(
          ""
        );

        setSuccessMessage(
          ""
        );

        const response =
          await resetPassword(
            {
              email,
              otp,
              newPassword:
                data.password,
            }
          );

        setSuccessMessage(
          response.data
            .message ||
            "Your password has been updated successfully."
        );

        window.setTimeout(
          () => {
            router.replace(
              "/login"
            );
          },
          1800
        );
      } catch (
        error: any
      ) {
        setServerError(
          error.response
            ?.data
            ?.message ||
            "Unable to reset your password. Please try again."
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
            <Lock
              className="h-6 w-6 text-neutral-900"
              strokeWidth={
                1.8
              }
            />
          </div>

          <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
            Secure your account
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-[44px] sm:leading-[1.05]">
            Create a new password
          </h1>

          <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-neutral-500">
            Choose a strong new
            password for your Eshop
            account.
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
                NEW PASSWORD
            ========================================== */}

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-neutral-800"
              >
                New password
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
                  placeholder="Enter your new password"
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
                characters and
                avoid reusing an
                old password.
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
                  placeholder="Enter your new password again"
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
                SUCCESS
            ========================================== */}

            {successMessage && (
              <div
                role="status"
                className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-5 text-emerald-700"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />

                <span>
                  {
                    successMessage
                  }
                </span>
              </div>
            )}

            {/* =========================================
                RESET BUTTON
            ========================================== */}

            <button
              type="submit"
              disabled={
                isSubmitting ||
                Boolean(
                  successMessage
                )
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

                  Updating password...
                </>
              ) : successMessage ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />

                  Password updated
                </>
              ) : (
                <>
                  Reset password

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

        <p className="mt-6 text-center text-xs leading-5 text-neutral-400">
          After your password is
          updated, you&apos;ll be
          redirected to sign in
          again.
        </p>
      </div>
    </main>
  );
}

// ======================================================
// PAGE WITH SUSPENSE
// ======================================================

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <ResetPasswordFallback />
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}

// ======================================================
// LOADING FALLBACK
// ======================================================

function ResetPasswordFallback() {
  return (
    <main className="flex min-h-[calc(100vh-100px)] items-center justify-center bg-[#f7f7f5] px-4">
      <div className="flex flex-col items-center text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-950" />

        <p className="mt-4 text-sm font-semibold text-neutral-800">
          Preparing password reset
        </p>

        <p className="mt-1 text-xs text-neutral-400">
          This will only take a moment.
        </p>
      </div>
    </main>
  );
}