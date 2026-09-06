"use client";

import { useState } from "react";

import ProductTable from "@/components/dashboard/products/ProductTable";
import ProductToolbar from "@/components/dashboard/products/ProductToolbar";

export default function ProductsPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-7">
      {/* ===============================================
          PAGE HEADER
      ================================================ */}

      <section>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
          Catalog management
        </p>

        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-[34px]">
          Products
        </h1>

        <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500">
          Manage your inventory, pricing, stock, and product catalog.
        </p>
      </section>

      {/* ===============================================
          TOOLBAR
      ================================================ */}

      <ProductToolbar
        search={search}
        setSearch={setSearch}
      />

      {/* ===============================================
          PRODUCT TABLE
      ================================================ */}

      <ProductTable search={search} />
    </div>
  );
}