import {
  type NextFunction,
  type Response,
} from "express";

import jwt from "jsonwebtoken";

import {
  AuthenticationError,
} from "@org/error-handler";

import {
  type ChatActorRole,
  type ChatAuthRequest,
} from "../types/chat.types";

// ======================================================
// JWT PAYLOAD
// ======================================================

interface JwtPayload {
  id?: unknown;
  role?: unknown;
}

// ======================================================
// ROLE COOKIE MAPPING
// ======================================================

const roleCookieNames: Record<
  ChatActorRole,
  string[]
> = {
  user: [
    "user_access_token",
    "access_token",
  ],

  seller: [
    "seller_access_token",
  ],
};

// ======================================================
// NORMALIZE ROLE
// ======================================================

const normalizeRole = (
  value: unknown
): ChatActorRole | null => {
  if (
    typeof value !==
    "string"
  ) {
    return null;
  }

  const normalizedRole =
    value
      .trim()
      .toLowerCase();

  if (
    normalizedRole ===
      "user" ||
    normalizedRole ===
      "seller"
  ) {
    return normalizedRole;
  }

  return null;
};

// ======================================================
// REQUESTED ACTOR ROLE
// ======================================================

const getRequestedRole = (
  req: ChatAuthRequest
): ChatActorRole => {
  const requestedRole =
    normalizeRole(
      req.headers[
        "x-chat-role"
      ]
    );

  if (!requestedRole) {
    throw new AuthenticationError(
      "Chat actor role is required"
    );
  }

  return requestedRole;
};

// ======================================================
// GET ACCESS TOKEN
// ======================================================

const getAccessToken = (
  req: ChatAuthRequest,
  requestedRole:
    ChatActorRole
): string | null => {
  const authorization =
    req.headers
      .authorization;

  if (
    typeof authorization ===
      "string" &&
    authorization
      .toLowerCase()
      .startsWith(
        "bearer "
      )
  ) {
    const token =
      authorization
        .slice(7)
        .trim();

    if (token) {
      return token;
    }
  }

  for (
    const cookieName of
    roleCookieNames[
      requestedRole
    ]
  ) {
    const cookieValue =
      req.cookies?.[
        cookieName
      ];

    if (
      typeof cookieValue ===
        "string" &&
      cookieValue.trim()
    ) {
      return cookieValue.trim();
    }
  }

  return null;
};

// ======================================================
// AUTHENTICATE CHAT ACTOR
// ======================================================

export const isChatAuthenticated = (
  req: ChatAuthRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const requestedRole =
      getRequestedRole(req);

    const token =
      getAccessToken(
        req,
        requestedRole
      );

    if (!token) {
      throw new AuthenticationError(
        `Please login as a ${requestedRole} to access chat`
      );
    }

    const jwtSecret =
      process.env
        .JWT_ACCESS_SECRET;

    if (!jwtSecret) {
      throw new Error(
        "JWT_ACCESS_SECRET is not configured"
      );
    }

    const payload =
      jwt.verify(
        token,
        jwtSecret
      ) as JwtPayload;

    const id =
      typeof payload.id ===
        "string"
        ? payload.id.trim()
        : "";

    const tokenRole =
      normalizeRole(
        payload.role
      );

    if (
      !id ||
      !tokenRole ||
      tokenRole !==
        requestedRole
    ) {
      throw new AuthenticationError(
        "Authentication token does not match the requested chat role"
      );
    }

    req.actor = {
      id,
      role:
        tokenRole,
    };

    return next();
  } catch (error) {
    if (
      error instanceof
      AuthenticationError
    ) {
      return next(error);
    }

    if (
      error instanceof
        jwt.JsonWebTokenError ||
      error instanceof
        jwt.TokenExpiredError
    ) {
      return next(
        new AuthenticationError(
          "Your session is invalid or expired"
        )
      );
    }

    return next(error);
  }
};