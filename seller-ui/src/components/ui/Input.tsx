import {
  forwardRef,
  InputHTMLAttributes,
} from "react";

import clsx from "clsx";

interface InputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<   
  HTMLInputElement,
  InputProps
>(
  (
    {
      label,
      error,
      className,
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

        <input
          ref={ref}
          {...props}
          className={clsx(
            "h-12 w-full rounded-2xl border bg-neutral-50 px-4 text-sm text-neutral-950 outline-none transition",
            "border-black/[0.08]",
            "placeholder:text-neutral-400",
            "hover:border-black/[0.13]",
            "focus:border-black/25 focus:bg-white focus:ring-4 focus:ring-black/[0.025]",
            "disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400",
            error &&
              "border-red-300 bg-red-50/30 focus:border-red-400 focus:ring-red-500/[0.06]",
            className
          )}
        />

        {error && (
          <p className="text-xs font-medium text-red-500">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;