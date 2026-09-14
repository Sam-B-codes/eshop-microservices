import {
  Router,
} from "express";

import {
  createNotificationController,
  getNotificationsController,
  getUnreadCountController,
  markAllNotificationsAsReadController,
  markNotificationAsReadController,
} from "../controllers/notification.controller";

import {
  authenticateActor,
} from "../middleware/auth.middleware";

import {
  authenticateInternalService,
} from "../middleware/internal-auth.middleware";

import {
  type NotificationActorRole,
} from "../types/notification.types";

// ======================================================
// ACTOR ROUTER
// ======================================================

const createActorRouter = (
  role: NotificationActorRole
) => {
  const actorRouter =
    Router();

  actorRouter.use(
    authenticateActor(role)
  );

  actorRouter.get(
    "/",
    getNotificationsController
  );

  actorRouter.get(
    "/unread-count",
    getUnreadCountController
  );

  // Must remain above /:notificationId/read.
  actorRouter.patch(
    "/read-all",
    markAllNotificationsAsReadController
  );

  actorRouter.patch(
    "/:notificationId/read",
    markNotificationAsReadController
  );

  return actorRouter;
};

const router =
  Router();

// ======================================================
// INTERNAL CREATE NOTIFICATION
// ======================================================

/**
 * @swagger
 * /api/notifications/internal:
 *   post:
 *     summary: Create or reuse a notification
 *     description: |
 *       Creates a notification for a user, seller, or administrator.
 *       The idempotency key prevents duplicate notifications.
 *       This endpoint is available only to trusted backend services.
 *     tags:
 *       - Internal Notifications
 *     security:
 *       - internalApiKey: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipientId
 *               - recipientRole
 *               - type
 *               - title
 *               - message
 *               - idempotencyKey
 *             properties:
 *               recipientId:
 *                 type: string
 *                 example: 66fa124bf746f40815aba1fe
 *               recipientRole:
 *                 type: string
 *                 enum:
 *                   - USER
 *                   - SELLER
 *                   - ADMIN
 *               type:
 *                 type: string
 *                 enum:
 *                   - PAYMENT_SUCCESS
 *                   - NEW_PAID_ORDER
 *                   - ORDER_STATUS_UPDATED
 *                   - NEW_REVIEW
 *                   - SELLER_REPLY
 *                   - PAYMENT_RECEIVED
 *               title:
 *                 type: string
 *                 example: Payment successful
 *               message:
 *                 type: string
 *                 example: Your payment was verified and your order is confirmed.
 *               actionUrl:
 *                 type: string
 *                 nullable: true
 *                 example: /profile/orders/66fa124bf746f40815aba555
 *               metadata:
 *                 type: object
 *                 nullable: true
 *                 additionalProperties: true
 *               idempotencyKey:
 *                 type: string
 *                 example: payment-success:66fa124bf746f40815aba555:66fa124bf746f40815aba1fe
 *     responses:
 *       201:
 *         description: Notification processed successfully
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
 *                   example: Notification processed successfully
 *                 notification:
 *                   $ref: '#/components/schemas/Notification'
 *       400:
 *         description: Invalid notification data
 *       401:
 *         description: Invalid internal service credentials
 */
router.post(
  "/internal",
  authenticateInternalService,
  createNotificationController
);

// ======================================================
// USER NOTIFICATIONS
// ======================================================

/**
 * @swagger
 * /api/notifications/user:
 *   get:
 *     summary: Get authenticated user notifications
 *     tags:
 *       - User Notifications
 *     security:
 *       - userCookieAuth: []
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
 *         name: unreadOnly
 *         schema:
 *           type: boolean
 *           default: false
 *     responses:
 *       200:
 *         description: User notifications fetched successfully
 *       401:
 *         description: User authentication required
 *
 * /api/notifications/user/unread-count:
 *   get:
 *     summary: Get authenticated user's unread notification count
 *     tags:
 *       - User Notifications
 *     security:
 *       - userCookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread count fetched successfully
 *       401:
 *         description: User authentication required
 *
 * /api/notifications/user/read-all:
 *   patch:
 *     summary: Mark all authenticated user notifications as read
 *     tags:
 *       - User Notifications
 *     security:
 *       - userCookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All user notifications marked as read
 *       401:
 *         description: User authentication required
 *
 * /api/notifications/user/{notificationId}/read:
 *   patch:
 *     summary: Mark one authenticated user notification as read
 *     tags:
 *       - User Notifications
 *     security:
 *       - userCookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User notification marked as read
 *       401:
 *         description: User authentication required
 *       404:
 *         description: Notification not found
 */
router.use(
  "/user",
  createActorRouter(
    "user"
  )
);

// ======================================================
// SELLER NOTIFICATIONS
// ======================================================

/**
 * @swagger
 * /api/notifications/seller:
 *   get:
 *     summary: Get authenticated seller notifications
 *     tags:
 *       - Seller Notifications
 *     security:
 *       - sellerCookieAuth: []
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
 *         name: unreadOnly
 *         schema:
 *           type: boolean
 *           default: false
 *     responses:
 *       200:
 *         description: Seller notifications fetched successfully
 *       401:
 *         description: Seller authentication required
 *
 * /api/notifications/seller/unread-count:
 *   get:
 *     summary: Get authenticated seller's unread notification count
 *     tags:
 *       - Seller Notifications
 *     security:
 *       - sellerCookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread count fetched successfully
 *       401:
 *         description: Seller authentication required
 *
 * /api/notifications/seller/read-all:
 *   patch:
 *     summary: Mark all authenticated seller notifications as read
 *     tags:
 *       - Seller Notifications
 *     security:
 *       - sellerCookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All seller notifications marked as read
 *       401:
 *         description: Seller authentication required
 *
 * /api/notifications/seller/{notificationId}/read:
 *   patch:
 *     summary: Mark one authenticated seller notification as read
 *     tags:
 *       - Seller Notifications
 *     security:
 *       - sellerCookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Seller notification marked as read
 *       401:
 *         description: Seller authentication required
 *       404:
 *         description: Notification not found
 */
router.use(
  "/seller",
  createActorRouter(
    "seller"
  )
);

// ======================================================
// ADMIN NOTIFICATIONS
// ======================================================

/**
 * @swagger
 * /api/notifications/admin:
 *   get:
 *     summary: Get authenticated administrator notifications
 *     tags:
 *       - Admin Notifications
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
 *         name: unreadOnly
 *         schema:
 *           type: boolean
 *           default: false
 *     responses:
 *       200:
 *         description: Administrator notifications fetched successfully
 *       401:
 *         description: Administrator authentication required
 *
 * /api/notifications/admin/unread-count:
 *   get:
 *     summary: Get authenticated administrator's unread notification count
 *     tags:
 *       - Admin Notifications
 *     security:
 *       - adminCookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread count fetched successfully
 *       401:
 *         description: Administrator authentication required
 *
 * /api/notifications/admin/read-all:
 *   patch:
 *     summary: Mark all administrator notifications as read
 *     tags:
 *       - Admin Notifications
 *     security:
 *       - adminCookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All administrator notifications marked as read
 *       401:
 *         description: Administrator authentication required
 *
 * /api/notifications/admin/{notificationId}/read:
 *   patch:
 *     summary: Mark one administrator notification as read
 *     tags:
 *       - Admin Notifications
 *     security:
 *       - adminCookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Administrator notification marked as read
 *       401:
 *         description: Administrator authentication required
 *       404:
 *         description: Notification not found
 */
router.use(
  "/admin",
  createActorRouter(
    "admin"
  )
);

export default router;