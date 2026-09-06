export interface CartProductImage {
  url: string;
  publicId?: string;
}

export interface CartProduct {
  id: string;

  // Seller ownership is required during checkout
  // for seller-specific coupon validation.
  sellerId: string;

  title: string;
  slug: string;
  description: string;
  category: string;
  brand?: string | null;

  price: number;
  discountPrice?: number | null;
  salePrice: number;

  stock: number;

  images: CartProductImage[];

  status:
    | "DRAFT"
    | "PUBLISHED"
    | "OUT_OF_STOCK"
    | "ARCHIVED";

  available: boolean;
  quantityAvailable: boolean;
}

export interface CartItem {
  id: string;
  productId: string;

  quantity: number;

  lineTotal: number;

  product: CartProduct;
}

export interface Cart {
  id: string | null;

  items: CartItem[];

  itemCount: number;

  subtotal: number;
}

export interface CartResponse {
  success: boolean;
  cart: Cart;
}

export interface CartMutationResponse {
  success: boolean;
  message: string;
  cart: Cart;
}

export interface AddToCartData {
  productId: string;
  quantity?: number;
}

export interface UpdateCartItemData {
  quantity: number;
}