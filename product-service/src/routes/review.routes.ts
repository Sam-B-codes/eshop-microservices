import {
  Router,
} from "express";

import {
  createReview,
  deleteReview,
  deleteSellerReply,
  getPublicProductReviews,
  getReviewEligibility,
  getSellerReviews,
  updateReview,
  updateSellerReply,
} from "../controllers/review.controller";

import {
  isAuthenticated,
} from "../middleware/auth.middleware";

import {
  authorizeRoles,
} from "../middleware/role.middleware";

const router =
  Router();

/**
 * @swagger
 * tags:
 *   - name: Reviews
 *     description: Customer product reviews and seller replies
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ReviewUser:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: 66fa124bf746f40815aba1fe
 *         name:
 *           type: string
 *           example: Saumya Bhardwaaj
 *
 *     ReviewProduct:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: 66fa124bf746f40815aba222
 *         title:
 *           type: string
 *           example: True Wireless Earbuds
 *         slug:
 *           type: string
 *           example: true-wireless-earbuds
 *         images:
 *           description: Product image data
 *
 *     Review:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: 66fa124bf746f40815aba333
 *         userId:
 *           type: string
 *           example: 66fa124bf746f40815aba1fe
 *         productId:
 *           type: string
 *           example: 66fa124bf746f40815aba222
 *         sellerId:
 *           type: string
 *           example: 66fa124bf746f40815aba444
 *         orderId:
 *           type: string
 *           example: 66fa124bf746f40815aba555
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *           example: 5
 *         title:
 *           type: string
 *           nullable: true
 *           example: Excellent product
 *         comment:
 *           type: string
 *           example: The product quality is excellent and delivery was fast.
 *         sellerReply:
 *           type: string
 *           nullable: true
 *           example: Thank you for shopping with us.
 *         sellerRepliedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         status:
 *           type: string
 *           enum:
 *             - PUBLISHED
 *             - HIDDEN
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         user:
 *           $ref: '#/components/schemas/ReviewUser'
 *         product:
 *           $ref: '#/components/schemas/ReviewProduct'
 *
 *     ReviewInput:
 *       type: object
 *       required:
 *         - rating
 *         - comment
 *       properties:
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *           example: 5
 *         title:
 *           type: string
 *           nullable: true
 *           maxLength: 100
 *           example: Excellent product
 *         comment:
 *           type: string
 *           minLength: 10
 *           maxLength: 1000
 *           example: The product quality is excellent and delivery was fast.
 *
 *     SellerReplyInput:
 *       type: object
 *       required:
 *         - reply
 *       properties:
 *         reply:
 *           type: string
 *           minLength: 2
 *           maxLength: 1000
 *           example: Thank you for your review and for shopping with us.
 *
 *     ReviewRatingCounts:
 *       type: object
 *       properties:
 *         1:
 *           type: integer
 *           example: 1
 *         2:
 *           type: integer
 *           example: 0
 *         3:
 *           type: integer
 *           example: 2
 *         4:
 *           type: integer
 *           example: 5
 *         5:
 *           type: integer
 *           example: 12
 *
 *     ReviewPagination:
 *       type: object
 *       properties:
 *         page:
 *           type: integer
 *           example: 1
 *         limit:
 *           type: integer
 *           example: 10
 *         totalReviews:
 *           type: integer
 *           example: 20
 *         totalPages:
 *           type: integer
 *           example: 2
 *         hasPreviousPage:
 *           type: boolean
 *           example: false
 *         hasNextPage:
 *           type: boolean
 *           example: true
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: Request could not be completed
 */

// ======================================================
// PUBLIC PRODUCT REVIEWS
// ======================================================

/**
 * @swagger
 * /api/reviews/product/{productId}:
 *   get:
 *     summary: Get public reviews for a product
 *     description: Returns published customer reviews, rating summary and pagination for a product.
 *     tags:
 *       - Reviews
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product identifier
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Requested page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Reviews per page
 *       - in: query
 *         name: rating
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         description: Filter reviews by star rating
 *     responses:
 *       200:
 *         description: Product reviews loaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 summary:
 *                   type: object
 *                   properties:
 *                     averageRating:
 *                       type: number
 *                       format: float
 *                       example: 4.6
 *                     totalReviews:
 *                       type: integer
 *                       example: 20
 *                     ratingCounts:
 *                       $ref: '#/components/schemas/ReviewRatingCounts'
 *                 reviews:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Review'
 *                 pagination:
 *                   $ref: '#/components/schemas/ReviewPagination'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  "/product/:productId",
  getPublicProductReviews
);

// ======================================================
// CUSTOMER ELIGIBILITY
// ======================================================

/**
 * @swagger
 * /api/reviews/eligibility/{productId}:
 *   get:
 *     summary: Check whether the customer can review a product
 *     description: A customer is eligible only after a paid and delivered purchase of the product.
 *     tags:
 *       - Reviews
 *     security:
 *       - bearerAuth: []
 *       - userCookieAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product identifier
 *     responses:
 *       200:
 *         description: Review eligibility returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 eligible:
 *                   type: boolean
 *                   example: true
 *                 alreadyReviewed:
 *                   type: boolean
 *                   example: false
 *                 review:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Review'
 *                   nullable: true
 *                 orderId:
 *                   type: string
 *                   nullable: true
 *                   example: 66fa124bf746f40815aba555
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Product not found
 */
router.get(
  "/eligibility/:productId",
  isAuthenticated,
  authorizeRoles("user"),
  getReviewEligibility
);

// ======================================================
// CREATE CUSTOMER REVIEW
// ======================================================

/**
 * @swagger
 * /api/reviews/product/{productId}:
 *   post:
 *     summary: Create a product review
 *     description: Creates one review for an authenticated customer who has a paid and delivered purchase of the product.
 *     tags:
 *       - Reviews
 *     security:
 *       - bearerAuth: []
 *       - userCookieAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product identifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReviewInput'
 *     responses:
 *       201:
 *         description: Review published successfully
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
 *                   example: Review published successfully
 *                 review:
 *                   $ref: '#/components/schemas/Review'
 *       400:
 *         description: Invalid review, duplicate review, or customer is not eligible
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Product not found
 */
router.post(
  "/product/:productId",
  isAuthenticated,
  authorizeRoles("user"),
  createReview
);

// ======================================================
// UPDATE CUSTOMER REVIEW
// ======================================================

/**
 * @swagger
 * /api/reviews/{reviewId}:
 *   patch:
 *     summary: Update the authenticated customer's review
 *     description: Updates rating, title and comment. A customer can update only their own review.
 *     tags:
 *       - Reviews
 *     security:
 *       - bearerAuth: []
 *       - userCookieAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *         description: Review identifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReviewInput'
 *     responses:
 *       200:
 *         description: Review updated successfully
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
 *                   example: Review updated successfully
 *                 review:
 *                   $ref: '#/components/schemas/Review'
 *       400:
 *         description: Invalid review content
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Review not found or does not belong to the customer
 */
router.patch(
  "/:reviewId",
  isAuthenticated,
  authorizeRoles("user"),
  updateReview
);

// ======================================================
// DELETE CUSTOMER REVIEW
// ======================================================

/**
 * @swagger
 * /api/reviews/{reviewId}:
 *   delete:
 *     summary: Delete the authenticated customer's review
 *     description: Permanently deletes a review belonging to the authenticated customer.
 *     tags:
 *       - Reviews
 *     security:
 *       - bearerAuth: []
 *       - userCookieAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *         description: Review identifier
 *     responses:
 *       200:
 *         description: Review deleted successfully
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
 *                   example: Review deleted successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Review not found or does not belong to the customer
 */
router.delete(
  "/:reviewId",
  isAuthenticated,
  authorizeRoles("user"),
  deleteReview
);

// ======================================================
// SELLER REVIEW LIST
// ======================================================

/**
 * @swagger
 * /api/reviews/seller/list:
 *   get:
 *     summary: Get reviews for the authenticated seller
 *     description: Returns reviews belonging only to products owned by the authenticated seller.
 *     tags:
 *       - Reviews
 *     security:
 *       - bearerAuth: []
 *       - userCookieAuth: []
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
 *         description: Search customer, product, title or comment
 *       - in: query
 *         name: rating
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         description: Filter by star rating
 *       - in: query
 *         name: replied
 *         schema:
 *           type: boolean
 *         description: Filter replied or awaiting-reply reviews
 *     responses:
 *       200:
 *         description: Seller reviews loaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 summary:
 *                   type: object
 *                   properties:
 *                     averageRating:
 *                       type: number
 *                       format: float
 *                       example: 4.5
 *                     totalReviews:
 *                       type: integer
 *                       example: 24
 *                     repliedReviews:
 *                       type: integer
 *                       example: 18
 *                     awaitingReply:
 *                       type: integer
 *                       example: 6
 *                 reviews:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Review'
 *                 pagination:
 *                   $ref: '#/components/schemas/ReviewPagination'
 *       401:
 *         description: Seller authentication required
 */
router.get(
  "/seller/list",
  isAuthenticated,
  authorizeRoles("seller"),
  getSellerReviews
);

// ======================================================
// CREATE OR UPDATE SELLER REPLY
// ======================================================

/**
 * @swagger
 * /api/reviews/seller/{reviewId}/reply:
 *   patch:
 *     summary: Create or update a seller reply
 *     description: The authenticated seller can reply only to a review associated with one of their products.
 *     tags:
 *       - Reviews
 *     security:
 *       - bearerAuth: []
 *       - userCookieAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *         description: Review identifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SellerReplyInput'
 *     responses:
 *       200:
 *         description: Seller reply saved successfully
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
 *                   example: Reply saved successfully
 *                 review:
 *                   $ref: '#/components/schemas/Review'
 *       400:
 *         description: Invalid reply
 *       401:
 *         description: Seller authentication required
 *       404:
 *         description: Review not found or does not belong to the seller
 */
router.patch(
  "/seller/:reviewId/reply",
  isAuthenticated,
  authorizeRoles("seller"),
  updateSellerReply
);

// ======================================================
// DELETE SELLER REPLY
// ======================================================

/**
 * @swagger
 * /api/reviews/seller/{reviewId}/reply:
 *   delete:
 *     summary: Delete a seller reply
 *     description: Removes the authenticated seller's response from a review.
 *     tags:
 *       - Reviews
 *     security:
 *       - bearerAuth: []
 *       - userCookieAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *         description: Review identifier
 *     responses:
 *       200:
 *         description: Seller reply removed successfully
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
 *                   example: Reply removed successfully
 *                 review:
 *                   $ref: '#/components/schemas/Review'
 *       401:
 *         description: Seller authentication required
 *       404:
 *         description: Review not found or does not belong to the seller
 */
router.delete(
  "/seller/:reviewId/reply",
  isAuthenticated,
  authorizeRoles("seller"),
  deleteSellerReply
);

export default router;
