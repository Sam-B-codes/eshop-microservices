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

import {
  SellerOrderStatus,
} from "@/types/order";

export type OrderStatusFilterValue =
  | ""
  | SellerOrderStatus;

interface OrderStatusFilterProps {
  value: OrderStatusFilterValue;
  onChange: (
    value: OrderStatusFilterValue
  ) => void;
}

const STATUS_OPTIONS: Array<{
  label: string;
  value: OrderStatusFilterValue;
  dotClassName: string;
}> = [
  {
    label: "All statuses",
    value: "",
    dotClassName:
      "bg-neutral-400",
  },
  {
    label: "Confirmed",
    value: "CONFIRMED",
    dotClassName:
      "bg-blue-500",
  },
  {
    label: "Processing",
    value: "PROCESSING",
    dotClassName:
      "bg-violet-500",
  },
  {
    label: "Shipped",
    value: "SHIPPED",
    dotClassName:
      "bg-cyan-500",
  },
  {
    label: "Delivered",
    value: "DELIVERED",
    dotClassName:
      "bg-emerald-500",
  },
];

export default function OrderStatusFilter({
  value,
  onChange,
}: OrderStatusFilterProps) {
  const [
    open,
    setOpen,
  ] = useState(false);

  const containerRef =
    useRef<HTMLDivElement>(
      null
    );

  const selectedOption =
    STATUS_OPTIONS.find(
      (option) =>
        option.value === value
    ) ?? STATUS_OPTIONS[0];

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
        event.key === "Escape"
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
      className="relative z-30 w-full lg:w-52"
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
        className={`flex h-11 w-full items-center justify-between gap-3 rounded-2xl border px-4 text-sm font-medium outline-none transition ${
          open
            ? "border-neutral-300 bg-white ring-4 ring-black/[0.025]"
            : "border-black/[0.07] bg-neutral-50 hover:border-neutral-300 hover:bg-white"
        }`}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${selectedOption.dotClassName}`}
          />

          <span className="truncate text-neutral-700">
            {selectedOption.label}
          </span>
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
        aria-label="Filter orders by status"
        className={`absolute right-0 top-[calc(100%+8px)] w-full min-w-[210px] origin-top-right overflow-hidden rounded-2xl border border-black/[0.07] bg-white p-1.5 shadow-[0_18px_50px_rgba(0,0,0,0.14)] transition duration-150 ${
          open
            ? "visible translate-y-0 scale-100 opacity-100"
            : "invisible -translate-y-1 scale-[0.98] opacity-0"
        }`}
      >
        {STATUS_OPTIONS.map(
          (option) => {
            const selected =
              option.value === value;

            return (
              <button
                key={
                  option.value ||
                  "all"
                }
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onChange(
                    option.value
                  );

                  setOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                  selected
                    ? "bg-[#0b1220] text-white"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950"
                }`}
              >
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${option.dotClassName}`}
                />

                <span className="flex-1">
                  {option.label}
                </span>

                {selected && (
                  <Check
                    className="h-4 w-4 shrink-0"
                    strokeWidth={2}
                  />
                )}
              </button>
            );
          }
        )}
      </div>
    </div>
  );
}