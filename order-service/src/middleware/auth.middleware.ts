import {
  type NextFunction,
  type Request,
  type Response,
} from "express";

import jwt from "jsonwebtoken";

import {
  AuthenticationError,
} from "@org/error-handler";

// ======================================================
// AUTHENTICATED ACTOR
// ======================================================

export interface AuthenticatedActor {
  id: string;
  role: string;
}

export interface AuthRequest
  extends Request {
  user?: AuthenticatedActor;
}

type AccountRole =
  | "user"
  | "seller";

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
      "/api/orders/seller"
    )
  ) {
    return "seller";
  }

  return "user";
};

// ======================================================
// EXTRACT ACCESS TOKEN
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
        );

      if (
        typeof decoded !==
          "object" ||
        decoded === null ||
        typeof decoded.id !==
          "string" ||
        !decoded.id.trim() ||
        typeof decoded.role !==
          "string" ||
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
        id: decoded.id.trim(),
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

// ======================================================
// SELLER AUTHORIZATION
// ======================================================

export const isSeller = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return next(
      new AuthenticationError(
        "Please login first"
      )
    );
  }

  if (
    req.user.role !==
    "seller"
  ) {
    return next(
      new AuthenticationError(
        "Seller access required"
      )
    );
  }

  return next();
};