export type SellerOrderStatus =
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

export interface SellerOrderItem {
  id: string;
  productId: string;
  productTitle: string;
  productSlug: string;
  productImage: string | null;
  productSku: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  createdAt: string;
  updatedAt: string;
}

export interface SellerOrderCustomer {
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

export interface SellerOrder {
  id: string;
  sellerOrderId: string;

  status: SellerOrderStatus;
  paymentStatus: PaymentStatus;

  customer: SellerOrderCustomer;

  itemCount: number;
  totalQuantity: number;

  sellerSubtotal: number;
  sellerDiscount: number;
  sellerTotal: number;

  couponCode: string | null;
  couponAppliedToSeller: boolean;

  paymentProvider: string | null;
  paymentVerifiedAt: string | null;

  processingAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;

  createdAt: string;
  updatedAt: string;

  items: SellerOrderItem[];
}

export interface SellerOrderPagination {
  page: number;
  limit: number;
  totalOrders: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface SellerOrdersResponse {
  success: boolean;
  message: string;
  orders: SellerOrder[];
  pagination: SellerOrderPagination;
}

export interface SellerOrderPayment {
  status: PaymentStatus;
  provider: string | null;
  paymentOrderId: string | null;
  paymentId: string | null;
  verifiedAt: string | null;
}

export interface SellerOrderTracking {
  trackingNumber: string | null;
  shippingCarrier: string | null;
}

export interface SellerOrderDetails
  extends SellerOrder {
  contact: SellerOrderContact;
  shippingAddress: SellerOrderShippingAddress;
  payment: SellerOrderPayment;
  tracking: SellerOrderTracking;
  cancelledAt: string | null;
}

export interface SellerOrderDetailsResponse {
  success: boolean;
  message: string;
  order: SellerOrderDetails;
}

export interface GetSellerOrdersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: SellerOrderStatus;
  paymentStatus?: PaymentStatus;
}

export type SellerOrderStatusUpdate =
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED";

export interface UpdateSellerOrderStatusData {
  status: SellerOrderStatusUpdate;
  trackingNumber?: string;
  shippingCarrier?: string;
}

export interface UpdatedSellerOrder {
  id: string;
  orderId: string;
  sellerId: string;

  status: SellerOrderStatus;

  processingAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;

  subtotal: number;
  discount: number;
  totalAmount: number;

  trackingNumber: string | null;
  shippingCarrier: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface UpdateSellerOrderStatusResponse {
  success: boolean;
  message: string;
  sellerOrder: UpdatedSellerOrder;
}

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

export interface SellerRevenueSummaryResponse {
  success: boolean;
  message: string;
  summary: SellerRevenueSummary;
}

export interface GetSellerRevenueSummaryParams {
  from?: string;
  to?: string;
}