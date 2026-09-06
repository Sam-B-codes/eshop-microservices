"use client";

import { ReactNode, useEffect, useState } from "react";

import { Loader2 } from "lucide-react";

import { usePathname, useRouter } from "next/navigation";

import AdminHeader from "@/components/dashboard/AdminHeader";
import AdminSidebar from "@/components/dashboard/AdminSidebar";

import { useAdminContext } from "@/context/AdminContext";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  const { admin, loading } = useAdminContext();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !admin) {
      router.replace("/login");
    }
  }, [admin, loading, router]);

  // Close the drawer whenever navigation completes.
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Escape key and body scroll lock.
  useEffect(() => {
    if (!mobileMenuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;

      window.removeEventListener("keydown", handleEscape);
    };
  }, [mobileMenuOpen]);

  if (loading || !admin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080d19]">
        <div className="text-center">
          <Loader2 className="mx-auto h-7 w-7 animate-spin text-white" />

          <p className="mt-4 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
            Securing console
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f5f7]">
      {/* Desktop sidebar */}

      <AdminSidebar />

      {/* Mobile sidebar */}

      <div
        className={`fixed inset-0 z-[100] lg:hidden ${
          mobileMenuOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!mobileMenuOpen}
      >
        <button
          type="button"
          aria-label="Close navigation overlay"
          onClick={() => setMobileMenuOpen(false)}
          className={`absolute inset-0 bg-[#080d19]/60 backdrop-blur-sm transition-opacity duration-300 ${
            mobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        <div
          role="dialog"
          aria-modal="true"
          aria-label="Admin navigation"
          className={`absolute inset-y-0 left-0 w-[86%] max-w-[320px] overflow-hidden border-r border-white/[0.06] shadow-[24px_0_70px_rgba(0,0,0,0.3)] transition-transform duration-300 ease-out ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <AdminSidebar
            mobile
            onClose={() => setMobileMenuOpen(false)}
            onNavigate={() => setMobileMenuOpen(false)}
          />
        </div>
      </div>

      <div className="min-w-0 lg:pl-[280px]">
        <AdminHeader onOpenMenu={() => setMobileMenuOpen(true)} />

        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
