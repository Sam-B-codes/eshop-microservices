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

export interface CreateOrderCouponInput {
  code: string;
  sellerId: string;
}

export interface CreateOrderInput {
  email: string;
  phone: string;
  shippingAddress: CreateOrderShippingAddress;
  coupon?: CreateOrderCouponInput | null;
}

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
// SHARED ORDER ITEM SNAPSHOT
// ======================================================

export interface OrderItemSnapshot {
  id: string;
  productId: string;
  sellerId: string;
  productTitle: string;
  productSlug: string;
  productImage: string | null;
  productSku: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  createdAt: Date;
  updatedAt: Date;
}

// ======================================================
// CUSTOMER ORDER LIST QUERY
// ======================================================

export interface UserOrderListQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
}

// ======================================================
// CUSTOMER ORDER LIST ITEM
// ======================================================

export interface UserOrderListItem {
  id: string;

  status: OrderStatus;
  paymentStatus: PaymentStatus;

  subtotal: number;
  discount: number;
  shippingAmount: number;
  totalAmount: number;

  couponCode: string | null;

  itemCount: number;
  totalQuantity: number;
  sellerCount: number;

  paymentProvider: string | null;
  paymentVerifiedAt: Date | null;

  createdAt: Date;
  updatedAt: Date;

  items: OrderItemSnapshot[];
}

// ======================================================
// CUSTOMER ORDER PAGINATION
// ======================================================

export interface UserOrderListPagination {
  page: number;
  limit: number;
  totalOrders: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// ======================================================
// CUSTOMER ORDER LIST RESULT
// ======================================================

export interface UserOrderListResult {
  orders: UserOrderListItem[];
  pagination: UserOrderListPagination;
}

// ======================================================
// SELLER ORDER LIST QUERY
// ======================================================

export interface SellerOrderListQuery {
  page?: number;
  limit?: number;
  search?: string;

  status?: SellerOrderStatus;

  // Temporary compatibility with the older seller query.
  orderStatus?: OrderStatus;

  paymentStatus?: PaymentStatus;
}

// ======================================================
// SELLER ORDER ITEM SNAPSHOT
// ======================================================

export interface SellerOrderItemSnapshot {
  id: string;
  productId: string;
  productTitle: string;
  productSlug: string;
  productImage: string | null;
  productSku: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  createdAt: Date;
  updatedAt: Date;
}

// ======================================================
// SELLER ORDER CUSTOMER
// ======================================================

export interface SellerOrderCustomerSummary {
  fullName: string;
  city: string;
  state: string;
  country: string;
}

export interface SellerOrderContact {
  email: string;
  phone: string;
}

export interface SellerOrderShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// ======================================================
// SELLER ORDER LIST ITEM
// ======================================================

export interface SellerOrderListItem {
  id: string;

  sellerOrderId?: string;
  status?: SellerOrderStatus;

  // Temporary compatibility with the older response.
  orderStatus?: OrderStatus;

  paymentStatus: PaymentStatus;

  customer: SellerOrderCustomerSummary;

  itemCount: number;
  totalQuantity: number;

  sellerSubtotal: number;
  sellerDiscount: number;
  sellerTotal: number;

  couponCode: string | null;
  couponAppliedToSeller: boolean;

  paymentProvider: string | null;
  paymentVerifiedAt: Date | null;

  processingAt?: Date | null;
  shippedAt?: Date | null;
  deliveredAt?: Date | null;

  createdAt: Date;
  updatedAt: Date;

  items: SellerOrderItemSnapshot[];
}

// ======================================================
// SELLER ORDER PAGINATION
// ======================================================

export interface SellerOrderListPagination {
  page: number;
  limit: number;
  totalOrders: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface SellerOrderListResult {
  orders: SellerOrderListItem[];
  pagination: SellerOrderListPagination;
}

// ======================================================
// SELLER ORDER DETAILS
// ======================================================

export interface SellerOrderPaymentDetails {
  status: PaymentStatus;
  provider: string | null;
  paymentOrderId: string | null;
  paymentId: string | null;
  verifiedAt: Date | null;
}

export interface SellerOrderTrackingDetails {
  trackingNumber: string | null;
  shippingCarrier: string | null;
}

export interface SellerOrderDetails {
  id: string;
  sellerOrderId: string;

  status: SellerOrderStatus;
  paymentStatus: PaymentStatus;

  contact: SellerOrderContact;
  shippingAddress: SellerOrderShippingAddress;

  itemCount: number;
  totalQuantity: number;

  sellerSubtotal: number;
  sellerDiscount: number;
  sellerTotal: number;

  couponCode: string | null;
  couponAppliedToSeller: boolean;

  payment: SellerOrderPaymentDetails;
  tracking: SellerOrderTrackingDetails;

  processingAt: Date | null;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  cancelledAt: Date | null;

  createdAt: Date;
  updatedAt: Date;

  items: SellerOrderItemSnapshot[];
}

// ======================================================
// UPDATE SELLER ORDER STATUS
// ======================================================

export interface UpdateSellerOrderStatusInput {
  status:
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED";

  trackingNumber?: string | null;
  shippingCarrier?: string | null;
}

// ======================================================
// SELLER REVENUE SUMMARY QUERY
// ======================================================

export interface SellerRevenueSummaryQuery {
  from?: Date;
  to?: Date;
}

// ======================================================
// SELLER REVENUE SUMMARY
// ======================================================

export interface SellerRevenueSummary {
  totalOrders: number;
  confirmedOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;

  grossRevenue: number;
  totalDiscount: number;
  netRevenue: number;

  paidRevenue: number;
  refundedRevenue: number;

  averageOrderValue: number;
}