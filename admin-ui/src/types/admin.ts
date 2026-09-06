export type AdminRole =
  | "ADMIN"
  | "SUPER_ADMIN";

export type AdminStatus =
  | "ACTIVE"
  | "DISABLED";

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: AdminStatus;
  lastLoginAt:
    | string
    | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminLoginData {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  success: boolean;
  message: string;
  admin: Admin;
}

export interface GetAdminResponse {
  success: boolean;
  admin: Admin;
}

export interface AdminLogoutResponse {
  success: boolean;
  message: string;
}