import { NextFunction, Response } from "express";

import { SettlementStatus } from "@prisma/client";

import { BadRequestError } from "@org/error-handler";

import { AdminRequest } from "../middleware/admin-auth.middleware";

import {
  getAdminPayments,
  getAdminPaymentSummary,
  updateAdminSettlementStatus,
} from "../services/admin-payment.service";

const parsePositiveInteger = (value: unknown, fallback: number): number => {
  if (typeof value !== "string") {
    return fallback;
  }

  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

export const getAdminPaymentSummaryController = async (
  _req: AdminRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const summary = await getAdminPaymentSummary();

    return res.status(200).json({
      success: true,
      message: "Admin payment summary fetched successfully",
      summary,
    });
  } catch (error) {
    return next(error);
  }
};

export const getAdminPaymentsController = async (
  req: AdminRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const statusValue =
      typeof req.query.status === "string" ? req.query.status : undefined;

    const statuses: SettlementStatus[] = [
      "PENDING",
      "PROCESSING",
      "SETTLED",
      "FAILED",
    ];

    let status: SettlementStatus | undefined;

    if (statusValue) {
      if (!statuses.includes(statusValue as SettlementStatus)) {
        return next(new BadRequestError("Invalid settlement status"));
      }

      status = statusValue as SettlementStatus;
    }

    const response = await getAdminPayments({
      page: parsePositiveInteger(req.query.page, 1),

      limit: parsePositiveInteger(req.query.limit, 10),

      search:
        typeof req.query.search === "string" ? req.query.search : undefined,

      status,
    });

    return res.status(200).json(response);
  } catch (error) {
    return next(error);
  }
};

export const updateAdminSettlementStatusController = async (
  req: AdminRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const idValue = req.params.settlementId;

    const settlementId = Array.isArray(idValue) ? idValue[0] : idValue;

    if (!settlementId) {
      return next(new BadRequestError("Settlement ID is required"));
    }

    const status: unknown = req.body?.status;

    if (
      status !== "PENDING" &&
      status !== "PROCESSING" &&
      status !== "SETTLED" &&
      status !== "FAILED"
    ) {
      return next(new BadRequestError("Invalid settlement status"));
    }

    const failureReason =
      typeof req.body?.failureReason === "string"
        ? req.body.failureReason
        : undefined;

    const response = await updateAdminSettlementStatus(
      settlementId,
      status,
      failureReason,
    );

    return res.status(200).json(response);
  } catch (error) {
    return next(error);
  }
};
