export type SettlementStatus =
  | "PENDING"
  | "PROCESSING"
  | "SETTLED"
  | "FAILED";

export interface AdminPaymentSummary {
  totalTransactions: number;
  pendingTransactions: number;
  processingTransactions: number;
  settledTransactions: number;
  failedTransactions: number;
  grossAmount: number;
  totalDiscounts: number;
  netAmount: number;
  platformFees: number;
  sellerEarnings: number;
  pendingEarnings: number;
  settledEarnings: number;
}

export interface AdminPayment {
  id: string;
  orderId: string;
  sellerOrderId: string;
  sellerId: string;

  sellerName: string;
  shopName: string | null;
  sellerEmail: string;

  currency: string;
  paymentProvider: string | null;
  transactionReference: string | null;
  paymentVerifiedAt: string | null;

  grossAmount: number;
  discountAmount: number;
  netAmount: number;
  platformFeeRate: number;
  platformFee: number;
  sellerEarnings: number;

  status: SettlementStatus;

  processingAt: string | null;
  settledAt: string | null;
  failedAt: string | null;
  failureReason: string | null;

  orderCreatedAt: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminPaymentPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface AdminPaymentsResponse {
  success: boolean;
  message: string;
  payments: AdminPayment[];
  pagination: AdminPaymentPagination;
}

export interface AdminPaymentSummaryResponse {
  success: boolean;
  message: string;
  summary: AdminPaymentSummary;
}

export interface GetAdminPaymentsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: SettlementStatus;
}

export interface UpdateSettlementStatusData {
  status: SettlementStatus;
  failureReason?: string;
}