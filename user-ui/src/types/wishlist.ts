export interface WishlistProductImage {
  url: string;
  publicId?: string;
}

export interface WishlistProduct {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  brand?: string | null;

  price: number;
  discountPrice?: number | null;
  salePrice: number;

  stock: number;
  images: WishlistProductImage[];

  status:
    | "DRAFT"
    | "PUBLISHED"
    | "OUT_OF_STOCK"
    | "ARCHIVED";

  available: boolean;

  availability:
    | "IN_STOCK"
    | "OUT_OF_STOCK";

  hasDiscount: boolean;
  discountPercentage: number;
}

export interface WishlistItem {
  id: string;
  productId: string;
  createdAt: string;

  product: WishlistProduct;
}

export interface Wishlist {
  id: string | null;
  items: WishlistItem[];
  itemCount: number;
}

export interface WishlistResponse {
  success: boolean;
  wishlist: Wishlist;
}

export interface WishlistMutationResponse {
  success: boolean;
  message: string;
  wishlist: Wishlist;
}

export interface AddToWishlistData {
  productId: string;
}