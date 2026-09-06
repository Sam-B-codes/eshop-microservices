import { NextFunction, Request, Response } from "express";
import {
  checkOtpRestrictions,
  sendOtp,
  trackOtpRequests,
  validateRegistrationData,
  verifyOtp,
} from "../utils/auth.helper";

import prisma from "@org/prisma";
import { AuthenticationError, ValidationError } from "@org/error-handler";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import type { StringValue } from "ms";

import redis from "@org/redis";
import { AuthRequest } from "../middleware/auth.middleware";

import {
  AUTH_COOKIES,
  clearSellerAuthCookies,
  clearUserAuthCookies,
  setCookie,
} from "../utils/cookies/setCookie";

interface TokenPayload {
  id: string;
  role: string;
}

const getJwtSecrets = () => {
  const accessSecret =
    process.env.JWT_ACCESS_SECRET;

  const refreshSecret =
    process.env.JWT_REFRESH_SECRET;

  if (
    !accessSecret ||
    !refreshSecret
  ) {
    throw new Error(
      "JWT secrets are not configured"
    );
  }

  return {
    accessSecret,
    refreshSecret,
  };
};

const createAuthTokens = (
  id: string,
  role: "user" | "seller"
) => {
  const {
    accessSecret,
    refreshSecret,
  } = getJwtSecrets();

  const accessExpire = (
    process.env
      .ACCESS_TOKEN_EXPIRE ??
    "15m"
  ) as StringValue;

  const refreshExpire = (
    process.env
      .REFRESH_TOKEN_EXPIRE ??
    "7d"
  ) as StringValue;

  const accessToken =
    jwt.sign(
      {
        id,
        role,
      },
      accessSecret,
      {
        expiresIn:
          accessExpire,
      }
    );

  const refreshToken =
    jwt.sign(
      {
        id,
        role,
      },
      refreshSecret,
      {
        expiresIn:
          refreshExpire,
      }
    );

  return {
    accessToken,
    refreshToken,
  };
};

const verifyRefreshToken = (
  token: string,
  expectedRole:
    | "user"
    | "seller"
): TokenPayload => {
  const {
    refreshSecret,
  } = getJwtSecrets();

  const decoded =
    jwt.verify(
      token,
      refreshSecret
    ) as TokenPayload;

  if (
    !decoded.id ||
    decoded.role !==
      expectedRole
  ) {
    throw new AuthenticationError(
      "Invalid refresh token"
    );
  }

  return decoded;
};

const getAuthenticatedId = (
  req: AuthRequest
): string => {
  if (!req.user?.id) {
    throw new AuthenticationError(
      "Please login first"
    );
  }

  return req.user.id;
};


// Register new User
export const userRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    validateRegistrationData(req.body, "user");
    const { name, email } = req.body;

    const existingUser = await prisma.users.findUnique({ where: { email } });

    if (existingUser) {
      return next(new ValidationError("User with this email already exists"));
    }

    await checkOtpRestrictions(email);
    await trackOtpRequests(email);
    await sendOtp(name, email, "user-activation-mail");

    res
      .status(201)
      .json({ message: "OTP sent to your email for verification" });
  } catch (error) {
    return next(error);
  }
};

//verify user otp
export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, otp, password, name } = req.body;
    if (!email || !otp || !password || !name) {
      return next(
        new ValidationError("Missing required fields for OTP verification"),
      );
    }
    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      return next(new ValidationError("User with this email already exists"));
    }
    await verifyOtp(email, otp);
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.users.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });
    res
      .status(201)
      .json({ success: true, message: "User registered successfully" });
  } catch (error) {
    return next(error);
  }
};


//user login
export const userLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return next(
        new ValidationError(
          "Missing required fields for login"
        )
      );
    }

    const user =
      await prisma.users.findUnique(
        {
          where: {
            email,
          },
        }
      );

    if (
      !user ||
      !user.password
    ) {
      return next(
        new ValidationError(
          "User not found"
        )
      );
    }

    if (
      user.status ===
      "SUSPENDED"
    ) {
      return next(
        new AuthenticationError(
          "Your account has been suspended. Please contact support."
        )
      );
    }

    const isMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isMatch) {
      return next(
        new AuthenticationError(
          "Invalid password"
        )
      );
    }

    const {
      accessToken,
      refreshToken,
    } = createAuthTokens(
      user.id,
      "user"
    );

    setCookie(
      res,
      AUTH_COOKIES.userAccess,
      accessToken
    );

    setCookie(
      res,
      AUTH_COOKIES.userRefresh,
      refreshToken
    );

    return res
      .status(200)
      .json({
        success: true,
        message:
          "Login successful",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
  } catch (error) {
    return next(error);
  }
};

// user forgot password
export const userForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(new ValidationError("Email is required"));
    }

    // Check whether user exists
    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      return next(new ValidationError("User not found"));
    }

    // Check Redis restrictions
    await checkOtpRestrictions(email);

    // Track OTP requests
    await trackOtpRequests(email);

    // Send OTP
    await sendOtp(user.name, email, "user-forgot-password");

    return res.status(200).json({
      success: true,
      message: "Password reset OTP sent successfully",
    });
  } catch (error) {
    return next(error);
  }
};

// Verify Forgot Password OTP
export const verifyForgotPasswordOtp = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return next(new ValidationError("Email and OTP are required"));
    }

    // Check if user exists
    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      return next(new ValidationError("User not found"));
    }

    // Verify OTP
    await verifyOtp(email, otp);

    await redis.set(`password_reset_verified:${email}`, "true", "EX", 600);

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    return next(error);
  }
};

// Reset User Password
export const resetUserPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, newPassword } = req.body;

    // Validate request
    if (!email || !newPassword) {
      return next(
        new ValidationError("Email, OTP and new password are required"),
      );
    }

    // Check if user exists
    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      return next(new ValidationError("User not found"));
    }

    const verified = await redis.get(`password_reset_verified:${email}`);

    if (!verified) {
      return next(new ValidationError("OTP verification required"));
    }

    //password length
    if (newPassword.length < 8) {
      return next(
        new ValidationError("Password must be at least 8 characters long"),
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.users.update({
      where: { email },
      data: {
        password: hashedPassword,
      },
    });

    // Delete OTP from Redis
    await redis.del(`otp:${email}`);
    await redis.del(`otp_requests:${email}`);
    await redis.del(`otp_cooldown:${email}`);
    await redis.del(`password_reset_verified:${email}`);

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    return next(error);
  }
};

// ======================================================
// USER  LOGOUT AND REFRESH TOKEN HANDLING
// ======================================================

export const userLogout = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    clearUserAuthCookies(res);

    return res
      .status(200)
      .json({
        success: true,
        message:
          "Logout successful",
      });
  } catch (error) {
    return next(error);
  }
};

export const refreshAccessToken =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const refreshToken =
        req.cookies?.[
          AUTH_COOKIES
            .userRefresh
        ];

      if (!refreshToken) {
        return next(
          new AuthenticationError(
            "Refresh token not found"
          )
        );
      }

      const decoded =
        verifyRefreshToken(
          refreshToken,
          "user"
        );

      const user =
        await prisma.users.findUnique(
          {
            where: {
              id: decoded.id,
            },
            select: {
              id: true,
              status: true,
            },
          }
        );

      if (
        !user ||
        user.status ===
          "SUSPENDED"
      ) {
        clearUserAuthCookies(
          res
        );

        return next(
          new AuthenticationError(
            "User account is unavailable"
          )
        );
      }

      const {
        accessToken,
      } = createAuthTokens(
        user.id,
        "user"
      );

      setCookie(
        res,
        AUTH_COOKIES.userAccess,
        accessToken
      );

      return res
        .status(200)
        .json({
          success: true,
          message:
            "Access token refreshed",
        });
    } catch {
      clearUserAuthCookies(
        res
      );

      return next(
        new AuthenticationError(
          "Invalid refresh token"
        )
      );
    }
  };



//
export const getLoggedInUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await prisma.users.findUnique({
      where: {
        id: getAuthenticatedId(req),
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      return next(new ValidationError("User not found"));
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return next(error);
  }
};

// Register New Seller
// Seller Registration
export const sellerRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Validate request
    validateRegistrationData(req.body, "seller");

    const { name, email } = req.body;

    console.log("========== SELLER REGISTRATION ==========");
    console.log("Step 1: Request validated");

    // Check if seller already exists
    const existingSeller = await prisma.sellers.findUnique({
      where: {
        email,
      },
    });

    console.log("Step 2: Database checked");

    if (existingSeller) {
      return next(new ValidationError("Seller with this email already exists"));
    }

    // Check OTP restrictions
    await checkOtpRestrictions(email);

    console.log("Step 3: OTP restrictions checked");

    // Track OTP requests
    await trackOtpRequests(email);

    console.log("Step 4: OTP request tracked");

    // Send OTP
    await sendOtp(name, email, "seller-activation-mail");

    console.log("Step 5: OTP sent successfully");

    return res.status(201).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("========== SELLER REGISTRATION ERROR ==========");
    console.error(error);
    console.error("===============================================");

    return next(error);
  }
};

// Verify Seller OTP
export const verifySeller = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, email, password, phone_number, country, otp } = req.body;

    if (!name || !email || !password || !phone_number || !country || !otp) {
      return next(
        new ValidationError("Missing required fields for OTP verification"),
      );
    }

    // Check if seller already exists
    const existingSeller = await prisma.sellers.findUnique({
      where: {
        email,
      },
    });

    if (existingSeller) {
      return next(new ValidationError("Seller with this email already exists"));
    }

    // Verify OTP
    await verifyOtp(email, otp);

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create Seller
    const seller = await prisma.sellers.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone_number,
        country,
        isOnboarded: false,
      },
    });

    // Generate Access Token
  const {
  accessToken,
  refreshToken,
} = createAuthTokens(
  seller.id,
  "seller"
);

setCookie(
  res,
  AUTH_COOKIES.sellerAccess,
  accessToken
);

setCookie(
  res,
  AUTH_COOKIES.sellerRefresh,
  refreshToken
);

    // Cleanup Redis
    await redis.del(`otp:${email}`);
    await redis.del(`otp_requests:${email}`);
    await redis.del(`otp_cooldown:${email}`);

    return res.status(201).json({
      success: true,
      message: "Seller registered successfully",
      seller: {
        id: seller.id,
        name: seller.name,
        email: seller.email,
        isOnboarded: seller.isOnboarded,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// Seller Login
export const sellerLogin =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const {
        email,
        password,
      } = req.body;

      if (
        !email ||
        !password
      ) {
        return next(
          new ValidationError(
            "Missing required fields for login"
          )
        );
      }

      const seller =
        await prisma.sellers.findUnique(
          {
            where: {
              email,
            },
          }
        );

      if (
        !seller ||
        !seller.password
      ) {
        return next(
          new ValidationError(
            "Seller not found"
          )
        );
      }

      if (
        seller.status ===
        "SUSPENDED"
      ) {
        return next(
          new AuthenticationError(
            "Your seller account has been suspended. Please contact support."
          )
        );
      }

      const isMatch =
        await bcrypt.compare(
          password,
          seller.password
        );

      if (!isMatch) {
        return next(
          new AuthenticationError(
            "Invalid password"
          )
        );
      }

      const {
        accessToken,
        refreshToken,
      } = createAuthTokens(
        seller.id,
        "seller"
      );

      setCookie(
        res,
        AUTH_COOKIES
          .sellerAccess,
        accessToken
      );

      setCookie(
        res,
        AUTH_COOKIES
          .sellerRefresh,
        refreshToken
      );

      return res
        .status(200)
        .json({
          success: true,
          message:
            "Seller login successful",
          onboardingRequired:
            !seller.isOnboarded,

          seller: {
            id: seller.id,
            name: seller.name,
            email: seller.email,
            phone_number:
              seller.phone_number,
            country:
              seller.country,
            isOnboarded:
              seller.isOnboarded,
            bankConnected:
              seller.bankConnected,
          },
        });
    } catch (error) {
      return next(error);
    }
  };

// GET me GET /api/seller
export const getLoggedInSeller = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const seller = await prisma.sellers.findUnique({
      where: {
        id: getAuthenticatedId(req),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone_number: true,
        country: true,

        // Dashboard fields
        shopName: true,
        shopBio: true,
        shopAddress: true,
        website: true,
        category: true,
        openingHours: true,

        bankConnected: true,
        isOnboarded: true,
      },
    });

    if (!seller) {
      return next(new ValidationError("Seller not found"));
    }

    return res.status(200).json({
      success: true,
      seller,
    });
  } catch (error) {
    return next(error);
  }
};

// Seller Forgot Password
export const sellerForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(new ValidationError("Email is required"));
    }

    // Check whether seller exists
    const seller = await prisma.sellers.findUnique({
      where: { email },
    });

    if (!seller) {
      return next(new ValidationError("Seller not found"));
    }

    // Check OTP restrictions
    await checkOtpRestrictions(email);

    // Track OTP requests
    await trackOtpRequests(email);

    // Send OTP
    await sendOtp(seller.name, email, "seller-forgot-password");

    return res.status(200).json({
      success: true,
      message: "Password reset OTP sent successfully",
    });
  } catch (error) {
    return next(error);
  }
};

// Verify Seller Forgot Password OTP
export const verifySellerForgotPasswordOtp = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return next(new ValidationError("Email and OTP are required"));
    }

    // Check if seller exists
    const seller = await prisma.sellers.findUnique({
      where: { email },
    });

    if (!seller) {
      return next(new ValidationError("Seller not found"));
    }

    // Verify OTP
    await verifyOtp(email, otp);

    // Allow password reset for 10 minutes
    await redis.set(
      `seller_password_reset_verified:${email}`,
      "true",
      "EX",
      600,
    );

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    return next(error);
  }
};

// Reset Seller Password
export const resetSellerPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return next(new ValidationError("Email and new password are required"));
    }

    // Check seller
    const seller = await prisma.sellers.findUnique({
      where: { email },
    });

    if (!seller) {
      return next(new ValidationError("Seller not found"));
    }

    // Check OTP verification
    const verified = await redis.get(`seller_password_reset_verified:${email}`);

    if (!verified) {
      return next(new ValidationError("OTP verification required"));
    }

    // Password length
    if (newPassword.length < 8) {
      return next(
        new ValidationError("Password must be at least 8 characters long"),
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update seller password
    await prisma.sellers.update({
      where: { email },
      data: {
        password: hashedPassword,
      },
    });

    // Cleanup Redis
    await redis.del(`otp:${email}`);
    await redis.del(`otp_requests:${email}`);
    await redis.del(`otp_cooldown:${email}`);
    await redis.del(`seller_password_reset_verified:${email}`);

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    return next(error);
  }
};

//refresh seller access token
export const refreshSellerAccessToken =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const refreshToken =
        req.cookies?.[
          AUTH_COOKIES
            .sellerRefresh
        ];

      if (!refreshToken) {
        return next(
          new AuthenticationError(
            "Refresh token not found"
          )
        );
      }

      const decoded =
        verifyRefreshToken(
          refreshToken,
          "seller"
        );

      const seller =
        await prisma.sellers.findUnique(
          {
            where: {
              id: decoded.id,
            },
            select: {
              id: true,
              status: true,
            },
          }
        );

      if (
        !seller ||
        seller.status ===
          "SUSPENDED"
      ) {
        clearSellerAuthCookies(
          res
        );

        return next(
          new AuthenticationError(
            "Seller account is unavailable"
          )
        );
      }

      const {
        accessToken,
      } = createAuthTokens(
        seller.id,
        "seller"
      );

      setCookie(
        res,
        AUTH_COOKIES
          .sellerAccess,
        accessToken
      );

      return res
        .status(200)
        .json({
          success: true,
          message:
            "Seller access token refreshed",
        });
    } catch {
      clearSellerAuthCookies(
        res
      );

      return next(
        new AuthenticationError(
          "Invalid refresh token"
        )
      );
    }
  };

// Setup Seller Shop
export const setupSellerShop = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { shopName, shopBio, shopAddress, website, category, openingHours } =
      req.body;

    if (!shopName || !shopBio || !shopAddress || !category || !openingHours) {
      return next(
        new ValidationError("All required shop fields must be provided"),
      );
    }

    const seller = await prisma.sellers.findUnique({
      where: {
        id: getAuthenticatedId(req),
      },
    });

    if (!seller) {
      return next(new ValidationError("Seller not found"));
    }

    const updatedSeller = await prisma.sellers.update({
      where: {
        id: seller.id,
      },
      data: {
        shopName,
        shopBio,
        shopAddress,
        website,
        category,
        openingHours,
      },
      select: {
        id: true,
        name: true,
        email: true,
        shopName: true,
        shopBio: true,
        shopAddress: true,
        website: true,
        category: true,
        openingHours: true,
        isOnboarded: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Shop setup completed successfully",
      seller: updatedSeller,
    });
  } catch (error) {
    return next(error);
  }
};

// Complete Seller Onboarding (Connect Bank)
export const completeSellerOnboarding = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Check seller exists
    const seller = await prisma.sellers.findUnique({
      where: {
        id: getAuthenticatedId(req),
      },
    });

    if (!seller) {
      return next(new ValidationError("Seller not found"));
    }

    // Update onboarding status
    const updatedSeller = await prisma.sellers.update({
      where: {
        id: seller.id,
      },
      data: {
        bankConnected: true,
        isOnboarded: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        bankConnected: true,
        isOnboarded: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Bank connected successfully",
      seller: updatedSeller,
    });
  } catch (error) {
    return next(error);
  }
};

//seller logout
export const sellerLogout =
  async (
    _req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      clearSellerAuthCookies(
        res
      );

      return res
        .status(200)
        .json({
          success: true,
          message:
            "Seller logout successful",
        });
    } catch (error) {
      return next(error);
    }
  };