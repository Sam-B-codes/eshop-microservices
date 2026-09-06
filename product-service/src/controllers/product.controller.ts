import { NextFunction, Request, Response } from "express";

import { NotFoundError, ValidationError } from "@org/error-handler";

import { AuthRequest } from "../middleware/auth.middleware";

import * as productService from "../services/product.service";

import {
  createProductSchema,
  updateProductSchema,
} from "../validations/product.validation";

const getRouteParam = (value: string | string[]): string => {
  return Array.isArray(value) ? value[0] : value;
};

const getOptionalQueryString = (value: unknown): string | undefined => {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value) && typeof value[0] === "string") {
    return value[0];
  }

  return undefined;
};

// ======================================================
// CREATE PRODUCT
// ======================================================

export const createProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = createProductSchema.safeParse(req.body);

    if (!result.success) {
      return next(
        new ValidationError(
          result.error.issues[0]?.message || "Validation failed",
        ),
      );
    }

    const product = await productService.createProduct({
      ...result.data,
      sellerId: req.user!.id,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    return next(error);
  }
};

// ======================================================
// GET SELLER PRODUCTS
// ======================================================

export const getSellerProducts = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = Number(getOptionalQueryString(req.query.page)) || 1;

    const limit = Number(getOptionalQueryString(req.query.limit)) || 10;

    const result = await productService.getSellerProducts(req.user!.id, {
      page,
      limit,

      search: getOptionalQueryString(req.query.search),

      status: getOptionalQueryString(req.query.status),

      category: getOptionalQueryString(req.query.category),
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    return next(error);
  }
};

// ======================================================
// GET PUBLIC PRODUCTS
// ======================================================

export const getPublicProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const rawPage = Number(getOptionalQueryString(req.query.page));

    const page =
      Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;

    const rawLimit = Number(getOptionalQueryString(req.query.limit));

    const limit =
      Number.isFinite(rawLimit) && rawLimit > 0
        ? Math.min(Math.floor(rawLimit), 50)
        : 12;

    const rawMinPrice = getOptionalQueryString(req.query.minPrice);

    const parsedMinPrice =
      rawMinPrice !== undefined ? Number(rawMinPrice) : undefined;

    const minPrice =
      parsedMinPrice !== undefined &&
      Number.isFinite(parsedMinPrice) &&
      parsedMinPrice >= 0
        ? parsedMinPrice
        : undefined;

    const rawMaxPrice = getOptionalQueryString(req.query.maxPrice);

    const parsedMaxPrice =
      rawMaxPrice !== undefined ? Number(rawMaxPrice) : undefined;

    const maxPrice =
      parsedMaxPrice !== undefined &&
      Number.isFinite(parsedMaxPrice) &&
      parsedMaxPrice >= 0
        ? parsedMaxPrice
        : undefined;

    const rawAvailability = getOptionalQueryString(req.query.availability);

    const availability =
      rawAvailability === "IN_STOCK" || rawAvailability === "OUT_OF_STOCK"
        ? rawAvailability
        : undefined;

    const rawSort = getOptionalQueryString(req.query.sort);

    const sort =
      rawSort === "price-low" ||
      rawSort === "price-high" ||
      rawSort === "newest"
        ? rawSort
        : "newest";

    if (
      minPrice !== undefined &&
      maxPrice !== undefined &&
      minPrice > maxPrice
    ) {
      return res.status(400).json({
        success: false,
        message: "minPrice cannot be greater than maxPrice",
      });
    }

    const result = await productService.getPublicProducts({
      page,
      limit,

      search: getOptionalQueryString(req.query.search),

      category: getOptionalQueryString(req.query.category),

      brand: getOptionalQueryString(req.query.brand),

      minPrice,
      maxPrice,
      availability,
      sort,
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    return next(error);
  }
};

// ======================================================
// GET PUBLIC PRODUCT BY SLUG
// ======================================================

export const getPublicProductBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const slug = getRouteParam(req.params.slug);

    const product = await productService.getPublicProductBySlug(slug);

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    return next(error);
  }
};

// ======================================================
// GET PUBLIC PRODUCT FILTERS
// ======================================================

export const getPublicProductFilters = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const filters = await productService.getPublicProductFilters();

    return res.status(200).json({
      success: true,
      filters,
    });
  } catch (error) {
    return next(error);
  }
};

// ======================================================
// GET PUBLIC CATEGORIES
// ======================================================

export const getPublicCategories = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const categories = await productService.getPublicProductCategories();

    return res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    return next(error);
  }
};

// ======================================================
// GET SELLER PRODUCT BY ID
// ======================================================

export const getProductById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = getRouteParam(req.params.id);

    const product = await productService.getProductById(req.user!.id, id);

    if (!product) {
      return next(new NotFoundError("Product not found"));
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    return next(error);
  }
};

// ======================================================
// UPDATE PRODUCT
// ======================================================

export const updateProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = getRouteParam(req.params.id);

    const result = updateProductSchema.safeParse(req.body);

    if (!result.success) {
      return next(
        new ValidationError(
          result.error.issues[0]?.message || "Validation failed",
        ),
      );
    }

    const product = await productService.updateProduct(
      req.user!.id,
      id,
      result.data,
    );

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    return next(error);
  }
};

// ======================================================
// DELETE PRODUCT
// ======================================================

export const deleteProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = getRouteParam(req.params.id);

    await productService.deleteProduct(req.user!.id, id);

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
};
