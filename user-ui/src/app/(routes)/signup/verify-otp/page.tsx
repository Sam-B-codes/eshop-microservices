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
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  registerUser,
  verifyUser,
} from "@/services/auth";

type SignupData = {
  name: string;
  email: string;
  password: string;
};

const OTP_LENGTH = 4;
const RESEND_SECONDS = 60;

export default function VerifyOTPPage() {
  const router = useRouter();

  const [
    otp,
    setOtp,
  ] = useState<string[]>(
    Array(OTP_LENGTH).fill("")
  );

  const [
    timer,
    setTimer,
  ] = useState(
    RESEND_SECONDS
  );

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
    serverError,
    setServerError,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const [
    userData,
    setUserData,
  ] = useState<SignupData>({
    name: "",
    email: "",
    password: "",
  });

  const inputRefs =
    useRef<
      (HTMLInputElement | null)[]
    >([]);

  // ====================================================
  // LOAD SIGNUP DATA
  // ====================================================

  useEffect(() => {
    const storedData =
      sessionStorage.getItem(
        "signupData"
      );

    if (!storedData) {
      router.replace(
        "/signup"
      );

      return;
    }

    try {
      const parsedData =
        JSON.parse(
          storedData
        ) as SignupData;

      if (
        !parsedData.name ||
        !parsedData.email ||
        !parsedData.password
      ) {
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
        "signupData"
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
  // OTP CHANGE
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

    setServerError("");

    const newOtp = [
      ...otp,
    ];

    newOtp[index] =
      digit;

    setOtp(
      newOtp
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

    const pastedData =
      event.clipboardData
        .getData("text")
        .replace(/\D/g, "")
        .slice(
          0,
          OTP_LENGTH
        );

    if (
      !pastedData
    ) {
      return;
    }

    const digits =
      pastedData.split("");

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
          "Signup information is missing. Please create your account again."
        );

        return;
      }

      try {
        setLoading(
          true
        );

        const response =
          await verifyUser(
            {
              name:
                userData.name,

              email:
                userData.email,

              password:
                userData.password,

              otp:
                otpCode,
            }
          );

        setSuccessMessage(
          response.data
            .message ||
            "Email verified successfully."
        );

        sessionStorage.removeItem(
          "signupData"
        );

        window.setTimeout(
          () => {
            router.replace(
              "/login"
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
        resending
      ) {
        return;
      }

      if (
        !userData.name ||
        !userData.email ||
        !userData.password
      ) {
        setServerError(
          "Signup information is missing. Please create your account again."
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

        setResending(
          true
        );

        await registerUser(
          {
            name:
              userData.name,

            email:
              userData.email,

            password:
              userData.password,
          }
        );

        setOtp(
          Array(
            OTP_LENGTH
          ).fill("")
        );

        setCanResend(
          false
        );

        setTimer(
          RESEND_SECONDS
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
  // FORMATTED TIMER
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
      Boolean
    );

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
          href="/signup"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-neutral-500 transition hover:text-neutral-950"
        >
          <ArrowLeft
            size={17}
          />

          Back to signup
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
            Email verification
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-[44px] sm:leading-[1.05]">
            Check your inbox
          </h1>

          <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-neutral-500">
            We&apos;ve sent a
            4-digit verification
            code to
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

        {/* =============================================
            CARD
        ============================================== */}

        <div className="mt-8 rounded-[30px] border border-black/[0.06] bg-white p-5 shadow-[0_20px_60px_rgba(0,0,0,0.06)] sm:p-8">
          {/* ===========================================
              OTP INPUTS
          ============================================ */}

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

          {/* ===========================================
              ERROR / SUCCESS
          ============================================ */}

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

          {successMessage && (
            <div
              role="status"
              className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-5 text-emerald-700"
            >
              <CheckCircle2
                className="mt-0.5 h-4 w-4 shrink-0"
              />

              <span>
                {
                  successMessage
                }
              </span>
            </div>
          )}

          {/* ===========================================
              VERIFY
          ============================================ */}

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
            className="group mt-6 flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-neutral-950 px-6 text-sm font-semibold text-white transition duration-200 hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
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
                Verify email

                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </>
            )}
          </button>

          {/* ===========================================
              RESEND
          ============================================ */}

          <div className="mt-7 border-t border-black/[0.07] pt-6 text-center">
            <p className="text-sm text-neutral-500">
              Didn&apos;t receive
              the code?
            </p>

            {!canResend ? (
              <p className="mt-2 text-xs font-semibold text-neutral-950">
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
                {resending ? (
                  <>
                    <svg
                      className="h-4 w-4 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
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

        {/* =============================================
            HELP
        ============================================== */}

        <p className="mt-6 text-center text-xs leading-5 text-neutral-400">
          Make sure to check your
          spam or promotions folder
          if you can&apos;t find the
          email.
        </p>
      </div>
    </main>
  );
}