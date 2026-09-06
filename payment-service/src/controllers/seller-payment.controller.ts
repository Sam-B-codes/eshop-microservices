import {
  NextFunction,
  Response,
} from "express";

import {
  BadRequestError,
} from "@org/error-handler";

import {
  AuthRequest,
} from "../middleware/auth.middleware";

import {
  SettlementStatus,
  SellerPaymentListQuery,
} from "../types/seller-payment.types";

import {
  getSellerPayments,
  getSellerPaymentSummary,
} from "../services/seller-payment.service";

// ======================================================
// ALLOWED SETTLEMENT STATUSES
// ======================================================

const SETTLEMENT_STATUSES:
  SettlementStatus[] = [
    "PENDING",
    "PROCESSING",
    "SETTLED",
    "FAILED",
  ];

// ======================================================
// GET QUERY VALUE
// ======================================================

const getQueryValue = (
  value: unknown
): string | undefined => {
  if (
    typeof value === "string"
  ) {
    const normalizedValue =
      value.trim();

    return (
      normalizedValue ||
      undefined
    );
  }

  if (
    Array.isArray(value) &&
    typeof value[0] ===
      "string"
  ) {
    const normalizedValue =
      value[0].trim();

    return (
      normalizedValue ||
      undefined
    );
  }

  return undefined;
};

// ======================================================
// PARSE POSITIVE INTEGER
// ======================================================

const parsePositiveInteger = (
  value: unknown,
  fieldName: string
): number | undefined => {
  const normalizedValue =
    getQueryValue(value);

  if (!normalizedValue) {
    return undefined;
  }

  const parsedValue =
    Number(normalizedValue);

  if (
    !Number.isInteger(
      parsedValue
    ) ||
    parsedValue < 1
  ) {
    throw new BadRequestError(
      `${fieldName} must be a positive integer`
    );
  }

  return parsedValue;
};

// ======================================================
// PARSE SETTLEMENT STATUS
// ======================================================

const parseSettlementStatus = (
  value: unknown
): SettlementStatus | undefined => {
  const normalizedValue =
    getQueryValue(value)
      ?.toUpperCase();

  if (!normalizedValue) {
    return undefined;
  }

  if (
    !SETTLEMENT_STATUSES.includes(
      normalizedValue as SettlementStatus
    )
  ) {
    throw new BadRequestError(
      "Invalid settlement status"
    );
  }

  return normalizedValue as SettlementStatus;
};

// ======================================================
// GET SELLER PAYMENTS
// ======================================================

export const getSellerPaymentsController =
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const sellerId =
        req.user?.id;

      if (!sellerId) {
        throw new BadRequestError(
          "Authenticated seller is required"
        );
      }

      const query:
        SellerPaymentListQuery = {
          page:
            parsePositiveInteger(
              req.query.page,
              "Page"
            ),

          limit:
            parsePositiveInteger(
              req.query.limit,
              "Limit"
            ),

          search:
            getQueryValue(
              req.query.search
            ),

          status:
            parseSettlementStatus(
              req.query.status
            ),
        };

      const result =
        await getSellerPayments(
          sellerId,
          query
        );

      return res
        .status(200)
        .json({
          success: true,

          message:
            "Seller payments fetched successfully",

          ...result,
        });
    } catch (error) {
      return next(error);
    }
  };

// ======================================================
// GET SELLER PAYMENT SUMMARY
// ======================================================

export const getSellerPaymentSummaryController =
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const sellerId =
        req.user?.id;

      if (!sellerId) {
        throw new BadRequestError(
          "Authenticated seller is required"
        );
      }

      const summary =
        await getSellerPaymentSummary(
          sellerId
        );

      return res
        .status(200)
        .json({
          success: true,

          message:
            "Seller payment summary fetched successfully",

          summary,
        });
    } catch (error) {
      return next(error);
    }
  };