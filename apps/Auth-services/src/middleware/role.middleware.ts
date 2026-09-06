import { NextFunction, Response } from "express";
import { ForbiddenError } from "@org/error-handler";
import { AuthRequest } from "./auth.middleware";

export const authorizeRoles =
  (...roles: string[]) =>
  (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      return next(
        new ForbiddenError("Unauthorized")
      );
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ForbiddenError("Access denied")
      );
    }

    next();
  };