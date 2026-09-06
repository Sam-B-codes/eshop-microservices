import {
  NextFunction,
  Request,
  Response,
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

interface JwtPayload {
  id: string;
  role: string;
}

// ======================================================
// GET ACCESS TOKEN
// ======================================================

const getAccessToken = (
  req: Request
): string | undefined => {
  const requestPath =
    req.originalUrl ||
    req.url ||
    "";

  if (
    requestPath.startsWith(
      "/api/seller"
    )
  ) {
    return req.cookies
      ?.seller_access_token;
  }

  if (
    requestPath.startsWith(
      "/api/admin"
    )
  ) {
    return req.cookies
      ?.admin_access_token;
  }

  const userToken =
    req.cookies
      ?.user_access_token;

  if (userToken) {
    return userToken;
  }

  const authorization =
    req.headers.authorization;

  if (
    authorization?.startsWith(
      "Bearer "
    )
  ) {
    return authorization
      .slice(7)
      .trim();
  }

  return undefined;
};

// ======================================================
// AUTHENTICATION MIDDLEWARE
// ======================================================

export const isAuthenticated = (
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
      ) as JwtPayload;

    if (
      !decoded.id ||
      !decoded.role
    ) {
      return next(
        new AuthenticationError(
          "Invalid access token"
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