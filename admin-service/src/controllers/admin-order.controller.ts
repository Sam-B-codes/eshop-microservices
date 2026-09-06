import { NextFunction, Response } from "express";

import { OrderStatus, PaymentStatus } from "@prisma/client";

import { BadRequestError } from "@org/error-handler";

import { AdminRequest } from "../middleware/admin-auth.middleware";

import {
  getAdminOrderById,
  getAdminOrders,
} from "../services/admin-order.service";

const parsePositiveInteger = (value: unknown, fallback: number): number => {
  if (typeof value !== "string") {
    return fallback;
  }

  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

export const getAdminOrdersController = async (
  req: AdminRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const statusValue =
      typeof req.query.status === "string" ? req.query.status : undefined;

    const paymentValue =
      typeof req.query.paymentStatus === "string"
        ? req.query.paymentStatus
        : undefined;

    const orderStatuses: OrderStatus[] = [
      "PENDING_PAYMENT",
      "CONFIRMED",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ];

    const paymentStatuses: PaymentStatus[] = [
      "PENDING",
      "PAID",
      "FAILED",
      "REFUNDED",
    ];

    let status: OrderStatus | undefined;

    let paymentStatus: PaymentStatus | undefined;

    if (statusValue) {
      if (!orderStatuses.includes(statusValue as OrderStatus)) {
        return next(new BadRequestError("Invalid order status"));
      }

      status = statusValue as OrderStatus;
    }

    if (paymentValue) {
      if (!paymentStatuses.includes(paymentValue as PaymentStatus)) {
        return next(new BadRequestError("Invalid payment status"));
      }

      paymentStatus = paymentValue as PaymentStatus;
    }

    const response = await getAdminOrders({
      page: parsePositiveInteger(req.query.page, 1),

      limit: parsePositiveInteger(req.query.limit, 10),

      search:
        typeof req.query.search === "string" ? req.query.search : undefined,

      status,
      paymentStatus,
    });

    return res.status(200).json(response);
  } catch (error) {
    return next(error);
  }
};

export const getAdminOrderByIdController = async (
  req: AdminRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const orderIdValue = req.params.orderId;

    const orderId = Array.isArray(orderIdValue)
      ? orderIdValue[0]
      : orderIdValue;

    if (!orderId) {
      return next(new BadRequestError("Order ID is required"));
    }

    const response = await getAdminOrderById(orderId);

    return res.status(200).json(response);
  } catch (error) {
    return next(error);
  }
};
