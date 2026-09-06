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

type AccountRole =
  | "user"
  | "seller";

interface TokenPayload {
  id: string;
  role: string;
}

// ======================================================
// EXPECTED ROLE
// ======================================================

const getExpectedRole = (
  req: Request
): AccountRole => {
  const requestPath =
    req.originalUrl ||
    req.url ||
    "";

  if (
    requestPath.startsWith(
      "/api/payments/seller"
    )
  ) {
    return "seller";
  }

  return "user";
};

// ======================================================
// GET ACCESS TOKEN
// ======================================================

const getAccessToken = (
  req: Request,
  expectedRole: AccountRole
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
    cookieToken.trim()
  ) {
    return cookieToken.trim();
  }

  const authorization =
    req.headers.authorization;

  if (
    typeof authorization ===
      "string" &&
    authorization.startsWith(
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