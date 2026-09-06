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

export default function FeaturedProducts() {
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

        /*
         * Temporary featured logic:
         *
         * - published products only
         * - in-stock products first
         * - favor products with images
         * - avoid simply sorting by discount
         *
         * Later this can be replaced
         * by a real `isFeatured` field.
         */

        const featured =
          response.products
            .filter(
              (product) =>
                product.available
            )
            .sort((a, b) => {
              const aHasImage =
                a.images?.length > 0
                  ? 1
                  : 0;

              const bHasImage =
                b.images?.length > 0
                  ? 1
                  : 0;

              if (
                bHasImage !==
                aHasImage
              ) {
                return (
                  bHasImage -
                  aHasImage
                );
              }

              return (
                new Date(
                  b.createdAt
                ).getTime() -
                new Date(
                  a.createdAt
                ).getTime()
              );
            })
            .slice(0, 4);

        setProducts(featured);
      } catch (error) {
        console.error(
          "Failed to load featured products:",
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
      id="featured"
      eyebrow="Handpicked for you"
      title="Featured Products"
      description="A curated selection of fresh, available products worth discovering."
      viewAllHref="/products"
      viewAllLabel="Explore products"
    >
      {loading ? (
        <ProductSectionSkeleton
          count={4}
        />
      ) : error ? (
        <div className="rounded-3xl border border-neutral-200 bg-neutral-50 px-6 py-12 text-center">
          <p className="text-sm font-medium text-neutral-700">
            We couldn't load products
            right now.
          </p>
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-3xl border border-neutral-200 bg-neutral-50 px-6 py-12 text-center">
          <p className="text-sm font-medium text-neutral-700">
            No featured products
            available yet.
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