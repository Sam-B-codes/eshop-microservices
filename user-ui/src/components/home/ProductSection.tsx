import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface ProductSectionProps {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  children: React.ReactNode;

  viewAllHref?: string;
  viewAllLabel?: string;
}

export default function ProductSection({
  id,
  eyebrow,
  title,
  description,
  children,
  viewAllHref = "/products",
  viewAllLabel = "View all",
}: ProductSectionProps) {
  return (
    <section
      id={id}
      className="bg-white py-12 sm:py-14 lg:py-16"
    >
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <div className="mb-7 flex items-end justify-between gap-6 sm:mb-8">
          <div className="max-w-2xl">
            {eyebrow && (
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-neutral-400">
                {eyebrow}
              </p>
            )}

            <h2 className="text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl lg:text-4xl">
              {title}
            </h2>

            {description && (
              <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-500 sm:text-base">
                {description}
              </p>
            )}
          </div>

          <Link
            href={viewAllHref}
            className="hidden shrink-0 items-center gap-2 rounded-full border border-neutral-200 px-5 py-2.5 text-sm font-semibold text-neutral-900 transition hover:border-neutral-900 hover:bg-neutral-950 hover:text-white sm:flex"
          >
            {viewAllLabel}

            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {children}

        <div className="mt-8 sm:hidden">
          <Link
            href={viewAllHref}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-neutral-200 px-5 py-3 text-sm font-semibold text-neutral-900"
          >
            {viewAllLabel}

            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}