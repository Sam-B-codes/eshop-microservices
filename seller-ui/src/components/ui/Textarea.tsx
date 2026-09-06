import {
  forwardRef,
  TextareaHTMLAttributes,
} from "react";

import clsx from "clsx";

interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}   

const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaProps
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

        <textarea
          ref={ref}
          {...props}
          className={clsx(
            "w-full resize-none rounded-2xl border bg-neutral-50 px-4 py-3.5 text-sm leading-6 text-neutral-950 outline-none transition",
            "placeholder:text-neutral-400",
            "border-black/[0.08]",
            "hover:border-black/[0.13]",
            "focus:border-black/25 focus:bg-white focus:ring-4 focus:ring-black/[0.025]",
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

Textarea.displayName =
  "Textarea";

export default Textarea;