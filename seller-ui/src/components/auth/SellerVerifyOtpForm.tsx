"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Mail,
  ShieldCheck,
  Store,
} from "lucide-react";

import { useRouter } from "next/navigation";

import SellerOnboardingSteps from "@/components/auth/SellerOnboardingSteps";

import {
  registerSeller,
  verifySeller,
} from "@/services/auth";

const OTP_LENGTH = 4;
const RESEND_SECONDS = 60;

type SellerSignupData = {
  name: string;
  email: string;
  password: string;
  phone_number: string;
  country: string;
};

const initialSellerData: SellerSignupData = {
  name: "",
  email: "",
  password: "",
  phone_number: "",
  country: "",
};

export default function SellerVerifyOTPPage() {
  const router = useRouter();

  const [otp, setOtp] = useState<string[]>(
    Array(OTP_LENGTH).fill("")
  );

  const [timer, setTimer] =
    useState(RESEND_SECONDS);

  const [canResend, setCanResend] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [resending, setResending] =
    useState(false);

  const [serverError, setServerError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [userData, setUserData] =
    useState<SellerSignupData>(
      initialSellerData
    );

  const inputRefs =
    useRef<
      (HTMLInputElement | null)[]
    >([]);

  // ====================================================
  // LOAD SELLER SIGNUP DATA
  // ====================================================

  useEffect(() => {
    const storedData =
      sessionStorage.getItem(
        "sellerSignupData"
      );

    if (!storedData) {
      router.replace("/signup");
      return;
    }

    try {
      const parsedData =
        JSON.parse(
          storedData
        ) as SellerSignupData;

      if (
        !parsedData.name ||
        !parsedData.email ||
        !parsedData.password ||
        !parsedData.phone_number ||
        !parsedData.country
      ) {
        sessionStorage.removeItem(
          "sellerSignupData"
        );

        router.replace(
          "/signup"
        );

        return;
      }

      setUserData(
        parsedData
      );
    } catch {
      sessionStorage.removeItem(
        "sellerSignupData"
      );

      router.replace(
        "/signup"
      );
    }
  }, [router]);

  // ====================================================
  // COUNTDOWN
  // ====================================================

  useEffect(() => {
    if (timer <= 0) {
      setCanResend(
        true
      );

      return;
    }

    const timeout =
      window.setTimeout(
        () => {
          setTimer(
            (
              current
            ) =>
              current - 1
          );
        },
        1000
      );

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
    if (
      !/^\d*$/.test(
        value
      )
    ) {
      return;
    }

    const digit =
      value.slice(-1);

    const newOtp = [
      ...otp,
    ];

    newOtp[index] =
      digit;

    setOtp(
      newOtp
    );

    setServerError(
      ""
    );

    if (
      digit &&
      index <
        OTP_LENGTH - 1
    ) {
      inputRefs.current[
        index + 1
      ]?.focus();
    }
  };

  // ====================================================
  // KEYBOARD NAVIGATION
  // ====================================================

  const handleKeyDown = (
    event:
      React.KeyboardEvent<HTMLInputElement>,
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

      return;
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
        OTP_LENGTH - 1
    ) {
      inputRefs.current[
        index + 1
      ]?.focus();
    }
  };

  // ====================================================
  // PASTE OTP
  // ====================================================

  const handlePaste = (
    event:
      React.ClipboardEvent<HTMLInputElement>
  ) => {
    event.preventDefault();

    const pasted =
      event.clipboardData
        .getData("text")
        .replace(/\D/g, "")
        .slice(
          0,
          OTP_LENGTH
        );

    if (!pasted) {
      return;
    }

    const digits =
      pasted.split("");

    const newOtp =
      Array(
        OTP_LENGTH
      ).fill("");

    digits.forEach(
      (
        digit,
        index
      ) => {
        newOtp[index] =
          digit;
      }
    );

    setOtp(
      newOtp
    );

    setServerError(
      ""
    );

    const focusIndex =
      Math.min(
        digits.length,
        OTP_LENGTH
      ) - 1;

    inputRefs.current[
      focusIndex
    ]?.focus();
  };

  // ====================================================
  // VERIFY SELLER
  // ====================================================

  const handleVerify =
    async () => {
      if (
        loading ||
        successMessage
      ) {
        return;
      }

      setServerError(
        ""
      );

      setSuccessMessage(
        ""
      );

      const otpCode =
        otp.join("");

      if (
        otpCode.length !==
        OTP_LENGTH
      ) {
        setServerError(
          "Please enter the complete verification code."
        );

        return;
      }

      if (
        !userData.email
      ) {
        setServerError(
          "Seller registration data is missing. Please restart signup."
        );

        return;
      }

      try {
        setLoading(
          true
        );

        const response =
          await verifySeller({
            name:
              userData.name,

            email:
              userData.email,

            password:
              userData.password,

            phone_number:
              userData.phone_number,

            country:
              userData.country,

            otp:
              otpCode,
          });

        setSuccessMessage(
          response.data
            .message ||
            "Seller account verified successfully."
        );

        // Save seller info for onboarding.
        sessionStorage.setItem(
          "seller",
          JSON.stringify(
            response.data
              .seller
          )
        );

        // Signup data is no longer required.
        sessionStorage.removeItem(
          "sellerSignupData"
        );

        window.setTimeout(
          () => {
            router.push(
              "/setup-shop"
            );
          },
          1500
        );
      } catch (
        error: any
      ) {
        setServerError(
          error.response
            ?.data
            ?.message ||
            "The verification code is invalid or has expired."
        );
      } finally {
        setLoading(
          false
        );
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
        !userData.email
      ) {
        return;
      }

      try {
        setServerError(
          ""
        );

        setSuccessMessage(
          ""
        );

        setResending(
          true
        );

        await registerSeller({
          name:
            userData.name,

          email:
            userData.email,

          password:
            userData.password,

          phone_number:
            userData.phone_number,

          country:
            userData.country,
        });

        setOtp(
          Array(
            OTP_LENGTH
          ).fill("")
        );

        setTimer(
          RESEND_SECONDS
        );

        setCanResend(
          false
        );

        setSuccessMessage(
          "A new verification code has been sent to your email."
        );

        inputRefs.current[
          0
        ]?.focus();
      } catch (
        error: any
      ) {
        setServerError(
          error.response
            ?.data
            ?.message ||
            "Unable to resend the verification code. Please try again."
        );
      } finally {
        setResending(
          false
        );
      }
    };

  // ====================================================
  // TIMER
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
    otp.every(Boolean);

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
            <Link
              href="/"
              className="inline-flex items-center gap-3"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white text-[#0b1220] shadow-lg">
                <Store
                  className="h-5 w-5"
                  strokeWidth={
                    2
                  }
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

          {/* Message */}

          <div className="relative z-10 max-w-xl py-16">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Email verification
            </p>

            <h1 className="mt-6 text-5xl font-semibold leading-[1.06] tracking-[-0.045em] text-white xl:text-[58px]">
              One quick step before your store setup.
            </h1>

            <p className="mt-6 max-w-lg text-base leading-7 text-slate-400">
              Verify your seller
              email to protect your
              account and continue
              setting up your Eshop
              store.
            </p>

            <div className="mt-10 rounded-[28px] border border-white/[0.07] bg-white/[0.035] p-6 backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/[0.07]">
                  <ShieldCheck className="h-5 w-5 text-slate-200" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">
                    Secure seller onboarding
                  </p>

                  <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                    Email verification
                    helps us protect
                    seller accounts
                    before store and
                    payment information
                    is added.
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

        <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f7f7f5] px-4 py-10 sm:px-6 lg:px-10 xl:px-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
          >
            <div className="absolute -right-40 top-10 h-96 w-96 rounded-full bg-white blur-3xl" />

            <div className="absolute -bottom-40 left-0 h-96 w-96 rounded-full bg-[#e8e8e4] blur-3xl" />
          </div>

          <div className="relative w-full max-w-[560px]">
            {/* ===========================================
                MOBILE BRAND
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
                BACK
            ============================================ */}

            <Link
              href="/signup"
              className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-neutral-500 transition hover:text-neutral-950"
            >
              <ArrowLeft
                size={17}
              />

              Back to registration
            </Link>

            {/* ===========================================
                INTRO
            ============================================ */}

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
                Seller verification
              </p>

              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-[44px] sm:leading-[1.05]">
                Check your inbox
              </h2>

              <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-neutral-500">
                Enter the 4-digit
                verification code
                sent to your seller
                email.
              </p>

              {userData.email ? (
                <p className="mt-1 break-all text-sm font-semibold text-neutral-950">
                  {
                    userData.email
                  }
                </p>
              ) : (
                <div className="mx-auto mt-2 h-4 w-48 animate-pulse rounded bg-neutral-200" />
              )}
            </div>

            {/* ===========================================
                CARD
            ============================================ */}

            <div className="mt-8 rounded-[30px] border border-black/[0.06] bg-white p-5 shadow-[0_20px_60px_rgba(0,0,0,0.06)] sm:p-8">
              <div className="mb-7 border-b border-black/[0.07] pb-7">
                <SellerOnboardingSteps
                  currentStep={1}
                />
              </div>

              {/* =========================================
                  OTP INPUTS
              ========================================== */}

              <div>
                <label className="block text-center text-sm font-semibold text-neutral-800">
                  Verification code
                </label>

                <div className="mt-5 flex justify-center gap-2.5 sm:gap-3">
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
                        autoFocus={
                          index ===
                          0
                        }
                        aria-label={`OTP digit ${
                          index +
                          1
                        }`}
                        className="h-14 w-14 rounded-2xl border border-black/10 bg-neutral-50 text-center text-xl font-semibold text-neutral-950 outline-none transition duration-200 focus:border-black/40 focus:bg-white focus:ring-4 focus:ring-black/[0.03] sm:h-16 sm:w-16 sm:text-2xl"
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
                  className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
                >
                  {
                    serverError
                  }
                </div>
              )}

              {/* =========================================
                  SUCCESS
              ========================================== */}

              {successMessage && (
                <div
                  role="status"
                  className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-5 text-emerald-700"
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
                  VERIFY
              ========================================== */}

              <button
                type="button"
                onClick={() =>
                  void handleVerify()
                }
                disabled={
                  loading ||
                  Boolean(
                    successMessage
                  ) ||
                  !otpComplete
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

                    Verifying seller...
                  </>
                ) : successMessage ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />

                    Verified
                  </>
                ) : (
                  <>
                    Verify seller account

                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </>
                )}
              </button>

              {/* =========================================
                  RESEND
              ========================================== */}

              <div className="mt-7 border-t border-black/[0.07] pt-6 text-center">
                <p className="text-sm text-neutral-500">
                  Didn&apos;t receive
                  the code?
                </p>

                {!canResend ? (
                  <p className="mt-2 text-xs font-semibold text-neutral-950">
                    Resend available
                    in{" "}
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
                    {resending ? (
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

                        Sending...
                      </>
                    ) : (
                      "Resend verification code"
                    )}
                  </button>
                )}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-neutral-400">
              <ShieldCheck className="h-3.5 w-3.5" />

              <span>
                Secure seller email
                verification
              </span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}