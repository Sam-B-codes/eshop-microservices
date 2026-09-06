import { Router } from "express";

import {
  deleteAdminCouponController,
  getAdminCouponsController,
  getAdminCouponSummaryController,
  updateAdminCouponStatusController,
} from "../controllers/admin-coupon.controller";

import { isAdminAuthenticated } from "../middleware/admin-auth.middleware";

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: Admin Coupons
 *     description: Marketplace-wide coupon management
 */

/**
 * @openapi
 * /api/admin/coupons/summary:
 *   get:
 *     summary: Get coupon summary
 *     tags:
 *       - Admin Coupons
 *     security:
 *       - adminCookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Coupon summary fetched successfully
 *       401:
 *         description: Admin authentication required
 */
router.get("/summary", isAdminAuthenticated, getAdminCouponSummaryController);

/**
 * @openapi
 * /api/admin/coupons:
 *   get:
 *     summary: Get marketplace coupons
 *     tags:
 *       - Admin Coupons
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
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *           enum:
 *             - ACTIVE
 *             - INACTIVE
 *             - EXPIRED
 *             - EXHAUSTED
 *       - in: query
 *         name: discountType
 *         schema:
 *           type: string
 *           enum:
 *             - PERCENTAGE
 *             - FIXED
 *     responses:
 *       200:
 *         description: Coupons fetched successfully
 *       400:
 *         description: Invalid filter
 *       401:
 *         description: Admin authentication required
 */
router.get("/", isAdminAuthenticated, getAdminCouponsController);

/**
 * @openapi
 * /api/admin/coupons/{couponId}/status:
 *   patch:
 *     summary: Activate or deactivate a coupon
 *     tags:
 *       - Admin Coupons
 *     security:
 *       - adminCookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: couponId
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
 *               - isActive
 *             properties:
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Coupon status updated successfully
 *       400:
 *         description: Coupon cannot be activated
 *       404:
 *         description: Coupon not found
 */
router.patch(
  "/:couponId/status",
  isAdminAuthenticated,
  updateAdminCouponStatusController,
);

/**
 * @openapi
 * /api/admin/coupons/{couponId}:
 *   delete:
 *     summary: Permanently delete a coupon
 *     tags:
 *       - Admin Coupons
 *     security:
 *       - adminCookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: couponId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Coupon deleted successfully
 *       404:
 *         description: Coupon not found
 */
router.delete("/:couponId", isAdminAuthenticated, deleteAdminCouponController);

export default router;
