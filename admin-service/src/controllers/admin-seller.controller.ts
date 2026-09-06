import { NextFunction, Response } from "express";

import { SellerStatus } from "@prisma/client";

import { BadRequestError } from "@org/error-handler";

import { AdminRequest } from "../middleware/admin-auth.middleware";

import {
  getAdminSellers,
  updateAdminSellerStatus,
} from "../services/admin-seller.service";

const parsePositiveInteger = (value: unknown, fallback: number): number => {
  if (typeof value !== "string") {
    return fallback;
  }

  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

export const getAdminSellersController = async (
  req: AdminRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const statusValue =
      typeof req.query.status === "string" ? req.query.status : undefined;

    const onboardingValue =
      typeof req.query.onboarding === "string"
        ? req.query.onboarding
        : undefined;

    let status: SellerStatus | undefined;

    if (statusValue) {
      if (statusValue !== "ACTIVE" && statusValue !== "SUSPENDED") {
        return next(new BadRequestError("Invalid seller status"));
      }

      status = statusValue;
    }

    let onboarding: "COMPLETE" | "INCOMPLETE" | undefined;

    if (onboardingValue) {
      if (onboardingValue !== "COMPLETE" && onboardingValue !== "INCOMPLETE") {
        return next(new BadRequestError("Invalid onboarding filter"));
      }

      onboarding = onboardingValue;
    }

    const response = await getAdminSellers({
      page: parsePositiveInteger(req.query.page, 1),

      limit: parsePositiveInteger(req.query.limit, 10),

      search:
        typeof req.query.search === "string" ? req.query.search : undefined,

      status,
      onboarding,
    });

    return res.status(200).json(response);
  } catch (error) {
    return next(error);
  }
};

export const updateAdminSellerStatusController = async (
  req: AdminRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sellerIdValue = req.params.sellerId;

    const sellerId = Array.isArray(sellerIdValue)
      ? sellerIdValue[0]
      : sellerIdValue;

    if (!sellerId) {
      return next(new BadRequestError("Seller ID is required"));
    }

    const status: unknown = req.body?.status;

    if (status !== "ACTIVE" && status !== "SUSPENDED") {
      return next(new BadRequestError("Status must be ACTIVE or SUSPENDED"));
    }

    const response = await updateAdminSellerStatus(sellerId, status);

    return res.status(200).json(response);
  } catch (error) {
    return next(error);
  }
};
