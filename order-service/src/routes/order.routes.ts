import {
  Router,
} from "express";

import {
  createOrderController,
} from "../controllers/order.controller";

import {
  isAuthenticated,
} from "../middleware/auth.middleware";

const router =
  Router();

// ======================================================
// CREATE ORDER
// ======================================================

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a pending order from the user's cart
 *     description: |
 *       Creates an authoritative pending order using the
 *       authenticated customer's current cart.
 *
 *       The server validates:
 *       - Customer
 *       - Cart contents
 *       - Product availability
 *       - Product stock
 *       - Current sale prices
 *       - Seller-specific coupon
 *       - Shipping and contact information
 *
 *       Creating an order does not reduce stock, consume
 *       the coupon, or clear the cart. Those operations
 *       happen only after payment verification.
 *
 *     tags:
 *       - Checkout
 *
 *     security:
 *       - userCookieAuth: []
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - phone
 *               - shippingAddress
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               shippingAddress:
 *                 type: object
 *                 required:
 *                   - fullName
 *                   - addressLine1
 *                   - city
 *                   - state
 *                   - postalCode
 *                   - country
 *                 properties:
 *                   fullName:
 *                     type: string
 *                   addressLine1:
 *                     type: string
 *                   addressLine2:
 *                     type: string
 *                     nullable: true
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   postalCode:
 *                     type: string
 *                   country:
 *                     type: string
 *               coupon:
 *                 type: object
 *                 nullable: true
 *                 required:
 *                   - code
 *                   - sellerId
 *                 properties:
 *                   code:
 *                     type: string
 *                   sellerId:
 *                     type: string
 *
 *     responses:
 *       201:
 *         description: Pending order created successfully
 *       400:
 *         description: Invalid order or cart
 *       401:
 *         description: Authentication required
 *       404:
 *         description: User or required resource not found
 *       500:
 *         description: Internal server error
 */
router.post(
  "/",
  isAuthenticated,
  createOrderController
);

export default router;
