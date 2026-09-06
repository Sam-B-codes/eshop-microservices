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
  OrderStatus,
  PaymentStatus,
  UserOrderListQuery,
} from "../types/order.types";

import {
  getUserOrderById,
  getUserOrders,
} from "../services/user-order.service";

// ======================================================
// ALLOWED STATUSES
// ======================================================

const ORDER_STATUSES: OrderStatus[] = [
  "PENDING_PAYMENT",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const PAYMENT_STATUSES: PaymentStatus[] = [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
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

    return normalizedValue ||
      undefined;
  }

  if (
    Array.isArray(value) &&
    typeof value[0] ===
      "string"
  ) {
    const normalizedValue =
      value[0].trim();

    return normalizedValue ||
      undefined;
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
// PARSE ORDER STATUS
// ======================================================

const parseOrderStatus = (
  value: unknown
): OrderStatus | undefined => {
  const normalizedValue =
    getQueryValue(value)
      ?.toUpperCase();

  if (!normalizedValue) {
    return undefined;
  }

  if (
    !ORDER_STATUSES.includes(
      normalizedValue as
        OrderStatus
    )
  ) {
    throw new BadRequestError(
      "Invalid order status"
    );
  }

  return normalizedValue as
    OrderStatus;
};

// ======================================================
// PARSE PAYMENT STATUS
// ======================================================

const parsePaymentStatus = (
  value: unknown
): PaymentStatus | undefined => {
  const normalizedValue =
    getQueryValue(value)
      ?.toUpperCase();

  if (!normalizedValue) {
    return undefined;
  }

  if (
    !PAYMENT_STATUSES.includes(
      normalizedValue as
        PaymentStatus
    )
  ) {
    throw new BadRequestError(
      "Invalid payment status"
    );
  }

  return normalizedValue as
    PaymentStatus;
};

// ======================================================
// GET AUTHENTICATED USER ID
// ======================================================

const getAuthenticatedUserId = (
  req: AuthRequest
): string => {
  const userId =
    req.user?.id;

  if (!userId) {
    throw new BadRequestError(
      "Authenticated user is required"
    );
  }

  return userId;
};

// ======================================================
// GET ORDER ID
// ======================================================

const getOrderId = (
  req: AuthRequest
): string => {
  const rawOrderId =
    req.params.orderId;

  const orderId =
    Array.isArray(
      rawOrderId
    )
      ? rawOrderId[0]
      : rawOrderId;

  if (
    !orderId ||
    !orderId.trim()
  ) {
    throw new BadRequestError(
      "Order ID is required"
    );
  }

  return orderId.trim();
};

// ======================================================
// GET AUTHENTICATED USER ORDERS
// ======================================================

export const getUserOrdersController =
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const query: UserOrderListQuery = {
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
          parseOrderStatus(
            req.query.status
          ),

        paymentStatus:
          parsePaymentStatus(
            req.query.paymentStatus
          ),
      };

      const result =
        await getUserOrders(
          getAuthenticatedUserId(
            req
          ),
          query
        );

      return res
        .status(200)
        .json({
          success: true,

          message:
            "Orders fetched successfully",

          ...result,
        });
    } catch (error) {
      return next(error);
    }
  };

// ======================================================
// GET AUTHENTICATED USER ORDER BY ID
// ======================================================

export const getUserOrderByIdController =
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const order =
        await getUserOrderById(
          getAuthenticatedUserId(
            req
          ),
          getOrderId(req)
        );

      return res
        .status(200)
        .json({
          success: true,

          message:
            "Order fetched successfully",

          order,
        });
    } catch (error) {
      return next(error);
    }
  };