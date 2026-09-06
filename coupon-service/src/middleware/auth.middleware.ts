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
// GET SELLER ACCESS TOKEN
// ======================================================

const getAccessToken = (
  req: Request
): string | undefined => {
  const cookieToken =
    req.cookies
      ?.seller_access_token;

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
      const token =
        getAccessToken(req);

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
          "seller"
      ) {
        return next(
          new AuthenticationError(
            "Seller access required"
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