import api from "./api";

// ======================================================
// SHARED USER
// ======================================================

export interface User {
  id: string;
  name: string;
  email: string;
}

// ======================================================
// AUTHENTICATION TYPES
// ======================================================

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface VerifyData {
  name: string;
  email: string;
  password: string;
  otp: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface VerifyForgotPasswordOtpData {
  email: string;
  otp: string;
}

export interface ResetPasswordData {
  email: string;
  otp: string;
  newPassword: string;
}

// ======================================================
// SETTINGS TYPES
// ======================================================

export interface UpdateUserProfileData {
  name: string;
}

export interface ChangeUserPasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserResponse {
  success: boolean;
  user: User;
  message?: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
  requiresLogin: boolean;
}

// ======================================================
// REGISTRATION
// ======================================================

export const registerUser = (
  data: RegisterData
) =>
  api.post(
    "/user-registration",
    data
  );

export const verifyUser = (
  data: VerifyData
) =>
  api.post(
    "/verify-user",
    data
  );

// ======================================================
// LOGIN / LOGOUT
// ======================================================

export const loginUser = (
  data: LoginData
) =>
  api.post(
    "/login-user",
    data
  );

export const logoutUser = () =>
  api.post(
    "/logout-user"
  );

// ======================================================
// CURRENT USER
// ======================================================

export const getMe = () =>
  api.get<UserResponse>(
    "/me"
  );

// ======================================================
// FORGOT PASSWORD
// ======================================================

export const forgotPassword = (
  data: ForgotPasswordData
) =>
  api.post(
    "/forgot-password",
    data
  );

export const verifyForgotPasswordOtp =
  (
    data: VerifyForgotPasswordOtpData
  ) =>
    api.post(
      "/verify-forgot-password-otp",
      data
    );

export const resetPassword = (
  data: ResetPasswordData
) =>
  api.post(
    "/reset-password",
    data
  );

// ======================================================
// USER SETTINGS
// ======================================================

export const updateUserProfile =
  (
    data: UpdateUserProfileData
  ) =>
    api.patch<UserResponse>(
      "/user/settings/profile",
      data
    );

export const changeUserPassword =
  (
    data: ChangeUserPasswordData
  ) =>
    api.patch<ChangePasswordResponse>(
      "/user/settings/password",
      data
    );