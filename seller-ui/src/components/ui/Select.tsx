import {
  forwardRef,
  SelectHTMLAttributes,
} from "react";

import {
  ChevronDown,
} from "lucide-react";

import clsx from "clsx";
   
interface Option {
  label: string;
  value: string;
}

interface SelectProps
  extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Option[];
  placeholder?: string;
}

const Select = forwardRef<
  HTMLSelectElement,
  SelectProps
>(
  (
    {
      label,
      error,
      options,
      className,
      placeholder = "Select an option",
      ...props
    },
    ref
  ) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-xs font-semibold text-neutral-700">
            {label}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            {...props}
            className={clsx(
              "h-12 w-full cursor-pointer appearance-none rounded-2xl border bg-neutral-50 px-4 pr-11 text-sm font-medium text-neutral-800 outline-none transition",
              "border-black/[0.08]",
              "hover:border-black/[0.13]",
              "focus:border-black/25 focus:bg-white focus:ring-4 focus:ring-black/[0.025]",
              error &&
                "border-red-300 bg-red-50/30 focus:border-red-400 focus:ring-red-500/[0.06]",
              className
            )}
          >
            <option value="">
              {placeholder}
            </option>

            {options.map(
              (option) => (
                <option
                  key={
                    option.value
                  }
                  value={
                    option.value
                  }
                >
                  {
                    option.label
                  }
                </option>
              )
            )}
          </select>

          <ChevronDown
            className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
            strokeWidth={1.8}
          />
        </div>

        {error && (
          <p className="text-xs font-medium text-red-500">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;