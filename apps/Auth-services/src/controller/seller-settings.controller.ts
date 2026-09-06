import { NextFunction, Response } from "express";

import bcrypt from "bcryptjs";

import prisma from "@org/prisma";

import { AuthenticationError, ValidationError } from "@org/error-handler";

import { AuthRequest } from "../middleware/auth.middleware";

// ======================================================
// TYPES
// ======================================================

interface UpdateSellerProfileBody {
  name?: string;
  phone_number?: string;
  country?: string;
}

interface UpdateSellerStoreBody {
  shopName?: string;
  shopBio?: string;
  shopAddress?: string;
  website?: string | null;
  category?: string;
  openingHours?: string;
}

interface ChangeSellerPasswordBody {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

// ======================================================
// SELECT
// ======================================================

const sellerSettingsSelect = {
  id: true,
  name: true,
  email: true,
  phone_number: true,
  country: true,

  shopName: true,
  shopBio: true,
  shopAddress: true,
  website: true,
  category: true,
  openingHours: true,

  bankConnected: true,
  isOnboarded: true,
} as const;

// ======================================================
// HELPERS
// ======================================================

const ensureSeller = (req: AuthRequest): string => {
  if (!req.user?.id || req.user.role !== "seller") {
    throw new AuthenticationError("Seller authentication is required");
  }

  return req.user.id;
};

const requireText = (
  value: string | undefined,
  field: string,
  minimum: number,
  maximum: number,
): string => {
  const cleanValue = value?.trim();

  if (!cleanValue) {
    throw new ValidationError(`${field} is required`);
  }

  if (cleanValue.length < minimum || cleanValue.length > maximum) {
    throw new ValidationError(
      `${field} must contain between ${minimum} and ${maximum} characters`,
    );
  }

  return cleanValue;
};

const normalizeWebsite = (website?: string | null): string | null => {
  const cleanWebsite = website?.trim();

  if (!cleanWebsite) {
    return null;
  }

  let parsedWebsite: URL;

  try {
    parsedWebsite = new URL(cleanWebsite);
  } catch {
    throw new ValidationError("Website must be a valid URL");
  }

  if (
    parsedWebsite.protocol !== "http:" &&
    parsedWebsite.protocol !== "https:"
  ) {
    throw new ValidationError("Website must use HTTP or HTTPS");
  }

  return parsedWebsite.toString();
};

const validatePassword = (password: string) => {
  if (password.length < 8) {
    throw new ValidationError(
      "New password must contain at least 8 characters",
    );
  }

  if (!/[a-z]/.test(password)) {
    throw new ValidationError("New password must contain a lowercase letter");
  }

  if (!/[A-Z]/.test(password)) {
    throw new ValidationError("New password must contain an uppercase letter");
  }

  if (!/\d/.test(password)) {
    throw new ValidationError("New password must contain a number");
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    throw new ValidationError("New password must contain a special character");
  }
};

const clearSellerCookies = (res: Response) => {
  const cookieOptions = {
    httpOnly: true,

    secure: process.env.NODE_ENV === "production",

    sameSite: (process.env.NODE_ENV === "production" ? "none" : "lax") as
      | "none"
      | "lax",

    path: "/",
  };

  res.clearCookie("seller_access_token", cookieOptions);

  res.clearCookie("seller_refresh_token", cookieOptions);
};

// ======================================================
// UPDATE SELLER PROFILE
// PATCH /api/seller/settings/profile
// ======================================================

export const updateSellerProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sellerId = ensureSeller(req);

    const body = req.body as UpdateSellerProfileBody;

    const name = requireText(body.name, "Full name", 2, 60);

    const phoneNumber = requireText(body.phone_number, "Phone number", 7, 20);

    const country = requireText(body.country, "Country", 2, 60);

    if (!/^\+?[0-9\s()-]{7,20}$/.test(phoneNumber)) {
      return next(new ValidationError("Enter a valid phone number"));
    }

    const existingSeller = await prisma.sellers.findUnique({
      where: {
        id: sellerId,
      },

      select: {
        id: true,
        status: true,
      },
    });

    if (!existingSeller) {
      return next(new ValidationError("Seller account not found"));
    }

    if (existingSeller.status === "SUSPENDED") {
      return next(
        new AuthenticationError(
          "Your seller account has been suspended. Please contact support.",
        ),
      );
    }

    const seller = await prisma.sellers.update({
      where: {
        id: sellerId,
      },

      data: {
        name,

        phone_number: phoneNumber,

        country,
      },

      select: sellerSettingsSelect,
    });

    return res.status(200).json({
      success: true,

      message: "Seller profile updated successfully",

      seller,
    });
  } catch (error) {
    return next(error);
  }
};

// ======================================================
// UPDATE STORE
// PATCH /api/seller/settings/store
// ======================================================

export const updateSellerStore = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sellerId = ensureSeller(req);

    const body = req.body as UpdateSellerStoreBody;

    const shopName = requireText(body.shopName, "Shop name", 2, 80);

    const shopBio = requireText(body.shopBio, "Shop bio", 10, 500);

    const shopAddress = requireText(body.shopAddress, "Shop address", 5, 250);

    const category = requireText(body.category, "Category", 2, 60);

    const openingHours = requireText(
      body.openingHours,
      "Opening hours",
      2,
      100,
    );

    const website = normalizeWebsite(body.website);

    const existingSeller = await prisma.sellers.findUnique({
      where: {
        id: sellerId,
      },

      select: {
        id: true,
        status: true,
      },
    });

    if (!existingSeller) {
      return next(new ValidationError("Seller account not found"));
    }

    if (existingSeller.status === "SUSPENDED") {
      return next(
        new AuthenticationError(
          "Your seller account has been suspended. Please contact support.",
        ),
      );
    }

    const seller = await prisma.sellers.update({
      where: {
        id: sellerId,
      },

      data: {
        shopName,
        shopBio,
        shopAddress,
        website,
        category,
        openingHours,
      },

      select: sellerSettingsSelect,
    });

    return res.status(200).json({
      success: true,

      message: "Store information updated successfully",

      seller,
    });
  } catch (error) {
    return next(error);
  }
};

// ======================================================
// CHANGE SELLER PASSWORD
// PATCH /api/seller/settings/password
// ======================================================

export const changeSellerPassword = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sellerId = ensureSeller(req);

    const body = req.body as ChangeSellerPasswordBody;

    const currentPassword = body.currentPassword;

    const newPassword = body.newPassword;

    const confirmPassword = body.confirmPassword;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return next(
        new ValidationError(
          "Current password, new password and confirmation are required",
        ),
      );
    }

    if (newPassword !== confirmPassword) {
      return next(
        new ValidationError("New password and confirmation do not match"),
      );
    }

    if (currentPassword === newPassword) {
      return next(
        new ValidationError(
          "New password must be different from your current password",
        ),
      );
    }

    validatePassword(newPassword);

    const seller = await prisma.sellers.findUnique({
      where: {
        id: sellerId,
      },

      select: {
        id: true,
        password: true,
        status: true,
      },
    });

    if (!seller) {
      return next(new ValidationError("Seller account not found"));
    }

    if (seller.status === "SUSPENDED") {
      return next(
        new AuthenticationError(
          "Your seller account has been suspended. Please contact support.",
        ),
      );
    }

    if (!seller.password) {
      return next(
        new ValidationError("Password change is unavailable for this account"),
      );
    }

    const passwordMatches = await bcrypt.compare(
      currentPassword,
      seller.password,
    );

    if (!passwordMatches) {
      return next(new ValidationError("Current password is incorrect"));
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.sellers.update({
      where: {
        id: sellerId,
      },

      data: {
        password: hashedPassword,
      },
    });

    clearSellerCookies(res);

    return res.status(200).json({
      success: true,

      message: "Password changed successfully. Please sign in again.",

      requiresLogin: true,
    });
  } catch (error) {
    return next(error);
  }
};
