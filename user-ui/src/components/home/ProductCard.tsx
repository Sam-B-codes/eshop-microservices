"use client";

import { useState } from "react";

import Image from "next/image";
import Link from "next/link";

import { useRouter } from "next/navigation";

import { Check, Heart, Loader2, ShoppingBag } from "lucide-react";

import { Product } from "@/types/product";

import { useAuthContext } from "@/context/AuthContext";

import { useShop } from "@/context/ShopContext";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();

  const { user, loading: authLoading } = useAuthContext();

  const { addToCart, toggleWishlist, isInWishlist } = useShop();

  const [addingToCart, setAddingToCart] = useState(false);

  const [updatingWishlist, setUpdatingWishlist] = useState(false);

  const [addedToCart, setAddedToCart] = useState(false);

  const [actionError, setActionError] = useState("");

  const image = product.images?.[0]?.url || "/placeholder-product.png";

  /*
   * salePrice is the authoritative effective price.
   * Product cards must not recalculate it independently.
   */
  const displayPrice = product.salePrice;

  const showOriginalPrice =
    product.hasDiscount && product.salePrice < product.price;

  const wishlisted = isInWishlist(product.id);

  const requireAuthentication = () => {
    if (authLoading) {
      return false;
    }

    if (user) {
      return true;
    }

    const returnUrl = `/products/${product.slug}`;

    router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);

    return false;
  };

  const handleAddToCart = async () => {
    if (!product.available || addingToCart) {
      return;
    }

    if (!requireAuthentication()) {
      return;
    }

    try {
      setAddingToCart(true);
      setActionError("");
      setAddedToCart(false);

      await addToCart(product.id, 1);

      setAddedToCart(true);

      window.setTimeout(() => {
        setAddedToCart(false);
      }, 1800);
    } catch (error) {
      console.error("Failed to add product to cart:", error);

      setActionError("Could not add to cart.");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlist = async () => {
    if (updatingWishlist) {
      return;
    }

    if (!requireAuthentication()) {
      return;
    }

    try {
      setUpdatingWishlist(true);
      setActionError("");

      await toggleWishlist(product.id);
    } catch (error) {
      console.error("Failed to update wishlist:", error);

      setActionError("Could not update wishlist.");
    } finally {
      setUpdatingWishlist(false);
    }
  };

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-neutral-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
        <Link
          href={`/products/${product.slug}`}
          className="block h-full w-full"
        >
          <Image
            src={image}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {showOriginalPrice && product.discountPercentage > 0 && (
            <span className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-white shadow-sm">
              {product.discountPercentage}% OFF
            </span>
          )}

          {!product.available && (
            <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-neutral-700 shadow-sm backdrop-blur">
              Out of stock
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => void handleWishlist()}
          disabled={updatingWishlist || authLoading}
          aria-label={
            wishlisted
              ? `Remove ${product.title} from wishlist`
              : `Add ${product.title} to wishlist`
          }
          aria-pressed={wishlisted}
          className={`absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full shadow-sm backdrop-blur transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
            wishlisted
              ? "bg-black text-white hover:bg-neutral-800"
              : "bg-white/90 text-neutral-700 hover:bg-white hover:text-red-500"
          }`}
        >
          {updatingWishlist ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Heart
              className="h-5 w-5"
              fill={wishlisted ? "currentColor" : "none"}
            />
          )}
        </button>

        <div className="absolute inset-x-3 bottom-3 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <button
            type="button"
            onClick={() => void handleAddToCart()}
            disabled={!product.available || addingToCart || authLoading}
            className={`flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-lg transition disabled:cursor-not-allowed ${
              addedToCart
                ? "bg-emerald-600 hover:bg-emerald-600"
                : "bg-black hover:bg-neutral-800 disabled:bg-neutral-400"
            }`}
          >
            {addingToCart ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : addedToCart ? (
              <>
                <Check className="h-4 w-4" />
                Added
              </>
            ) : (
              <>
                <ShoppingBag className="h-4 w-4" />

                {product.available ? "Add to Cart" : "Unavailable"}
              </>
            )}
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="truncate text-xs font-medium uppercase tracking-[0.16em] text-neutral-400">
            {product.brand || product.category}
          </span>

          {product.stock > 0 && product.stock <= 5 && (
            <span className="shrink-0 text-xs font-semibold text-orange-600">
              Only {product.stock} left
            </span>
          )}
        </div>

        <Link href={`/products/${product.slug}`}>
          <h3 className="line-clamp-2 min-h-[48px] text-base font-semibold leading-6 text-neutral-900 transition group-hover:text-neutral-600">
            {product.title}
          </h3>
        </Link>

        <div className="mt-3 flex flex-wrap items-end gap-2">
          <span className="text-lg font-bold tracking-tight text-neutral-950">
            ₹{displayPrice.toLocaleString("en-IN")}
          </span>

          {showOriginalPrice && (
            <span className="pb-0.5 text-sm text-neutral-400 line-through">
              ₹{product.price.toLocaleString("en-IN")}
            </span>
          )}
        </div>

        {actionError && (
          <p role="alert" className="mt-2 text-xs font-medium text-red-600">
            {actionError}
          </p>
        )}
      </div>
    </article>
  );
}
