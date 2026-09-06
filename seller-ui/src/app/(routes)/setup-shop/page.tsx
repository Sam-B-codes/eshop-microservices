"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Controller,
  useForm,
} from "react-hook-form";

import {
  ArrowRight,
  Building2,
  Check,
  ChevronDown,
  Clock3,
  Globe2,
  MapPin,
  Store,
  Tag,
} from "lucide-react";

import SellerOnboardingSteps from "@/components/auth/SellerOnboardingSteps";
import { setupSellerShop } from "@/services/auth";

type FormData = {
  shopName: string;
  shopBio: string;
  shopAddress: string;
  website: string;
  category: string;
  openingHours: string;
};

const SHOP_CATEGORIES = [
  "Electronics",
  "Fashion",
  "Beauty",
  "Home",
  "Sports",
  "Books",
  "Food",
  "Other",
];

export default function SetupShopPage() {
  const router = useRouter();

  const [
    categoryOpen,
    setCategoryOpen,
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
    control,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<FormData>({
    defaultValues: {
      shopName: "",
      shopBio: "",
      shopAddress: "",
      website: "",
      category: "",
      openingHours: "",
    },
  });

  // ====================================================
  // CREATE SHOP
  // ====================================================

  const onSubmit = async (
    data: FormData
  ) => {
    try {
      setServerError("");
      setSuccessMessage("");

      const payload = {
        shopName:
          data.shopName.trim(),

        shopBio:
          data.shopBio.trim(),

        shopAddress:
          data.shopAddress.trim(),

        website:
          data.website.trim(),

        category:
          data.category,

        openingHours:
          data.openingHours.trim(),
      };

      const response =
        await setupSellerShop(
          payload
        );

      setSuccessMessage(
        response.data.message ||
          "Shop created successfully."
      );

      window.setTimeout(
        () => {
          router.push(
            "/connect-bank"
          );
        },
        1200
      );
    } catch (
      error: any
    ) {
      setServerError(
        error.response?.data
          ?.message ||
          "Failed to set up your shop. Please try again."
      );
    }
  };

  return (
    <main className="min-h-screen bg-[#0b1220]">
      <div className="grid min-h-screen lg:grid-cols-[0.88fr_1.12fr]">
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
              Store setup
            </p>

            <h1 className="mt-6 text-5xl font-semibold leading-[1.06] tracking-[-0.045em] text-white xl:text-[58px]">
              Give your store an identity.
            </h1>

            <p className="mt-6 max-w-lg text-base leading-7 text-slate-400">
              Add the details
              customers need to
              understand your
              business and recognize
              your store across Eshop.
            </p>

            {/* Information cards */}

            <div className="mt-10 space-y-3">
              <div className="flex items-start gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4 backdrop-blur-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06]">
                  <Building2 className="h-5 w-5 text-slate-300" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">
                    Store identity
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Add your name,
                    category and
                    business
                    description.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4 backdrop-blur-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06]">
                  <MapPin className="h-5 w-5 text-slate-300" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">
                    Business details
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Tell customers
                    where you operate
                    and when you are
                    available.
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
            FORM SIDE
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

          <div className="relative my-auto w-full max-w-[680px]">
            {/* ===========================================
                INTRO
            ============================================ */}

            <div className="mb-7">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
                Step 2 of 3
              </p>

              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-[44px] sm:leading-[1.05]">
                Set up your shop
              </h2>

              <p className="mt-4 max-w-lg text-sm leading-6 text-neutral-500">
                Add the essential
                details for your
                seller storefront.
                You can refine these
                later from your
                dashboard.
              </p>
            </div>

            {/* ===========================================
                CARD
            ============================================ */}

            <div className="rounded-[30px] border border-black/[0.06] bg-white p-5 shadow-[0_20px_60px_rgba(0,0,0,0.06)] sm:p-8">
              {/* Progress */}

              <div className="mb-7 border-b border-black/[0.07] pb-7">
                <SellerOnboardingSteps
                  currentStep={2}
                />
              </div>

              <form
                onSubmit={handleSubmit(
                  onSubmit
                )}
                className="space-y-5"
              >
                {/* =====================================
                    SHOP NAME
                ====================================== */}

                <div>
                  <label
                    htmlFor="shopName"
                    className="mb-2 block text-sm font-semibold text-neutral-800"
                  >
                    Shop name
                  </label>

                  <div
                    className={`flex min-h-14 items-center rounded-2xl border bg-white px-4 transition duration-200 focus-within:ring-4 ${
                      errors.shopName
                        ? "border-red-300 focus-within:border-red-400 focus-within:ring-red-50"
                        : "border-black/10 focus-within:border-black/40 focus-within:ring-black/[0.03]"
                    }`}
                  >
                    <Store
                      className="h-[19px] w-[19px] shrink-0 text-neutral-400"
                      strokeWidth={
                        1.8
                      }
                    />

                    <input
                      id="shopName"
                      type="text"
                      placeholder="e.g. Urban Thread"
                      className="ml-3 min-w-0 flex-1 bg-transparent text-sm text-neutral-950 outline-none placeholder:text-neutral-400"
                      {...register(
                        "shopName",
                        {
                          required:
                            "Shop name is required",

                          minLength: {
                            value: 2,

                            message:
                              "Shop name must be at least 2 characters",
                          },
                        }
                      )}
                    />
                  </div>

                  {errors.shopName && (
                    <p className="mt-2 text-xs font-medium text-red-600">
                      {
                        errors.shopName
                          .message
                      }
                    </p>
                  )}
                </div>

                {/* =====================================
                    SHOP BIO
                ====================================== */}

                <div>
                  <label
                    htmlFor="shopBio"
                    className="mb-2 block text-sm font-semibold text-neutral-800"
                  >
                    Shop bio
                  </label>

                  <textarea
                    id="shopBio"
                    rows={4}
                    placeholder="Tell customers what your store offers..."
                    className="w-full resize-none rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm leading-6 text-neutral-950 outline-none transition duration-200 placeholder:text-neutral-400 focus:border-black/40 focus:ring-4 focus:ring-black/[0.03]"
                    {...register(
                      "shopBio",
                      {
                        maxLength: {
                          value:
                            500,

                          message:
                            "Shop bio must be under 500 characters",
                        },
                      }
                    )}
                  />

                  {errors.shopBio && (
                    <p className="mt-2 text-xs font-medium text-red-600">
                      {
                        errors.shopBio
                          .message
                      }
                    </p>
                  )}
                </div>

                {/* =====================================
                    ADDRESS + CATEGORY
                ====================================== */}

                <div className="grid gap-5 sm:grid-cols-2">
                  {/* Shop address */}

                  <div>
                    <label
                      htmlFor="shopAddress"
                      className="mb-2 block text-sm font-semibold text-neutral-800"
                    >
                      Shop address
                    </label>

                    <div
                      className={`flex min-h-14 items-center rounded-2xl border bg-white px-4 transition duration-200 focus-within:ring-4 ${
                        errors.shopAddress
                          ? "border-red-300 focus-within:border-red-400 focus-within:ring-red-50"
                          : "border-black/10 focus-within:border-black/40 focus-within:ring-black/[0.03]"
                      }`}
                    >
                      <MapPin
                        className="h-[19px] w-[19px] shrink-0 text-neutral-400"
                        strokeWidth={
                          1.8
                        }
                      />

                      <input
                        id="shopAddress"
                        type="text"
                        placeholder="City, State"
                        className="ml-3 min-w-0 flex-1 bg-transparent text-sm text-neutral-950 outline-none placeholder:text-neutral-400"
                        {...register(
                          "shopAddress",
                          {
                            required:
                              "Address is required",
                          }
                        )}
                      />
                    </div>

                    {errors.shopAddress && (
                      <p className="mt-2 text-xs font-medium text-red-600">
                        {
                          errors
                            .shopAddress
                            .message
                        }
                      </p>
                    )}
                  </div>

                  {/* ===================================
                      PREMIUM CATEGORY DROPDOWN
                  ==================================== */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-neutral-800">
                      Category
                    </label>

                    <Controller
                      name="category"
                      control={
                        control
                      }
                      rules={{
                        required:
                          "Category is required",
                      }}
                      render={({
                        field,
                      }) => (
                        <div className="relative">
                          {/* Trigger */}

                          <button
                            type="button"
                            aria-haspopup="listbox"
                            aria-expanded={
                              categoryOpen
                            }
                            onClick={() =>
                              setCategoryOpen(
                                (
                                  current
                                ) =>
                                  !current
                              )
                            }
                            className={`flex min-h-14 w-full items-center rounded-2xl border bg-white px-4 text-left transition duration-200 focus:outline-none focus:ring-4 ${
                              errors.category
                                ? "border-red-300 focus:border-red-400 focus:ring-red-50"
                                : categoryOpen
                                ? "border-black/40 ring-4 ring-black/[0.03]"
                                : "border-black/10 hover:border-black/20 focus:border-black/40 focus:ring-black/[0.03]"
                            }`}
                          >
                            <Tag
                              className="h-[19px] w-[19px] shrink-0 text-neutral-400"
                              strokeWidth={
                                1.8
                              }
                            />

                            <span
                              className={`ml-3 min-w-0 flex-1 truncate text-sm ${
                                field.value
                                  ? "text-neutral-950"
                                  : "text-neutral-400"
                              }`}
                            >
                              {field.value ||
                                "Select category"}
                            </span>

                            <ChevronDown
                              className={`ml-2 h-4 w-4 shrink-0 text-neutral-400 transition-transform duration-200 ${
                                categoryOpen
                                  ? "rotate-180"
                                  : ""
                              }`}
                            />
                          </button>

                          {/* Dropdown */}

                          {categoryOpen && (
                            <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-black/[0.08] bg-white p-2 shadow-[0_18px_50px_rgba(0,0,0,0.12)]">
                              <div
                                role="listbox"
                                aria-label="Shop category"
                                className="max-h-64 overflow-y-auto"
                              >
                                {SHOP_CATEGORIES.map(
                                  (
                                    category
                                  ) => {
                                    const selected =
                                      field.value ===
                                      category;

                                    return (
                                      <button
                                        key={
                                          category
                                        }
                                        type="button"
                                        role="option"
                                        aria-selected={
                                          selected
                                        }
                                        onClick={() => {
                                          field.onChange(
                                            category
                                          );

                                          setCategoryOpen(
                                            false
                                          );
                                        }}
                                        className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm transition ${
                                          selected
                                            ? "bg-neutral-950 font-semibold text-white"
                                            : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950"
                                        }`}
                                      >
                                        <span>
                                          {
                                            category
                                          }
                                        </span>

                                        {selected && (
                                          <Check className="h-4 w-4 shrink-0" />
                                        )}
                                      </button>
                                    );
                                  }
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    />

                    {errors.category && (
                      <p className="mt-2 text-xs font-medium text-red-600">
                        {
                          errors.category
                            .message
                        }
                      </p>
                    )}
                  </div>
                </div>

                {/* =====================================
                    WEBSITE + OPENING HOURS
                ====================================== */}

                <div className="grid gap-5 sm:grid-cols-2">
                  {/* Website */}

                  <div>
                    <label
                      htmlFor="website"
                      className="mb-2 block text-sm font-semibold text-neutral-800"
                    >
                      Website

                      <span className="ml-1 font-normal text-neutral-400">
                        optional
                      </span>
                    </label>

                    <div className="flex min-h-14 items-center rounded-2xl border border-black/10 bg-white px-4 transition duration-200 focus-within:border-black/40 focus-within:ring-4 focus-within:ring-black/[0.03]">
                      <Globe2
                        className="h-[19px] w-[19px] shrink-0 text-neutral-400"
                        strokeWidth={
                          1.8
                        }
                      />

                      <input
                        id="website"
                        type="text"
                        inputMode="url"
                        placeholder="https://yourstore.com"
                        className="ml-3 min-w-0 flex-1 bg-transparent text-sm text-neutral-950 outline-none placeholder:text-neutral-400"
                        {...register(
                          "website"
                        )}
                      />
                    </div>
                  </div>

                  {/* Opening hours */}

                  <div>
                    <label
                      htmlFor="openingHours"
                      className="mb-2 block text-sm font-semibold text-neutral-800"
                    >
                      Opening hours

                      <span className="ml-1 font-normal text-neutral-400">
                        optional
                      </span>
                    </label>

                    <div className="flex min-h-14 items-center rounded-2xl border border-black/10 bg-white px-4 transition duration-200 focus-within:border-black/40 focus-within:ring-4 focus-within:ring-black/[0.03]">
                      <Clock3
                        className="h-[19px] w-[19px] shrink-0 text-neutral-400"
                        strokeWidth={
                          1.8
                        }
                      />

                      <input
                        id="openingHours"
                        type="text"
                        placeholder="9:00 AM - 7:00 PM"
                        className="ml-3 min-w-0 flex-1 bg-transparent text-sm text-neutral-950 outline-none placeholder:text-neutral-400"
                        {...register(
                          "openingHours"
                        )}
                      />
                    </div>
                  </div>
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
                    SUCCESS
                ====================================== */}

                {successMessage && (
                  <div
                    role="status"
                    className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-5 text-emerald-700"
                  >
                    {
                      successMessage
                    }
                  </div>
                )}

                {/* =====================================
                    SUBMIT
                ====================================== */}

                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    Boolean(
                      successMessage
                    )
                  }
                  className="group flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-[#0b1220] px-6 text-sm font-semibold text-white transition duration-200 hover:bg-[#172033] disabled:cursor-not-allowed disabled:bg-neutral-300"
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

                      Creating shop...
                    </>
                  ) : successMessage ? (
                    "Shop created"
                  ) : (
                    <>
                      Save shop & continue

                      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}