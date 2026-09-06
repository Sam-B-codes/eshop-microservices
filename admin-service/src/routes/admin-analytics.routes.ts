import { Router } from "express";

import { getAdminAnalyticsController } from "../controllers/admin-analytics.controller";

import { isAdminAuthenticated } from "../middleware/admin-auth.middleware";

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: Admin Analytics
 *     description: Marketplace performance and growth analytics
 */

/**
 * @openapi
 * /api/admin/analytics:
 *   get:
 *     summary: Get marketplace analytics
 *     tags:
 *       - Admin Analytics
 *     security:
 *       - adminCookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: range
 *         schema:
 *           type: string
 *           default: 30D
 *           enum:
 *             - 7D
 *             - 30D
 *             - 90D
 *             - 1Y
 *     responses:
 *       200:
 *         description: Analytics fetched successfully
 *       400:
 *         description: Invalid analytics range
 *       401:
 *         description: Admin authentication required
 */
router.get("/", isAdminAuthenticated, getAdminAnalyticsController);

export default router;
