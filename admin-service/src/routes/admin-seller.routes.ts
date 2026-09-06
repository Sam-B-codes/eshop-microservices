import { Router } from "express";

import {
  getAdminSellersController,
  updateAdminSellerStatusController,
} from "../controllers/admin-seller.controller";

import { isAdminAuthenticated } from "../middleware/admin-auth.middleware";

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: Admin Sellers
 *     description: Seller account management for administrators
 */

/**
 * @openapi
 * /api/admin/sellers:
 *   get:
 *     summary: Get marketplace sellers
 *     tags:
 *       - Admin Sellers
 *     security:
 *       - adminCookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 50
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum:
 *             - ACTIVE
 *             - SUSPENDED
 *       - in: query
 *         name: onboarding
 *         schema:
 *           type: string
 *           enum:
 *             - COMPLETE
 *             - INCOMPLETE
 *     responses:
 *       200:
 *         description: Sellers fetched successfully
 *       400:
 *         description: Invalid filter
 *       401:
 *         description: Admin authentication required
 */
router.get("/", isAdminAuthenticated, getAdminSellersController);

/**
 * @openapi
 * /api/admin/sellers/{sellerId}/status:
 *   patch:
 *     summary: Suspend or reactivate a seller
 *     tags:
 *       - Admin Sellers
 *     security:
 *       - adminCookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sellerId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum:
 *                   - ACTIVE
 *                   - SUSPENDED
 *     responses:
 *       200:
 *         description: Seller status updated successfully
 *       400:
 *         description: Invalid status
 *       401:
 *         description: Admin authentication required
 *       404:
 *         description: Seller not found
 */
router.patch(
  "/:sellerId/status",
  isAdminAuthenticated,
  updateAdminSellerStatusController,
);

export default router;
