import {
  NextFunction,
  Request,
  Response,
} from "express";

import jwt from "jsonwebtoken";

import {
  AuthenticationError,
} from "@org/error-handler";

interface AdminTokenPayload {
  id: string;
  role: string;
}

export const isAdminAuthenticated = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined =
      req.cookies
        ?.admin_access_token;

    if (
      !token &&
      req.headers.authorization
        ?.startsWith("Bearer ")
    ) {
      token =
        req.headers.authorization
          .split(" ")[1];
    }

    if (!token) {
      return next(
        new AuthenticationError(
          "Please login as an Admin"
        )
      );
    }

    const secret =
      process.env
        .JWT_ACCESS_SECRET;

    if (!secret) {
      throw new Error(
        "JWT_ACCESS_SECRET is not configured"
      );
    }

    const decoded =
      jwt.verify(
        token,
        secret
      ) as AdminTokenPayload;

    if (
      !decoded.id ||
      decoded.role !== "admin"
    ) {
      return next(
        new AuthenticationError(
          "Invalid Admin access token"
        )
      );
    }

    req.admin = {
      id: decoded.id,
      role: "admin",
    };

    return next();
  } catch {
    return next(
      new AuthenticationError(
        "Invalid or expired Admin access token"
      )
    );
  }
};