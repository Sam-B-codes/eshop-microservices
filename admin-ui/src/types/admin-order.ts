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

export interface AdminOrder {
  id: string;
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  itemCount: number;
  sellerCount: number;
  paymentProvider:
    | string
    | null;
  paymentId:
    | string
    | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminOrderPagination {
  page: number;
  limit: number;
  totalOrders: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface GetAdminOrdersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
}

export interface AdminOrderListResponse {
  success: boolean;
  message: string;
  orders: AdminOrder[];
  pagination: AdminOrderPagination;
}

export type SellerOrderStatus =
  | "PENDING_PAYMENT"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type SettlementStatus =
  | "PENDING"
  | "PROCESSING"
  | "SETTLED"
  | "FAILED";

export interface AdminOrderItem {
  id: string;
  orderId: string;
  productId: string;
  sellerId: string;
  productTitle: string;
  productSlug: string;
  productImage:
    | string
    | null;
  productSku:
    | string
    | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminSettlement {
  id: string;
  orderId: string;
  sellerId: string;
  sellerOrderId: string;
  currency: string;
  paymentProvider:
    | string
    | null;
  paymentId:
    | string
    | null;
  paymentVerifiedAt:
    | string
    | null;
  grossAmount: number;
  discountAmount: number;
  netAmount: number;
  platformFeeRate: number;
  platformFee: number;
  sellerEarnings: number;
  status: SettlementStatus;
  processingAt:
    | string
    | null;
  settledAt:
    | string
    | null;
  failedAt:
    | string
    | null;
  failureReason:
    | string
    | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminSellerOrder {
  id: string;
  orderId: string;
  sellerId: string;
  status: SellerOrderStatus;
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

  seller: {
    id: string;
    name: string;
    email: string;
    shopName:
      | string
      | null;
    status:
      | "ACTIVE"
      | "SUSPENDED";
  };

  settlement:
    | AdminSettlement
    | null;
}

export interface AdminOrderDetails {
  id: string;
  userId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotal: number;
  discount: number;
  shippingAmount: number;
  totalAmount: number;
  couponId:
    | string
    | null;
  couponCode:
    | string
    | null;
  couponSellerId:
    | string
    | null;
  couponDiscount: number;
  contactEmail: string;
  contactPhone: string;
  shippingFullName: string;
  shippingAddressLine1: string;
  shippingAddressLine2:
    | string
    | null;
  shippingCity: string;
  shippingState: string;
  shippingPostalCode: string;
  shippingCountry: string;
  paymentProvider:
    | string
    | null;
  paymentOrderId:
    | string
    | null;
  paymentId:
    | string
    | null;
  paymentVerifiedAt:
    | string
    | null;
  fulfillmentProcessedAt:
    | string
    | null;
  createdAt: string;
  updatedAt: string;

  user: {
    id: string;
    name: string;
    email: string;
    status:
      | "ACTIVE"
      | "SUSPENDED";
  };

  items: AdminOrderItem[];
  sellerOrders: AdminSellerOrder[];
  sellerSettlements: AdminSettlement[];
}

export interface AdminOrderDetailsResponse {
  success: boolean;
  message: string;
  order: AdminOrderDetails;
}