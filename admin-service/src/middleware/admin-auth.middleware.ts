import { NextFunction, Request, Response } from "express";

import jwt from "jsonwebtoken";

import prisma from "@org/prisma";

import { AuthenticationError } from "@org/error-handler";

interface AdminTokenPayload {
  id: string;
  role: string;
}

export interface AdminRequest extends Request {
  admin?: {
    id: string;
    role: "admin";
  };
}

export const isAdminAuthenticated = async (
  req: AdminRequest,
  _res: Response,
  next: NextFunction,
) => {
  try {
    let token: string | undefined = req.cookies?.admin_access_token;

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(new AuthenticationError("Please login as an Admin"));
    }

    const secret = process.env.JWT_ACCESS_SECRET;

    if (!secret) {
      throw new Error("JWT_ACCESS_SECRET is not configured");
    }

    const decoded = jwt.verify(token, secret) as AdminTokenPayload;

    if (!decoded.id || decoded.role !== "admin") {
      return next(new AuthenticationError("Invalid Admin access token"));
    }

    const admin = await prisma.admins.findUnique({
      where: {
        id: decoded.id,
      },

      select: {
        id: true,
        status: true,
      },
    });

    if (!admin || admin.status !== "ACTIVE") {
      return next(new AuthenticationError("Admin account is unavailable"));
    }

    req.admin = {
      id: admin.id,
      role: "admin",
    };

    return next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return next(error);
    }

    return next(
      new AuthenticationError("Invalid or expired Admin access token"),
    );
  }
};
