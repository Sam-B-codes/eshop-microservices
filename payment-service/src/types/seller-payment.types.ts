// ======================================================
// SETTLEMENT STATUS
// ======================================================

export type SettlementStatus =
  | "PENDING"
  | "PROCESSING"
  | "SETTLED"
  | "FAILED";

// ======================================================
// SELLER PAYMENT LIST QUERY
// ======================================================

export interface SellerPaymentListQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: SettlementStatus;
}

// ======================================================
// SELLER PAYMENT LIST ITEM
// ======================================================

export interface SellerPaymentListItem {
  id: string;
  orderId: string;
  sellerOrderId: string;

  paymentStatus:
    | "PENDING"
    | "PAID"
    | "FAILED"
    | "REFUNDED";

  paymentProvider:
    | string
    | null;

  transactionReference:
    | string
    | null;

  paymentVerifiedAt:
    | Date
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
    | Date
    | null;

  settledAt:
    | Date
    | null;

  failedAt:
    | Date
    | null;

  failureReason:
    | string
    | null;

  customer: {
    fullName: string;
    email: string;
  };

  orderCreatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
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
// PAYMENT LIST RESULT
// ======================================================

export interface SellerPaymentListResult {
  payments:
    SellerPaymentListItem[];

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