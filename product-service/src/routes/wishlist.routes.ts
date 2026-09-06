import { Router } from "express";

import {
  addToWishlistController,
  clearWishlistController,
  getWishlistController,
  removeFromWishlistController,
} from "../controllers/wishlist.controller";

import {
  isAuthenticated,
} from "../middleware/auth.middleware";

import {
  authorizeRoles,
} from "../middleware/role.middleware";

const router = Router();

// ======================================================
// CUSTOMER AUTHENTICATION
// ======================================================

router.use(
  isAuthenticated,
  authorizeRoles("user")
);

/**
 * @swagger
 * /api/wishlist:
 *   get:
 *     summary: Get logged-in user's wishlist
 *     description: >
 *       Returns the authenticated customer's wishlist with
 *       current product pricing, stock, availability and
 *       discount information.
 *     tags:
 *       - Wishlist
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Wishlist fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 wishlist:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       nullable: true
 *                       example: 6a96a2c845fc889c833478c6
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           productId:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           product:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               title:
 *                                 type: string
 *                                 example: Nike Air Max 270
 *                               slug:
 *                                 type: string
 *                                 example: demo-nike-air-max-270
 *                               description:
 *                                 type: string
 *                               category:
 *                                 type: string
 *                                 example: Shoes
 *                               brand:
 *                                 type: string
 *                                 nullable: true
 *                                 example: Nike
 *                               price:
 *                                 type: number
 *                                 example: 12999
 *                               discountPrice:
 *                                 type: number
 *                                 nullable: true
 *                                 example: 9999
 *                               salePrice:
 *                                 type: number
 *                                 example: 9999
 *                               stock:
 *                                 type: integer
 *                                 example: 18
 *                               images:
 *                                 type: array
 *                                 items:
 *                                   type: object
 *                               status:
 *                                 type: string
 *                                 example: PUBLISHED
 *                               available:
 *                                 type: boolean
 *                                 example: true
 *                               availability:
 *                                 type: string
 *                                 enum:
 *                                   - IN_STOCK
 *                                   - OUT_OF_STOCK
 *                               hasDiscount:
 *                                 type: boolean
 *                                 example: true
 *                               discountPercentage:
 *                                 type: integer
 *                                 example: 23
 *                     itemCount:
 *                       type: integer
 *                       example: 1
 *
 *       401:
 *         description: Authentication required
 *       403:
 *         description: User role required
 *       500:
 *         description: Internal server error
 */
router.get(
  "/",
  getWishlistController
);

/**
 * @swagger
 * /api/wishlist/items:
 *   post:
 *     summary: Add product to wishlist
 *     description: >
 *       Adds a published product to the authenticated
 *       customer's wishlist. Adding the same product again
 *       does not create a duplicate wishlist item.
 *     tags:
 *       - Wishlist
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *             properties:
 *               productId:
 *                 type: string
 *                 example: 6a948f8a24797bdeabf8f86b
 *           example:
 *             productId: 6a948f8a24797bdeabf8f86b
 *
 *     responses:
 *       200:
 *         description: Product added to wishlist successfully
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
 *                   example: Product added to wishlist successfully
 *                 wishlist:
 *                   type: object
 *
 *       400:
 *         description: Invalid product ID
 *       401:
 *         description: Authentication required
 *       403:
 *         description: User role required
 *       404:
 *         description: Product not found or unavailable
 *       500:
 *         description: Internal server error
 */
router.post(
  "/items",
  addToWishlistController
);

/**
 * @swagger
 * /api/wishlist/items/{productId}:
 *   delete:
 *     summary: Remove product from wishlist
 *     description: >
 *       Removes a product from the authenticated
 *       customer's wishlist.
 *     tags:
 *       - Wishlist
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         description: Product ID to remove
 *         schema:
 *           type: string
 *         example: 6a948f8a24797bdeabf8f86b
 *
 *     responses:
 *       200:
 *         description: Product removed from wishlist successfully
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
 *                   example: Product removed from wishlist successfully
 *                 wishlist:
 *                   type: object
 *
 *       401:
 *         description: Authentication required
 *       403:
 *         description: User role required
 *       404:
 *         description: Wishlist or product not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/items/:productId",
  removeFromWishlistController
);

/**
 * @swagger
 * /api/wishlist:
 *   delete:
 *     summary: Clear wishlist
 *     description: >
 *       Removes every product from the authenticated
 *       customer's wishlist. Clearing an already empty
 *       wishlist is considered successful.
 *     tags:
 *       - Wishlist
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Wishlist cleared successfully
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
 *                   example: Wishlist cleared successfully
 *                 wishlist:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       nullable: true
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                     itemCount:
 *                       type: integer
 *                       example: 0
 *
 *       401:
 *         description: Authentication required
 *       403:
 *         description: User role required
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/",
  clearWishlistController
);

export default router;