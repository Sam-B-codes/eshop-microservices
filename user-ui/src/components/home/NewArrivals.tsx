"use client";

import {
  useEffect,
  useState,
} from "react";

import ProductCard from "./ProductCard";
import ProductSection from "./ProductSection";
import ProductSectionSkeleton from "./ProductSectionSkeleton";

import { getPublicProducts } from "@/services/product.service";

import { Product } from "@/types/product";

export default function NewArrivals() {
  const [products, setProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(false);
const response =
  await getPublicProducts({
    page: 1,
    limit: 20,
    sort: "newest",
  });

setProducts(
  response.products.slice(0, 4)
);
      } catch (error) {
        console.error(
          "Failed to load new arrivals:",
          error
        );

        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  return (
    <ProductSection
      id="new-arrivals"
      eyebrow="Just landed"
      title="New Arrivals"
      description="Fresh additions from sellers, recently published and ready to discover."
      viewAllHref="/products?sort=newest"
      viewAllLabel="View new arrivals"
    >
      {loading ? (
        <ProductSectionSkeleton
          count={4}
        />
      ) : error ? (
        <div className="rounded-3xl border border-neutral-200 bg-neutral-50 px-6 py-14 text-center">
          <p className="text-sm font-medium text-neutral-700">
            New arrivals couldn't be
            loaded right now.
          </p>
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-3xl border border-neutral-200 bg-neutral-50 px-6 py-14 text-center">
          <p className="text-sm font-medium text-neutral-700">
            No new arrivals yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4 lg:gap-6">
          {products.map(
            (product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            )
          )}
        </div>
      )}
    </ProductSection>
  );
}