import crypto from "crypto";

import {
  type NextFunction,
  type Request,
  type Response,
} from "express";

import {
  AuthenticationError,
} from "@org/error-handler";

// ======================================================
// CONSTANT-TIME COMPARISON
// ======================================================

const secretsMatch = (
  receivedSecret: string,
  expectedSecret: string
): boolean => {
  const receivedBuffer =
    Buffer.from(
      receivedSecret,
      "utf8"
    );

  const expectedBuffer =
    Buffer.from(
      expectedSecret,
      "utf8"
    );

  if (
    receivedBuffer.length !==
    expectedBuffer.length
  ) {
    return false;
  }

  return crypto.timingSafeEqual(
    receivedBuffer,
    expectedBuffer
  );
};

// ======================================================
// INTERNAL SERVICE AUTHENTICATION
// ======================================================

export const authenticateInternalService =
  (
    req: Request,
    _res: Response,
    next: NextFunction
  ) => {
    const expectedSecret =
      process.env
        .INTERNAL_SERVICE_SECRET
        ?.trim();

    if (!expectedSecret) {
      console.error(
        "INTERNAL_SERVICE_SECRET is not configured"
      );

      return next(
        new Error(
          "Internal service authentication is not configured"
        )
      );
    }

    const rawHeader =
      req.headers[
        "x-internal-api-key"
      ];

    const receivedSecret =
      Array.isArray(rawHeader)
        ? rawHeader[0]
        : rawHeader;

    if (
      typeof receivedSecret !==
        "string" ||
      !receivedSecret.trim() ||
      !secretsMatch(
        receivedSecret.trim(),
        expectedSecret
      )
    ) {
      return next(
        new AuthenticationError(
          "Invalid internal service credentials"
        )
      );
    }

    return next();
  };