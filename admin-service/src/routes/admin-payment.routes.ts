import { Router } from "express";

import {
  getAdminPaymentsController,
  getAdminPaymentSummaryController,
  updateAdminSettlementStatusController,
} from "../controllers/admin-payment.controller";

import { isAdminAuthenticated } from "../middleware/admin-auth.middleware";

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: Admin Payments
 *     description: Platform revenue and settlement management
 */

/**
 * @openapi
 * /api/admin/payments/summary:
 *   get:
 *     summary: Get marketplace payment summary
 *     tags:
 *       - Admin Payments
 *     security:
 *       - adminCookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment summary fetched successfully
 *       401:
 *         description: Admin authentication required
 */
router.get("/summary", isAdminAuthenticated, getAdminPaymentSummaryController);

/**
 * @openapi
 * /api/admin/payments:
 *   get:
 *     summary: Get marketplace settlements
 *     tags:
 *       - Admin Payments
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
 *             - PENDING
 *             - PROCESSING
 *             - SETTLED
 *             - FAILED
 *     responses:
 *       200:
 *         description: Settlements fetched successfully
 *       401:
 *         description: Admin authentication required
 */
router.get("/", isAdminAuthenticated, getAdminPaymentsController);

/**
 * @openapi
 * /api/admin/payments/{settlementId}/status:
 *   patch:
 *     summary: Update settlement status
 *     description: Updates only the internal settlement ledger and does not initiate a real payout.
 *     tags:
 *       - Admin Payments
 *     security:
 *       - adminCookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: settlementId
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
 *                   - PENDING
 *                   - PROCESSING
 *                   - SETTLED
 *                   - FAILED
 *               failureReason:
 *                 type: string
 *                 description: Required when status is FAILED
 *     responses:
 *       200:
 *         description: Settlement status updated successfully
 *       400:
 *         description: Invalid transition or missing failure reason
 *       404:
 *         description: Settlement not found
 */
router.patch(
  "/:settlementId/status",
  isAdminAuthenticated,
  updateAdminSettlementStatusController,
);

export default router;
