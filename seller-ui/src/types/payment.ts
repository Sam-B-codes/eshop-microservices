// ======================================================
// STATUSES
// ======================================================

export type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "REFUNDED";

export type SettlementStatus =
  | "PENDING"
  | "PROCESSING"
  | "SETTLED"
  | "FAILED";

// ======================================================
// SELLER PAYMENT
// ======================================================

export interface SellerPayment {
  id: string;
  orderId: string;
  sellerOrderId: string;

  paymentStatus:
    PaymentStatus;

  paymentProvider:
    | string
    | null;

  transactionReference:
    | string
    | null;

  paymentVerifiedAt:
    | string
    | null;

  grossSale: number;
  sellerDiscount: number;
  netSale: number;

  platformFeeRate: number;
  platformFee: number;
  sellerEarnings: number;

  settlementStatus:
    SettlementStatus;

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

  customer: {
    fullName: string;
    email: string;
  };

  orderCreatedAt: string;
  createdAt: string;
  updatedAt: string;
}

// ======================================================
// PAGINATION
// ======================================================

export interface SellerPaymentPagination {
  page: number;
  limit: number;
  totalPayments: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// ======================================================
// PAYMENT LIST
// ======================================================

export interface SellerPaymentListParams {
  page?: number;
  limit?: number;
  search?: string;

  status?:
    SettlementStatus;
}

export interface SellerPaymentListResponse {
  success: boolean;
  message: string;

  payments:
    SellerPayment[];

  pagination:
    SellerPaymentPagination;
}

// ======================================================
// PAYMENT SUMMARY
// ======================================================

export interface SellerPaymentSummary {
  totalTransactions: number;

  pendingSettlements: number;
  processingSettlements: number;
  settledTransactions: number;
  failedSettlements: number;

  grossSales: number;
  totalDiscounts: number;
  netSales: number;

  totalPlatformFees: number;
  totalSellerEarnings: number;

  pendingEarnings: number;
  settledEarnings: number;
}

export interface SellerPaymentSummaryResponse {
  success: boolean;
  message: string;

  summary:
    SellerPaymentSummary;
}