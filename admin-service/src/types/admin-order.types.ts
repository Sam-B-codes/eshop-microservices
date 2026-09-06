import { OrderStatus, PaymentStatus } from "@prisma/client";

export interface AdminOrderListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
}

export interface AdminOrderSummary {
  id: string;
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  itemCount: number;
  sellerCount: number;
  paymentProvider: string | null;
  paymentId: string | null;
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

export interface AdminOrderListResponse {
  success: true;
  message: string;
  orders: AdminOrderSummary[];
  pagination: AdminOrderPagination;
}
