"use client";

import {
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";

import {
  CheckoutFormErrors,
  CheckoutFormValues,
} from "@/types/checkout";

interface ShippingAddressFormProps {
  values: CheckoutFormValues;

  errors: CheckoutFormErrors;

  onChange: (
    field: keyof CheckoutFormValues,
    value: string
  ) => void;
}

export default function ShippingAddressForm({
  values,
  errors,
  onChange,
}: ShippingAddressFormProps) {
  return (
    <div className="space-y-6">
      {/* ================================================
          CONTACT
      ================================================= */}

      <section className="rounded-[28px] border border-black/5 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-900">
            <Mail
              size={18}
              strokeWidth={1.8}
            />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
              Contact
            </p>

            <h2 className="mt-1 text-xl font-semibold tracking-tight text-neutral-950">
              Contact information
            </h2>

            <p className="mt-1 text-sm leading-6 text-neutral-500">
              We&apos;ll use these details for order
              and delivery updates.
            </p>
          </div>
        </div>

        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          <CheckoutInput
            label="Email address"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={values.email}
            error={errors.email}
            icon={
              <Mail size={17} />
            }
            autoComplete="email"
            onChange={(value) =>
              onChange(
                "email",
                value
              )
            }
          />

          <CheckoutInput
            label="Phone number"
            name="phone"
            type="tel"
            placeholder="+91 98765 43210"
            value={values.phone}
            error={errors.phone}
            icon={
              <Phone size={17} />
            }
            autoComplete="tel"
            onChange={(value) =>
              onChange(
                "phone",
                value
              )
            }
          />
        </div>
      </section>

      {/* ================================================
          SHIPPING
      ================================================= */}

      <section className="rounded-[28px] border border-black/5 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-900">
            <MapPin
              size={18}
              strokeWidth={1.8}
            />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
              Delivery
            </p>

            <h2 className="mt-1 text-xl font-semibold tracking-tight text-neutral-950">
              Shipping address
            </h2>

            <p className="mt-1 text-sm leading-6 text-neutral-500">
              Enter the address where you want your
              order delivered.
            </p>
          </div>
        </div>

        <div className="mt-7 space-y-5">
          <CheckoutInput
            label="Full name"
            name="fullName"
            placeholder="Full name"
            value={values.fullName}
            error={errors.fullName}
            icon={
              <User size={17} />
            }
            autoComplete="name"
            onChange={(value) =>
              onChange(
                "fullName",
                value
              )
            }
          />

          <CheckoutInput
            label="Address"
            name="addressLine1"
            placeholder="House number, street, area"
            value={values.addressLine1}
            error={errors.addressLine1}
            icon={
              <MapPin size={17} />
            }
            autoComplete="address-line1"
            onChange={(value) =>
              onChange(
                "addressLine1",
                value
              )
            }
          />

          <CheckoutInput
            label="Apartment, landmark (optional)"
            name="addressLine2"
            placeholder="Apartment, floor, landmark"
            value={values.addressLine2}
            error={errors.addressLine2}
            autoComplete="address-line2"
            onChange={(value) =>
              onChange(
                "addressLine2",
                value
              )
            }
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <CheckoutInput
              label="City"
              name="city"
              placeholder="City"
              value={values.city}
              error={errors.city}
              autoComplete="address-level2"
              onChange={(value) =>
                onChange(
                  "city",
                  value
                )
              }
            />

            <CheckoutInput
              label="State"
              name="state"
              placeholder="State"
              value={values.state}
              error={errors.state}
              autoComplete="address-level1"
              onChange={(value) =>
                onChange(
                  "state",
                  value
                )
              }
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <CheckoutInput
              label="PIN code"
              name="postalCode"
              inputMode="numeric"
              placeholder="826001"
              value={values.postalCode}
              error={errors.postalCode}
              autoComplete="postal-code"
              maxLength={6}
              onChange={(value) =>
                onChange(
                  "postalCode",
                  value.replace(
                    /\D/g,
                    ""
                  )
                )
              }
            />

            <CheckoutInput
              label="Country"
              name="country"
              placeholder="India"
              value={values.country}
              error={errors.country}
              autoComplete="country-name"
              onChange={(value) =>
                onChange(
                  "country",
                  value
                )
              }
            />
          </div>
        </div>
      </section>
    </div>
  );
}

// ======================================================
// INPUT
// ======================================================

interface CheckoutInputProps {
  label: string;
  name: string;

  value: string;

  placeholder?: string;
  error?: string;

  type?: string;

  icon?: React.ReactNode;

  autoComplete?: string;

  inputMode?:
    | "text"
    | "numeric"
    | "tel"
    | "email"
    | "decimal"
    | "search"
    | "url"
    | "none";

  maxLength?: number;

  onChange: (
    value: string
  ) => void;
}

function CheckoutInput({
  label,
  name,
  value,
  placeholder,
  error,
  type = "text",
  icon,
  autoComplete,
  inputMode,
  maxLength,
  onChange,
}: CheckoutInputProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold text-neutral-700">
        {label}
      </span>

      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
            {icon}
          </span>
        )}

        <input
          name={name}
          type={type}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          maxLength={maxLength}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          className={`min-h-12 w-full rounded-2xl border bg-[#fafafa] px-4 text-sm text-neutral-950 outline-none transition placeholder:text-neutral-400 ${
            icon
              ? "pl-11"
              : ""
          } ${
            error
              ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100"
              : "border-black/[0.08] focus:border-black/20 focus:bg-white focus:ring-4 focus:ring-black/[0.03]"
          }`}
        />
      </div>

      {error && (
        <p className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </label>
  );
}