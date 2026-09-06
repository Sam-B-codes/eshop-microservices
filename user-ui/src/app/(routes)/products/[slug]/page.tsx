"use client";

import { useEffect, useMemo, useState } from "react";

import Image from "next/image";

import { useParams, useRouter } from "next/navigation";

import {
  ArrowLeft,
  Check,
  Heart,
  Loader2,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";

import { AxiosError } from "axios";

import {
  getPublicProductBySlug,
  getPublicProducts,
} from "@/services/product.service";

import { Product } from "@/types/product";

import ProductCard from "@/components/home/ProductCard";

import { useAuthContext } from "@/context/AuthContext";

import { useShop } from "@/context/ShopContext";

import ProductReviews from "@/components/products/ProductReviews";

// ======================================================
// API ERROR
// ======================================================

interface ApiErrorResponse {
  success?: boolean;
  message?: string;
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined;

    if (data?.message) {
      return data.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

// ======================================================
// PRODUCT DETAILS PAGE
// ======================================================

export default function ProductDetailsPage() {
  const params = useParams();

  const router = useRouter();

  const { user, loading: authLoading } = useAuthContext();

  const {
    addToCart,
    toggleWishlist,
    isInWishlist,
    cartMutating,
    wishlistMutating,
  } = useShop();

  const slug = typeof params.slug === "string" ? params.slug : "";

  const [product, setProduct] = useState<Product | null>(null);

  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);

  const [relatedLoading, setRelatedLoading] = useState(false);

  const [error, setError] = useState("");

  const [quantity, setQuantity] = useState(1);

  const [selectedImage, setSelectedImage] = useState(0);

  const [actionMessage, setActionMessage] = useState("");

  const [actionError, setActionError] = useState("");

  // ====================================================
  // LOAD PRODUCT
  // ====================================================

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);

        setError("");

        const data = await getPublicProductBySlug(slug);

        setProduct(data.product);

        setQuantity(1);

        setSelectedImage(0);

        setActionMessage("");

        setActionError("");
      } catch (error) {
        console.error("Failed to load product:", error);

        setProduct(null);

        setError("Product could not be found.");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      void loadProduct();
    }
  }, [slug]);

  // ====================================================
  // LOAD RELATED PRODUCTS
  // ====================================================

  useEffect(() => {
    const loadRelatedProducts = async () => {
      if (!product) {
        return;
      }

      try {
        setRelatedLoading(true);

        const data = await getPublicProducts({
          page: 1,
          limit: 8,

          category: product.category,

          sort: "newest",
        });

        const filteredProducts = data.products
          .filter((item) => item.id !== product.id)
          .slice(0, 4);

        setRelatedProducts(filteredProducts);
      } catch (error) {
        console.error("Failed to load related products:", error);

        setRelatedProducts([]);
      } finally {
        setRelatedLoading(false);
      }
    };

    void loadRelatedProducts();
  }, [product]);

  // ======================================================
  // AUTHORITATIVE EFFECTIVE PRICE
  // ======================================================

  const displayPrice = useMemo(() => {
    if (!product) {
      return 0;
    }

    return product.salePrice;
  }, [product]);

  const showOriginalPrice = useMemo(() => {
    if (!product) {
      return false;
    }

    return product.hasDiscount && product.salePrice < product.price;
  }, [product]);

  // ====================================================
  // WISHLIST STATE
  // ====================================================

  const wishlisted = product ? isInWishlist(product.id) : false;

  // ====================================================
  // QUANTITY
  // ====================================================

  const handleDecrease = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  const handleIncrease = () => {
    if (!product) {
      return;
    }

    setQuantity((current) => Math.min(product.stock, current + 1));
  };

  // ====================================================
  // REQUIRE AUTHENTICATION
  // ====================================================

  const requireAuthentication = () => {
    if (authLoading) {
      return false;
    }

    if (user) {
      return true;
    }

    const returnUrl = `/products/${encodeURIComponent(slug)}`;

    router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);

    return false;
  };

  // ====================================================
  // ADD TO CART
  // ====================================================

  const handleAddToCart = async () => {
    if (!product || !product.available) {
      return;
    }

    if (!requireAuthentication()) {
      return;
    }

    try {
      setActionError("");

      setActionMessage("");

      await addToCart(product.id, quantity);

      setActionMessage(
        quantity === 1
          ? "Added to your cart."
          : `${quantity} items added to your cart.`,
      );
    } catch (error) {
      console.error("Failed to add product to cart:", error);

      setActionError(
        getErrorMessage(error, "We couldn't add this product to your cart."),
      );
    }
  };

  // ====================================================
  // TOGGLE WISHLIST
  // ====================================================

  const handleWishlist = async () => {
    if (!product) {
      return;
    }

    if (!requireAuthentication()) {
      return;
    }

    const wasWishlisted = wishlisted;

    try {
      setActionError("");

      setActionMessage("");

      await toggleWishlist(product.id);

      setActionMessage(
        wasWishlisted
          ? "Removed from your wishlist."
          : "Saved to your wishlist.",
      );
    } catch (error) {
      console.error("Failed to update wishlist:", error);

      setActionError(
        getErrorMessage(error, "We couldn't update your wishlist."),
      );
    }
  };

  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f8f8f6]">
        <div className="mx-auto max-w-7xl px-4 pb-14 pt-10 sm:px-6 lg:px-8 lg:pt-12">
          <div className="mb-8 h-5 w-32 animate-pulse rounded bg-neutral-200" />

          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
            <div className="aspect-square animate-pulse rounded-[32px] bg-neutral-200" />

            <div className="space-y-5 pt-4">
              <div className="h-4 w-32 animate-pulse rounded bg-neutral-200" />

              <div className="h-12 w-4/5 animate-pulse rounded bg-neutral-200" />

              <div className="h-8 w-40 animate-pulse rounded bg-neutral-200" />

              <div className="h-10 w-28 animate-pulse rounded-full bg-neutral-200" />

              <div className="h-24 w-full animate-pulse rounded bg-neutral-200" />

              <div className="h-14 w-full animate-pulse rounded-full bg-neutral-200" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ====================================================
  // ERROR
  // ====================================================

  if (error || !product) {
    return (
      <main className="flex min-h-[75vh] items-center justify-center bg-[#f8f8f6] px-4">
        <div className="max-w-md text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">
            Product unavailable
          </p>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
            We couldn&apos;t find this product.
          </h1>

          <p className="mt-4 text-sm leading-6 text-neutral-600">
            The product may have been removed, unpublished, or is no longer
            available.
          </p>

          <button
            onClick={() => router.push("/products")}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-black px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            <ArrowLeft size={17} />
            Back to products
          </button>
        </div>
      </main>
    );
  }

  // ====================================================
  // PRODUCT IMAGE
  // ====================================================

  const images = product.images ?? [];

  const currentImage = images[selectedImage]?.url;

  return (
    <main className="min-h-screen bg-[#f8f8f6]">
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8 lg:pb-20 lg:pt-12">
        {/* =====================================
            BACK
        ====================================== */}

        <button
          onClick={() => router.push("/products")}
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-neutral-600 transition hover:text-black"
        >
          <ArrowLeft size={17} />
          Back to products
        </button>

        {/* =====================================
            MAIN PRODUCT SECTION
        ====================================== */}

        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 xl:gap-16">
          {/* ===================================
              IMAGE GALLERY
          ==================================== */}

          <section>
            <div className="overflow-hidden rounded-[30px] border border-black/5 bg-white shadow-sm">
              <div className="relative aspect-square bg-neutral-100">
                {currentImage ? (
                  <Image
                    src={currentImage}
                    alt={product.title}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 52vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-neutral-400">
                    Product image unavailable
                  </div>
                )}

                {product.hasDiscount && product.discountPercentage > 0 && (
                  <div className="absolute left-5 top-5 rounded-full bg-black px-4 py-2 text-xs font-semibold text-white shadow-sm">
                    -{product.discountPercentage}%
                  </div>
                )}
              </div>
            </div>

            {images.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
                {images.map((image, index) => (
                  <button
                    key={image.publicId || `${image.url}-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    className={`relative aspect-square overflow-hidden rounded-2xl border bg-white transition ${
                      selectedImage === index
                        ? "border-black ring-1 ring-black"
                        : "border-black/10 hover:border-black/30"
                    }`}
                  >
                    <Image
                      src={image.url}
                      alt={`${product.title} ${index + 1}`}
                      fill
                      sizes="120px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* ===================================
              PRODUCT INFORMATION
          ==================================== */}

          <section className="lg:pt-2">
            <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-500">
              <button
                onClick={() =>
                  router.push(
                    `/products?category=${encodeURIComponent(
                      product.category,
                    )}`,
                  )
                }
                className="transition hover:text-black"
              >
                {product.category}
              </button>

              <span>•</span>

              <span>{product.brand || "Independent Brand"}</span>
            </div>

            {/* TITLE */}

            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-neutral-950 sm:text-5xl lg:text-[52px] lg:leading-[1.05]">
              {product.title}
            </h1>

            {/* PRICE */}

            <div className="mt-7 flex flex-wrap items-end gap-3">
              <span className="text-3xl font-semibold tracking-tight text-neutral-950">
                ₹{displayPrice.toLocaleString("en-IN")}
              </span>

              {showOriginalPrice && (
                <>
                  <span className="pb-1 text-lg text-neutral-400 line-through">
                    ₹{product.price.toLocaleString("en-IN")}
                  </span>

                  <span className="mb-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Save {product.discountPercentage}%
                  </span>
                </>
              )}
            </div>

            {/* STOCK */}

            <div className="mt-7">
              {product.available ? (
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-2 text-sm font-semibold text-emerald-700">
                  <Check size={16} />
                  In stock
                </div>
              ) : (
                <div className="inline-flex items-center rounded-full bg-red-50 px-3.5 py-2 text-sm font-semibold text-red-600">
                  Out of stock
                </div>
              )}
            </div>

            {/* DESCRIPTION */}

            <p className="mt-8 max-w-xl text-[15px] leading-7 text-neutral-600 sm:text-base">
              {product.description}
            </p>

            {/* QUANTITY */}

            {product.available && (
              <div className="mt-9">
                <p className="mb-3 text-sm font-semibold text-neutral-950">
                  Quantity
                </p>

                <div className="inline-flex items-center rounded-full border border-black/10 bg-white p-1 shadow-sm">
                  <button
                    type="button"
                    onClick={handleDecrease}
                    disabled={quantity <= 1 || cartMutating}
                    aria-label="Decrease quantity"
                    className="flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <Minus size={17} />
                  </button>

                  <span className="w-12 text-center text-sm font-semibold">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={handleIncrease}
                    disabled={quantity >= product.stock || cartMutating}
                    aria-label="Increase quantity"
                    className="flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <Plus size={17} />
                  </button>
                </div>

                <p className="mt-2.5 text-xs text-neutral-500">
                  {product.stock} units available
                </p>
              </div>
            )}

            {/* CTA BUTTONS */}

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => void handleAddToCart()}
                disabled={!product.available || cartMutating || authLoading}
                className="flex min-h-14 flex-1 items-center justify-center gap-2 rounded-full bg-black px-6 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
              >
                {cartMutating ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <ShoppingBag size={18} />

                    {product.available ? "Add to cart" : "Out of stock"}
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => void handleWishlist()}
                disabled={wishlistMutating || authLoading}
                aria-pressed={wishlisted}
                className={`flex min-h-14 items-center justify-center gap-2 rounded-full border px-7 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  wishlisted
                    ? "border-black bg-black text-white hover:bg-neutral-800"
                    : "border-black/10 bg-white text-neutral-900 hover:border-black/25 hover:bg-neutral-50"
                }`}
              >
                {wishlistMutating ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Heart
                      size={18}
                      fill={wishlisted ? "currentColor" : "none"}
                    />

                    {wishlisted ? "Wishlisted" : "Wishlist"}
                  </>
                )}
              </button>
            </div>

            {/* ACTION FEEDBACK */}

            {actionMessage && (
              <div
                role="status"
                className="mt-4 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"
              >
                <Check size={17} className="shrink-0" />

                {actionMessage}
              </div>
            )}

            {actionError && (
              <div
                role="alert"
                className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
              >
                {actionError}
              </div>
            )}

            {/* SERVICE CARDS */}

            <div className="mt-9 grid gap-3 sm:grid-cols-3">
              <InfoCard
                icon={<Truck size={19} />}
                title="Fast delivery"
                description="Secure doorstep shipping"
              />

              <InfoCard
                icon={<ShieldCheck size={19} />}
                title="Secure purchase"
                description="Protected checkout"
              />

              <InfoCard
                icon={<Check size={19} />}
                title="Quality checked"
                description="Verified products"
              />
            </div>

            {/* TAGS */}

            {product.tags.length > 0 && (
              <div className="mt-10 border-t border-black/10 pt-7">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                  Product tags
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-black/10 bg-white px-3.5 py-2 text-xs font-medium text-neutral-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>

        <ProductReviews productId={product.id} />
        {/* =====================================
            RELATED PRODUCTS
        ====================================== */}

        <section className="mt-16 border-t border-black/10 pt-12 lg:mt-20 lg:pt-16">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                More to explore
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl">
                You may also like
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500">
                Discover more products from the{" "}
                <span className="font-medium text-neutral-700">
                  {product.category}
                </span>{" "}
                collection.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                router.push(
                  `/products?category=${encodeURIComponent(product.category)}`,
                )
              }
              className="inline-flex w-fit items-center text-sm font-semibold text-neutral-700 transition hover:text-black"
            >
              View all {product.category}
              <span className="ml-2">→</span>
            </button>
          </div>

          {/* RELATED LOADING */}

          {relatedLoading ? (
            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
              {Array.from({
                length: 4,
              }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-3xl border border-black/5 bg-white"
                >
                  <div className="aspect-[4/5] animate-pulse bg-neutral-200" />

                  <div className="space-y-3 p-4">
                    <div className="h-3 w-20 animate-pulse rounded bg-neutral-200" />

                    <div className="h-4 w-4/5 animate-pulse rounded bg-neutral-200" />

                    <div className="h-4 w-24 animate-pulse rounded bg-neutral-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : relatedProducts.length > 0 ? (
            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-3xl border border-black/5 bg-white px-6 py-12 text-center">
              <p className="text-sm font-semibold text-neutral-800">
                No related products available yet.
              </p>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
                Explore the full catalogue to discover more products.
              </p>

              <button
                type="button"
                onClick={() => router.push("/products")}
                className="mt-5 inline-flex rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
              >
                Browse all products
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

// ======================================================
// SERVICE INFO CARD
// ======================================================

function InfoCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
      <div className="text-neutral-950">{icon}</div>

      <p className="mt-3 text-sm font-semibold text-neutral-950">{title}</p>

      <p className="mt-1 text-xs leading-5 text-neutral-500">{description}</p>
    </div>
  );
}
