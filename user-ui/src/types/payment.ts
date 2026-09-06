// ======================================================
// CREATE RAZORPAY PAYMENT ORDER
// ======================================================

export interface CreatePaymentOrderData {
  orderId: string;
}

// ======================================================
// PAYMENT CHECKOUT DATA
// ======================================================

export interface PaymentCheckoutData {
  internalOrderId: string;

  razorpayOrderId: string;

  amount: number;

  currency: string;

  keyId: string;
}

// ======================================================
// CREATE PAYMENT ORDER RESPONSE
// ======================================================

export interface CreatePaymentOrderResponse {
  success: boolean;

  message: string;

  payment: PaymentCheckoutData;
}

// ======================================================
// RAZORPAY CHECKOUT SUCCESS RESPONSE
//
// These values are returned by Razorpay Checkout after
// the customer completes the simulated/real payment.
// ======================================================

export interface RazorpayPaymentSuccessResponse {
  razorpay_payment_id: string;

  razorpay_order_id: string;

  razorpay_signature: string;
}

// ======================================================
// VERIFY PAYMENT REQUEST
// ======================================================

export interface VerifyPaymentData {
  internalOrderId: string;

  razorpayPaymentId: string;

  razorpaySignature: string;
}

// ======================================================
// VERIFIED ORDER
// ======================================================

export interface VerifiedPaymentOrder {
  id: string;

  status: string;

  paymentStatus: string;

  subtotal: number;

  discount: number;

  shippingAmount: number;

  totalAmount: number;

  paymentProvider?: string | null;

  paymentOrderId?: string | null;

  paymentId?: string | null;
}

// ======================================================
// VERIFY PAYMENT RESPONSE
// ======================================================

export interface VerifyPaymentResponse {
  success: boolean;

  message: string;

  verified: boolean;

  alreadyProcessed: boolean;

  order: VerifiedPaymentOrder;
}

// ======================================================
// RAZORPAY CHECKOUT OPTIONS
// ======================================================

export interface RazorpayCheckoutOptions {
  key: string;

  amount: number;

  currency: string;

  name: string;

  description: string;

  order_id: string;

  handler: (
    response: RazorpayPaymentSuccessResponse
  ) => void | Promise<void>;

  prefill?: {
    name?: string;

    email?: string;

    contact?: string;
  };

  notes?: {
    internalOrderId?: string;
  };

  theme?: {
    color?: string;
  };

  modal?: {
    ondismiss?: () => void;
  };
}

// ======================================================
// RAZORPAY CHECKOUT INSTANCE
// ======================================================

export interface RazorpayCheckoutInstance {
  open: () => void;

  close: () => void;

  on: (
    event: string,
    callback: (response: unknown) => void
  ) => void;
}

// ======================================================
// WINDOW RAZORPAY CONSTRUCTOR
// ======================================================

export interface RazorpayConstructor {
  new (
    options: RazorpayCheckoutOptions
  ): RazorpayCheckoutInstance;
}

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

export {};