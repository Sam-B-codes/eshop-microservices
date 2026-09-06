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
  CreateOrderInput,
} from "../types/order.types";

import {
  createOrder,
} from "../services/order.service";

// ======================================================
// CREATE ORDER CONTROLLER
// ======================================================

export const createOrderController =
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId =
        req.user?.id;

      if (!userId) {
        throw new BadRequestError(
          "Authenticated user is required"
        );
      }

      const input =
        req.body as
          CreateOrderInput;

      const order =
        await createOrder(
          userId,
          input
        );

      return res
        .status(201)
        .json({
          success: true,

          message:
            "Order created successfully",

          order,
        });
    } catch (error) {
      return next(error);
    }
  };