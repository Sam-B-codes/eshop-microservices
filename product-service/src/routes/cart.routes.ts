import { Router } from "express";

import {
  addToCartController,
  clearCartController,
  getCartController,
  removeFromCartController,
  updateCartItemController,
} from "../controllers/cart.controller";

import {
  isAuthenticated,
} from "../middleware/auth.middleware";

import {
  authorizeRoles,
} from "../middleware/role.middleware";

const router = Router();

// ======================================================
// ALL CART ROUTES REQUIRE CUSTOMER AUTHENTICATION
// ======================================================

router.use(
  isAuthenticated,
  authorizeRoles("user")
);

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Get logged-in user's cart
 *     description: >
 *       Returns the authenticated customer's cart along with
 *       current product information, item quantities, line totals,
 *       total item count, and subtotal.
 *
 *       Cart totals are calculated using the current product salePrice.
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Cart fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *
 *                 cart:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       nullable: true
 *                       example: 68b5d51f15795742f5d1a001
 *
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: 68b5d61f15795742f5d1a002
 *
 *                           productId:
 *                             type: string
 *                             example: 68b5d71f15795742f5d1a003
 *
 *                           quantity:
 *                             type: integer
 *                             example: 2
 *
 *                           lineTotal:
 *                             type: number
 *                             example: 19998
 *
 *                           product:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 example: 68b5d71f15795742f5d1a003
 *
 *                               title:
 *                                 type: string
 *                                 example: Nike Air Max 270
 *
 *                               slug:
 *                                 type: string
 *                                 example: nike-air-max-270
 *
 *                               description:
 *                                 type: string
 *                                 example: Premium running shoes.
 *
 *                               category:
 *                                 type: string
 *                                 example: Shoes
 *
 *                               brand:
 *                                 type: string
 *                                 nullable: true
 *                                 example: Nike
 *
 *                               price:
 *                                 type: number
 *                                 example: 12999
 *
 *                               discountPrice:
 *                                 type: number
 *                                 nullable: true
 *                                 example: 9999
 *
 *                               salePrice:
 *                                 type: number
 *                                 example: 9999
 *
 *                               stock:
 *                                 type: integer
 *                                 example: 20
 *
 *                               images:
 *                                 type: array
 *                                 items:
 *                                   type: object
 *
 *                               status:
 *                                 type: string
 *                                 example: PUBLISHED
 *
 *                               available:
 *                                 type: boolean
 *                                 example: true
 *
 *                               quantityAvailable:
 *                                 type: boolean
 *                                 example: true
 *
 *                     itemCount:
 *                       type: integer
 *                       example: 2
 *
 *                     subtotal:
 *                       type: number
 *                       example: 19998
 *
 *       401:
 *         description: Authentication required
 *
 *       403:
 *         description: User role required
 *
 *       500:
 *         description: Internal server error
 */
router.get(
  "/",
  getCartController
);

/**
 * @swagger
 * /api/cart/items:
 *   post:
 *     summary: Add product to cart
 *     description: >
 *       Adds a published product to the logged-in user's cart.
 *
 *       If the product already exists in the cart, the requested
 *       quantity is added to the existing quantity.
 *
 *       The final quantity cannot exceed available product stock.
 *     tags:
 *       - Cart
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
 *                 example: 68b5d71f15795742f5d1a003
 *
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 default: 1
 *                 example: 2
 *
 *           example:
 *             productId: 68b5d71f15795742f5d1a003
 *             quantity: 2
 *
 *     responses:
 *       200:
 *         description: Product added to cart successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *
 *                 message:
 *                   type: string
 *                   example: Product added to cart successfully
 *
 *                 cart:
 *                   type: object
 *
 *       400:
 *         description: >
 *           Invalid quantity, out-of-stock product,
 *           or requested quantity exceeds available stock.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *
 *                 message:
 *                   type: string
 *                   example: Only 5 item(s) available
 *
 *       401:
 *         description: Authentication required
 *
 *       403:
 *         description: User role required
 *
 *       404:
 *         description: Product not found or unavailable
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *
 *                 message:
 *                   type: string
 *                   example: Product not found or unavailable
 *
 *       500:
 *         description: Internal server error
 */
router.post(
  "/items",
  addToCartController
);

/**
 * @swagger
 * /api/cart/items/{productId}:
 *   put:
 *     summary: Update cart item quantity
 *     description: >
 *       Updates the quantity of an existing product in the
 *       authenticated user's cart.
 *
 *       Quantity must be at least 1 and cannot exceed
 *       the product's current stock.
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         description: Product ID
 *         schema:
 *           type: string
 *         example: 68b5d71f15795742f5d1a003
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 example: 3
 *
 *           example:
 *             quantity: 3
 *
 *     responses:
 *       200:
 *         description: Cart updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *
 *                 message:
 *                   type: string
 *                   example: Cart updated successfully
 *
 *                 cart:
 *                   type: object
 *
 *       400:
 *         description: Invalid quantity or insufficient stock
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *
 *                 message:
 *                   type: string
 *                   example: Quantity must be a positive integer
 *
 *       401:
 *         description: Authentication required
 *
 *       403:
 *         description: User role required
 *
 *       404:
 *         description: Cart, product, or cart item not found
 *
 *       500:
 *         description: Internal server error
 */
router.put(
  "/items/:productId",
  updateCartItemController
);

/**
 * @swagger
 * /api/cart/items/{productId}:
 *   delete:
 *     summary: Remove product from cart
 *     description: >
 *       Removes a specific product from the authenticated
 *       user's cart.
 *     tags:
 *       - Cart
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
 *         example: 68b5d71f15795742f5d1a003
 *
 *     responses:
 *       200:
 *         description: Product removed from cart successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *
 *                 message:
 *                   type: string
 *                   example: Product removed from cart successfully
 *
 *                 cart:
 *                   type: object
 *
 *       401:
 *         description: Authentication required
 *
 *       403:
 *         description: User role required
 *
 *       404:
 *         description: Cart or product not found in cart
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *
 *                 message:
 *                   type: string
 *                   example: Product not found in cart
 *
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/items/:productId",
  removeFromCartController
);

/**
 * @swagger
 * /api/cart:
 *   delete:
 *     summary: Clear cart
 *     description: >
 *       Removes all items from the authenticated user's cart.
 *
 *       Calling this endpoint when the user has no cart
 *       is also considered successful.
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *
 *                 message:
 *                   type: string
 *                   example: Cart cleared successfully
 *
 *                 cart:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       nullable: true
 *
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *
 *                     itemCount:
 *                       type: integer
 *                       example: 0
 *
 *                     subtotal:
 *                       type: number
 *                       example: 0
 *
 *       401:
 *         description: Authentication required
 *
 *       403:
 *         description: User role required
 *
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/",
  clearCartController
);

export default router;