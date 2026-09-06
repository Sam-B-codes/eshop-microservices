"use client";

import { useState } from "react";

import Header from "@/components/dashboard/layout/Header";
import Sidebar from "@/components/dashboard/layout/Sidebar";

import { SellerProvider } from "@/context/SellerContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] =
    useState(false);

  return (
    <SellerProvider>
      <div className="flex h-dvh overflow-hidden bg-[#0b1220]">
        {/* =============================================
            SIDEBAR
        ============================================== */}

        <Sidebar
          collapsed={collapsed}
          onCollapse={() =>
            setCollapsed(
              (current) =>
                !current
            )
          }
        />

        {/* =============================================
            DASHBOARD AREA
        ============================================== */}

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Header />

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