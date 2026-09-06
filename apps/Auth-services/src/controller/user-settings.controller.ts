import { NextFunction, Response } from "express";

import bcrypt from "bcryptjs";

import prisma from "@org/prisma";

import { AuthenticationError, ValidationError } from "@org/error-handler";

import { AuthRequest } from "../middleware/auth.middleware";

// ======================================================
// TYPES
// ======================================================

interface UpdateUserProfileBody {
  name?: string;
}

interface ChangeUserPasswordBody {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

// ======================================================
// HELPERS
// ======================================================

const ensureCustomer = (req: AuthRequest): string => {
  if (!req.user?.id || req.user.role !== "user") {
    throw new AuthenticationError("Customer authentication is required");
  }

  return req.user.id;
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

const clearUserAuthCookies = (res: Response) => {
  const cookieOptions = {
    httpOnly: true,

    secure: process.env.NODE_ENV === "production",

    sameSite: (process.env.NODE_ENV === "production" ? "none" : "lax") as
      | "none"
      | "lax",

    path: "/",
  };

  res.clearCookie("user_access_token", cookieOptions);

  res.clearCookie("user_refresh_token", cookieOptions);
};

// ======================================================
// UPDATE USER PROFILE
// PATCH /api/user/settings/profile
// ======================================================

export const updateUserProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = ensureCustomer(req);

    const body = req.body as UpdateUserProfileBody;

    const name = body.name?.trim();

    if (!name) {
      return next(new ValidationError("Full name is required"));
    }

    if (name.length < 2 || name.length > 60) {
      return next(
        new ValidationError(
          "Full name must contain between 2 and 60 characters",
        ),
      );
    }

    const existingUser = await prisma.users.findUnique({
      where: {
        id: userId,
      },

      select: {
        id: true,
      },
    });

    if (!existingUser) {
      return next(new ValidationError("User account not found"));
    }

    const user = await prisma.users.update({
      where: {
        id: userId,
      },

      data: {
        name,
      },

      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return res.status(200).json({
      success: true,

      message: "Profile updated successfully",

      user,
    });
  } catch (error) {
    return next(error);
  }
};

// ======================================================
// CHANGE USER PASSWORD
// PATCH /api/user/settings/password
// ======================================================

export const changeUserPassword = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = ensureCustomer(req);

    const body = req.body as ChangeUserPasswordBody;

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

    const user = await prisma.users.findUnique({
      where: {
        id: userId,
      },

      select: {
        id: true,
        password: true,
      },
    });

    if (!user) {
      return next(new ValidationError("User account not found"));
    }

    if (!user.password) {
      return next(
        new ValidationError("Password change is unavailable for this account"),
      );
    }

    const passwordMatches = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!passwordMatches) {
      return next(new ValidationError("Current password is incorrect"));
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.users.update({
      where: {
        id: userId,
      },

      data: {
        password: hashedPassword,
      },
    });

    clearUserAuthCookies(res);

    return res.status(200).json({
      success: true,

      message: "Password changed successfully. Please sign in again.",

      requiresLogin: true,
    });
  } catch (error) {
    return next(error);
  }
};
