import {
  Router,
} from "express";

import {
  isAuthenticated,
} from "../middleware/auth.middleware";

import {
  authorizeRoles,
} from "../middleware/role.middleware";

import {
  getSellerPaymentsController,
  getSellerPaymentSummaryController,
} from "../controllers/seller-payment.controller";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Seller Payments
 *     description: Seller earnings and internal settlement ledger
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     SettlementStatus:
 *       type: string
 *       enum:
 *         - PENDING
 *         - PROCESSING
 *         - SETTLED
 *         - FAILED
 *
 *     SellerPayment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "6a98a12f0e84850468c31abc"
 *         orderId:
 *           type: string
 *           example: "6a9740b398efa5daee2f5670"
 *         sellerOrderId:
 *           type: string
 *           example: "6a9829380e84850468c31ddc"
 *         paymentStatus:
 *           type: string
 *           enum:
 *             - PENDING
 *             - PAID
 *             - FAILED
 *             - REFUNDED
 *           example: "PAID"
 *         paymentProvider:
 *           type: string
 *           nullable: true
 *           example: "razorpay"
 *         transactionReference:
 *           type: string
 *           nullable: true
 *           example: "pay_TWxxxxxxxxxxxx"
 *         paymentVerifiedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         grossSale:
 *           type: number
 *           example: 6297
 *         sellerDiscount:
 *           type: number
 *           example: 500
 *         netSale:
 *           type: number
 *           example: 5797
 *         platformFeeRate:
 *           type: number
 *           description: Platform fee percentage
 *           example: 5
 *         platformFee:
 *           type: number
 *           example: 289.85
 *         sellerEarnings:
 *           type: number
 *           example: 5507.15
 *         settlementStatus:
 *           $ref: '#/components/schemas/SettlementStatus'
 *         processingAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         settledAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         failedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         failureReason:
 *           type: string
 *           nullable: true
 *         customer:
 *           type: object
 *           properties:
 *             fullName:
 *               type: string
 *               example: "Saumya Bhardwaaj"
 *             email:
 *               type: string
 *               example: "customer@example.com"
 *         orderCreatedAt:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     SellerPaymentSummary:
 *       type: object
 *       properties:
 *         totalTransactions:
 *           type: integer
 *           example: 12
 *         pendingSettlements:
 *           type: integer
 *           example: 3
 *         processingSettlements:
 *           type: integer
 *           example: 1
 *         settledTransactions:
 *           type: integer
 *           example: 8
 *         failedSettlements:
 *           type: integer
 *           example: 0
 *         grossSales:
 *           type: number
 *           example: 50000
 *         totalDiscounts:
 *           type: number
 *           example: 2500
 *         netSales:
 *           type: number
 *           example: 47500
 *         totalPlatformFees:
 *           type: number
 *           example: 2375
 *         totalSellerEarnings:
 *           type: number
 *           example: 45125
 *         pendingEarnings:
 *           type: number
 *           example: 12000
 *         settledEarnings:
 *           type: number
 *           example: 33125
 */

// ======================================================
// SELLER AUTHENTICATION
// ======================================================

router.use(
  isAuthenticated,
  authorizeRoles("seller")
);

/**
 * @swagger
 * /api/payments/seller/summary:
 *   get:
 *     summary: Get seller payment summary
 *     description: >
 *       Returns the authenticated seller's earnings,
 *       platform fees, transaction counts and internal
 *       settlement totals. Missing settlement records
 *       for older paid orders are backfilled safely.
 *     tags:
 *       - Seller Payments
 *     security:
 *       - sellerCookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Seller payment summary fetched successfully
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
 *                   example: "Seller payment summary fetched successfully"
 *                 summary:
 *                   $ref: '#/components/schemas/SellerPaymentSummary'
 *       401:
 *         description: Access token is missing or invalid
 *       403:
 *         description: Authenticated account is not a seller
 *       404:
 *         description: Seller not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/summary",
  getSellerPaymentSummaryController
);

/**
 * @swagger
 * /api/payments/seller:
 *   get:
 *     summary: Get authenticated seller payment transactions
 *     description: >
 *       Returns a paginated internal settlement ledger
 *       for the authenticated seller. The response includes
 *       gross sale, discount, platform fee, seller earnings,
 *       Razorpay transaction reference and settlement status.
 *     tags:
 *       - Seller Payments
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
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Transactions per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by order ID or transaction reference
 *       - in: query
 *         name: status
 *         schema:
 *           $ref: '#/components/schemas/SettlementStatus'
 *         description: Filter by settlement status
 *     responses:
 *       200:
 *         description: Seller payments fetched successfully
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
 *                   example: "Seller payments fetched successfully"
 *                 payments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SellerPayment'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     totalPayments:
 *                       type: integer
 *                       example: 12
 *                     totalPages:
 *                       type: integer
 *                       example: 2
 *                     hasPreviousPage:
 *                       type: boolean
 *                       example: false
 *                     hasNextPage:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Invalid query parameter
 *       401:
 *         description: Access token is missing or invalid
 *       403:
 *         description: Authenticated account is not a seller
 *       404:
 *         description: Seller not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/",
  getSellerPaymentsController
);

export default router;
