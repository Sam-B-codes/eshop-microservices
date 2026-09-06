import api from "./api";

// ======================================================
// LOGIN
// ======================================================

export interface LoginData {
  email: string;
  password: string;
}

export const loginSeller = (
  data: LoginData
) =>
  api.post(
    "/seller-login",
    data
  );

// ======================================================
// CURRENT SELLER
// ======================================================

export interface SellerResponseData {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  country: string;

  shopName: string | null;
  shopBio: string | null;
  shopAddress: string | null;
  website: string | null;
  category: string | null;
  openingHours: string | null;

  bankConnected: boolean;
  isOnboarded: boolean;
}

export interface SellerResponse {
  success: boolean;
  message?: string;
  seller: SellerResponseData;
}

export const getSeller = () =>
  api.get<SellerResponse>(
    "/seller"
  );

// ======================================================
// LOGOUT
// ======================================================

export const logoutSeller = () =>
  api.post(
    "/seller-logout"
  );

// ======================================================
// REGISTRATION
// ======================================================

export interface SellerRegisterData {
  name: string;
  email: string;
  password: string;
  phone_number: string;
  country: string;
}

export interface VerifySellerData {
  name: string;
  email: string;
  password: string;
  phone_number: string;
  country: string;
  otp: string;
}

export const registerSeller = (
  data: SellerRegisterData
) =>
  api.post(
    "/seller-registration",
    data
  );

export const verifySeller = (
  data: VerifySellerData
) =>
  api.post(
    "/verify-seller",
    data
  );

// ======================================================
// FORGOT PASSWORD
// ======================================================

export interface SellerForgotPasswordData {
  email: string;
}

export interface VerifySellerForgotPasswordOtpData {
  email: string;
  otp: string;
}

export interface SellerResetPasswordData {
  email: string;
  newPassword: string;
}

export interface ResetSellerPasswordData {
  email: string;
  otp: string;
  newPassword: string;
}

export const sellerForgotPassword = (
  data: SellerForgotPasswordData
) =>
  api.post(
    "/seller-forgot-password",
    data
  );

export const verifySellerForgotPasswordOtp = (
  data: VerifySellerForgotPasswordOtpData
) =>
  api.post(
    "/verify-seller-forgot-password-otp",
    data
  );

/*
 * Used by the existing
 * SellerResetPassword component.
 */
export const sellerResetPassword = (
  data: SellerResetPasswordData
) =>
  api.post(
    "/seller-reset-password",
    data
  );

/*
 * OTP-based reset API retained
 * for existing/new flows.
 */
export const resetSellerPassword = (
  data: ResetSellerPasswordData
) =>
  api.post(
    "/reset-seller-password",
    data
  );

// ======================================================
// REFRESH SELLER TOKEN
// ======================================================

export const refreshSellerToken = () =>
  api.post(
    "/seller-refresh-token"
  );

// ======================================================
// SELLER ONBOARDING
// ======================================================

export interface SetupSellerShopData {
  shopName: string;
  shopBio: string;
  shopAddress: string;
  website: string;
  category: string;
  openingHours: string;
}

export const setupSellerShop = (
  data: SetupSellerShopData
) =>
  api.post(
    "/seller/setup-shop",
    data
  );

export const connectSellerBank = () =>
  api.post(
    "/seller/connect-bank"
  );

// ======================================================
// SELLER SETTINGS TYPES
// ======================================================

export interface UpdateSellerProfileData {
  name: string;
  phone_number: string;
  country: string;
}

export interface UpdateSellerStoreData {
  shopName: string;
  shopBio: string;
  shopAddress: string;
  website?: string;
  category: string;
  openingHours: string;
}

export interface ChangeSellerPasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface SellerSettingsResponse {
  success: boolean;
  message: string;
  seller: SellerResponseData;
}

export interface SellerPasswordResponse {
  success: boolean;
  message: string;
  requiresLogin: boolean;
}

// ======================================================
// UPDATE SELLER PROFILE
// ======================================================

export const updateSellerProfile = (
  data: UpdateSellerProfileData
) =>
  api.patch<SellerSettingsResponse>(
    "/seller/settings/profile",
    data
  );

// ======================================================
// UPDATE SELLER STORE
// ======================================================

export const updateSellerStore = (
  data: UpdateSellerStoreData
) =>
  api.patch<SellerSettingsResponse>(
    "/seller/settings/store",
    data
  );

// ======================================================
// CHANGE SELLER PASSWORD
// ======================================================

export const changeSellerPassword = (
  data: ChangeSellerPasswordData
) =>
  api.patch<SellerPasswordResponse>(
    "/seller/settings/password",
    data
  );