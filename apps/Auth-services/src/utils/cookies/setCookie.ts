import {
  type CookieOptions,
  type Response,
} from "express";

// ======================================================
// COOKIE NAMES
// ======================================================

export const AUTH_COOKIES = {
  userAccess:
    "user_access_token",
  userRefresh:
    "user_refresh_token",

  sellerAccess:
    "seller_access_token",
  sellerRefresh:
    "seller_refresh_token",

  adminAccess:
    "admin_access_token",
  adminRefresh:
    "admin_refresh_token",
} as const;

export type AuthCookieName =
  (typeof AUTH_COOKIES)[keyof typeof AUTH_COOKIES];

// ======================================================
// COOKIE OPTIONS
// ======================================================

const getCookieOptions =
  (): CookieOptions => {
    const isProduction =
      process.env.NODE_ENV ===
      "production";

    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction
        ? "none"
        : "lax",
      path: "/",
    };
  };

// ======================================================
// SET COOKIE
// ======================================================

export const setCookie = (
  res: Response,
  name: AuthCookieName,
  value: string
) => {
  const refreshCookies:
    AuthCookieName[] = [
      AUTH_COOKIES.userRefresh,
      AUTH_COOKIES
        .sellerRefresh,
      AUTH_COOKIES.adminRefresh,
    ];

  const isRefreshToken =
    refreshCookies.includes(
      name
    );

  const maxAge = isRefreshToken
    ? 7 * 24 * 60 * 60 * 1000
    : 15 * 60 * 1000;

  res.cookie(
    name,
    value,
    {
      ...getCookieOptions(),
      maxAge,
    }
  );
};

// ======================================================
// CLEAR COOKIE
// ======================================================

export const clearCookie = (
  res: Response,
  name: AuthCookieName
) => {
  res.clearCookie(
    name,
    getCookieOptions()
  );
};

// ======================================================
// CLEAR USER COOKIES
// ======================================================

export const clearUserAuthCookies =
  (res: Response) => {
    clearCookie(
      res,
      AUTH_COOKIES.userAccess
    );

    clearCookie(
      res,
      AUTH_COOKIES.userRefresh
    );
  };

// ======================================================
// CLEAR SELLER COOKIES
// ======================================================

export const clearSellerAuthCookies =
  (res: Response) => {
    clearCookie(
      res,
      AUTH_COOKIES
        .sellerAccess
    );

    clearCookie(
      res,
      AUTH_COOKIES
        .sellerRefresh
    );
  };

// ======================================================
// CLEAR ADMIN COOKIES
// ======================================================

export const clearAdminAuthCookies =
  (res: Response) => {
    clearCookie(
      res,
      AUTH_COOKIES.adminAccess
    );

    clearCookie(
      res,
      AUTH_COOKIES.adminRefresh
    );
  };

// ======================================================
// CLEAR ALL AUTH COOKIES
// BACKWARD COMPATIBILITY
// ======================================================

export const clearAuthCookies =
  (res: Response) => {
    clearUserAuthCookies(res);
    clearSellerAuthCookies(res);
    clearAdminAuthCookies(res);

    // Clear cookies created by the
    // previous implementation.
    const options =
      getCookieOptions();

    res.clearCookie(
      "access_token",
      options
    );

    res.clearCookie(
      "refresh_token",
      options
    );
  };