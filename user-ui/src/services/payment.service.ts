import api from "./api";

import {
  CreatePaymentOrderData,
  CreatePaymentOrderResponse,
  VerifyPaymentData,
  VerifyPaymentResponse,
} from "@/types/payment";

// ======================================================
// CREATE / REUSE RAZORPAY PAYMENT ORDER
// ======================================================

export const createPaymentOrder =
  async (
    data: CreatePaymentOrderData
  ): Promise<CreatePaymentOrderResponse> => {
    const response =
      await api.post<CreatePaymentOrderResponse>(
        "/payments/create-order",
        {
          orderId:
            data.orderId.trim(),
        }
      );

    return response.data;
  };

// ======================================================
// VERIFY RAZORPAY PAYMENT
// ======================================================

export const verifyPayment =
  async (
    data: VerifyPaymentData
  ): Promise<VerifyPaymentResponse> => {
    const response =
      await api.post<VerifyPaymentResponse>(
        "/payments/verify",
        {
          internalOrderId:
            data.internalOrderId.trim(),

          razorpayPaymentId:
            data.razorpayPaymentId.trim(),

          razorpaySignature:
            data.razorpaySignature.trim(),
        }
      );

    return response.data;
  };