import { Router } from "express";

import { getAdminDashboardController } from "../controllers/admin-dashboard.controller";

import { isAdminAuthenticated } from "../middleware/admin-auth.middleware";

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: Admin Dashboard
 *     description: Marketplace-wide Admin dashboard statistics
 */

/**
 * @openapi
 * /api/admin/dashboard:
 *   get:
 *     summary: Get the Admin dashboard
 *     description: Returns marketplace statistics and recent orders. Requires an authenticated active Admin.
 *     tags:
 *       - Admin Dashboard
 *     security:
 *       - adminCookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin dashboard fetched successfully
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
 *                   example: Admin dashboard fetched successfully
 *                 summary:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                     sellers:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         onboarded:
 *                           type: integer
 *                         awaitingOnboarding:
 *                           type: integer
 *                         bankConnected:
 *                           type: integer
 *                     products:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         published:
 *                           type: integer
 *                         draft:
 *                           type: integer
 *                         outOfStock:
 *                           type: integer
 *                         lowStock:
 *                           type: integer
 *                     orders:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         pendingPayment:
 *                           type: integer
 *                         confirmed:
 *                           type: integer
 *                         processing:
 *                           type: integer
 *                         shipped:
 *                           type: integer
 *                         delivered:
 *                           type: integer
 *                         cancelled:
 *                           type: integer
 *                     revenue:
 *                       type: object
 *                       properties:
 *                         grossOrderRevenue:
 *                           type: number
 *                         marketplaceGrossAmount:
 *                           type: number
 *                         totalDiscounts:
 *                           type: number
 *                         platformFees:
 *                           type: number
 *                         sellerEarnings:
 *                           type: number
 *                     settlements:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         pending:
 *                           type: integer
 *                         processing:
 *                           type: integer
 *                         settled:
 *                           type: integer
 *                         failed:
 *                           type: integer
 *                 recentOrders:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       status:
 *                         type: string
 *                       paymentStatus:
 *                         type: string
 *                       totalAmount:
 *                         type: number
 *                       customerName:
 *                         type: string
 *                       customerEmail:
 *                         type: string
 *                       itemCount:
 *                         type: integer
 *                       sellerCount:
 *                         type: integer
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Admin authentication is missing or invalid
 *       500:
 *         description: Internal server error
 */
router.get("/", isAdminAuthenticated, getAdminDashboardController);

export default router;
