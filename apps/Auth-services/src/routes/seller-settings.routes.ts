import {
  Router,
} from "express";

import {
  changeSellerPassword,
  updateSellerProfile,
  updateSellerStore,
} from "../controller/seller-settings.controller";

import {
  isAuthenticated,
} from "../middleware/auth.middleware";

const router =
  Router();

/**
 * @openapi
 * tags:
 *   - name: Seller Settings
 *     description: Authenticated seller account and store settings
 */

/**
 * @openapi
 * /api/seller/settings/profile:
 *   patch:
 *     summary: Update seller profile
 *     tags:
 *       - Seller Settings
 *     security:
 *       - sellerCookieAuth: []
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - phone_number
 *               - country
 *             properties:
 *               name:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               country:
 *                 type: string
 *     responses:
 *       200:
 *         description: Seller profile updated successfully
 *       400:
 *         description: Invalid seller information
 *       401:
 *         description: Seller authentication required
 */
router.patch(
  "/profile",
  isAuthenticated,
  updateSellerProfile
);

/**
 * @openapi
 * /api/seller/settings/store:
 *   patch:
 *     summary: Update seller store information
 *     tags:
 *       - Seller Settings
 *     security:
 *       - sellerCookieAuth: []
 *       - bearerAuth: []
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
 *               shopBio:
 *                 type: string
 *               shopAddress:
 *                 type: string
 *               website:
 *                 type: string
 *                 format: uri
 *                 nullable: true
 *               category:
 *                 type: string
 *               openingHours:
 *                 type: string
 *     responses:
 *       200:
 *         description: Store information updated successfully
 *       400:
 *         description: Invalid store information
 *       401:
 *         description: Seller authentication required
 */
router.patch(
  "/store",
  isAuthenticated,
  updateSellerStore
);

/**
 * @openapi
 * /api/seller/settings/password:
 *   patch:
 *     summary: Change seller password
 *     tags:
 *       - Seller Settings
 *     security:
 *       - sellerCookieAuth: []
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid password information
 *       401:
 *         description: Seller authentication required
 */
router.patch(
  "/password",
  isAuthenticated,
  changeSellerPassword
);

export default router;
