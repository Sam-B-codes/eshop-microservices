import {
  NextFunction,
  Request,
  Response,
} from "express";

import bcrypt from "bcryptjs";

import jwt, {
  SignOptions,
} from "jsonwebtoken";

import prisma from "@org/prisma";

import {
  AuthenticationError,
  ValidationError,
} from "@org/error-handler";

import {
  setCookie,
} from "../utils/cookies/setCookie";

interface AdminLoginBody {
  email?: string;
  password?: string;
}

interface AdminTokenPayload {
  id: string;
  role: string;
}

const ADMIN_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

const createAdminAccessToken = (
  adminId: string
): string => {
  const secret =
    process.env.JWT_ACCESS_SECRET;

  if (!secret) {
    throw new Error(
      "JWT_ACCESS_SECRET is not configured"
    );
  }

  const expiresIn = (
    process.env.ACCESS_TOKEN_EXPIRE ??
    "15m"
  ) as SignOptions["expiresIn"];

  return jwt.sign(
    {
      id: adminId,
      role: "admin",
    },
    secret,
    {
      expiresIn,
    }
  );
};

const createAdminRefreshToken = (
  adminId: string
): string => {
  const secret =
    process.env.JWT_REFRESH_SECRET;

  if (!secret) {
    throw new Error(
      "JWT_REFRESH_SECRET is not configured"
    );
  }

  const expiresIn = (
    process.env.REFRESH_TOKEN_EXPIRE ??
    "7d"
  ) as SignOptions["expiresIn"];

  return jwt.sign(
    {
      id: adminId,
      role: "admin",
    },
    secret,
    {
      expiresIn,
    }
  );
};

const setAdminCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string
) => {
  setCookie(
    res,
    "admin_access_token",
    accessToken
  );

  setCookie(
    res,
    "admin_refresh_token",
    refreshToken
  );
};

const clearAdminCookies = (
  res: Response
) => {
  const cookieOptions = {
    httpOnly: true,

    secure:
      process.env.NODE_ENV ===
      "production",

    sameSite: (
      process.env.NODE_ENV ===
      "production"
        ? "none"
        : "lax"
    ) as "none" | "lax",

    path: "/",
  };

  res.clearCookie(
    "admin_access_token",
    cookieOptions
  );

  res.clearCookie(
    "admin_refresh_token",
    cookieOptions
  );
};

// ======================================================
// ADMIN LOGIN
// POST /api/admin-login
// ======================================================

export const adminLogin = async (
  req: Request<
    Record<string, never>,
    unknown,
    AdminLoginBody
  >,
  res: Response,
  next: NextFunction
) => {
  try {
    const email =
      req.body.email
        ?.trim()
        .toLowerCase();

    const password =
      req.body.password;

    if (!email || !password) {
      return next(
        new ValidationError(
          "Email and password are required"
        )
      );
    }

    const admin =
      await prisma.admins.findUnique({
        where: {
          email,
        },
      });

    if (
      !admin ||
      admin.status !== "ACTIVE"
    ) {
      return next(
        new AuthenticationError(
          "Invalid email or password"
        )
      );
    }

    const passwordMatches =
      await bcrypt.compare(
        password,
        admin.password
      );

    if (!passwordMatches) {
      return next(
        new AuthenticationError(
          "Invalid email or password"
        )
      );
    }

    const accessToken =
      createAdminAccessToken(
        admin.id
      );

    const refreshToken =
      createAdminRefreshToken(
        admin.id
      );

    setAdminCookies(
      res,
      accessToken,
      refreshToken
    );

    const updatedAdmin =
      await prisma.admins.update({
        where: {
          id: admin.id,
        },

        data: {
          lastLoginAt: new Date(),
        },

        select: ADMIN_SELECT,
      });

    return res.status(200).json({
      success: true,
      message:
        "Admin login successful",
      accessToken,
      refreshToken,
      admin: updatedAdmin,
    });
  } catch (error) {
    return next(error);
  }
};

// ======================================================
// REFRESH ADMIN ACCESS TOKEN
// POST /api/admin-refresh-token
// ======================================================

export const refreshAdminAccessToken =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const refreshToken =
        req.cookies
          ?.admin_refresh_token;

      if (
        !refreshToken ||
        typeof refreshToken !==
          "string"
      ) {
        clearAdminCookies(res);

        return next(
          new AuthenticationError(
            "Admin session has expired. Please login again."
          )
        );
      }

      const refreshSecret =
        process.env
          .JWT_REFRESH_SECRET;

      if (!refreshSecret) {
        throw new Error(
          "JWT_REFRESH_SECRET is not configured"
        );
      }

      let decoded:
        AdminTokenPayload;

      try {
        decoded = jwt.verify(
          refreshToken,
          refreshSecret
        ) as AdminTokenPayload;
      } catch {
        clearAdminCookies(res);

        return next(
          new AuthenticationError(
            "Invalid or expired Admin refresh token"
          )
        );
      }

      if (
        !decoded.id ||
        decoded.role !== "admin"
      ) {
        clearAdminCookies(res);

        return next(
          new AuthenticationError(
            "Invalid Admin refresh token"
          )
        );
      }

      const admin =
        await prisma.admins.findUnique({
          where: {
            id: decoded.id,
          },

          select: ADMIN_SELECT,
        });

      if (
        !admin ||
        admin.status !== "ACTIVE"
      ) {
        clearAdminCookies(res);

        return next(
          new AuthenticationError(
            "Admin account is unavailable"
          )
        );
      }

      /*
       * Rotate both tokens. If an old refresh token is
       * copied, it naturally expires according to its JWT
       * expiry. Full token revocation can be added later
       * using Redis-backed token sessions.
       */
      const newAccessToken =
        createAdminAccessToken(
          admin.id
        );

      const newRefreshToken =
        createAdminRefreshToken(
          admin.id
        );

      setAdminCookies(
        res,
        newAccessToken,
        newRefreshToken
      );

      return res
        .status(200)
        .json({
          success: true,
          message:
            "Admin access token refreshed successfully",
          accessToken:
            newAccessToken,
          refreshToken:
            newRefreshToken,
          admin,
        });
    } catch (error) {
      clearAdminCookies(res);

      return next(error);
    }
  };

// ======================================================
// GET LOGGED-IN ADMIN
// GET /api/admin/me
// ======================================================

export const getLoggedInAdmin =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const adminId =
        req.admin?.id;

      if (!adminId) {
        return next(
          new AuthenticationError(
            "Admin authentication is required"
          )
        );
      }

      const admin =
        await prisma.admins.findUnique({
          where: {
            id: adminId,
          },

          select: ADMIN_SELECT,
        });

      if (
        !admin ||
        admin.status !== "ACTIVE"
      ) {
        return next(
          new AuthenticationError(
            "Admin account is unavailable"
          )
        );
      }

      return res
        .status(200)
        .json({
          success: true,
          admin,
        });
    } catch (error) {
      return next(error);
    }
  };

// ======================================================
// ADMIN LOGOUT
// POST /api/admin-logout
// ======================================================

export const adminLogout = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    clearAdminCookies(res);

    return res
      .status(200)
      .json({
        success: true,
        message:
          "Admin logged out successfully",
      });
  } catch (error) {
    return next(error);
  }
};