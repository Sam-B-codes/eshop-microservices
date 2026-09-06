import { NextFunction, Response } from "express";

import { UserStatus } from "@prisma/client";

import { BadRequestError } from "@org/error-handler";

import { AdminRequest } from "../middleware/admin-auth.middleware";

import {
  getAdminUsers,
  updateAdminUserStatus,
} from "../services/admin-user.service";

const parsePositiveInteger = (value: unknown, fallback: number): number => {
  if (typeof value !== "string") {
    return fallback;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
};

export const getAdminUsersController = async (
  req: AdminRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const statusValue =
      typeof req.query.status === "string" ? req.query.status : undefined;

    let status: UserStatus | undefined;

    if (statusValue) {
      if (statusValue !== "ACTIVE" && statusValue !== "SUSPENDED") {
        return next(new BadRequestError("Invalid user status"));
      }

      status = statusValue;
    }

    const response = await getAdminUsers({
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

export const updateAdminUserStatusController = async (
  req: AdminRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userIdParam = req.params.userId;

    const userId = Array.isArray(userIdParam) ? userIdParam[0] : userIdParam;

    if (!userId) {
      return next(new BadRequestError("User ID is required"));
    }

    const status: unknown = req.body?.status;

    if (status !== "ACTIVE" && status !== "SUSPENDED") {
      return next(new BadRequestError("Status must be ACTIVE or SUSPENDED"));
    }

    const response = await updateAdminUserStatus(userId, status);

    return res.status(200).json(response);
  } catch (error) {
    return next(error);
  }
};
