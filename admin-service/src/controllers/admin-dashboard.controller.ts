import { NextFunction, Response } from "express";

import { AdminRequest } from "../middleware/admin-auth.middleware";

import { getAdminDashboard } from "../services/admin-dashboard.service";

export const getAdminDashboardController = async (
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

    const response = await getAdminDashboard();

    return res.status(200).json(response);
  } catch (error) {
    return next(error);
  }
};
