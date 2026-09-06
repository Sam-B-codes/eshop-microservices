import { Router } from "express";

import {
  isAuthenticated,
} from "../middleware/auth.middleware";

import {
  createPaymentOrderController,
  verifyPaymentController,
} from "../controllers/payment.controller";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Payments
 *     description: Razorpay payment management
 */

/**
 * @swagger
 * /api/payments/create-order:
 *   post:
 *     summary: Create or reuse a Razorpay payment order
 *     description: >
 *       Creates a Razorpay order for an existing internal e-commerce order.
 *       The payable amount is fetched from the internal Order stored in the
 *       database. The client must never send the payment amount.
 *       If a Razorpay order has already been created for the internal order,
 *       the existing Razorpay order is reused.
 *     tags:
 *       - Payments
 *     security:
 *       - userCookieAuth: []
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *             properties:
 *               orderId:
 *                 type: string
 *                 description: Internal e-commerce order ID
 *                 example: "6a97287f6947b18feb15a09f"
 *
 *     responses:
 *       201:
 *         description: Razorpay payment order created successfully
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
 *                   example: "Payment order created successfully"
 *                 payment:
 *                   type: object
 *                   properties:
 *                     internalOrderId:
 *                       type: string
 *                       example: "6a97287f6947b18feb15a09f"
 *                     razorpayOrderId:
 *                       type: string
 *                       example: "order_TWu4aUWs3raA5g"
 *                     amount:
 *                       type: integer
 *                       description: Authoritative payable amount in paise
 *                       example: 961700
 *                     currency:
 *                       type: string
 *                       example: "INR"
 *                     keyId:
 *                       type: string
 *                       description: Public Razorpay Key ID used by Razorpay Checkout
 *                       example: "rzp_test_xxxxxxxxx"
 *
 *       400:
 *         description: Invalid order or order cannot be paid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "This order is not awaiting payment"
 *
 *       401:
 *         description: User is not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Please login first"
 *
 *       404:
 *         description: Order not found or does not belong to the authenticated user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Order not found"
 *
 *       500:
 *         description: Internal server or payment provider error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */

router.post(
  "/create-order",
  isAuthenticated,
  createPaymentOrderController
);

/**
 * @swagger
 * /api/payments/verify:
 *   post:
 *     summary: Verify a Razorpay payment
 *     description: >
 *       Securely verifies the Razorpay payment signature on the server.
 *       The backend loads the authoritative Razorpay order ID from the
 *       internal Order record and uses RAZORPAY_KEY_SECRET to verify the
 *       HMAC SHA256 signature. After signature verification, the Payment
 *       Service fetches the payment from Razorpay and validates its order,
 *       currency and amount before updating the internal payment state.
 *
 *       The frontend must never directly mark an order as PAID.
 *     tags:
 *       - Payments
 *     security:
 *       - userCookieAuth: []
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - internalOrderId
 *               - razorpayPaymentId
 *               - razorpaySignature
 *             properties:
 *               internalOrderId:
 *                 type: string
 *                 description: Internal e-commerce order ID
 *                 example: "6a97287f6947b18feb15a09f"
 *
 *               razorpayPaymentId:
 *                 type: string
 *                 description: Razorpay payment ID returned by Razorpay Checkout
 *                 example: "pay_TWxxxxxxxxxxxx"
 *
 *               razorpaySignature:
 *                 type: string
 *                 description: Razorpay Checkout payment signature
 *                 example: "9a8b7c6d5e4f..."
 *
 *     responses:
 *       200:
 *         description: Payment verified successfully
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
 *                   example: "Payment verified successfully"
 *
 *                 verified:
 *                   type: boolean
 *                   example: true
 *
 *                 alreadyProcessed:
 *                   type: boolean
 *                   example: false
 *
 *                 order:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "6a97287f6947b18feb15a09f"
 *
 *                     status:
 *                       type: string
 *                       example: "CONFIRMED"
 *
 *                     paymentStatus:
 *                       type: string
 *                       example: "PAID"
 *
 *                     totalAmount:
 *                       type: number
 *                       example: 9617
 *
 *                     paymentProvider:
 *                       type: string
 *                       example: "razorpay"
 *
 *                     paymentOrderId:
 *                       type: string
 *                       example: "order_TWu4aUWs3raA5g"
 *
 *                     paymentId:
 *                       type: string
 *                       example: "pay_TWxxxxxxxxxxxx"
 *
 *       400:
 *         description: Invalid verification data or payment verification failed
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
 *                   example: "Payment signature verification failed"
 *
 *       401:
 *         description: User is not authenticated
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
 *                   example: "Please login first"
 *
 *       404:
 *         description: Internal order not found or does not belong to the authenticated user
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
 *                   example: "Order not found"
 *
 *       500:
 *         description: Internal server or Razorpay provider error
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
 *                   example: "Internal server error"
 */

router.post(
  "/verify",
  isAuthenticated,
  verifyPaymentController
);

export default router;
