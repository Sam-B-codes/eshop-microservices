import { Router } from "express";

import {
  getSellerDashboardStats,
} from "../controllers/dashboard.controller";

import { isAuthenticated } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";

const router = Router();

/**
 * @swagger
 * /api/seller/dashboard/stats:
 *   get:
 *     summary: Get seller dashboard statistics
 *     description: Returns product statistics for the currently authenticated seller.
 *     tags:
 *       - Seller Dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalProducts:
 *                       type: integer
 *                       example: 25
 *                     publishedProducts:
 *                       type: integer
 *                       example: 18
 *                     draftProducts:
 *                       type: integer
 *                       example: 4
 *                     outOfStockProducts:
 *                       type: integer
 *                       example: 2
 *                     lowStockProducts:
 *                       type: integer
 *                       example: 1
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Seller access required
 *       500:
 *         description: Internal Server Error
 */
router.get(
  "/stats",
  isAuthenticated,
  authorizeRoles("seller"),
  getSellerDashboardStats
);

export default router;