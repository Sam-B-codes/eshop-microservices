"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Check,
  ChevronDown,
  ShieldCheck,
} from "lucide-react";

import {
  UserStatus,
} from "@/types/admin-user";

interface UserStatusFilterProps {
  value:
    | UserStatus
    | "";
  onChange: (
    value:
      | UserStatus
      | ""
  ) => void;
}

const statusOptions: Array<{
  label: string;
  description: string;
  value: UserStatus | "";
}> = [
  {
    label: "All statuses",
    description:
      "Show every customer",
    value: "",
  },
  {
    label: "Active",
    description:
      "Customers with access",
    value: "ACTIVE",
  },
  {
    label: "Suspended",
    description:
      "Restricted customers",
    value: "SUSPENDED",
  },
];

export default function UserStatusFilter({
  value,
  onChange,
}: UserStatusFilterProps) {
  const [
    open,
    setOpen,
  ] = useState(false);

  const containerRef =
    useRef<HTMLDivElement>(
      null
    );

  const selectedOption =
    statusOptions.find(
      (option) =>
        option.value === value
    ) ?? statusOptions[0];

  useEffect(() => {
    const handleOutsideClick = (
      event: MouseEvent
    ) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (
      event: KeyboardEvent
    ) => {
      if (
        event.key ===
        "Escape"
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative min-w-[210px]"
    >
      <button
        type="button"
        onClick={() =>
          setOpen(
            (current) =>
              !current
          )
        }
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex min-h-12 w-full items-center gap-3 rounded-2xl border bg-white px-4 text-left transition ${
          open
            ? "border-black/25 ring-4 ring-black/[0.03]"
            : "border-black/[0.08] hover:border-black/15 hover:bg-neutral-50"
        }`}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600">
          <ShieldCheck className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-neutral-800">
            {
              selectedOption.label
            }
          </p>
        </div>

        <ChevronDown
          className={`h-4 w-4 shrink-0 text-neutral-400 transition-transform duration-200 ${
            open
              ? "rotate-180"
              : ""
          }`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-full min-w-[250px] overflow-hidden rounded-[20px] border border-black/[0.07] bg-white p-1.5 shadow-[0_20px_60px_rgba(15,23,42,0.14)]"
        >
          <div className="px-3 pb-2 pt-2">
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
              Account status
            </p>
          </div>

          {statusOptions.map(
            (option) => {
              const selected =
                option.value ===
                value;

              return (
                <button
                  key={
                    option.value ||
                    "all"
                  }
                  type="button"
                  role="option"
                  aria-selected={
                    selected
                  }
                  onClick={() => {
                    onChange(
                      option.value
                    );

                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
                    selected
                      ? "bg-[#080d19] text-white"
                      : "text-neutral-700 hover:bg-neutral-100"
                  }`}
                >
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${
                      option.value ===
                      "ACTIVE"
                        ? "bg-emerald-500"
                        : option.value ===
                            "SUSPENDED"
                          ? "bg-red-500"
                          : selected
                            ? "bg-white"
                            : "bg-neutral-300"
                    }`}
                  />

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">
                      {
                        option.label
                      }
                    </p>

                    <p
                      className={`mt-0.5 text-[10px] ${
                        selected
                          ? "text-slate-400"
                          : "text-neutral-400"
                      }`}
                    >
                      {
                        option.description
                      }
                    </p>
                  </div>

                  {selected && (
                    <Check className="h-4 w-4 shrink-0" />
                  )}
                </button>
              );
            }
          )}
        </div>
      )}
    </div>
  );
}