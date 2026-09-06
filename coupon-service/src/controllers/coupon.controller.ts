import {
  Request,
  Response,
} from "express";

import { AuthRequest } from "../middleware/auth.middleware";

import {
  createCoupon,
  getSellerCoupons,
  getPublicCoupons,
  getCouponById,
  deleteCoupon,
  updateCoupon,
  validateCoupon,
} from "../services/coupon.service";

// ======================================================
// CREATE COUPON
// SELLER
// ======================================================

export const createCouponController =
  async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const coupon =
        await createCoupon(
          req.body,
          req.user.id
        );

      return res.status(201).json({
        success: true,
        message:
          "Coupon created successfully",
        coupon,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

// ======================================================
// GET SELLER COUPONS
// ======================================================

export const getCouponsController =
  async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const coupons =
        await getSellerCoupons(
          req.user.id
        );

      return res.status(200).json({
        success: true,
        coupons,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

// ======================================================
// GET PUBLIC COUPONS
// CUSTOMER
// ======================================================

export const getPublicCouponsController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const sellerId =
        typeof req.query.sellerId ===
        "string"
          ? req.query.sellerId
          : undefined;

      const coupons =
        await getPublicCoupons(
          sellerId
        );

      return res.status(200).json({
        success: true,
        coupons,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

// ======================================================
// GET COUPON BY ID
// SELLER
// ======================================================

export const getCouponController =
  async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const coupon =
        await getCouponById(
          req.params.id as string,
          req.user.id
        );

      if (!coupon) {
        return res.status(404).json({
          success: false,
          message:
            "Coupon not found",
        });
      }

      return res.status(200).json({
        success: true,
        coupon,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

// ======================================================
// DELETE COUPON
// SELLER
// ======================================================

export const deleteCouponController =
  async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      await deleteCoupon(
        req.params.id as string,
        req.user.id
      );

      return res.status(200).json({
        success: true,
        message:
          "Coupon deleted successfully",
      });
    } catch (error: any) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  };

// ======================================================
// UPDATE COUPON
// SELLER
// ======================================================

export const updateCouponController =
  async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const coupon =
        await updateCoupon(
          req.params.id as string,
          req.user.id,
          req.body
        );

      return res.status(200).json({
        success: true,
        message:
          "Coupon updated successfully",
        coupon,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

// ======================================================
// VALIDATE COUPON
// CUSTOMER
// ======================================================

export const validateCouponController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const {
        code,
        sellerId,
        orderAmount,
      } = req.body;

      if (
        !code ||
        !sellerId ||
        orderAmount === undefined
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Coupon code, seller ID and order amount are required",
        });
      }

      const numericOrderAmount =
        Number(orderAmount);

      if (
        Number.isNaN(
          numericOrderAmount
        ) ||
        numericOrderAmount <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Order amount must be greater than 0",
        });
      }

      const result =
        await validateCoupon(
          String(code),
          String(sellerId),
          numericOrderAmount
        );

      return res.status(200).json({
        success: true,
        message:
          "Coupon applied successfully",
        ...result,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };