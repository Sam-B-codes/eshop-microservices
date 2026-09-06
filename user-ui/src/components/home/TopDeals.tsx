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

export default function TopDeals() {
  const [products, setProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(false);

  useEffect(() => {
    const loadDeals = async () => {
      try {
        setLoading(true);
        setError(false);

        const response =
          await getPublicProducts({
            page: 1,
            limit: 20,
            sort: "newest",
          });

        const deals =
          response.products
            .filter(
              (product) =>
                product.hasDiscount &&
                product.discountPrice !=
                  null &&
                product.discountPercentage >
                  0
            )
            .sort(
              (a, b) =>
                b.discountPercentage -
                a.discountPercentage
            )
            .slice(0, 4);

        setProducts(deals);
      } catch (error) {
        console.error(
          "Failed to load top deals:",
          error
        );

        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadDeals();
  }, []);

  if (
    !loading &&
    !error &&
    products.length === 0
  ) {
    return null;
  }

  return (
   <ProductSection
  id="top-deals"
  eyebrow="Best savings right now"
  title="Top Deals"
  description="Shop products with some of the biggest currently available discounts."
  viewAllHref="/products"
  viewAllLabel="Shop all deals"
>
      {loading ? (
        <ProductSectionSkeleton
          count={4}
        />
      ) : error ? (
        <div className="rounded-3xl border border-neutral-200 bg-neutral-50 px-6 py-14 text-center">
          <p className="text-sm font-medium text-neutral-700">
            Deals couldn't be
            loaded right now.
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