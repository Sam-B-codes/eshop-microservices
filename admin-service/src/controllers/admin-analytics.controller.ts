import { NextFunction, Response } from "express";

import { AdminRequest } from "../middleware/admin-auth.middleware";

import {
  getAdminAnalytics,
  isAnalyticsRange,
} from "../services/admin-analytics.service";

export const getAdminAnalyticsController = async (
  req: AdminRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: "Admin authentication is required",
      });
    }

    const rangeValue =
      typeof req.query.range === "string"
        ? req.query.range.trim().toUpperCase()
        : "30D";

    if (!isAnalyticsRange(rangeValue)) {
      return res.status(400).json({
        success: false,
        message: "Analytics range must be 7D, 30D, 90D, or 1Y",
      });
    }

    const response = await getAdminAnalytics(rangeValue);

    return res.status(200).json(response);
  } catch (error) {
    return next(error);
  }
};
