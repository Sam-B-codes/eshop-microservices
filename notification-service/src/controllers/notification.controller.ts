import {
  type NextFunction,
  type Request,
  type Response,
} from "express";

import {
  AuthenticationError,
  BadRequestError,
} from "@org/error-handler";

import {
  createNotification,
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  toRecipientRole,
} from "../services/notification.service";

import {
  type CreateNotificationInput,
  type NotificationAuthRequest,
} from "../types/notification.types";

// ======================================================
// QUERY VALUE
// ======================================================

const getQueryValue = (
  value: unknown
): string | undefined => {
  if (
    typeof value ===
    "string"
  ) {
    return (
      value.trim() ||
      undefined
    );
  }

  if (
    Array.isArray(value) &&
    typeof value[0] ===
      "string"
  ) {
    return (
      value[0].trim() ||
      undefined
    );
  }

  return undefined;
};

// ======================================================
// POSITIVE INTEGER
// ======================================================

const parsePositiveInteger = (
  value: unknown,
  fieldName: string
): number | undefined => {
  const normalizedValue =
    getQueryValue(value);

  if (!normalizedValue) {
    return undefined;
  }

  const parsedValue =
    Number(normalizedValue);

  if (
    !Number.isInteger(
      parsedValue
    ) ||
    parsedValue < 1
  ) {
    throw new BadRequestError(
      `${fieldName} must be a positive integer`
    );
  }

  return parsedValue;
};

// ======================================================
// BOOLEAN
// ======================================================

const parseBoolean = (
  value: unknown,
  fieldName: string
): boolean | undefined => {
  const normalizedValue =
    getQueryValue(value)
      ?.toLowerCase();

  if (!normalizedValue) {
    return undefined;
  }

  if (
    normalizedValue ===
    "true"
  ) {
    return true;
  }

  if (
    normalizedValue ===
    "false"
  ) {
    return false;
  }

  throw new BadRequestError(
    `${fieldName} must be true or false`
  );
};

// ======================================================
// AUTHENTICATED ACTOR
// ======================================================

const getActor = (
  req: NotificationAuthRequest
) => {
  if (!req.actor) {
    throw new AuthenticationError(
      "Authentication required"
    );
  }

  return {
    recipientId:
      req.actor.id,

    recipientRole:
      toRecipientRole(
        req.actor.role
      ),
  };
};

// ======================================================
// NOTIFICATION ID
// ======================================================

const getNotificationId = (
  req: NotificationAuthRequest
): string => {
  const rawNotificationId =
    req.params.notificationId;

  const notificationId =
    Array.isArray(
      rawNotificationId
    )
      ? rawNotificationId[0]
      : rawNotificationId;

  if (
    !notificationId ||
    !notificationId.trim()
  ) {
    throw new BadRequestError(
      "Notification ID is required"
    );
  }

  return notificationId.trim();
};

// ======================================================
// CREATE INTERNAL NOTIFICATION
// ======================================================

export const createNotificationController =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const notification =
        await createNotification(
          req.body as
            CreateNotificationInput
        );

      return res.status(201).json({
        success: true,
        message:
          "Notification processed successfully",
        notification,
      });
    } catch (error) {
      return next(error);
    }
  };

// ======================================================
// GET NOTIFICATIONS
// ======================================================

export const getNotificationsController =
  async (
    req:
      NotificationAuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const actor =
        getActor(req);

      const result =
        await getNotifications(
          actor.recipientId,
          actor.recipientRole,
          {
            page:
              parsePositiveInteger(
                req.query.page,
                "Page"
              ),

            limit:
              parsePositiveInteger(
                req.query.limit,
                "Limit"
              ),

            unreadOnly:
              parseBoolean(
                req.query
                  .unreadOnly,
                "Unread only"
              ),
          }
        );

      return res.status(200).json({
        success: true,
        message:
          "Notifications fetched successfully",
        ...result,
      });
    } catch (error) {
      return next(error);
    }
  };

// ======================================================
// GET UNREAD COUNT
// ======================================================

export const getUnreadCountController =
  async (
    req:
      NotificationAuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const actor =
        getActor(req);

      const unreadCount =
        await getUnreadNotificationCount(
          actor.recipientId,
          actor.recipientRole
        );

      return res.status(200).json({
        success: true,
        unreadCount,
      });
    } catch (error) {
      return next(error);
    }
  };

// ======================================================
// MARK ONE AS READ
// ======================================================

export const markNotificationAsReadController =
  async (
    req:
      NotificationAuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const actor =
        getActor(req);

      const notification =
        await markNotificationAsRead(
          getNotificationId(req),
          actor.recipientId,
          actor.recipientRole
        );

      return res.status(200).json({
        success: true,
        message:
          "Notification marked as read",
        notification,
      });
    } catch (error) {
      return next(error);
    }
  };

// ======================================================
// MARK ALL AS READ
// ======================================================

export const markAllNotificationsAsReadController =
  async (
    req:
      NotificationAuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const actor =
        getActor(req);

      const result =
        await markAllNotificationsAsRead(
          actor.recipientId,
          actor.recipientRole
        );

      return res.status(200).json({
        success: true,
        message:
          "All notifications marked as read",
        ...result,
      });
    } catch (error) {
      return next(error);
    }
  };