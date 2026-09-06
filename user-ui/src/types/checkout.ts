// ======================================================
// CHECKOUT CONTACT
// ======================================================

export interface CheckoutContact {
  email: string;
  phone: string;
}

// ======================================================
// SHIPPING ADDRESS
// ======================================================

export interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// ======================================================
// CHECKOUT FORM
// ======================================================

export interface CheckoutFormValues {
  email: string;
  phone: string;

  fullName: string;
  addressLine1: string;
  addressLine2: string;

  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// ======================================================
// CHECKOUT VALIDATION ERRORS
// ======================================================

export type CheckoutFormErrors = Partial<
  Record<keyof CheckoutFormValues, string>
>;

// ======================================================
// PUBLIC COUPON
// ======================================================

export interface PublicCoupon {
  id: string;
  sellerId: string;

  code: string;
  description?: string | null;

  discountType:
    | "PERCENTAGE"
    | "FIXED";

  discountValue: number;

  minimumOrderValue?: number | null;
  maximumDiscount?: number | null;

  expiryDate: string;

  remainingUses?: number | null;
}

export interface PublicCouponsResponse {
  success: boolean;
  coupons: PublicCoupon[];
}

// ======================================================
// COUPON VALIDATION
// ======================================================

export interface ValidateCouponData {
  code: string;
  sellerId: string;
  orderAmount: number;
}

export interface AppliedCoupon {
  id: string;
  sellerId: string;
  code: string;

  discountType:
    | "PERCENTAGE"
    | "FIXED";

  discountValue: number;
}

export interface ValidateCouponResponse {
  success: boolean;
  message: string;

  coupon: AppliedCoupon;

  discount: number;
  finalAmount: number;
}