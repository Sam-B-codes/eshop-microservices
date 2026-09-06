import { SettlementStatus } from "@prisma/client";

export interface AdminPaymentListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: SettlementStatus;
}

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

export interface AdminPaymentItem {
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
  createdAt: string;
  updatedAt: string;
}

export interface AdminPaymentPagination {
  page: number;
  limit: number;
  totalPayments: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface AdminPaymentListResponse {
  success: true;
  message: string;
  payments: AdminPaymentItem[];
  pagination: AdminPaymentPagination;
}

export interface UpdateSettlementStatusInput {
  status: SettlementStatus;
  failureReason?: string;
}
