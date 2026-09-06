import { Router } from 'express';

import {
  createCouponController,
  getCouponsController,
  getPublicCouponsController,
  getCouponController,
  deleteCouponController,
  updateCouponController,
  validateCouponController,
} from "../controllers/coupon.controller";

import { isAuthenticated } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';

const router = Router();

/**
 * @swagger
 * /api/coupons:
 *   post:
 *     summary: Create a new coupon
 *     description: Creates a coupon for the authenticated seller.
 *     tags:
 *       - Coupons
 *     security:
 *       - sellerCookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCouponRequest'
 *     responses:
 *       201:
 *         description: Coupon created successfully
 *       400:
 *         description: Invalid coupon data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 */
router.post(
  '/',
  isAuthenticated,
  authorizeRoles('seller'),
  createCouponController
);

/**
 * @swagger
 * /api/coupons:
 *   get:
 *     summary: Get seller coupons
 *     description: Returns all coupons belonging to the authenticated seller.
 *     tags:
 *       - Coupons
 *     security:
 *       - sellerCookieAuth: []
 *     responses:
 *       200:
 *         description: Coupons retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 */
router.get(
  '/',
  isAuthenticated,
  authorizeRoles('seller'),
  getCouponsController
);



/**
 * @swagger
 * /api/coupons/validate:
 *   post:
 *     summary: Validate coupon
 *     description: Validates a coupon against an order amount and calculates the discount.
 *     tags:
 *       - Coupons
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - orderAmount
 *             properties:
 *               code:
 *                 type: string
 *                 example: SAVE20
 *               orderAmount:
 *                 type: number
 *                 example: 1000
 *     responses:
 *       200:
 *         description: Coupon applied successfully
 *       400:
 *         description: Invalid or expired coupon
 */
router.post(
  '/validate',
  validateCouponController
);

/**
 * @swagger
 * /api/coupons/public:
 *   get:
 *     summary: Get active public coupons
 *     description: >
 *       Returns active, non-expired coupons that still have
 *       remaining usage. Authentication is not required.
 *       Optionally filter coupons by seller.
 *     tags:
 *       - Public Coupons
 *     parameters:
 *       - in: query
 *         name: sellerId
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter promotions by seller ID
 *     responses:
 *       200:
 *         description: Public coupons fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 coupons:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       sellerId:
 *                         type: string
 *                       code:
 *                         type: string
 *                         example: SAVE20
 *                       description:
 *                         type: string
 *                       discountType:
 *                         type: string
 *                         enum:
 *                           - PERCENTAGE
 *                           - FIXED
 *                       discountValue:
 *                         type: number
 *                       minimumOrderValue:
 *                         type: number
 *                         nullable: true
 *                       maximumDiscount:
 *                         type: number
 *                         nullable: true
 *                       expiryDate:
 *                         type: string
 *                         format: date-time
 *                       remainingUses:
 *                         type: integer
 *                         nullable: true
 *       500:
 *         description: Internal Server Error
 */
router.get(
  "/public",
  getPublicCouponsController
);

/**
 * @swagger
 * /api/coupons/{id}:
 *   get:
 *     summary: Get coupon by ID
 *     description: Returns a specific coupon belonging to the authenticated seller.
 *     tags:
 *       - Coupons
 *     security:
 *       - sellerCookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Coupon ID
 *     responses:
 *       200:
 *         description: Coupon retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Coupon not found
 */
router.get(
  '/:id',
  isAuthenticated,
  authorizeRoles('seller'),
  getCouponController
);

/**
 * @swagger
 * /api/coupons/{id}:
 *   delete:
 *     summary: Delete coupon
 *     description: Deletes a coupon belonging to the authenticated seller.
 *     tags:
 *       - Coupons
 *     security:
 *       - sellerCookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Coupon ID
 *     responses:
 *       200:
 *         description: Coupon deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Coupon not found
 */
router.delete(
  '/:id',
  isAuthenticated,
  authorizeRoles('seller'),
  deleteCouponController
);


/**
 * @swagger
 * /api/coupons/{id}:
 *   put:
 *     summary: Update coupon
 *     description: Updates a coupon belonging to the authenticated seller.
 *     tags:
 *       - Coupons
 *     security:
 *       - sellerCookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Coupon ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCouponRequest'
 *     responses:
 *       200:
 *         description: Coupon updated successfully
 *       400:
 *         description: Invalid coupon data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Coupon not found
 */
router.put(
  '/:id',
  isAuthenticated,
  authorizeRoles('seller'),
  updateCouponController
);

export default router;
