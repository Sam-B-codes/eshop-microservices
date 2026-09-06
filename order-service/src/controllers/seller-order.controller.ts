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
  PaymentStatus,
  SellerOrderListQuery,
  SellerOrderStatus,
} from "../types/order.types";

import {
  getSellerOrderDetails,
  getSellerOrders,
  getSellerRevenueSummary,
  updateSellerOrderStatus,
} from "../services/seller-order.service";

// ======================================================
// QUERY VALUE
// ======================================================

const getQueryValue = (
  value: unknown
): string | undefined => {
  if (typeof value === "string") {
    return value.trim() || undefined;
  }

  if (
    Array.isArray(value) &&
    typeof value[0] === "string"
  ) {
    return value[0].trim() || undefined;
  }

  return undefined;
};

// ======================================================
// POSITIVE INTEGER
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
    !Number.isInteger(parsedValue) ||
    parsedValue < 1
  ) {
    throw new BadRequestError(
      `${fieldName} must be a positive integer`
    );
  }

  return parsedValue;
};

// ======================================================
// SELLER STATUS
// ======================================================

const SELLER_STATUSES: SellerOrderStatus[] = [
  "PENDING_PAYMENT",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const parseSellerStatus = (
  value: unknown
): SellerOrderStatus | undefined => {
  const normalizedValue =
    getQueryValue(value);

  if (!normalizedValue) {
    return undefined;
  }

  const status =
    normalizedValue.toUpperCase() as
      SellerOrderStatus;

  if (
    !SELLER_STATUSES.includes(
      status
    )
  ) {
    throw new BadRequestError(
      "Invalid seller order status"
    );
  }

  return status;
};

// ======================================================
// PAYMENT STATUS
// ======================================================

const PAYMENT_STATUSES: PaymentStatus[] = [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
];

const parsePaymentStatus = (
  value: unknown
): PaymentStatus | undefined => {
  const normalizedValue =
    getQueryValue(value);

  if (!normalizedValue) {
    return undefined;
  }

  const status =
    normalizedValue.toUpperCase() as
      PaymentStatus;

  if (
    !PAYMENT_STATUSES.includes(
      status
    )
  ) {
    throw new BadRequestError(
      "Invalid payment status"
    );
  }

  return status;
};

// ======================================================
// DATE
// ======================================================

const parseDate = (
  value: unknown,
  fieldName: string
): Date | undefined => {
  const normalizedValue =
    getQueryValue(value);

  if (!normalizedValue) {
    return undefined;
  }

  const date =
    new Date(normalizedValue);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    throw new BadRequestError(
      `${fieldName} must be a valid date`
    );
  }

  return date;
};

// ======================================================
// ORDER ID
// ======================================================

const getOrderId = (
  req: AuthRequest
): string => {
  const rawOrderId =
    req.params.orderId;

  const orderId =
    Array.isArray(rawOrderId)
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
// SELLER ID
// ======================================================

const getSellerId = (
  req: AuthRequest
): string => {
  const sellerId =
    req.user?.id;

  if (!sellerId) {
    throw new BadRequestError(
      "Authenticated seller is required"
    );
  }

  return sellerId;
};

// ======================================================
// GET SELLER ORDERS
// ======================================================

export const getSellerOrdersController =
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const query: SellerOrderListQuery = {
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
          parseSellerStatus(
            req.query.status
          ),

        paymentStatus:
          parsePaymentStatus(
            req.query.paymentStatus
          ),
      };

      const result =
        await getSellerOrders(
          getSellerId(req),
          query
        );

      return res.status(200).json({
        success: true,
        message:
          "Seller orders fetched successfully",
        ...result,
      });
    } catch (error) {
      return next(error);
    }
  };

// ======================================================
// GET SELLER ORDER DETAILS
// ======================================================

export const getSellerOrderDetailsController =
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const order =
        await getSellerOrderDetails(
          getSellerId(req),
          getOrderId(req)
        );

      return res.status(200).json({
        success: true,
        message:
          "Seller order fetched successfully",
        order,
      });
    } catch (error) {
      return next(error);
    }
  };

// ======================================================
// UPDATE SELLER ORDER STATUS
// ======================================================

export const updateSellerOrderStatusController =
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const requestedStatus =
        typeof req.body?.status ===
        "string"
          ? req.body.status
              .trim()
              .toUpperCase()
          : "";

      const allowedStatuses = [
        "PROCESSING",
        "SHIPPED",
        "DELIVERED",
      ] as const;

      type AllowedStatus =
        (typeof allowedStatuses)[number];

      if (
        !allowedStatuses.includes(
          requestedStatus as
            AllowedStatus
        )
      ) {
        throw new BadRequestError(
          "Status must be PROCESSING, SHIPPED, or DELIVERED"
        );
      }

      const sellerOrder =
        await updateSellerOrderStatus(
          getSellerId(req),
          getOrderId(req),
          {
            status:
              requestedStatus as
                AllowedStatus,

            trackingNumber:
              req.body
                ?.trackingNumber,

            shippingCarrier:
              req.body
                ?.shippingCarrier,
          }
        );

      return res.status(200).json({
        success: true,
        message:
          "Seller order status updated successfully",
        sellerOrder,
      });
    } catch (error) {
      return next(error);
    }
  };

// ======================================================
// GET SELLER REVENUE SUMMARY
// ======================================================

export const getSellerRevenueSummaryController =
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const from =
        parseDate(
          req.query.from,
          "From"
        );

      const to =
        parseDate(
          req.query.to,
          "To"
        );

      if (
        from &&
        to &&
        from > to
      ) {
        throw new BadRequestError(
          "From date cannot be after to date"
        );
      }

      const summary =
        await getSellerRevenueSummary(
          getSellerId(req),
          {
            from,
            to,
          }
        );

      return res.status(200).json({
        success: true,
        message:
          "Seller revenue summary fetched successfully",
        summary,
      });
    } catch (error) {
      return next(error);
    }
  };