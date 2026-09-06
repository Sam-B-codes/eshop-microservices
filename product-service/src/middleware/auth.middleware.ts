import {
  type NextFunction,
  type Request,
  type Response,
} from "express";

import jwt from "jsonwebtoken";

import {
  AuthenticationError,
} from "@org/error-handler";

export interface AuthRequest
  extends Request {
  user?: {
    id: string;
    role: string;
  };
}

interface TokenPayload {
  id: string;
  role: string;
}

// ======================================================
// EXPECTED ROLE FROM ROUTE
// ======================================================

const getExpectedRole = (
  req: Request
): "user" | "seller" => {
  const requestPath =
    req.originalUrl ||
    req.url ||
    "";

  const sellerRoute =
    requestPath.startsWith(
      "/api/products"
    ) ||
    requestPath.startsWith(
      "/api/upload"
    ) ||
    requestPath.startsWith(
      "/api/seller/dashboard"
    ) ||
    requestPath.startsWith(
      "/api/reviews/seller"
    );

  return sellerRoute
    ? "seller"
    : "user";
};

// ======================================================
// GET ACCESS TOKEN
// ======================================================

const getAccessToken = (
  req: Request,
  expectedRole:
    | "user"
    | "seller"
): string | undefined => {
  const cookieName =
    expectedRole === "seller"
      ? "seller_access_token"
      : "user_access_token";

  const cookieToken =
    req.cookies?.[cookieName];

  if (
    typeof cookieToken ===
      "string" &&
    cookieToken
  ) {
    return cookieToken;
  }

  const authorization =
    req.headers.authorization;

  if (
    authorization?.startsWith(
      "Bearer "
    )
  ) {
    const bearerToken =
      authorization
        .slice(7)
        .trim();

    return (
      bearerToken ||
      undefined
    );
  }

  return undefined;
};

// ======================================================
// AUTHENTICATION
// ======================================================

export const isAuthenticated =
  (
    req: AuthRequest,
    _res: Response,
    next: NextFunction
  ) => {
    try {
      const expectedRole =
        getExpectedRole(req);

      const token =
        getAccessToken(
          req,
          expectedRole
        );

      if (!token) {
        return next(
          new AuthenticationError(
            "Please login first"
          )
        );
      }

      const accessSecret =
        process.env
          .JWT_ACCESS_SECRET;

      if (!accessSecret) {
        console.error(
          "JWT_ACCESS_SECRET is not configured"
        );

        return next(
          new AuthenticationError(
            "Authentication configuration error"
          )
        );
      }

      const decoded =
        jwt.verify(
          token,
          accessSecret
        ) as TokenPayload;

      if (
        !decoded.id ||
        decoded.role !==
          expectedRole
      ) {
        return next(
          new AuthenticationError(
            "Invalid account role"
          )
        );
      }

      req.user = {
        id: decoded.id,
        role: decoded.role,
      };

      return next();
    } catch {
      return next(
        new AuthenticationError(
          "Invalid or expired access token"
        )
      );
    }
  };