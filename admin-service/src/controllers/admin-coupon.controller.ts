import { NextFunction, Request, Response } from "express";

import {
  deleteAdminCoupon,
  getAdminCoupons,
  getAdminCouponSummary,
  isAdminCouponState,
  isCouponDiscountType,
  updateAdminCouponStatus,
} from "../services/admin-coupon.service";

const getQueryValue = (value: unknown) => {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value) && typeof value[0] === "string") {
    return value[0];
  }

  return "";
};

const getParamValue = (value: string | string[]) => {
  return Array.isArray(value) ? value[0] : value;
};

export const getAdminCouponSummaryController = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const summary = await getAdminCouponSummary();

    return res.status(200).json({
      success: true,
      message: "Admin coupon summary fetched successfully",
      summary,
    });
  } catch (error) {
    return next(error);
  }
};

export const getAdminCouponsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = Number(getQueryValue(req.query.page)) || 1;

    const limit = Number(getQueryValue(req.query.limit)) || 10;

    const search = getQueryValue(req.query.search).trim();

    const stateValue = getQueryValue(req.query.state).trim().toUpperCase();

    const discountTypeValue = getQueryValue(req.query.discountType)
      .trim()
      .toUpperCase();

    if (stateValue && !isAdminCouponState(stateValue)) {
      const error = new Error("Invalid coupon state") as Error & {
        statusCode: number;
      };

      error.statusCode = 400;

      throw error;
    }

    if (discountTypeValue && !isCouponDiscountType(discountTypeValue)) {
      const error = new Error("Invalid coupon discount type") as Error & {
        statusCode: number;
      };

      error.statusCode = 400;

      throw error;
    }

    const result = await getAdminCoupons({
      page,
      limit,
      search: search || undefined,
      state:
        stateValue && isAdminCouponState(stateValue) ? stateValue : undefined,
      discountType:
        discountTypeValue && isCouponDiscountType(discountTypeValue)
          ? discountTypeValue
          : undefined,
    });

    return res.status(200).json({
      success: true,
      message: "Coupons fetched successfully",
      ...result,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateAdminCouponStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const couponId = getParamValue(req.params.couponId);

    const { isActive } = req.body as {
      isActive?: unknown;
    };

    if (typeof isActive !== "boolean") {
      const error = new Error("isActive must be a boolean") as Error & {
        statusCode: number;
      };

      error.statusCode = 400;

      throw error;
    }

    const coupon = await updateAdminCouponStatus(couponId, isActive);

    return res.status(200).json({
      success: true,
      message: isActive
        ? "Coupon activated successfully"
        : "Coupon deactivated successfully",
      coupon,
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteAdminCouponController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const couponId = getParamValue(req.params.couponId);

    const coupon = await deleteAdminCoupon(couponId);

    return res.status(200).json({
      success: true,
      message: "Coupon deleted successfully",
      coupon,
    });
  } catch (error) {
    return next(error);
  }
};
