import { Response, NextFunction } from "express";

import { AuthRequest } from "../middleware/auth.middleware";

import * as dashboardService from "../services/dashboard.service";

// ================= SELLER DASHBOARD STATS =================

export const getSellerDashboardStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req.user!.id;

    const stats =
      await dashboardService.getSellerDashboardStats(
        sellerId
      );

    return res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    next(error);
  }
};