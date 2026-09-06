import {
  Router,
} from "express";

import {
  changeUserPassword,
  updateUserProfile,
} from "../controller/user-settings.controller";

import {
  isAuthenticated,
} from "../middleware/auth.middleware";

const router =
  Router();

/**
 * @openapi
 * tags:
 *   - name: User Settings
 *     description: Authenticated customer account settings
 */

/**
 * @openapi
 * /api/user/settings/profile:
 *   patch:
 *     summary: Update customer profile
 *     tags:
 *       - User Settings
 *     security:
 *       - userCookieAuth: []
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 60
 *                 example: Saumya Bhardwaaj
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Invalid profile information
 *       401:
 *         description: Customer authentication required
 */
router.patch(
  "/profile",
  isAuthenticated,
  updateUserProfile
);

/**
 * @openapi
 * /api/user/settings/password:
 *   patch:
 *     summary: Change customer password
 *     description: Changes the password and clears the current customer authentication cookies.
 *     tags:
 *       - User Settings
 *     security:
 *       - userCookieAuth: []
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
 *                 example: NewPassword@123
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 example: NewPassword@123
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid password information
 *       401:
 *         description: Customer authentication required
 */
router.patch(
  "/password",
  isAuthenticated,
  changeUserPassword
);

export default router;
