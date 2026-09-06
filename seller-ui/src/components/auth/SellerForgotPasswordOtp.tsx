"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Mail,
  RefreshCw,
  ShieldCheck,
  Store,
} from "lucide-react";

import {
  sellerForgotPassword,
  verifySellerForgotPasswordOtp,
} from "@/services/auth";

export default function VerifyForgotPasswordOTPPage() {
  const router = useRouter();

  const [otp, setOtp] = useState([
    "",
    "",
    "",
    "",
  ]);

  const [email, setEmail] =
    useState("");

  const [timer, setTimer] =
    useState(60);

  const [
    canResend,
    setCanResend,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    resending,
    setResending,
  ] = useState(false);

  const [
    checking,
    setChecking,
  ] = useState(true);

  const [
    serverError,
    setServerError,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const inputRefs = useRef<
    (HTMLInputElement | null)[]
  >([]);

  // ====================================================
  // LOAD SELLER EMAIL
  // ====================================================

  useEffect(() => {
    const storedData =
      sessionStorage.getItem(
        "sellerForgotPassword"
      );

    if (!storedData) {
      router.replace(
        "/forgot-password"
      );

      setChecking(false);

      return;
    }

    try {
      const parsed =
        JSON.parse(storedData);

      if (
        !parsed?.email ||
        typeof parsed.email !==
          "string"
      ) {
        sessionStorage.removeItem(
          "sellerForgotPassword"
        );

        router.replace(
          "/forgot-password"
        );

        return;
      }

      setEmail(
        parsed.email.trim()
      );
    } catch {
      sessionStorage.removeItem(
        "sellerForgotPassword"
      );

      router.replace(
        "/forgot-password"
      );
    } finally {
      setChecking(false);
    }
  }, [router]);

  // ====================================================
  // COUNTDOWN TIMER
  // ====================================================

  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true);
      return;
    }

    const timeout =
      window.setTimeout(() => {
        setTimer(
          (current) =>
            current - 1
        );
      }, 1000);

    return () =>
      window.clearTimeout(
        timeout
      );
  }, [timer]);

  // ====================================================
  // OTP INPUT
  // ====================================================

  const handleChange = (
    value: string,
    index: number
  ) => {
    if (!/^\d*$/.test(value)) {
      return;
    }

    const digit =
      value.slice(-1);

    const updatedOtp = [
      ...otp,
    ];

    updatedOtp[index] =
      digit;

    setOtp(updatedOtp);

    setServerError("");

    if (
      digit &&
      index <
        otp.length - 1
    ) {
      inputRefs.current[
        index + 1
      ]?.focus();
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (
      event.key ===
        "Backspace" &&
      !otp[index] &&
      index > 0
    ) {
      inputRefs.current[
        index - 1
      ]?.focus();
    }

    if (
      event.key ===
        "ArrowLeft" &&
      index > 0
    ) {
      inputRefs.current[
        index - 1
      ]?.focus();
    }

    if (
      event.key ===
        "ArrowRight" &&
      index <
        otp.length - 1
    ) {
      inputRefs.current[
        index + 1
      ]?.focus();
    }
  };

  const handlePaste = (
    event: React.ClipboardEvent<HTMLInputElement>
  ) => {
    event.preventDefault();

    const pasted =
      event.clipboardData
        .getData("text")
        .replace(/\D/g, "")
        .slice(0, 4);

    if (!pasted) {
      return;
    }

    const digits =
      pasted.split("");

    const updatedOtp = [
      "",
      "",
      "",
      "",
    ];

    digits.forEach(
      (digit, index) => {
        updatedOtp[index] =
          digit;
      }
    );

    setOtp(updatedOtp);

    setServerError("");

    const focusIndex =
      Math.min(
        digits.length,
        4
      ) - 1;

    inputRefs.current[
      focusIndex
    ]?.focus();
  };

  // ====================================================
  // VERIFY OTP
  // ====================================================

  const handleVerify =
    async () => {
      if (
        loading ||
        successMessage
      ) {
        return;
      }

      setServerError("");
      setSuccessMessage("");

      const otpCode =
        otp.join("");

      if (
        otpCode.length !== 4
      ) {
        setServerError(
          "Please enter the complete verification code."
        );

        return;
      }

      try {
        setLoading(true);

        const response =
          await verifySellerForgotPasswordOtp(
            {
              email,
              otp: otpCode,
            }
          );

        setSuccessMessage(
          response.data.message ||
            "Verification successful."
        );

        window.setTimeout(
          () => {
            router.push(
              "/reset-password"
            );
          },
          1500
        );
      } catch (
        error: any
      ) {
        setServerError(
          error.response?.data
            ?.message ||
            "Invalid or expired verification code."
        );
      } finally {
        setLoading(false);
      }
    };

  // ====================================================
  // RESEND OTP
  // ====================================================

  const handleResend =
    async () => {
      if (
        !canResend ||
        resending ||
        !email
      ) {
        return;
      }

      try {
        setResending(true);
        setServerError("");
        setSuccessMessage("");

        const response =
          await sellerForgotPassword(
            {
              email,
            }
          );

        setOtp([
          "",
          "",
          "",
          "",
        ]);

        setTimer(60);
        setCanResend(false);

        setSuccessMessage(
          response.data.message ||
            "A new verification code has been sent."
        );

        window.setTimeout(() => {
          setSuccessMessage("");
        }, 3000);

        window.setTimeout(() => {
          inputRefs.current[
            0
          ]?.focus();
        }, 50);
      } catch (
        error: any
      ) {
        setServerError(
          error.response?.data
            ?.message ||
            "Unable to resend the verification code."
        );
      } finally {
        setResending(false);
      }
    };

  // ====================================================
  // HELPERS
  // ====================================================

  const formattedTime =
    `${String(
      Math.floor(
        timer / 60
      )
    ).padStart(
      2,
      "0"
    )}:${String(
      timer % 60
    ).padStart(
      2,
      "0"
    )}`;

  const otpComplete =
    otp.every(
      (digit) =>
        digit !== ""
    );

  // ====================================================
  // INITIAL SESSION CHECK
  // ====================================================

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f7f5]">
        <div className="flex items-center gap-3 text-sm text-neutral-500">
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

          Loading secure recovery...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b1220]">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
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

          {/* Content */}

          <div className="relative z-10 max-w-xl py-16">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Identity verification
            </p>

            <h1 className="mt-6 text-5xl font-semibold leading-[1.06] tracking-[-0.045em] text-white xl:text-[58px]">
              Verify it&apos;s really you.
            </h1>

            <p className="mt-6 max-w-lg text-base leading-7 text-slate-400">
              Enter the one-time verification code sent to your registered seller email before creating a new password.
            </p>

            <div className="mt-10 space-y-3">
              <div className="flex items-start gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4 backdrop-blur-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06]">
                  <KeyRound className="h-5 w-5 text-slate-300" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">
                    One-time code
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Use the latest code sent to your seller email address.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4 backdrop-blur-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06]">
                  <ShieldCheck className="h-5 w-5 text-slate-300" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">
                    Protected recovery
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Verification is required before password reset access is granted.
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
            OTP SIDE
        ================================================ */}

        <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f7f7f5] px-4 py-12 sm:px-6 lg:px-10 xl:px-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
          >
            <div className="absolute -right-40 top-10 h-96 w-96 rounded-full bg-white blur-3xl" />

            <div className="absolute -bottom-40 left-0 h-96 w-96 rounded-full bg-[#e8e8e4] blur-3xl" />
          </div>

          <div className="relative w-full max-w-[500px]">
            {/* ===========================================
                MOBILE BRAND
            ============================================ */}

            <div className="mb-8 lg:hidden">
              <div className="inline-flex items-center gap-3">
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
              </div>
            </div>

            {/* ===========================================
                BACK LINK
            ============================================ */}

            <Link
              href="/forgot-password"
              className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-neutral-500 transition hover:text-neutral-950"
            >
              <ArrowLeft className="h-4 w-4" />

              Change email
            </Link>

            {/* ===========================================
                INTRO
            ============================================ */}

            <div className="mb-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
                Account recovery
              </p>

              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-[44px] sm:leading-[1.05]">
                Check your email
              </h2>

              <p className="mt-4 max-w-md text-sm leading-6 text-neutral-500">
                We sent a 4-digit verification code to
              </p>

              <p className="mt-1 break-all text-sm font-semibold text-neutral-950">
                {email}
              </p>
            </div>

            {/* ===========================================
                OTP CARD
            ============================================ */}

            <div className="rounded-[30px] border border-black/[0.06] bg-white p-5 shadow-[0_20px_60px_rgba(0,0,0,0.06)] sm:p-8">
              <div className="mb-7 flex items-center gap-4 border-b border-black/[0.07] pb-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-neutral-100">
                  <Mail
                    className="h-5 w-5 text-neutral-900"
                    strokeWidth={1.8}
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-neutral-950">
                    Verify seller account
                  </p>

                  <p className="mt-1 text-xs leading-5 text-neutral-500">
                    Enter the code before continuing to password reset.
                  </p>
                </div>
              </div>

              {/* =========================================
                  OTP INPUTS
              ========================================== */}

              <div>
                <label className="mb-3 block text-sm font-semibold text-neutral-800">
                  Verification code
                </label>

                <div className="flex justify-between gap-2 sm:gap-3">
                  {otp.map(
                    (
                      digit,
                      index
                    ) => (
                      <input
                        key={
                          index
                        }
                        ref={(
                          element
                        ) => {
                          inputRefs.current[
                            index
                          ] =
                            element;
                        }}
                        type="text"
                        inputMode="numeric"
                        autoComplete={
                          index ===
                          0
                            ? "one-time-code"
                            : "off"
                        }
                        maxLength={
                          1
                        }
                        value={
                          digit
                        }
                        aria-label={`OTP digit ${
                          index +
                          1
                        }`}
                        onChange={(
                          event
                        ) =>
                          handleChange(
                            event
                              .target
                              .value,
                            index
                          )
                        }
                        onKeyDown={(
                          event
                        ) =>
                          handleKeyDown(
                            event,
                            index
                          )
                        }
                        onPaste={
                          handlePaste
                        }
                        className="h-16 w-full min-w-0 rounded-2xl border border-black/10 bg-neutral-50 text-center text-xl font-semibold text-neutral-950 outline-none transition duration-200 focus:border-neutral-950 focus:bg-white focus:ring-4 focus:ring-black/[0.04] sm:h-[68px] sm:text-2xl"
                      />
                    )
                  )}
                </div>
              </div>

              {/* =========================================
                  ERROR
              ========================================== */}

              {serverError && (
                <div
                  role="alert"
                  className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
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
                  className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-5 text-emerald-700"
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
                  VERIFY BUTTON
              ========================================== */}

              <button
                type="button"
                onClick={() =>
                  void handleVerify()
                }
                disabled={
                  loading ||
                  !otpComplete ||
                  Boolean(
                    successMessage
                  )
                }
                className="group mt-6 flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-[#0b1220] px-6 text-sm font-semibold text-white transition duration-200 hover:bg-[#172033] disabled:cursor-not-allowed disabled:bg-neutral-300"
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

                    Verifying...
                  </>
                ) : successMessage ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />

                    Verified
                  </>
                ) : (
                  <>
                    Verify & continue

                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </>
                )}
              </button>

              {/* =========================================
                  RESEND
              ========================================== */}

              <div className="mt-7 border-t border-black/[0.07] pt-6 text-center">
                <p className="text-sm text-neutral-500">
                  Didn&apos;t receive the code?
                </p>

                {!canResend ? (
                  <p className="mt-2 text-sm font-semibold text-neutral-950">
                    Resend available in{" "}
                    <span className="tabular-nums">
                      {
                        formattedTime
                      }
                    </span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      void handleResend()
                    }
                    disabled={
                      resending
                    }
                    className="mt-2 inline-flex items-center justify-center gap-2 text-sm font-semibold text-neutral-950 underline-offset-4 transition hover:underline disabled:cursor-not-allowed disabled:text-neutral-400"
                  >
                    <RefreshCw
                      className={`h-3.5 w-3.5 ${
                        resending
                          ? "animate-spin"
                          : ""
                      }`}
                    />

                    {resending
                      ? "Sending..."
                      : "Resend code"}
                  </button>
                )}
              </div>
            </div>

            {/* ===========================================
                SECURITY FOOTER
            ============================================ */}

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-neutral-400">
              <ShieldCheck className="h-3.5 w-3.5" />

              Secure seller verification
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}