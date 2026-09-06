import { Router } from "express";

import {
  getAdminProductsController,
  updateAdminProductStatusController,
} from "../controllers/admin-product.controller";

import { isAdminAuthenticated } from "../middleware/admin-auth.middleware";

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: Admin Products
 *     description: Marketplace-wide product management
 */

/**
 * @openapi
 * /api/admin/products:
 *   get:
 *     summary: Get marketplace products
 *     tags:
 *       - Admin Products
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
 *             - DRAFT
 *             - PUBLISHED
 *             - OUT_OF_STOCK
 *             - ARCHIVED
 *       - in: query
 *         name: stock
 *         schema:
 *           type: string
 *           enum:
 *             - IN_STOCK
 *             - LOW_STOCK
 *             - OUT_OF_STOCK
 *     responses:
 *       200:
 *         description: Products fetched successfully
 *       401:
 *         description: Admin authentication required
 */
router.get("/", isAdminAuthenticated, getAdminProductsController);

/**
 * @openapi
 * /api/admin/products/{productId}/status:
 *   patch:
 *     summary: Update product status
 *     tags:
 *       - Admin Products
 *     security:
 *       - adminCookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
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
 *                   - DRAFT
 *                   - PUBLISHED
 *                   - OUT_OF_STOCK
 *                   - ARCHIVED
 *     responses:
 *       200:
 *         description: Product status updated successfully
 *       400:
 *         description: Invalid status or product cannot be published
 *       404:
 *         description: Product not found
 */
router.patch(
  "/:productId/status",
  isAdminAuthenticated,
  updateAdminProductStatusController,
);

export default router;
