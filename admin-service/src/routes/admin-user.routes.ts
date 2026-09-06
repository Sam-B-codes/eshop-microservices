import { Router } from "express";

import {
  getAdminUsersController,
  updateAdminUserStatusController,
} from "../controllers/admin-user.controller";

import { isAdminAuthenticated } from "../middleware/admin-auth.middleware";

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: Admin Users
 *     description: Customer account management for administrators
 */

/**
 * @openapi
 * /api/admin/users:
 *   get:
 *     summary: Get customers
 *     tags:
 *       - Admin Users
 *     security:
 *       - adminCookieAuth: []
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
 *         description: Search by customer name or email
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum:
 *             - ACTIVE
 *             - SUSPENDED
 *     responses:
 *       200:
 *         description: Customers fetched successfully
 *       400:
 *         description: Invalid filter
 *       401:
 *         description: Admin authentication required
 */
router.get("/", isAdminAuthenticated, getAdminUsersController);

/**
 * @openapi
 * /api/admin/users/{userId}/status:
 *   patch:
 *     summary: Suspend or reactivate a customer
 *     tags:
 *       - Admin Users
 *     security:
 *       - adminCookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
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
 *         description: Customer status updated successfully
 *       400:
 *         description: Invalid status
 *       401:
 *         description: Admin authentication required
 *       404:
 *         description: Customer not found
 */
router.patch(
  "/:userId/status",
  isAdminAuthenticated,
  updateAdminUserStatusController,
);

export default router;
