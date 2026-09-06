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
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../services/payment.service";

import {
  CreatePaymentOrderInput,
  VerifyPaymentInput,
} from "../types/payment.types";

// ======================================================
// CREATE RAZORPAY PAYMENT ORDER
// ======================================================

export const createPaymentOrderController =
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // ==================================================
      // AUTHENTICATED USER
      // ==================================================

      const userId =
        req.user?.id;

      if (!userId) {
        throw new BadRequestError(
          "Authenticated user is required"
        );
      }

      // ==================================================
      // REQUEST BODY
      // ==================================================

      const {
        orderId,
      } =
        req.body as CreatePaymentOrderInput;

      if (!orderId?.trim()) {
        throw new BadRequestError(
          "Order ID is required"
        );
      }

      // ==================================================
      // CREATE / REUSE RAZORPAY ORDER
      // ==================================================

      const payment =
        await createRazorpayOrder(
          userId,
          orderId
        );

      // ==================================================
      // RESPONSE
      // ==================================================

      return res
        .status(201)
        .json({
          success: true,

          message:
            "Payment order created successfully",

          payment,
        });
    } catch (error) {
      return next(error);
    }
  };

// ======================================================
// VERIFY RAZORPAY PAYMENT
// ======================================================

export const verifyPaymentController =
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // ==================================================
      // AUTHENTICATED USER
      // ==================================================

      const userId =
        req.user?.id;

      if (!userId) {
        throw new BadRequestError(
          "Authenticated user is required"
        );
      }

      // ==================================================
      // REQUEST BODY
      //
      // These values come from Razorpay Checkout after a
      // successful test/live payment.
      // ==================================================

      const {
        internalOrderId,
        razorpayPaymentId,
        razorpaySignature,
      } =
        req.body as VerifyPaymentInput;

      // ==================================================
      // BASIC VALIDATION
      // ==================================================

      if (
        !internalOrderId?.trim()
      ) {
        throw new BadRequestError(
          "Internal order ID is required"
        );
      }

      if (
        !razorpayPaymentId?.trim()
      ) {
        throw new BadRequestError(
          "Razorpay payment ID is required"
        );
      }

      if (
        !razorpaySignature?.trim()
      ) {
        throw new BadRequestError(
          "Razorpay signature is required"
        );
      }

      // ==================================================
      // SERVER-SIDE PAYMENT VERIFICATION
      // ==================================================

      const result =
        await verifyRazorpayPayment(
          userId,
          {
            internalOrderId,

            razorpayPaymentId,

            razorpaySignature,
          }
        );

      // ==================================================
      // RESPONSE
      // ==================================================

      return res
        .status(200)
        .json({
          success: true,

          message:
            result.alreadyProcessed
              ? "Payment was already verified"
              : "Payment verified successfully",

          verified:
            result.verified,

          alreadyProcessed:
            result.alreadyProcessed,

          order:
            result.order,
        });
    } catch (error) {
      return next(error);
    }
  };