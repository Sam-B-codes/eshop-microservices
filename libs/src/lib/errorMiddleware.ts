import { Request, Response, NextFunction } from "express";
import { AppError } from "./AppError.js";

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    console.error(`${req.method} ${req.url} - ${err.message}`);

    const response: {
      success: boolean;
      message: string;
      details?: unknown;
    } = {
      success: false,
      message: err.message,
    };

    if (err.details !== undefined) {
      response.details = err.details;
    }

    return res.status(err.statusCode).json(response);
  }

  console.error("Unexpected Error:", err);

  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
};