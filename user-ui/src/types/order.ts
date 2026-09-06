// ======================================================
// STATUSES
// ======================================================

export type OrderStatus =
  | "PENDING_PAYMENT"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "REFUNDED";

export type SellerOrderStatus =
  | "PENDING_PAYMENT"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

// ======================================================
// CREATE ORDER
// ======================================================

export interface CreateOrderShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface CreateOrderCoupon {
  code: string;
  sellerId: string;
}

export interface CreateOrderData {
  email: string;
  phone: string;
  shippingAddress:
    CreateOrderShippingAddress;

  coupon?:
    | CreateOrderCoupon
    | null;
}

// ======================================================
// ORDER ITEM
// ======================================================

export interface OrderItem {
  id: string;
  orderId?: string;
  productId: string;
  sellerId: string;

  productTitle: string;
  productSlug: string;

  productImage?:
    | string
    | null;

  productSku?:
    | string
    | null;

  unitPrice: number;
  quantity: number;
  lineTotal: number;

  createdAt: string;
  updatedAt: string;
}

// ======================================================
// SELLER FULFILMENT
// ======================================================

export interface OrderSeller {
  id: string;
  name: string;

  shopName?:
    | string
    | null;
}

export interface SellerFulfilment {
  id: string;
  orderId: string;
  sellerId: string;

  status:
    SellerOrderStatus;

  processingAt:
    | string
    | null;

  shippedAt:
    | string
    | null;

  deliveredAt:
    | string
    | null;

  cancelledAt:
    | string
    | null;

  subtotal: number;
  discount: number;
  totalAmount: number;

  trackingNumber:
    | string
    | null;

  shippingCarrier:
    | string
    | null;

  createdAt: string;
  updatedAt: string;

  seller: OrderSeller;
}

// ======================================================
// COMPLETE ORDER
// ======================================================

export interface Order {
  id: string;
  userId: string;

  status: OrderStatus;

  paymentStatus:
    PaymentStatus;

  subtotal: number;
  discount: number;
  shippingAmount: number;
  totalAmount: number;

  couponId?:
    | string
    | null;

  couponCode?:
    | string
    | null;

  couponSellerId?:
    | string
    | null;

  couponDiscount: number;

  contactEmail: string;
  contactPhone: string;

  shippingFullName: string;
  shippingAddressLine1: string;

  shippingAddressLine2?:
    | string
    | null;

  shippingCity: string;
  shippingState: string;
  shippingPostalCode: string;
  shippingCountry: string;

  paymentProvider?:
    | string
    | null;

  paymentOrderId?:
    | string
    | null;

  paymentId?:
    | string
    | null;

  paymentVerifiedAt?:
    | string
    | null;

  fulfillmentProcessedAt?:
    | string
    | null;

  items: OrderItem[];

  sellerOrders?:
    SellerFulfilment[];

  createdAt: string;
  updatedAt: string;
}

// ======================================================
// CUSTOMER ORDER LIST
// ======================================================

export interface UserOrderSummary {
  id: string;

  status: OrderStatus;

  paymentStatus:
    PaymentStatus;

  subtotal: number;
  discount: number;
  shippingAmount: number;
  totalAmount: number;

  couponCode:
    | string
    | null;

  itemCount: number;
  totalQuantity: number;
  sellerCount: number;

  paymentProvider:
    | string
    | null;

  paymentVerifiedAt:
    | string
    | null;

  createdAt: string;
  updatedAt: string;

  items: OrderItem[];
}

export interface UserOrderPagination {
  page: number;
  limit: number;
  totalOrders: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface GetUserOrdersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
}

export interface GetUserOrdersResponse {
  success: boolean;
  message: string;
  orders: UserOrderSummary[];
  pagination:
    UserOrderPagination;
}

// ======================================================
// API RESPONSES
// ======================================================

export interface CreateOrderResponse {
  success: boolean;
  message: string;
  order: Order;
}

export interface GetOrderResponse {
  success: boolean;
  message?: string;
  order: Order;
}