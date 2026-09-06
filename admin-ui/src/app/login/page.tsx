"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import axios from "axios";

import {
  ArrowRight,
  BarChart3,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  loginAdmin,
} from "@/services/auth.service";

import {
  useAdminContext,
} from "@/context/AdminContext";

export default function AdminLoginPage() {
  const router =
    useRouter();

  const {
    admin,
    loading:
      authLoading,
    setAuthenticatedAdmin,
  } = useAdminContext();

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    if (
      !authLoading &&
      admin
    ) {
      router.replace(
        "/dashboard"
      );
    }
  }, [
    admin,
    authLoading,
    router,
  ]);

  const handleSubmit =
    async (
      event:
        FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();

      const normalizedEmail =
        email
          .trim()
          .toLowerCase();

      if (
        !normalizedEmail ||
        !password
      ) {
        setError(
          "Enter your Admin email and password."
        );

        return;
      }

      try {
        setSubmitting(true);
        setError("");

        const response =
          await loginAdmin({
            email:
              normalizedEmail,
            password,
          });

        setAuthenticatedAdmin(
          response.admin
        );

        router.replace(
          "/dashboard"
        );
      } catch (error) {
        if (
          axios.isAxiosError(
            error
          )
        ) {
          const message =
            error.response
              ?.data?.message;

          setError(
            typeof message ===
              "string"
              ? message
              : "Unable to sign in."
          );
        } else {
          setError(
            "Unable to sign in. Please try again."
          );
        }
      } finally {
        setSubmitting(false);
      }
    };

  if (
    authLoading ||
    admin
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080d19]">
        <Loader2 className="h-7 w-7 animate-spin text-white" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#080d19]">
      <div className="grid min-h-screen lg:grid-cols-[1.08fr_0.92fr]">
        <section className="relative hidden overflow-hidden px-12 py-12 lg:flex lg:flex-col xl:px-16 xl:py-14">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
          >
            <div className="absolute -left-32 -top-32 h-[470px] w-[470px] rounded-full bg-indigo-500/15 blur-3xl" />

            <div className="absolute -bottom-44 right-0 h-[520px] w-[520px] rounded-full bg-cyan-400/10 blur-3xl" />

            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:52px_52px]" />
          </div>

          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#080d19] shadow-xl shadow-white/10">
              <ShieldCheck className="h-5 w-5" />
            </div>

            <div>
              <p className="text-lg font-semibold tracking-[-0.03em] text-white">
                Eshop
              </p>

              <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-slate-500">
                Administration
              </p>
            </div>
          </div>

          <div className="relative z-10 my-auto max-w-2xl py-14">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3.5 py-2">
              <Sparkles className="h-3.5 w-3.5 text-indigo-300" />

              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Marketplace intelligence
              </span>
            </div>

            <h1 className="mt-7 max-w-xl text-5xl font-semibold leading-[1.04] tracking-[-0.05em] text-white xl:text-[62px]">
              Operate your marketplace with clarity.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-slate-400">
              Manage users,
              sellers, inventory,
              orders and platform
              revenue from one secure
              control centre.
            </p>

            <div className="mt-10 grid max-w-xl gap-3 sm:grid-cols-3">
              <Feature
                icon={
                  <BarChart3 className="h-5 w-5" />
                }
                title="Insights"
                text="Live platform performance"
              />

              <Feature
                icon={
                  <Users className="h-5 w-5" />
                }
                title="Control"
                text="Users and sellers"
              />

              <Feature
                icon={
                  <ShieldCheck className="h-5 w-5" />
                }
                title="Security"
                text="Protected operations"
              />
            </div>
          </div>

          <p className="relative z-10 text-xs text-slate-600">
            Eshop Admin Console
          </p>
        </section>

        <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f5f6f8] px-4 py-10 sm:px-8 lg:px-12 xl:px-20">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
          >
            <div className="absolute -right-40 top-0 h-96 w-96 rounded-full bg-white blur-3xl" />

            <div className="absolute -bottom-44 left-0 h-96 w-96 rounded-full bg-indigo-100/50 blur-3xl" />
          </div>

          <div className="relative w-full max-w-[500px]">
            <div className="mb-8 lg:hidden">
              <div className="inline-flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#080d19] text-white">
                  <ShieldCheck className="h-5 w-5" />
                </div>

                <p className="font-semibold text-neutral-950">
                  Eshop Admin
                </p>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
                Secure access
              </p>

              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.045em] text-neutral-950 sm:text-[46px]">
                Welcome back.
              </h2>

              <p className="mt-4 max-w-md text-sm leading-6 text-neutral-500">
                Sign in with your
                authorized Admin
                credentials to access
                platform operations.
              </p>
            </div>

            <div className="mt-8 rounded-[30px] border border-black/[0.06] bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-8">
              <form
                onSubmit={
                  handleSubmit
                }
                className="space-y-5"
              >
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-neutral-800"
                  >
                    Admin email
                  </label>

                  <div className="flex min-h-14 items-center rounded-2xl border border-black/10 bg-white px-4 transition focus-within:border-[#080d19]/40 focus-within:ring-4 focus-within:ring-black/[0.03]">
                    <Mail className="h-[18px] w-[18px] shrink-0 text-neutral-400" />

                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(
                        event
                      ) =>
                        setEmail(
                          event.target
                            .value
                        )
                      }
                      autoComplete="email"
                      placeholder="admin@eshop.com"
                      className="ml-3 min-w-0 flex-1 bg-transparent text-sm text-neutral-950 outline-none placeholder:text-neutral-400"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-neutral-800"
                  >
                    Password
                  </label>

                  <div className="flex min-h-14 items-center rounded-2xl border border-black/10 bg-white px-4 transition focus-within:border-[#080d19]/40 focus-within:ring-4 focus-within:ring-black/[0.03]">
                    <LockKeyhole className="h-[18px] w-[18px] shrink-0 text-neutral-400" />

                    <input
                      id="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={
                        password
                      }
                      onChange={(
                        event
                      ) =>
                        setPassword(
                          event.target
                            .value
                        )
                      }
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      className="ml-3 min-w-0 flex-1 bg-transparent text-sm text-neutral-950 outline-none placeholder:text-neutral-400"
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
                      className="ml-2 flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-900"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <div
                    role="alert"
                    className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
                  >
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={
                    submitting
                  }
                  className="group flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-[#080d19] px-6 text-sm font-semibold text-white transition hover:bg-[#151d2e] disabled:cursor-not-allowed disabled:bg-neutral-400"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Enter Admin Console
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 flex items-center justify-center gap-2 border-t border-black/[0.06] pt-5 text-xs text-neutral-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                Protected administrative access
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Feature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4">
      <div className="text-slate-300">
        {icon}
      </div>

      <p className="mt-4 text-sm font-semibold text-white">
        {title}
      </p>

      <p className="mt-1 text-[11px] leading-4 text-slate-500">
        {text}
      </p>
    </div>
  );
}