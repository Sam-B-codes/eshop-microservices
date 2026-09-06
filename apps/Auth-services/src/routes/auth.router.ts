import express, { Router } from "express";

import {
  userRegistration,
  verifyUser,
  userLogin,
  userForgotPassword,
  verifyForgotPasswordOtp,
  resetUserPassword,
   userLogout,
   refreshAccessToken,
   getLoggedInUser,
   sellerRegistration,
    verifySeller,
     sellerLogin,
     getLoggedInSeller,
       sellerForgotPassword,
  verifySellerForgotPasswordOtp,
  resetSellerPassword,
  refreshSellerAccessToken,
  setupSellerShop,
  completeSellerOnboarding,
   sellerLogout,
} from "../controller/auth.controller";

import {
  adminLogin,
  adminLogout,
  getLoggedInAdmin,
  refreshAdminAccessToken,
} from "../controller/admin-auth.controller";

import {
  isAdminAuthenticated,
} from "../middleware/admin-auth.middleware";

import { isAuthenticated } from "../middleware/auth.middleware";

import userSettingsRoutes from "./user-settings.routes";
import sellerSettingsRoutes from "./seller-settings.routes";

const router: Router = express.Router();

/**
 * @openapi
 * tags:
 *   name: Authentication
 *   description: Authentication APIs
 */

/**
 * @openapi
 * /api/user-registration:
 *   post:
 *     summary: Register a new user
 *     description: Sends an OTP to the user's email for account verification.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: Password@123
 *     responses:
 *       201:
 *         description: OTP sent successfully
 *       400:
 *         description: Invalid request
 *       409:
 *         description: User already exists
 */
router.post("/user-registration", userRegistration);

/**
 * @openapi
 * /api/verify-user:
 *   post:
 *     summary: Verify user account
 *     description: Verifies the OTP and creates the user account.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - otp
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: Password@123
 *               otp:
 *                 type: string
 *                 example: "3070"
 *     responses:
 *       201:
 *         description: User verified successfully
 *       400:
 *         description: Invalid OTP
 */
router.post("/verify-user", verifyUser);

/**
 * @openapi
 * /api/login-user:
 *   post:
 *     summary: Login User
 *     description: Login using email and password.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: salesteach11@gmail.com
 *               password:
 *                 type: string
 *                 example: Password@123
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post("/login-user", userLogin);

/**
 * @openapi
 * /api/forgot-password:
 *   post:
 *     summary: Forgot Password
 *     description: Sends an OTP to the registered email for password reset.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: salesteach11@gmail.com
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       404:
 *         description: User not found
 */
router.post("/forgot-password", userForgotPassword);

/**
 * @openapi
 * /api/verify-forgot-password-otp:
 *   post:
 *     summary: Verify Forgot Password OTP
 *     description: Verifies the OTP sent for password reset.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 example: salesteach11@gmail.com
 *               otp:
 *                 type: string
 *                 example: "3070"
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: Invalid OTP
 */
router.post(
  "/verify-forgot-password-otp",
  verifyForgotPasswordOtp
);

/**
 * @openapi
 * /api/reset-password:
 *   post:
 *     summary: Reset Password
 *     description: Resets the user's password after successful OTP verification.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 example: salesteach11@gmail.com
 *               otp:
 *                 type: string
 *                 example: "3070"
 *               newPassword:
 *                 type: string
 *                 example: NewPassword@123
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid OTP
 */
router.post("/reset-password", resetUserPassword);

/**
 * @swagger
 * /api/logout-user:
 *   post:
 *     summary: Logout User
 *     description: Clears access token and refresh token cookies and logs out the authenticated user.
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Logout successful
 *       500:
 *         description: Internal Server Error
 */

router.post("/logout-user", userLogout);


/**
 * @swagger
 * /api/refresh-token:
 *   post:
 *     summary: Refresh Access Token
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: Access token refreshed successfully
 *       401:
 *         description: Invalid refresh token
 */
router.post(
  "/refresh-token",
  refreshAccessToken
);


/**
 * @swagger
 * /api/me:
 *   get:
 *     summary: Get Logged In User
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: User Profile
 */

router.get(
  "/me",
  isAuthenticated,
  getLoggedInUser
);


router.use(
  "/user/settings",
  userSettingsRoutes
);


/**
 * @swagger
 * /api/seller-registration:
 *   post:
 *     summary: Register a new seller
 *     tags:
 *       - Seller Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - phone_number
 *               - country
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Seller
 *               email:
 *                 type: string
 *                 example: seller@example.com
 *               password:
 *                 type: string
 *                 example: Seller@123
 *               phone_number:
 *                 type: string
 *                 example: "9876543210"
 *               country:
 *                 type: string
 *                 example: India
 *     responses:
 *       201:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: OTP sent successfully
 *       400:
 *         description: Validation Error
 *       409:
 *         description: Seller already exists
 */
router.post("/seller-registration", sellerRegistration);

/**
 * @swagger
 * /api/verify-seller:
 *   post:
 *     summary: Verify seller OTP and create seller account
 *     tags:
 *       - Seller Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - phone_number
 *               - country
 *               - otp
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Seller
 *               email:
 *                 type: string
 *                 example: seller@example.com
 *               password:
 *                 type: string
 *                 example: Seller@123
 *               phone_number:
 *                 type: string
 *                 example: "9876543210"
 *               country:
 *                 type: string
 *                 example: India
 *               otp:
 *                 type: string
 *                 example: "1234"
 *     responses:
 *       201:
 *         description: Seller registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Seller registered successfully
 *       400:
 *         description: Invalid OTP or Validation Error
 *       409:
 *         description: Seller already exists
 */
router.post("/verify-seller", verifySeller);


/**
 * @swagger
 * /api/seller-login:
 *   post:
 *     summary: Login seller
 *     tags:
 *       - Seller Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: seller@example.com
 *               password:
 *                 type: string
 *                 example: Seller@123
 *     responses:
 *       200:
 *         description: Seller login successful
 *       400:
 *         description: Missing credentials
 *       401:
 *         description: Invalid password
 */
router.post("/seller-login", sellerLogin);



/**
 * @swagger
 * /api/seller:
 *   get:
 *     summary: Get logged in seller
 *     tags:
 *       - Seller Authentication
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Seller profile fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 seller:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phone_number:
 *                       type: string
 *                     country:
 *                       type: string
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/seller",
  isAuthenticated,
  getLoggedInSeller
);



router.use(
  "/seller/settings",
  sellerSettingsRoutes
);



/**
 * @swagger
 * /api/seller-forgot-password:
 *   post:
 *     summary: Send OTP for seller password reset
 *     tags:
 *       - Seller Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: seller@example.com
 *     responses:
 *       200:
 *         description: Password reset OTP sent successfully
 *       400:
 *         description: Validation Error
 *       404:
 *         description: Seller not found
 */
router.post(
  "/seller-forgot-password",
  sellerForgotPassword
);

/**
 * @swagger
 * /api/verify-seller-forgot-password-otp:
 *   post:
 *     summary: Verify seller password reset OTP
 *     tags:
 *       - Seller Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: seller@example.com
 *               otp:
 *                 type: string
 *                 example: "1234"
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: Invalid or expired OTP
 */
router.post(
  "/verify-seller-forgot-password-otp",
  verifySellerForgotPasswordOtp
);

/**
 * @swagger
 * /api/seller-reset-password:
 *   post:
 *     summary: Reset seller password
 *     tags:
 *       - Seller Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: seller@example.com
 *               newPassword:
 *                 type: string
 *                 example: Seller@123
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Validation Error
 */
router.post(
  "/seller-reset-password",
  resetSellerPassword
);


/**
 * @swagger
 * /api/seller-refresh-token:
 *   post:
 *     summary: Refresh Seller Access Token
 *     tags:
 *       - Seller Authentication
 *     responses:
 *       200:
 *         description: Seller access token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Seller access token refreshed
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post(
  "/seller-refresh-token",
  refreshSellerAccessToken
);


/**
 * @swagger
 * /api/seller/setup-shop:
 *   post:
 *     summary: Setup Seller Shop
 *     tags:
 *       - Seller Authentication
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shopName
 *               - shopBio
 *               - shopAddress
 *               - category
 *               - openingHours
 *             properties:
 *               shopName:
 *                 type: string
 *                 example: Sam Electronics
 *               shopBio:
 *                 type: string
 *                 example: India's trusted electronics store.
 *               shopAddress:
 *                 type: string
 *                 example: Dhanbad, Jharkhand
 *               website:
 *                 type: string
 *                 example: https://samshop.com
 *               category:
 *                 type: string
 *                 example: Electronics
 *               openingHours:
 *                 type: string
 *                 example: 9 AM - 8 PM
 *     responses:
 *       200:
 *         description: Shop setup completed successfully
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/seller/setup-shop",
  isAuthenticated,
  setupSellerShop
);

/**
 * @swagger
 * /api/seller/connect-bank:
 *   post:
 *     summary: Complete Seller Bank Connection
 *     tags:
 *       - Seller Authentication
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Bank connected successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Bank connected successfully
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/seller/connect-bank",
  isAuthenticated,
  completeSellerOnboarding
);

// ======================================================
// ADMIN AUTHENTICATION
// ======================================================

/**
 * @openapi
 * tags:
 *   - name: Admin Authentication
 *     description: Secure authentication for Eshop administrators
 */

/**
 * @openapi
 * /api/admin-login:
 *   post:
 *     summary: Login as an Admin
 *     description: Authenticates an active Admin and sets separate Admin access and refresh cookies.
 *     tags:
 *       - Admin Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: StrongPassword123!
 *     responses:
 *       200:
 *         description: Admin login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Admin login successful
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *                 admin:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                       example: Saumya Bhardwaaj
 *                     email:
 *                       type: string
 *                       format: email
 *                     role:
 *                       type: string
 *                       enum:
 *                         - ADMIN
 *                         - SUPER_ADMIN
 *                     status:
 *                       type: string
 *                       enum:
 *                         - ACTIVE
 *                         - DISABLED
 *                     lastLoginAt:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *       400:
 *         description: Email or password is missing
 *       401:
 *         description: Invalid credentials or disabled Admin account
 *       500:
 *         description: Internal server error
 */
router.post(
  "/admin-login",
  adminLogin
);



/**
 * @openapi
 * /api/admin-refresh-token:
 *   post:
 *     summary: Refresh the Admin access token
 *     description: Validates the HTTP-only Admin refresh cookie and rotates both Admin tokens.
 *     tags:
 *       - Admin Authentication
 *     security:
 *       - adminRefreshCookieAuth: []
 *     responses:
 *       200:
 *         description: Admin access token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *                 admin:
 *                   type: object
 *       401:
 *         description: Refresh token is missing, invalid, or expired
 *       500:
 *         description: Internal server error
 */
router.post(
  "/admin-refresh-token",
  refreshAdminAccessToken
);




/**
 * @openapi
 * /api/admin/me:
 *   get:
 *     summary: Get logged-in Admin
 *     description: Returns the authenticated Admin using the Admin access cookie or Bearer token.
 *     tags:
 *       - Admin Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 admin:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                       format: email
 *                     role:
 *                       type: string
 *                       enum:
 *                         - ADMIN
 *                         - SUPER_ADMIN
 *                     status:
 *                       type: string
 *                       enum:
 *                         - ACTIVE
 *                         - DISABLED
 *                     lastLoginAt:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Admin authentication is missing, invalid, or expired
 *       500:
 *         description: Internal server error
 */
router.get(
  "/admin/me",
  isAdminAuthenticated,
  getLoggedInAdmin
);

/**
 * @openapi
 * /api/admin-logout:
 *   post:
 *     summary: Logout the Admin
 *     description: Clears the Admin access and refresh cookies.
 *     tags:
 *       - Admin Authentication
 *     responses:
 *       200:
 *         description: Admin logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Admin logged out successfully
 *       500:
 *         description: Internal server error
 */
router.post(
  "/admin-logout",
  adminLogout
);



/**
 * @swagger
 * /api/seller-logout:
 *   post:
 *     summary: Logout seller
 *     description: Clears the authenticated seller's access and refresh token cookies.
 *     tags:
 *       - Seller Authentication
 *     responses:
 *       200:
 *         description: Seller logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Seller logout successful
 *       500:
 *         description: Internal server error
 */
router.post(
  "/seller-logout",
  sellerLogout
);


export default router;