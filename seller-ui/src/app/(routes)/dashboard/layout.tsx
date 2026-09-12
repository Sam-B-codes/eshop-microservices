"use client";

import {
  useEffect,
  useState,
} from "react";

import { usePathname } from "next/navigation";

import Header from "@/components/dashboard/layout/Header";
import Sidebar from "@/components/dashboard/layout/Sidebar";

import { SellerProvider } from "@/context/SellerContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const [collapsed, setCollapsed] =
    useState(false);

  const [
    mobileSidebarOpen,
    setMobileSidebarOpen,
  ] = useState(false);

  // ====================================================
  // CLOSE MOBILE SIDEBAR AFTER NAVIGATION
  // ====================================================

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  // ====================================================
  // ESCAPE KEY + BODY SCROLL LOCK
  // ====================================================

  useEffect(() => {
    if (!mobileSidebarOpen) {
      return;
    }

    const handleEscape = (
      event: KeyboardEvent
    ) => {
      if (event.key === "Escape") {
        setMobileSidebarOpen(false);
      }
    };

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [mobileSidebarOpen]);

  const closeMobileSidebar = () => {
    setMobileSidebarOpen(false);
  };

  return (
    <SellerProvider>
      <div className="flex h-dvh overflow-hidden bg-[#0b1220]">
        {/* =============================================
            MOBILE BACKDROP
        ============================================== */}

        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={
            closeMobileSidebar
          }
          className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden ${
            mobileSidebarOpen
              ? "visible opacity-100"
              : "pointer-events-none invisible opacity-0"
          }`}
        />

        {/* =============================================
            SIDEBAR
        ============================================== */}

        <div
          className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out lg:static lg:z-auto lg:translate-x-0 ${
            mobileSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }`}
        >
          <Sidebar
            collapsed={collapsed}
            onCollapse={() =>
              setCollapsed(
                (current) =>
                  !current
              )
            }
            onMobileClose={
              closeMobileSidebar
            }
            onNavigate={
              closeMobileSidebar
            }
          />
        </div>

        {/* =============================================
            DASHBOARD AREA
        ============================================== */}

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Header
            onMenuClick={() =>
              setMobileSidebarOpen(
                true
              )
            }
          />

          {/* ===========================================
              MAIN SCROLL AREA

              Only this section scrolls.
              Sidebar + header remain fixed.
          ============================================ */}

          <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-[#f5f5f3] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 xl:px-10">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SellerProvider>
  );
}