"use client";

import Link from "next/link";
import {
  usePathname,
} from "next/navigation";

import {
  LucideIcon,
} from "lucide-react";

import clsx from "clsx";

interface SidebarItemProps {
  title: string;
  href: string;
  icon: LucideIcon;
  collapsed?: boolean;
  danger?: boolean;
  onClick?: () => void;
}

export default function SidebarItem({
  title,
  href,
  icon: Icon,
  collapsed = false,
  danger = false,
  onClick,
}: SidebarItemProps) {
  const pathname =
    usePathname();

  // ====================================================
  // ACTIVE ROUTE
  // ====================================================

  const isDashboardRoot =
    href === "/dashboard";

  const isActive =
    pathname === href ||
    (!isDashboardRoot &&
      pathname.startsWith(
        `${href}/`
      ));

  return (
    <div className="group relative">
      <Link
        href={href}
        onClick={onClick}
        aria-current={
          isActive
            ? "page"
            : undefined
        }
        className={clsx(
          "relative flex min-h-11 items-center rounded-xl transition-all duration-200",
          collapsed
            ? "gap-3 px-3 lg:justify-center lg:gap-0 lg:px-2"
            : "gap-3 px-3",

          danger
            ? "text-slate-500 hover:bg-red-400/[0.07] hover:text-red-400"
            : isActive
              ? "bg-white text-[#0b1220] shadow-[0_5px_18px_rgba(0,0,0,0.14)]"
              : "text-slate-500 hover:bg-white/[0.045] hover:text-slate-200"
        )}
      >
        <Icon
          className={clsx(
            "h-[18px] w-[18px] shrink-0 transition duration-200",
            danger
              ? "group-hover:text-red-400"
              : isActive
                ? "text-[#0b1220]"
                : "text-slate-500 group-hover:text-slate-300"
          )}
          strokeWidth={1.8}
        />

        <span
          className={clsx(
            "min-w-0 truncate text-[13px]",
            collapsed &&
              "lg:hidden",
            isActive &&
              !danger
              ? "font-semibold"
              : "font-medium"
          )}
        >
          {title}
        </span>

        {isActive &&
          !danger && (
            <span
              className={clsx(
                "ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-[#0b1220]/30",
                collapsed &&
                  "lg:hidden"
              )}
            />
          )}
      </Link>

      {collapsed && (
        <div className="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 z-[80] hidden -translate-y-1/2 whitespace-nowrap rounded-xl border border-white/[0.08] bg-[#111827] px-3 py-2 text-xs font-medium text-slate-200 shadow-[0_12px_35px_rgba(0,0,0,0.35)] lg:group-hover:block">
          {title}

          <span className="absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 border-b border-l border-white/[0.08] bg-[#111827]" />
        </div>
      )}
    </div>
  );
}