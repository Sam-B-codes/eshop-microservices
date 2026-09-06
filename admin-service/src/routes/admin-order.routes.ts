import { Router } from "express";

import {
  getAdminOrderByIdController,
  getAdminOrdersController,
} from "../controllers/admin-order.controller";

import { isAdminAuthenticated } from "../middleware/admin-auth.middleware";

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: Admin Orders
 *     description: Marketplace-wide order monitoring
 */

/**
 * @openapi
 * /api/admin/orders:
 *   get:
 *     summary: Get marketplace orders
 *     tags:
 *       - Admin Orders
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
 *         name: status
 *         schema:
 *           type: string
 *           enum:
 *             - PENDING_PAYMENT
 *             - CONFIRMED
 *             - PROCESSING
 *             - SHIPPED
 *             - DELIVERED
 *             - CANCELLED
 *       - in: query
 *         name: paymentStatus
 *         schema:
 *           type: string
 *           enum:
 *             - PENDING
 *             - PAID
 *             - FAILED
 *             - REFUNDED
 *     responses:
 *       200:
 *         description: Orders fetched successfully
 *       401:
 *         description: Admin authentication required
 */
router.get("/", isAdminAuthenticated, getAdminOrdersController);

/**
 * @openapi
 * /api/admin/orders/{orderId}:
 *   get:
 *     summary: Get complete marketplace order details
 *     tags:
 *       - Admin Orders
 *     security:
 *       - adminCookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order fetched successfully
 *       401:
 *         description: Admin authentication required
 *       404:
 *         description: Order not found
 */
router.get("/:orderId", isAdminAuthenticated, getAdminOrderByIdController);

export default router;
