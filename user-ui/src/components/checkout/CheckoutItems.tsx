"use client";

import Image from "next/image";
import Link from "next/link";

import {
  PackageCheck,
} from "lucide-react";

import {
  Cart,
} from "@/types/cart";

interface CheckoutItemsProps {
  cart: Cart;
}

export default function CheckoutItems({
  cart,
}: CheckoutItemsProps) {
  return (
    <section className="rounded-[28px] border border-black/5 bg-white p-5 shadow-sm sm:p-7">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-neutral-100">
          <PackageCheck
            size={18}
            strokeWidth={1.8}
          />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
            Your order
          </p>

          <h2 className="mt-1 text-xl font-semibold tracking-tight text-neutral-950">
            Order items
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            {cart.itemCount}{" "}
            {cart.itemCount === 1
              ? "item"
              : "items"}{" "}
            in this order
          </p>
        </div>
      </div>

      <div className="mt-7 divide-y divide-black/[0.06]">
        {cart.items.map(
          (item) => {
            const {
              product,
            } = item;

            const image =
              product.images?.[0]
                ?.url ||
              "/placeholder-product.png";

            return (
              <div
                key={item.id}
                className="flex gap-4 py-5 first:pt-0 last:pb-0"
              >
                {/* IMAGE */}

                <Link
                  href={`/products/${product.slug}`}
                  className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-neutral-100 sm:h-24 sm:w-20"
                >
                  <Image
                    src={image}
                    alt={
                      product.title
                    }
                    fill
                    sizes="80px"
                    className="object-cover"
                  />

                  <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[10px] font-semibold text-white">
                    {item.quantity}
                  </span>
                </Link>

                {/* DETAILS */}

                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                    {product.brand ||
                      product.category}
                  </p>

                  <Link
                    href={`/products/${product.slug}`}
                    className="mt-1 line-clamp-2 block text-sm font-semibold leading-5 text-neutral-950 transition hover:text-neutral-600"
                  >
                    {
                      product.title
                    }
                  </Link>

                  <p className="mt-2 text-xs text-neutral-400">
                    Qty{" "}
                    {item.quantity}
                  </p>
                </div>

                {/* PRICE */}

                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold text-neutral-950">
                    ₹
                    {item.lineTotal.toLocaleString(
                      "en-IN"
                    )}
                  </p>

                  {item.quantity >
                    1 && (
                    <p className="mt-1 text-[11px] text-neutral-400">
                      ₹
                      {product.salePrice.toLocaleString(
                        "en-IN"
                      )}{" "}
                      each
                    </p>
                  )}
                </div>
              </div>
            );
          }
        )}
      </div>
    </section>
  );
}