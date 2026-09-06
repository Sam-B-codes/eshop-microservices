"use client";

import {
  BarChart3,
  CreditCard,
  LayoutDashboard,
  Package,
  ReceiptText,
  ShieldCheck,
  Store,
  TicketPercent,
  Users,
  X,
} from "lucide-react";

import Link from "next/link";

import { usePathname } from "next/navigation";

import { useAdminContext } from "@/context/AdminContext";

interface AdminSidebarProps {
  mobile?: boolean;
  onClose?: () => void;
  onNavigate?: () => void;
}

const navigation = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    available: true,
  },
  {
    label: "Users",
    href: "/dashboard/users",
    icon: Users,
    available: true,
  },
  {
    label: "Sellers",
    href: "/dashboard/sellers",
    icon: Store,
    available: true,
  },
  {
    label: "Products",
    href: "/dashboard/products",
    icon: Package,
    available: true,
  },
  {
    label: "Coupons",
    href: "/dashboard/coupons",
    icon: TicketPercent,
    available: true,
  },
  {
    label: "Orders",
    href: "/dashboard/orders",
    icon: ReceiptText,
    available: true,
  },
  {
    label: "Payments",
    href: "/dashboard/payments",
    icon: CreditCard,
    available: true,
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
    available: true,
  },
];

export default function AdminSidebar({
  mobile = false,
  onClose,
  onNavigate,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const { admin } = useAdminContext();

  return (
    <aside
      aria-label="Admin navigation"
      className={
        mobile
          ? "flex h-full w-full flex-col bg-[#080d19]"
          : "fixed inset-y-0 left-0 z-40 hidden w-[280px] flex-col border-r border-white/[0.06] bg-[#080d19] lg:flex"
      }
    >
      <div className="flex h-[82px] shrink-0 items-center gap-3 border-b border-white/[0.06] px-6">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#080d19]">
          <ShieldCheck className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <p className="text-lg font-semibold tracking-[-0.03em] text-white">
            Eshop
          </p>

          <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            Admin Console
          </p>
        </div>

        {mobile && (
          <button
            type="button"
            aria-label="Close navigation"
            onClick={onClose}
            className="ml-auto flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="shrink-0 px-5 pt-6">
        <div className="rounded-[22px] border border-white/[0.07] bg-white/[0.035] p-4">
          <p className="truncate text-sm font-semibold text-white">
            {admin?.name}
          </p>

          <p className="mt-1 truncate text-xs text-slate-500">{admin?.email}</p>

          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

            {admin?.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
          </div>
        </div>
      </div>

      <div className="mt-7 min-h-0 flex-1 overflow-y-auto px-5 pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <p className="px-3 text-[9px] font-semibold uppercase tracking-[0.22em] text-slate-600">
          Platform
        </p>

        <nav className="mt-3 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;

            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" &&
                pathname.startsWith(`${item.href}/`));

            if (!item.available) {
              return (
                <div
                  key={item.href}
                  aria-disabled="true"
                  className="flex min-h-12 cursor-not-allowed items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-600"
                >
                  <Icon className="h-[18px] w-[18px]" />

                  <span>{item.label}</span>

                  <span className="ml-auto text-[8px] font-semibold uppercase tracking-wider text-slate-700">
                    Soon
                  </span>
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={`flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium transition ${
                  active
                    ? "bg-white text-[#080d19]"
                    : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                <Icon className="h-[18px] w-[18px]" />

                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="shrink-0 border-t border-white/[0.06] px-7 py-5">
        <p className="text-[10px] text-slate-700">Eshop Marketplace</p>
      </div>
    </aside>
  );
}
