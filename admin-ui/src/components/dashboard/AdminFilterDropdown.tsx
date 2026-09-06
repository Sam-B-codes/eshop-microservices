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

export interface AdminFilterOption<
  TValue extends string,
> {
  label: string;
  description: string;
  value: TValue;
  dotClassName?: string;
}

interface AdminFilterDropdownProps<
  TValue extends string,
> {
  value: TValue;
  label: string;
  options:
    AdminFilterOption<TValue>[];
  onChange: (
    value: TValue
  ) => void;
}

export default function AdminFilterDropdown<
  TValue extends string,
>({
  value,
  label,
  options,
  onChange,
}: AdminFilterDropdownProps<TValue>) {
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
      className="relative min-w-[205px]"
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
        <span
          className={`h-2 w-2 shrink-0 rounded-full ${
            selectedOption
              .dotClassName ??
            "bg-neutral-300"
          }`}
        />

        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-neutral-800">
          {
            selectedOption.label
          }
        </span>

        <ChevronDown
          className={`h-4 w-4 shrink-0 text-neutral-400 transition-transform ${
            open
              ? "rotate-180"
              : ""
          }`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-full min-w-[250px] rounded-[20px] border border-black/[0.07] bg-white p-1.5 shadow-[0_20px_60px_rgba(15,23,42,0.14)]"
        >
          <p className="px-3 pb-2 pt-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
            {label}
          </p>

          {options.map(
            (option) => {
              const selected =
                option.value ===
                value;

              return (
                <button
                  key={
                    option.value
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
                      option
                        .dotClassName ??
                      "bg-neutral-300"
                    }`}
                  />

                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">
                      {
                        option.label
                      }
                    </span>

                    <span
                      className={`mt-0.5 block text-[10px] ${
                        selected
                          ? "text-slate-400"
                          : "text-neutral-400"
                      }`}
                    >
                      {
                        option.description
                      }
                    </span>
                  </span>

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