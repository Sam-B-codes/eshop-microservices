"use client";

import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    Check,
    ChevronDown,
} from "lucide-react";

import type {
    SettlementStatus,
} from "@/types/payment";

export interface SettlementStatusOption {
  label: string;

  value:
    | SettlementStatus
    | "";
}

interface SettlementStatusFilterProps {
  value:
    | SettlementStatus
    | "";

  options:
    SettlementStatusOption[];

  onChange: (
    value:
      | SettlementStatus
      | ""
  ) => void;
}

export default function SettlementStatusFilter({
  value,
  options,
  onChange,
}: SettlementStatusFilterProps) {
  const [
    open,
    setOpen,
  ] = useState(false);

  const containerRef =
    useRef<HTMLDivElement>(
      null
    );

  const selectedOption =
    options.find(
      (option) =>
        option.value === value
    ) ?? options[0];

  // ====================================================
  // CLOSE OUTSIDE
  // ====================================================

  useEffect(() => {
    const handleClickOutside = (
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

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // ====================================================
  // CLOSE WITH ESCAPE
  // ====================================================

  useEffect(() => {
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
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  // ====================================================
  // SELECT STATUS
  // ====================================================

  const selectStatus = (
    status:
      | SettlementStatus
      | ""
  ) => {
    onChange(status);
    setOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className="relative min-w-0 sm:min-w-[200px]"
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
        className={`flex h-13 w-full items-center justify-between gap-4 rounded-[18px] border px-4 text-left text-sm font-semibold outline-none transition ${
          open
            ? "border-[#0b1220] bg-white text-[#0b1220]"
            : "border-black/[0.07] bg-[#fafafa] text-neutral-700 hover:border-black/[0.13]"
        }`}
      >
        <span className="truncate">
          {selectedOption.label}
        </span>

        <ChevronDown
          className={`h-4 w-4 shrink-0 text-neutral-400 transition-transform duration-200 ${
            open
              ? "rotate-180"
              : ""
          }`}
          strokeWidth={1.8}
        />
      </button>

      <div
        role="listbox"
        aria-label="Filter by settlement status"
        className={`absolute right-0 top-[calc(100%+10px)] z-50 w-full min-w-[230px] origin-top overflow-hidden rounded-[22px] border border-black/[0.08] bg-white p-2 shadow-[0_22px_60px_rgba(0,0,0,0.14)] transition duration-200 ${
          open
            ? "visible translate-y-0 scale-100 opacity-100"
            : "invisible -translate-y-1 scale-[0.98] opacity-0"
        }`}
      >
        {options.map(
          (option) => {
            const active =
              option.value ===
              value;

            return (
              <button
                key={
                  option.value ||
                  "ALL"
                }
                type="button"
                role="option"
                aria-selected={
                  active
                }
                onClick={() =>
                  selectStatus(
                    option.value
                  )
                }
                className={`flex w-full items-center justify-between gap-3 rounded-[15px] px-4 py-3 text-left text-sm transition ${
                  active
                    ? "bg-[#eef1f5] font-semibold text-[#0b1220]"
                    : "font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950"
                }`}
              >
                <span>
                  {option.label}
                </span>

                {active && (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0b1220] text-white">
                    <Check
                      className="h-3.5 w-3.5"
                      strokeWidth={2}
                    />
                  </span>
                )}
              </button>
            );
          }
        )}
      </div>
    </div>
  );
}