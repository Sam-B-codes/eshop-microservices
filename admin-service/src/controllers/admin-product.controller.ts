import { NextFunction, Response } from "express";

import { ProductStatus } from "@prisma/client";

import { BadRequestError } from "@org/error-handler";

import { AdminRequest } from "../middleware/admin-auth.middleware";

import {
  getAdminProducts,
  updateAdminProductStatus,
} from "../services/admin-product.service";

import { StockFilter } from "../types/admin-product.types";

const parsePositiveInteger = (value: unknown, fallback: number): number => {
  if (typeof value !== "string") {
    return fallback;
  }

  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

export const getAdminProductsController = async (
  req: AdminRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const statusValue =
      typeof req.query.status === "string" ? req.query.status : undefined;

    const stockValue =
      typeof req.query.stock === "string" ? req.query.stock : undefined;

    const validStatuses: ProductStatus[] = [
      "DRAFT",
      "PUBLISHED",
      "OUT_OF_STOCK",
      "ARCHIVED",
    ];

    let status: ProductStatus | undefined;

    if (statusValue) {
      if (!validStatuses.includes(statusValue as ProductStatus)) {
        return next(new BadRequestError("Invalid product status"));
      }

      status = statusValue as ProductStatus;
    }

    const validStockFilters: StockFilter[] = [
      "IN_STOCK",
      "LOW_STOCK",
      "OUT_OF_STOCK",
    ];

    let stock: StockFilter | undefined;

    if (stockValue) {
      if (!validStockFilters.includes(stockValue as StockFilter)) {
        return next(new BadRequestError("Invalid stock filter"));
      }

      stock = stockValue as StockFilter;
    }

    const response = await getAdminProducts({
      page: parsePositiveInteger(req.query.page, 1),

      limit: parsePositiveInteger(req.query.limit, 10),

      search:
        typeof req.query.search === "string" ? req.query.search : undefined,

      status,
      stock,
    });

    return res.status(200).json(response);
  } catch (error) {
    return next(error);
  }
};

export const updateAdminProductStatusController = async (
  req: AdminRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const productIdValue = req.params.productId;

    const productId = Array.isArray(productIdValue)
      ? productIdValue[0]
      : productIdValue;

    if (!productId) {
      return next(new BadRequestError("Product ID is required"));
    }

    const status: unknown = req.body?.status;

    if (
      status !== "DRAFT" &&
      status !== "PUBLISHED" &&
      status !== "OUT_OF_STOCK" &&
      status !== "ARCHIVED"
    ) {
      return next(new BadRequestError("Invalid product status"));
    }

    const response = await updateAdminProductStatus(productId, status);

    return res.status(200).json(response);
  } catch (error) {
    return next(error);
  }
};
