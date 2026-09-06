"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Building2,
  Check,
  ExternalLink,
  KeyRound,
  Loader2,
  LockKeyhole,
  Save,
  ShieldCheck,
  Store,
  UserRound,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  AxiosError,
} from "axios";

import {
  toast,
} from "sonner";

import {
  changeSellerPassword,
  logoutSeller,
  updateSellerProfile,
  updateSellerStore,
} from "@/services/auth";

import {
  useSellerContext,
} from "@/context/SellerContext";

// ======================================================
// API ERROR
// ======================================================

interface ApiErrorResponse {
  success?: boolean;
  message?: string;
}

const getErrorMessage = (
  error: unknown,
  fallback: string
): string => {
  if (
    error instanceof AxiosError
  ) {
    const data =
      error.response
        ?.data as
        | ApiErrorResponse
        | undefined;

    if (data?.message) {
      return data.message;
    }
  }

  if (
    error instanceof Error
  ) {
    return error.message;
  }

  return fallback;
};

// ======================================================
// PAGE
// ======================================================

export default function SellerSettingsPage() {
  const router =
    useRouter();

  const {
    seller,
    loading,
    updateSeller,
    clearSeller,
  } = useSellerContext();

  const [
    savingProfile,
    setSavingProfile,
  ] = useState(false);

  const [
    savingStore,
    setSavingStore,
  ] = useState(false);

  const [
    changingPassword,
    setChangingPassword,
  ] = useState(false);

  // ====================================================
  // PROFILE FORM
  // ====================================================

  const [
    profileForm,
    setProfileForm,
  ] = useState({
    name: "",
    phone_number: "",
    country: "",
  });

  // ====================================================
  // STORE FORM
  // ====================================================

  const [
    storeForm,
    setStoreForm,
  ] = useState({
    shopName: "",
    shopBio: "",
    shopAddress: "",
    website: "",
    category: "",
    openingHours: "",
  });

  // ====================================================
  // PASSWORD FORM
  // ====================================================

  const [
    passwordForm,
    setPasswordForm,
  ] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // ====================================================
  // SELLER DISPLAY DATA
  // ====================================================

  const initials =
    useMemo(() => {
      if (!seller?.name) {
        return "S";
      }

      return (
        seller.name
          .trim()
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, 2)
          .map((part) =>
            part
              .charAt(0)
              .toUpperCase()
          )
          .join("") || "S"
      );
    }, [seller?.name]);

  // ====================================================
  // SYNCHRONIZE FORMS
  // ====================================================

  useEffect(() => {
    if (!seller) {
      return;
    }

    setProfileForm({
      name:
        seller.name || "",
      phone_number:
        seller.phone_number ||
        "",
      country:
        seller.country || "",
    });

    setStoreForm({
      shopName:
        seller.shopName || "",
      shopBio:
        seller.shopBio || "",
      shopAddress:
        seller.shopAddress ||
        "",
      website:
        seller.website || "",
      category:
        seller.category || "",
      openingHours:
        seller.openingHours ||
        "",
    });
  }, [seller]);

  // ====================================================
  // UPDATE PROFILE
  // ====================================================

  const handleProfileSubmit =
    async (
      event:
        FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();

      if (savingProfile) {
        return;
      }

      const name =
        profileForm.name.trim();

      const phoneNumber =
        profileForm.phone_number.trim();

      const country =
        profileForm.country.trim();

      if (
        !name ||
        !phoneNumber ||
        !country
      ) {
        toast.error(
          "Complete all profile fields."
        );

        return;
      }

      try {
        setSavingProfile(true);

        const response =
          await updateSellerProfile({
            name,
            phone_number:
              phoneNumber,
            country,
          });

        updateSeller(
          response.data.seller
        );

        toast.success(
          response.data.message ||
            "Profile updated successfully."
        );
      } catch (error) {
        toast.error(
          getErrorMessage(
            error,
            "Unable to update your profile."
          )
        );
      } finally {
        setSavingProfile(false);
      }
    };

  // ====================================================
  // UPDATE STORE
  // ====================================================

  const handleStoreSubmit =
    async (
      event:
        FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();

      if (savingStore) {
        return;
      }

      const shopName =
        storeForm.shopName.trim();

      const shopBio =
        storeForm.shopBio.trim();

      const shopAddress =
        storeForm.shopAddress.trim();

      const website =
        storeForm.website.trim();

      const category =
        storeForm.category.trim();

      const openingHours =
        storeForm.openingHours.trim();

      if (
        !shopName ||
        !shopBio ||
        !shopAddress ||
        !category ||
        !openingHours
      ) {
        toast.error(
          "Complete all required store fields."
        );

        return;
      }

      try {
        setSavingStore(true);

        const response =
          await updateSellerStore({
            shopName,
            shopBio,
            shopAddress,
            website,
            category,
            openingHours,
          });

        updateSeller(
          response.data.seller
        );

        toast.success(
          response.data.message ||
            "Store updated successfully."
        );
      } catch (error) {
        toast.error(
          getErrorMessage(
            error,
            "Unable to update your store."
          )
        );
      } finally {
        setSavingStore(false);
      }
    };

  // ====================================================
  // CHANGE PASSWORD
  // ====================================================

  const handlePasswordSubmit =
    async (
      event:
        FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();

      if (changingPassword) {
        return;
      }

      const {
        currentPassword,
        newPassword,
        confirmPassword,
      } = passwordForm;

      if (
        !currentPassword ||
        !newPassword ||
        !confirmPassword
      ) {
        toast.error(
          "Complete all password fields."
        );

        return;
      }

      if (
        newPassword !==
        confirmPassword
      ) {
        toast.error(
          "New passwords do not match."
        );

        return;
      }

      if (
        newPassword.length < 8
      ) {
        toast.error(
          "New password must contain at least 8 characters."
        );

        return;
      }

      try {
        setChangingPassword(
          true
        );

        const response =
          await changeSellerPassword({
            currentPassword,
            newPassword,
            confirmPassword,
          });

        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });

        toast.success(
          response.data.message ||
            "Password changed successfully."
        );

        clearSeller();

        try {
          await logoutSeller();
        } catch {
          // Password change already
          // invalidated the cookies.
        }

        router.replace(
          "/login"
        );

        router.refresh();
      } catch (error) {
        toast.error(
          getErrorMessage(
            error,
            "Unable to change your password."
          )
        );
      } finally {
        setChangingPassword(
          false
        );
      }
    };

  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {
    return (
      <SettingsSkeleton />
    );
  }

  // ====================================================
  // SELLER UNAVAILABLE
  // ====================================================

  if (!seller) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-[28px] border border-black/[0.06] bg-white px-8 py-12 text-center shadow-sm">
          <UserRound className="mx-auto h-8 w-8 text-neutral-300" />

          <h2 className="mt-4 text-lg font-semibold text-neutral-950">
            Seller account unavailable
          </h2>

          <p className="mt-2 text-sm text-neutral-500">
            Sign in again to manage
            your account.
          </p>

          <button
            type="button"
            onClick={() =>
              router.replace(
                "/login"
              )
            }
            className="mt-6 rounded-full bg-[#0b1220] px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Return to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1490px]">
      {/* ===============================================
          PAGE HEADER
      ================================================ */}

      <section className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
            Account management
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.045em] text-neutral-950 sm:text-4xl">
            Settings
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-500">
            Manage your seller
            profile, storefront
            information and account
            security.
          </p>
        </div>

        <div className="flex w-fit items-center gap-3 rounded-[20px] border border-black/[0.06] bg-white px-4 py-3 shadow-sm">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#0b1220] text-xs font-bold text-white">
            {initials}
          </div>

          <div className="min-w-0">
            <p className="max-w-[220px] truncate text-sm font-semibold text-neutral-950">
              {seller.name}
            </p>

            <p className="mt-1 max-w-[220px] truncate text-xs text-neutral-400">
              {seller.email}
            </p>
          </div>
        </div>
      </section>

      {/* ===============================================
          STATUS CARDS
      ================================================ */}

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <StatusCard
          icon={
            <UserRound
              className="h-5 w-5"
              strokeWidth={1.7}
            />
          }
          label="Seller account"
          value="Active"
          description="Your seller account is active and available."
          positive
        />

        <StatusCard
          icon={
            <Store
              className="h-5 w-5"
              strokeWidth={1.7}
            />
          }
          label="Onboarding"
          value={
            seller.isOnboarded
              ? "Completed"
              : "Incomplete"
          }
          description={
            seller.isOnboarded
              ? "Your store setup is complete."
              : "Complete your seller onboarding."
          }
          positive={
            seller.isOnboarded
          }
        />

        <StatusCard
          icon={
            <Building2
              className="h-5 w-5"
              strokeWidth={1.7}
            />
          }
          label="Settlement account"
          value={
            seller.bankConnected
              ? "Connected"
              : "Not connected"
          }
          description={
            seller.bankConnected
              ? "Your settlement account is ready."
              : "Connect an account for settlements."
          }
          positive={
            seller.bankConnected
          }
        />
      </section>

      {/* ===============================================
          PROFILE AND STORE
      ================================================ */}

      <section className="mt-6 grid items-start gap-6 xl:grid-cols-[0.82fr_1.18fr]">
        {/* SELLER PROFILE */}

        <SettingsCard
          icon={
            <UserRound
              className="h-5 w-5"
              strokeWidth={1.7}
            />
          }
          eyebrow="Personal"
          title="Seller profile"
          description="Information associated with your seller account."
        >
          <form
            onSubmit={
              handleProfileSubmit
            }
            className="space-y-5"
          >
            <Field
              label="Full name"
              required
            >
              <input
                type="text"
                value={
                  profileForm.name
                }
                onChange={(event) =>
                  setProfileForm(
                    (current) => ({
                      ...current,
                      name:
                        event.target
                          .value,
                    })
                  )
                }
                placeholder="Your full name"
                className={
                  inputClassName
                }
              />
            </Field>

            <Field
              label="Email address"
              hint="Cannot be changed"
            >
              <input
                type="email"
                value={
                  seller.email
                }
                disabled
                className={`${inputClassName} cursor-not-allowed bg-neutral-100 text-neutral-400`}
              />
            </Field>

            <Field
              label="Phone number"
              required
            >
              <input
                type="tel"
                value={
                  profileForm.phone_number
                }
                onChange={(event) =>
                  setProfileForm(
                    (current) => ({
                      ...current,
                      phone_number:
                        event.target
                          .value,
                    })
                  )
                }
                placeholder="+91 9876543210"
                className={
                  inputClassName
                }
              />
            </Field>

            <Field
              label="Country"
              required
            >
              <input
                type="text"
                value={
                  profileForm.country
                }
                onChange={(event) =>
                  setProfileForm(
                    (current) => ({
                      ...current,
                      country:
                        event.target
                          .value,
                    })
                  )
                }
                placeholder="India"
                className={
                  inputClassName
                }
              />
            </Field>

            <SubmitButton
              loading={
                savingProfile
              }
              label="Save profile"
              loadingLabel="Saving profile..."
            />
          </form>
        </SettingsCard>

        {/* STORE INFORMATION */}

        <SettingsCard
          icon={
            <Store
              className="h-5 w-5"
              strokeWidth={1.7}
            />
          }
          eyebrow="Storefront"
          title="Store information"
          description="Information customers use to understand your store."
        >
          <form
            onSubmit={
              handleStoreSubmit
            }
            className="space-y-5"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label="Store name"
                required
              >
                <input
                  type="text"
                  value={
                    storeForm.shopName
                  }
                  onChange={(event) =>
                    setStoreForm(
                      (current) => ({
                        ...current,
                        shopName:
                          event.target
                            .value,
                      })
                    )
                  }
                  placeholder="Your store name"
                  className={
                    inputClassName
                  }
                />
              </Field>

              <Field
                label="Category"
                required
              >
                <input
                  type="text"
                  value={
                    storeForm.category
                  }
                  onChange={(event) =>
                    setStoreForm(
                      (current) => ({
                        ...current,
                        category:
                          event.target
                            .value,
                      })
                    )
                  }
                  placeholder="Fashion, Electronics..."
                  className={
                    inputClassName
                  }
                />
              </Field>
            </div>

            <Field
              label="Store biography"
              required
            >
              <textarea
                value={
                  storeForm.shopBio
                }
                onChange={(event) =>
                  setStoreForm(
                    (current) => ({
                      ...current,
                      shopBio:
                        event.target
                          .value,
                    })
                  )
                }
                placeholder="Tell customers about your store..."
                rows={5}
                className={`${inputClassName} min-h-[130px] resize-y py-3`}
              />
            </Field>

            <Field
              label="Store address"
              required
            >
              <textarea
                value={
                  storeForm.shopAddress
                }
                onChange={(event) =>
                  setStoreForm(
                    (current) => ({
                      ...current,
                      shopAddress:
                        event.target
                          .value,
                    })
                  )
                }
                placeholder="Complete business address"
                rows={3}
                className={`${inputClassName} min-h-[96px] resize-y py-3`}
              />
            </Field>

            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label="Website"
                hint="Optional"
              >
                <div className="relative">
                  <input
                    type="url"
                    value={
                      storeForm.website
                    }
                    onChange={(event) =>
                      setStoreForm(
                        (current) => ({
                          ...current,
                          website:
                            event.target
                              .value,
                        })
                      )
                    }
                    placeholder="https://example.com"
                    className={`${inputClassName} pr-11`}
                  />

                  <ExternalLink className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                </div>
              </Field>

              <Field
                label="Opening hours"
                required
              >
                <input
                  type="text"
                  value={
                    storeForm.openingHours
                  }
                  onChange={(event) =>
                    setStoreForm(
                      (current) => ({
                        ...current,
                        openingHours:
                          event.target
                            .value,
                      })
                    )
                  }
                  placeholder="Mon-Sat, 9 AM-7 PM"
                  className={
                    inputClassName
                  }
                />
              </Field>
            </div>

            <SubmitButton
              loading={
                savingStore
              }
              label="Save store"
              loadingLabel="Saving store..."
            />
          </form>
        </SettingsCard>
      </section>

      {/* ===============================================
          SECURITY
      ================================================ */}

      <section className="mt-6">
        <SettingsCard
          icon={
            <LockKeyhole
              className="h-5 w-5"
              strokeWidth={1.7}
            />
          }
          eyebrow="Security"
          title="Change password"
          description="Use a strong password that you do not use for another account."
        >
          <form
            onSubmit={
              handlePasswordSubmit
            }
          >
            <div className="grid gap-5 lg:grid-cols-3">
              <Field
                label="Current password"
                required
              >
                <PasswordInput
                  value={
                    passwordForm.currentPassword
                  }
                  onChange={(value) =>
                    setPasswordForm(
                      (current) => ({
                        ...current,
                        currentPassword:
                          value,
                      })
                    )
                  }
                  placeholder="Current password"
                  autoComplete="current-password"
                />
              </Field>

              <Field
                label="New password"
                required
              >
                <PasswordInput
                  value={
                    passwordForm.newPassword
                  }
                  onChange={(value) =>
                    setPasswordForm(
                      (current) => ({
                        ...current,
                        newPassword:
                          value,
                      })
                    )
                  }
                  placeholder="New password"
                  autoComplete="new-password"
                />
              </Field>

              <Field
                label="Confirm password"
                required
              >
                <PasswordInput
                  value={
                    passwordForm.confirmPassword
                  }
                  onChange={(value) =>
                    setPasswordForm(
                      (current) => ({
                        ...current,
                        confirmPassword:
                          value,
                      })
                    )
                  }
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                />
              </Field>
            </div>

            <div className="mt-5 rounded-[18px] border border-amber-200 bg-amber-50 px-4 py-3">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />

                <p className="text-xs leading-5 text-amber-800">
                  Changing your
                  password signs you
                  out of the seller
                  dashboard. Sign in
                  again using the new
                  password.
                </p>
              </div>
            </div>

            <div className="mt-5">
              <SubmitButton
                loading={
                  changingPassword
                }
                label="Change password"
                loadingLabel="Changing password..."
              />
            </div>
          </form>
        </SettingsCard>
      </section>
    </div>
  );
}

// ======================================================
// INPUT STYLE
// ======================================================

const inputClassName =
  "min-h-12 w-full rounded-[16px] border border-black/[0.09] bg-white px-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 hover:border-black/[0.16] focus:border-[#0b1220] focus:ring-4 focus:ring-slate-900/[0.05] disabled:opacity-70";

// ======================================================
// SETTINGS CARD
// ======================================================

function SettingsCard({
  icon,
  eyebrow,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <article className="overflow-hidden rounded-[28px] border border-black/[0.06] bg-white shadow-[0_14px_45px_rgba(15,23,42,0.035)]">
      <div className="border-b border-black/[0.06] px-6 py-6 sm:px-7">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-[#f2f4f7] text-slate-600">
            {icon}
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
              {eyebrow}
            </p>

            <h2 className="mt-1.5 text-lg font-semibold text-neutral-950">
              {title}
            </h2>

            <p className="mt-2 max-w-2xl text-xs leading-5 text-neutral-500">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-7">
        {children}
      </div>
    </article>
  );
}

// ======================================================
// FORM FIELD
// ======================================================

function Field({
  label,
  hint,
  required = false,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between gap-3 text-xs font-semibold text-neutral-700">
        <span>
          {label}

          {required && (
            <span className="ml-1 text-red-500">
              *
            </span>
          )}
        </span>

        {hint && (
          <span className="font-normal text-neutral-400">
            {hint}
          </span>
        )}
      </span>

      {children}
    </label>
  );
}

// ======================================================
// PASSWORD INPUT
// ======================================================

function PasswordInput({
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  value: string;
  onChange: (
    value: string
  ) => void;
  placeholder: string;
  autoComplete:
    | "current-password"
    | "new-password";
}) {
  return (
    <div className="relative">
      <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />

      <input
        type="password"
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder={
          placeholder
        }
        autoComplete={
          autoComplete
        }
        className={`${inputClassName} pl-11`}
      />
    </div>
  );
}

// ======================================================
// SUBMIT BUTTON
// ======================================================

function SubmitButton({
  loading,
  label,
  loadingLabel,
}: {
  loading: boolean;
  label: string;
  loadingLabel: string;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#0b1220] px-6 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Save className="h-4 w-4" />
      )}

      {loading
        ? loadingLabel
        : label}
    </button>
  );
}

// ======================================================
// STATUS CARD
// ======================================================

function StatusCard({
  icon,
  label,
  value,
  description,
  positive = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
  positive?: boolean;
}) {
  return (
    <article className="rounded-[24px] border border-black/[0.06] bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.03)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-[15px] bg-[#f2f4f7] text-slate-600">
          {icon}
        </div>

        <span
          className={`flex h-8 w-8 items-center justify-center rounded-full ${
            positive
              ? "bg-emerald-50 text-emerald-600"
              : "bg-amber-50 text-amber-600"
          }`}
        >
          {positive ? (
            <Check className="h-4 w-4" />
          ) : (
            <ShieldCheck className="h-4 w-4" />
          )}
        </span>
      </div>

      <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.17em] text-neutral-400">
        {label}
      </p>

      <p
        className={`mt-2 text-xl font-semibold tracking-[-0.03em] ${
          positive
            ? "text-neutral-950"
            : "text-amber-700"
        }`}
      >
        {value}
      </p>

      <p className="mt-2 text-xs leading-5 text-neutral-500">
        {description}
      </p>
    </article>
  );
}

// ======================================================
// LOADING SKELETON
// ======================================================

function SettingsSkeleton() {
  return (
    <div className="mx-auto max-w-[1490px] animate-pulse">
      <div className="flex items-end justify-between">
        <div>
          <div className="h-3 w-36 rounded-full bg-neutral-200" />

          <div className="mt-4 h-10 w-44 rounded-xl bg-neutral-200" />

          <div className="mt-4 h-4 w-96 max-w-full rounded-full bg-neutral-200" />
        </div>

        <div className="hidden h-16 w-64 rounded-[20px] bg-neutral-200 sm:block" />
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map(
          (item) => (
            <div
              key={item}
              className="h-[190px] rounded-[24px] bg-white"
            />
          )
        )}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="h-[620px] rounded-[28px] bg-white" />

        <div className="h-[620px] rounded-[28px] bg-white" />
      </div>
    </div>
  );
}