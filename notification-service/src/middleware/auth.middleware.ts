import {
  type NextFunction,
  type Response,
} from "express";

import jwt from "jsonwebtoken";

import {
  AuthenticationError,
} from "@org/error-handler";

import {
  type NotificationActorRole,
  type NotificationAuthRequest,
  type NotificationJwtPayload,
} from "../types/notification.types";

// ======================================================
// COOKIE NAMES
// ======================================================

const ROLE_COOKIE_NAMES: Record<
  NotificationActorRole,
  string
> = {
  user:
    "user_access_token",

  seller:
    "seller_access_token",

  admin:
    "admin_access_token",
};

// ======================================================
// EXTRACT TOKEN
// ======================================================

const getAccessToken = (
  req: NotificationAuthRequest,
  expectedRole: NotificationActorRole
): string | undefined => {
  const cookieName =
    ROLE_COOKIE_NAMES[
      expectedRole
    ];

  const cookieToken =
    req.cookies?.[
      cookieName
    ];

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
// AUTHENTICATE ACTOR
// ======================================================

export const authenticateActor =
  (
    expectedRole:
      NotificationActorRole
  ) =>
  (
    req:
      NotificationAuthRequest,

    _res: Response,

    next: NextFunction
  ) => {
    try {
      const token =
        getAccessToken(
          req,
          expectedRole
        );

      if (!token) {
        return next(
          new AuthenticationError(
            `Please login as a${expectedRole === "admin" ? "n" : ""} ${expectedRole}`
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
          new Error(
            "Authentication configuration error"
          )
        );
      }

      const decoded =
        jwt.verify(
          token,
          accessSecret
        ) as NotificationJwtPayload;

      if (
        typeof decoded !==
          "object" ||
        decoded === null ||
        typeof decoded.id !==
          "string" ||
        !decoded.id.trim() ||
        decoded.role !==
          expectedRole
      ) {
        return next(
          new AuthenticationError(
            `Invalid ${expectedRole} access token`
          )
        );
      }

      req.actor = {
        id:
          decoded.id.trim(),

        role:
          expectedRole,
      };

      return next();
    } catch {
      return next(
        new AuthenticationError(
          `Invalid or expired ${expectedRole} access token`
        )
      );
    }
  };