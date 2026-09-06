"use client";

import {
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AxiosError,
} from "axios";

import {
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  useAuthContext,
} from "@/context/AuthContext";

import {
  changeUserPassword,
  updateUserProfile,
} from "@/services/auth";

// ======================================================
// TYPES
// ======================================================

interface ApiErrorResponse {
  success?: boolean;
  message?: string;
}

// ======================================================
// ERROR MESSAGE
// ======================================================

const getErrorMessage = (
  error: unknown,
  fallback: string
): string => {
  if (
    error instanceof
    AxiosError
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
// SETTINGS PAGE
// ======================================================

export default function SettingsPage() {
  const router =
    useRouter();

  const {
    user,
    updateUser,
    logout,
  } = useAuthContext();

  const [
    name,
    setName,
  ] = useState(
    user?.name || ""
  );

  const [
    profileSaving,
    setProfileSaving,
  ] = useState(false);

  const [
    profileMessage,
    setProfileMessage,
  ] = useState("");

  const [
    profileError,
    setProfileError,
  ] = useState("");

  const [
    currentPassword,
    setCurrentPassword,
  ] = useState("");

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    passwordSaving,
    setPasswordSaving,
  ] = useState(false);

  const [
    passwordError,
    setPasswordError,
  ] = useState("");

  const [
    showCurrentPassword,
    setShowCurrentPassword,
  ] = useState(false);

  const [
    showNewPassword,
    setShowNewPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  // ====================================================
  // SYNCHRONIZE PROFILE
  // ====================================================

  useEffect(() => {
    setName(
      user?.name || ""
    );
  }, [user?.name]);

  // ====================================================
  // DISPLAY DATA
  // ====================================================

  const initials =
    useMemo(() => {
      if (!user?.name) {
        return "U";
      }

      return (
        user.name
          .trim()
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, 2)
          .map((part) =>
            part
              .charAt(0)
              .toUpperCase()
          )
          .join("") || "U"
      );
    }, [user?.name]);

  const passwordChecks =
    useMemo(
      () => [
        {
          label:
            "At least 8 characters",
          valid:
            newPassword.length >=
            8,
        },
        {
          label:
            "One uppercase letter",
          valid:
            /[A-Z]/.test(
              newPassword
            ),
        },
        {
          label:
            "One lowercase letter",
          valid:
            /[a-z]/.test(
              newPassword
            ),
        },
        {
          label:
            "One number",
          valid:
            /\d/.test(
              newPassword
            ),
        },
        {
          label:
            "One special character",
          valid:
            /[^A-Za-z0-9]/.test(
              newPassword
            ),
        },
      ],
      [newPassword]
    );

  const passwordIsValid =
    passwordChecks.every(
      (check) =>
        check.valid
    );

  const passwordsMatch =
    confirmPassword.length >
      0 &&
    newPassword ===
      confirmPassword;

  // ====================================================
  // UPDATE PROFILE
  // ====================================================

  const handleProfileSubmit =
    async (
      event: FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();

      if (
        profileSaving
      ) {
        return;
      }

      const cleanName =
        name.trim();

      setProfileMessage("");
      setProfileError("");

      if (
        cleanName.length < 2 ||
        cleanName.length > 60
      ) {
        setProfileError(
          "Full name must contain between 2 and 60 characters."
        );

        return;
      }

      try {
        setProfileSaving(true);

        const response =
          await updateUserProfile({
            name:
              cleanName,
          });

        updateUser(
          response.data.user
        );

        setName(
          response.data.user
            .name
        );

        setProfileMessage(
          response.data
            .message ||
            "Profile updated successfully."
        );
      } catch (error) {
        setProfileError(
          getErrorMessage(
            error,
            "We couldn't update your profile."
          )
        );
      } finally {
        setProfileSaving(false);
      }
    };

  // ====================================================
  // CHANGE PASSWORD
  // ====================================================

  const handlePasswordSubmit =
    async (
      event: FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();

      if (
        passwordSaving
      ) {
        return;
      }

      setPasswordError("");

      if (!currentPassword) {
        setPasswordError(
          "Enter your current password."
        );

        return;
      }

      if (!passwordIsValid) {
        setPasswordError(
          "Your new password does not meet all requirements."
        );

        return;
      }

      if (!passwordsMatch) {
        setPasswordError(
          "New password and confirmation do not match."
        );

        return;
      }

      if (
        currentPassword ===
        newPassword
      ) {
        setPasswordError(
          "New password must be different from your current password."
        );

        return;
      }

      try {
        setPasswordSaving(true);

        await changeUserPassword({
          currentPassword,
          newPassword,
          confirmPassword,
        });

        logout();

        router.replace(
          "/login?passwordChanged=true"
        );

        router.refresh();
      } catch (error) {
        setPasswordError(
          getErrorMessage(
            error,
            "We couldn't change your password."
          )
        );
      } finally {
        setPasswordSaving(false);
      }
    };

  return (
    <div className="min-w-0 space-y-6">
      {/* ===============================================
          PAGE HEADING
      ================================================ */}

      <section className="rounded-[30px] border border-black/[0.06] bg-white px-6 py-7 shadow-[0_12px_40px_rgba(0,0,0,0.025)] sm:px-8 sm:py-9">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-neutral-950 text-lg font-semibold text-white">
            {initials}
          </div>

          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
              Account settings
            </p>

            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-neutral-950">
              Manage your account
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
              Keep your personal
              information accurate and
              protect your Eshop account
              with a strong password.
            </p>
          </div>
        </div>
      </section>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.82fr)]">
        {/* =============================================
            PERSONAL INFORMATION
        ============================================== */}

        <section className="rounded-[30px] border border-black/[0.06] bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.025)] sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-[#ead7dc] text-neutral-700">
              <UserRound
                className="h-5 w-5"
                strokeWidth={1.7}
              />
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-neutral-400">
                Personal details
              </p>

              <h3 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-neutral-950">
                Profile information
              </h3>

              <p className="mt-2 text-sm leading-6 text-neutral-500">
                This name appears across
                your account and order
                experience.
              </p>
            </div>
          </div>

          <form
            onSubmit={
              handleProfileSubmit
            }
            className="mt-8 space-y-5"
          >
            <SettingsField
              label="Full name"
              icon={
                <UserRound className="h-[18px] w-[18px]" />
              }
            >
              <input
                type="text"
                value={name}
                onChange={(
                  event
                ) => {
                  setName(
                    event.target
                      .value
                  );

                  setProfileMessage(
                    ""
                  );

                  setProfileError(
                    ""
                  );
                }}
                minLength={2}
                maxLength={60}
                autoComplete="name"
                required
                className="h-13 w-full bg-transparent px-4 text-sm text-neutral-950 outline-none placeholder:text-neutral-400"
                placeholder="Enter your full name"
              />
            </SettingsField>

            <SettingsField
              label="Email address"
              icon={
                <Mail className="h-[18px] w-[18px]" />
              }
              description="Email changes are disabled for account security."
            >
              <input
                type="email"
                value={
                  user?.email || ""
                }
                readOnly
                disabled
                className="h-13 w-full cursor-not-allowed bg-transparent px-4 text-sm text-neutral-400 outline-none"
              />
            </SettingsField>

            {profileMessage && (
              <Feedback
                positive
                message={
                  profileMessage
                }
              />
            )}

            {profileError && (
              <Feedback
                message={
                  profileError
                }
              />
            )}

            <button
              type="submit"
              disabled={
                profileSaving ||
                name.trim() ===
                  user?.name
              }
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-neutral-950 px-6 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
            >
              {profileSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />

                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />

                  Save changes
                </>
              )}
            </button>
          </form>
        </section>

        {/* =============================================
            SECURITY
        ============================================== */}

        <section className="rounded-[30px] border border-black/[0.06] bg-[#dce5df] p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-white/70 text-neutral-700">
              <ShieldCheck
                className="h-5 w-5"
                strokeWidth={1.7}
              />
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-neutral-500">
                Security
              </p>

              <h3 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-neutral-950">
                Change password
              </h3>

              <p className="mt-2 text-sm leading-6 text-neutral-600">
                You will be signed out
                after changing your
                password.
              </p>
            </div>
          </div>

          <form
            onSubmit={
              handlePasswordSubmit
            }
            className="mt-8 space-y-4"
          >
            <PasswordField
              label="Current password"
              value={
                currentPassword
              }
              onChange={
                setCurrentPassword
              }
              visible={
                showCurrentPassword
              }
              onToggle={() =>
                setShowCurrentPassword(
                  (current) =>
                    !current
                )
              }
              autoComplete="current-password"
            />

            <PasswordField
              label="New password"
              value={
                newPassword
              }
              onChange={
                setNewPassword
              }
              visible={
                showNewPassword
              }
              onToggle={() =>
                setShowNewPassword(
                  (current) =>
                    !current
                )
              }
              autoComplete="new-password"
            />

            <PasswordField
              label="Confirm new password"
              value={
                confirmPassword
              }
              onChange={
                setConfirmPassword
              }
              visible={
                showConfirmPassword
              }
              onToggle={() =>
                setShowConfirmPassword(
                  (current) =>
                    !current
                )
              }
              autoComplete="new-password"
            />

            <div className="rounded-[20px] border border-black/[0.06] bg-white/60 p-4">
              <p className="text-xs font-semibold text-neutral-800">
                Password requirements
              </p>

              <div className="mt-3 grid gap-2">
                {passwordChecks.map(
                  (check) => (
                    <div
                      key={
                        check.label
                      }
                      className={`flex items-center gap-2 text-xs ${
                        check.valid
                          ? "text-emerald-700"
                          : "text-neutral-500"
                      }`}
                    >
                      <Check
                        className="h-3.5 w-3.5"
                        strokeWidth={
                          2
                        }
                      />

                      {
                        check.label
                      }
                    </div>
                  )
                )}
              </div>
            </div>

            {passwordError && (
              <Feedback
                message={
                  passwordError
                }
              />
            )}

            <button
              type="submit"
              disabled={
                passwordSaving
              }
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-neutral-950 px-6 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {passwordSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />

                  Updating...
                </>
              ) : (
                <>
                  <KeyRound className="h-4 w-4" />

                  Update password
                </>
              )}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

// ======================================================
// SETTINGS FIELD
// ======================================================

function SettingsField({
  label,
  icon,
  description,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-neutral-800">
        {label}
      </span>

      <span className="mt-2 flex items-center rounded-[18px] border border-black/[0.08] bg-[#f8f7f4] transition focus-within:border-neutral-400 focus-within:bg-white">
        <span className="ml-4 text-neutral-400">
          {icon}
        </span>

        {children}
      </span>

      {description && (
        <span className="mt-2 block text-xs leading-5 text-neutral-400">
          {description}
        </span>
      )}
    </label>
  );
}

// ======================================================
// PASSWORD FIELD
// ======================================================

function PasswordField({
  label,
  value,
  onChange,
  visible,
  onToggle,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  visible: boolean;
  onToggle: () => void;
  autoComplete:
    | "current-password"
    | "new-password";
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-neutral-800">
        {label}
      </span>

      <span className="mt-2 flex items-center rounded-[18px] border border-black/[0.08] bg-white/70 transition focus-within:border-neutral-400 focus-within:bg-white">
        <LockKeyhole className="ml-4 h-[18px] w-[18px] shrink-0 text-neutral-400" />

        <input
          type={
            visible
              ? "text"
              : "password"
          }
          value={value}
          onChange={(
            event
          ) =>
            onChange(
              event.target.value
            )
          }
          autoComplete={
            autoComplete
          }
          required
          className="h-13 min-w-0 flex-1 bg-transparent px-4 text-sm text-neutral-950 outline-none placeholder:text-neutral-400"
          placeholder="Enter password"
        />

        <button
          type="button"
          onClick={
            onToggle
          }
          aria-label={
            visible
              ? `Hide ${label.toLowerCase()}`
              : `Show ${label.toLowerCase()}`
          }
          className="mr-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-neutral-400 transition hover:bg-black/[0.05] hover:text-neutral-700"
        >
          {visible ? (
            <EyeOff className="h-[18px] w-[18px]" />
          ) : (
            <Eye className="h-[18px] w-[18px]" />
          )}
        </button>
      </span>
    </label>
  );
}

// ======================================================
// FEEDBACK
// ======================================================

function Feedback({
  message,
  positive = false,
}: {
  message: string;
  positive?: boolean;
}) {
  return (
    <div
      role={
        positive
          ? "status"
          : "alert"
      }
      className={`rounded-[16px] border px-4 py-3 text-sm font-medium ${
        positive
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      {message}
    </div>
  );
}