import {
  Router,
} from "express";

import {
  getSellerOrderDetailsController,
  getSellerOrdersController,
  getSellerRevenueSummaryController,
  updateSellerOrderStatusController,
} from "../controllers/seller-order.controller";

import {
  isAuthenticated,
  isSeller,
} from "../middleware/auth.middleware";

const router =
  Router();

// ======================================================
// ALL SELLER ORDER ROUTES REQUIRE SELLER AUTH
// ======================================================

router.use(
  isAuthenticated,
  isSeller
);

// ======================================================
// GET SELLER ORDERS
// ======================================================

/**
 * @swagger
 * /api/orders/seller:
 *   get:
 *     summary: Get authenticated seller orders
 *     tags:
 *       - Seller Orders
 *     security:
 *       - sellerCookieAuth: []
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
 *           default: PAID
 *     responses:
 *       200:
 *         description: Seller orders fetched successfully
 *       401:
 *         description: Seller authentication required
 *       404:
 *         description: Seller not found
 */
router.get(
  "/",
  getSellerOrdersController
);

// ======================================================
// GET SELLER REVENUE SUMMARY
//
// This must be above /:orderId.
// ======================================================

/**
 * @swagger
 * /api/orders/seller/revenue-summary:
 *   get:
 *     summary: Get authenticated seller revenue summary
 *     tags:
 *       - Seller Orders
 *     security:
 *       - sellerCookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Revenue summary fetched successfully
 *       400:
 *         description: Invalid date range
 *       401:
 *         description: Seller authentication required
 */
router.get(
  "/revenue-summary",
  getSellerRevenueSummaryController
);

// ======================================================
// GET SELLER ORDER DETAILS
// ======================================================

/**
 * @swagger
 * /api/orders/seller/{orderId}:
 *   get:
 *     summary: Get seller-specific order details
 *     description: |
 *       Returns only the authenticated seller's portion
 *       of the marketplace order.
 *     tags:
 *       - Seller Orders
 *     security:
 *       - sellerCookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Seller order fetched successfully
 *       401:
 *         description: Seller authentication required
 *       404:
 *         description: Seller order not found
 */
router.get(
  "/:orderId",
  getSellerOrderDetailsController
);

// ======================================================
// UPDATE SELLER ORDER STATUS
// ======================================================

/**
 * @swagger
 * /api/orders/seller/{orderId}/status:
 *   patch:
 *     summary: Update seller-specific fulfilment status
 *     tags:
 *       - Seller Orders
 *     security:
 *       - sellerCookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
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
 *                   - PROCESSING
 *                   - SHIPPED
 *                   - DELIVERED
 *               trackingNumber:
 *                 type: string
 *                 nullable: true
 *               shippingCarrier:
 *                 type: string
 *                 nullable: true
 *           examples:
 *             processing:
 *               value:
 *                 status: PROCESSING
 *             shipped:
 *               value:
 *                 status: SHIPPED
 *                 trackingNumber: ESHOP123456
 *                 shippingCarrier: Delhivery
 *             delivered:
 *               value:
 *                 status: DELIVERED
 *     responses:
 *       200:
 *         description: Seller order status updated successfully
 *       400:
 *         description: Invalid status transition
 *       401:
 *         description: Seller authentication required
 *       404:
 *         description: Seller order not found
 */
router.patch(
  "/:orderId/status",
  updateSellerOrderStatusController
);

export default router;
