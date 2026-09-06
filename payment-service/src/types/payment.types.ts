// ======================================================
// CREATE RAZORPAY ORDER
// ======================================================

export interface CreatePaymentOrderInput {
  orderId: string;
}

// ======================================================
// RAZORPAY CHECKOUT DATA
// ======================================================

export interface RazorpayCheckoutData {
  keyId: string;

  razorpayOrderId: string;

  amount: number;

  currency: string;

  internalOrderId: string;
}

// ======================================================
// CREATE PAYMENT ORDER RESPONSE
// ======================================================

export interface CreatePaymentOrderResponse {
  success: boolean;

  message: string;

  payment: RazorpayCheckoutData;
}

// ======================================================
// VERIFY RAZORPAY PAYMENT
// ======================================================

export interface VerifyPaymentInput {
  internalOrderId: string;

  razorpayPaymentId: string;

  razorpaySignature: string;
}