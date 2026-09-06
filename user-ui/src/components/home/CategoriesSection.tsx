"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowUpRight,
  Boxes,
} from "lucide-react";

import { getPublicCategories } from "@/services/product.service";

interface CategoryVisual {
  title: string;
  subtitle: string;
  className: string;
}

const categoryVisuals: Record<
  string,
  CategoryVisual
> = {
  clothing: {
    title: "Fashion",
    subtitle:
      "Modern essentials for every style.",
    className:
      "bg-[linear-gradient(135deg,#e9e0d7_0%,#cab6a5_100%)]",
  },

  shoes: {
    title: "Footwear",
    subtitle:
      "Step into everyday comfort.",
    className:
      "bg-[linear-gradient(135deg,#dfe4e8_0%,#bfc8cf_100%)]",
  },

  beauty: {
    title: "Beauty",
    subtitle:
      "Everyday care, elevated.",
    className:
      "bg-[linear-gradient(135deg,#f4e1e5_0%,#e5bcc5_100%)]",
  },

  electronics: {
    title: "Electronics",
    subtitle:
      "Smart technology for modern life.",
    className:
      "bg-[linear-gradient(135deg,#dfe5df_0%,#b6c5b7_100%)]",
  },
};

function getCategoryVisual(
  category: string
): CategoryVisual {
  const key =
    category.toLowerCase();

  if (categoryVisuals[key]) {
    return categoryVisuals[key];
  }

  return {
    title: category,
    subtitle:
      "Explore products selected for you.",
    className:
      "bg-[linear-gradient(135deg,#ece7df_0%,#d4cec5_100%)]",
  };
}

export default function CategoriesSection() {
  const [categories, setCategories] =
    useState<string[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(false);

  useEffect(() => {
    const loadCategories =
      async () => {
        try {
          setLoading(true);
          setError(false);

          const response =
            await getPublicCategories();

          setCategories(
            response.categories || []
          );
        } catch (error) {
          console.error(
            "Failed to load categories:",
            error
          );

          setError(true);
        } finally {
          setLoading(false);
        }
      };

    loadCategories();
  }, []);

  return (
    <section className="bg-[#faf9f7] py-12 sm:py-14 lg:py-16">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-neutral-400">
              Shop by category
            </p>

            <h2 className="max-w-xl text-3xl font-semibold tracking-[-0.03em] text-neutral-950 sm:text-4xl">
              Explore your next favorite.
            </h2>

            <p className="mt-3 max-w-lg text-sm leading-6 text-neutral-500 sm:text-base">
              Browse thoughtfully
              organized collections
              across Eshop.
            </p>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-600 sm:flex">
            <Boxes className="h-4 w-4" />

            {categories.length}
            {" "}
            categories
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({
              length: 4,
            }).map((_, index) => (
              <div
                key={index}
                className="h-[300px] animate-pulse rounded-[32px] bg-neutral-200"
              />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-neutral-200 bg-white px-6 py-14 text-center">
            <p className="text-sm font-medium text-neutral-700">
              Categories couldn't be
              loaded right now.
            </p>
          </div>
        ) : categories.length ===
          0 ? (
          <div className="rounded-3xl border border-neutral-200 bg-white px-6 py-14 text-center">
            <p className="text-sm font-medium text-neutral-700">
              No categories available
              yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map(
              (
                category,
                index
              ) => {
                const visual =
                  getCategoryVisual(
                    category
                  );

                return (
                  <Link
                    key={
                      category
                    }
                    href={`/products?category=${encodeURIComponent(
                      category
                    )}`}
                    className={`group relative min-h-[300px] overflow-hidden rounded-[32px] p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl ${visual.className}`}
                  >
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/30 blur-2xl" />

                    <div className="absolute -bottom-14 -left-10 h-44 w-44 rounded-full bg-black/5 blur-2xl" />

                    <div className="relative flex h-full flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="rounded-full border border-black/10 bg-white/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-700 backdrop-blur">
                          Collection
                          {" "}
                          {String(
                            index +
                              1
                          ).padStart(
                            2,
                            "0"
                          )}
                        </span>

                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-neutral-900 shadow-sm transition group-hover:rotate-45">
                          <ArrowUpRight className="h-5 w-5" />
                        </span>
                      </div>

                      <div>
                        <p className="mb-2 text-sm text-neutral-700">
                          {
                            visual.subtitle
                          }
                        </p>

                        <h3 className="text-3xl font-semibold tracking-tight text-neutral-950">
                          {
                            visual.title
                          }
                        </h3>

                        {visual.title !==
                          category && (
                          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-neutral-600">
                            {
                              category
                            }
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              }
            )}
          </div>
        )}
      </div>
    </section>
  );
}