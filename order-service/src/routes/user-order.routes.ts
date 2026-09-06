import {
  Router,
} from "express";

import {
  getUserOrderByIdController,
  getUserOrdersController,
} from "../controllers/user-order.controller";

import {
  isAuthenticated,
} from "../middleware/auth.middleware";

const router =
  Router();

// ======================================================
// CUSTOMER ORDER ROUTES REQUIRE AUTHENTICATION
// ======================================================

router.use(
  isAuthenticated
);

// ======================================================
// GET AUTHENTICATED USER ORDERS
// ======================================================

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get authenticated user's order history
 *     tags:
 *       - Customer Orders
 *     security:
 *       - userCookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
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
 *       400:
 *         description: Invalid query parameters
 *       401:
 *         description: Authentication required
 *       404:
 *         description: User not found
 */
router.get(
  "/",
  getUserOrdersController
);

// ======================================================
// GET AUTHENTICATED USER ORDER BY ID
// ======================================================

/**
 * @swagger
 * /api/orders/{orderId}:
 *   get:
 *     summary: Get authenticated user's order details
 *     description: |
 *       Returns the order only when it belongs to the
 *       authenticated customer. Includes products and
 *       seller-specific fulfilment information.
 *     tags:
 *       - Customer Orders
 *     security:
 *       - userCookieAuth: []
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
 *       400:
 *         description: Order ID is required
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Order not found
 */
router.get(
  "/:orderId",
  getUserOrderByIdController
);

export default router;
