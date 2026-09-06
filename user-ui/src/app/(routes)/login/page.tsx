"use client";

import {
  useState,
} from "react";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import {
  useForm,
} from "react-hook-form";

import axios from "axios";

import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
} from "lucide-react";

import {
  FcGoogle,
} from "react-icons/fc";

import {
  loginUser,
} from "@/services/auth";

import {
  useAuth,
} from "@/hooks/useAuth";

// ======================================================
// TYPES
// ======================================================

type FormData = {
  email: string;
  password: string;
};

// ======================================================
// SAFE REDIRECT
// ======================================================

const getSafeRedirectPath = (): string => {
  if (
    typeof window ===
    "undefined"
  ) {
    return "/";
  }

  const searchParams =
    new URLSearchParams(
      window.location.search
    );

  const redirectPath =
    searchParams.get(
      "redirect"
    );

  if (!redirectPath) {
    return "/";
  }

  /*
   * Only allow internal application paths.
   *
   * Valid:
   * /profile
   * /profile/orders
   *
   * Invalid:
   * https://example.com
   * //example.com
   * \example.com
   */

  if (
    !redirectPath.startsWith(
      "/"
    ) ||
    redirectPath.startsWith(
      "//"
    ) ||
    redirectPath.includes(
      "\\"
    )
  ) {
    return "/";
  }

  return redirectPath;
};

// ======================================================
// LOGIN PAGE
// ======================================================

export default function LoginPage() {
  const router =
    useRouter();

  const {
    login,
  } = useAuth();

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    rememberMe,
    setRememberMe,
  ] = useState(false);

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
  } = useForm<FormData>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // ====================================================
  // LOGIN
  // ====================================================

  const onSubmit = async (
    data: FormData
  ) => {
    try {
      setServerError("");

      const response =
        await loginUser({
          email:
            data.email
              .trim()
              .toLowerCase(),

          password:
            data.password,
        });

      login(
        response.data.user
      );

      const redirectPath =
        getSafeRedirectPath();

      router.replace(
        redirectPath
      );

      router.refresh();
    } catch (error: unknown) {
      console.error(
        "Login failed:",
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

        setServerError(
          typeof message ===
            "string"
            ? message
            : "Unable to sign in. Please check your details and try again."
        );

        return;
      }

      setServerError(
        "Unable to sign in. Please check your details and try again."
      );
    }
  };

  return (
    <main className="relative min-h-[calc(100vh-100px)] overflow-hidden bg-[#f7f7f5] px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
      {/* BACKGROUND DECORATION */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-32 top-12 h-80 w-80 rounded-full bg-white blur-3xl" />

        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-[#ecece8] blur-3xl" />
      </div>

      {/* AUTH CONTAINER */}

      <div className="relative mx-auto w-full max-w-[520px]">
        {/* INTRODUCTION */}

        <div className="mb-8 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
            Welcome to Eshop
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-[44px] sm:leading-[1.05]">
            Welcome back
          </h1>

          <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-neutral-500">
            Sign in to continue shopping,
            manage your wishlist and keep
            track of your orders.
          </p>
        </div>

        {/* LOGIN CARD */}

        <div className="rounded-[30px] border border-black/[0.06] bg-white p-5 shadow-[0_20px_60px_rgba(0,0,0,0.06)] sm:p-8">
          {/* GOOGLE */}

          <button
            type="button"
            className="group flex min-h-14 w-full items-center justify-center gap-3 rounded-full border border-black/10 bg-white px-5 text-sm font-semibold text-neutral-900 transition duration-200 hover:border-black/20 hover:bg-neutral-50"
          >
            <FcGoogle
              size={21}
            />

            Continue with Google
          </button>

          {/* DIVIDER */}

          <div className="my-7 flex items-center gap-4">
            <div className="h-px flex-1 bg-black/[0.08]" />

            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
              Or continue with email
            </span>

            <div className="h-px flex-1 bg-black/[0.08]" />
          </div>

          {/* FORM */}

          <form
            onSubmit={handleSubmit(
              onSubmit
            )}
            className="space-y-5"
          >
            {/* EMAIL */}

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
                  strokeWidth={1.8}
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

            {/* PASSWORD */}

            <div>
              <div className="mb-2 flex items-center justify-between gap-4">
                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-neutral-800"
                >
                  Password
                </label>

                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-neutral-500 transition hover:text-black"
                >
                  Forgot password?
                </Link>
              </div>

              <div
                className={`flex min-h-14 items-center rounded-2xl border bg-white px-4 transition duration-200 focus-within:ring-4 ${
                  errors.password
                    ? "border-red-300 focus-within:border-red-400 focus-within:ring-red-50"
                    : "border-black/10 focus-within:border-black/40 focus-within:ring-black/[0.03]"
                }`}
              >
                <Lock
                  className="h-[19px] w-[19px] shrink-0 text-neutral-400"
                  strokeWidth={1.8}
                />

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="ml-3 min-w-0 flex-1 bg-transparent text-sm text-neutral-950 outline-none placeholder:text-neutral-400"
                  {...register(
                    "password",
                    {
                      required:
                        "Password is required",

                      minLength: {
                        value: 6,

                        message:
                          "Password must be at least 6 characters",
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
            </div>

            {/* REMEMBER ME */}

            <div className="flex items-center">
              <label className="group flex cursor-pointer items-center gap-3 text-sm text-neutral-500">
                <input
                  type="checkbox"
                  checked={
                    rememberMe
                  }
                  onChange={() =>
                    setRememberMe(
                      (
                        current
                      ) =>
                        !current
                    )
                  }
                  className="h-4 w-4 cursor-pointer rounded border-neutral-300 accent-black"
                />

                <span className="transition group-hover:text-neutral-900">
                  Remember me
                </span>
              </label>
            </div>

            {/* SERVER ERROR */}

            {serverError && (
              <div
                role="alert"
                className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
              >
                {serverError}
              </div>
            )}

            {/* LOGIN BUTTON */}

            <button
              type="submit"
              disabled={
                isSubmitting
              }
              className="group flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-neutral-950 px-6 text-sm font-semibold text-white transition duration-200 hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-400"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />

                  Signing in...
                </>
              ) : (
                <>
                  Sign in

                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          {/* CREATE ACCOUNT */}

          <div className="mt-7 border-t border-black/[0.07] pt-6 text-center">
            <p className="text-sm text-neutral-500">
              New to Eshop?{" "}

              <Link
                href="/signup"
                className="font-semibold text-neutral-950 underline-offset-4 transition hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-xs leading-5 text-neutral-400">
          By continuing, you agree to
          Eshop&apos;s Terms of Service
          and Privacy Policy.
        </p>
      </div>
    </main>
  );
}