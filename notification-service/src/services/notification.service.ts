import { Prisma } from "@prisma/client";

import prisma from "@org/prisma";

import {
  BadRequestError,
  NotFoundError,
} from "@org/error-handler";

import {
  type CreateNotificationInput,
  type NotificationActorRole,
  type NotificationEventType,
  type NotificationListQuery,
  type NotificationRecipientRole,
} from "../types/notification.types";

// ======================================================
// CONSTANTS
// ======================================================

const OBJECT_ID_PATTERN =
  /^[a-f\d]{24}$/i;

const RECIPIENT_ROLES: NotificationRecipientRole[] = [
  "USER",
  "SELLER",
  "ADMIN",
];

const NOTIFICATION_TYPES: NotificationEventType[] = [
  "PAYMENT_SUCCESS",
  "NEW_PAID_ORDER",
  "ORDER_STATUS_UPDATED",
  "NEW_REVIEW",
  "SELLER_REPLY",
  "PAYMENT_RECEIVED",
  "NEW_MESSAGE",
  "SELLER_PAYMENT_SETTLED",
];

// ======================================================
// NORMALIZATION
// ======================================================

const normalizeRequiredText = (
  value: unknown,
  fieldName: string,
  maximumLength: number,
): string => {
  if (typeof value !== "string") {
    throw new BadRequestError(
      `${fieldName} is required`,
    );
  }

  const normalizedValue =
    value.trim();

  if (!normalizedValue) {
    throw new BadRequestError(
      `${fieldName} is required`,
    );
  }

  if (
    normalizedValue.length >
    maximumLength
  ) {
    throw new BadRequestError(
      `${fieldName} cannot exceed ${maximumLength} characters`,
    );
  }

  return normalizedValue;
};

const normalizeRecipientId = (
  value: unknown,
): string => {
  const recipientId =
    normalizeRequiredText(
      value,
      "Recipient ID",
      100,
    );

  if (
    !OBJECT_ID_PATTERN.test(
      recipientId,
    )
  ) {
    throw new BadRequestError(
      "Recipient ID is invalid",
    );
  }

  return recipientId;
};

const normalizeActionUrl = (
  value: unknown,
): string | null => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  if (typeof value !== "string") {
    throw new BadRequestError(
      "Action URL must be a string",
    );
  }

  const actionUrl =
    value.trim();

  if (
    !actionUrl.startsWith("/") ||
    actionUrl.startsWith("//")
  ) {
    throw new BadRequestError(
      "Action URL must be a relative application path",
    );
  }

  if (actionUrl.length > 500) {
    throw new BadRequestError(
      "Action URL cannot exceed 500 characters",
    );
  }

  return actionUrl;
};

const normalizeMetadata = (
  value: unknown,
): Prisma.InputJsonValue | undefined => {
  if (
    value === undefined ||
    value === null
  ) {
    return undefined;
  }

  if (
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    throw new BadRequestError(
      "Metadata must be an object",
    );
  }

  return value as Prisma.InputJsonValue;
};

// ======================================================
// ROLE CONVERSION
// ======================================================

export const toRecipientRole = (
  role: NotificationActorRole,
): NotificationRecipientRole => {
  switch (role) {
    case "user":
      return "USER";

    case "seller":
      return "SELLER";

    case "admin":
      return "ADMIN";
  }
};

// ======================================================
// CREATE IDEMPOTENT NOTIFICATION
// ======================================================

export const createNotification =
  async (
    input: CreateNotificationInput,
  ) => {
    const recipientId =
      normalizeRecipientId(
        input.recipientId,
      );

    const recipientRole =
      input.recipientRole;

    if (
      !RECIPIENT_ROLES.includes(
        recipientRole,
      )
    ) {
      throw new BadRequestError(
        "Invalid notification recipient role",
      );
    }

    const type = input.type;

    if (
      !NOTIFICATION_TYPES.includes(
        type,
      )
    ) {
      throw new BadRequestError(
        "Invalid notification type",
      );
    }

    const title =
      normalizeRequiredText(
        input.title,
        "Title",
        120,
      );

    const message =
      normalizeRequiredText(
        input.message,
        "Message",
        500,
      );

    const actionUrl =
      normalizeActionUrl(
        input.actionUrl,
      );

    const metadata =
      normalizeMetadata(
        input.metadata,
      );

    const idempotencyKey =
      normalizeRequiredText(
        input.idempotencyKey,
        "Idempotency key",
        250,
      );

    return prisma.notification.upsert({
      where: {
        idempotencyKey,
      },

      update: {},

      create: {
        recipientId,
        recipientRole,
        type,
        title,
        message,
        actionUrl,
        metadata,
        idempotencyKey,
      },
    });
  };

// ======================================================
// GET NOTIFICATIONS
// ======================================================

export const getNotifications =
  async (
    recipientId: string,
    recipientRole: NotificationRecipientRole,
    query: NotificationListQuery = {},
  ) => {
    const normalizedRecipientId =
      normalizeRecipientId(
        recipientId,
      );

    const page = Math.max(
      1,
      query.page ?? 1,
    );

    const limit = Math.min(
      50,
      Math.max(
        1,
        query.limit ?? 10,
      ),
    );

    const where = {
      recipientId:
        normalizedRecipientId,

      recipientRole,

      ...(query.unreadOnly
        ? {
            isRead: false,
          }
        : {}),
    };

    const [
      notifications,
      totalNotifications,
      unreadCount,
    ] = await Promise.all([
      prisma.notification.findMany({
        where,

        orderBy: {
          createdAt: "desc",
        },

        skip:
          (page - 1) *
          limit,

        take: limit,
      }),

      prisma.notification.count({
        where,
      }),

      prisma.notification.count({
        where: {
          recipientId:
            normalizedRecipientId,

          recipientRole,

          isRead: false,
        },
      }),
    ]);

    const totalPages = Math.max(
      1,
      Math.ceil(
        totalNotifications /
          limit,
      ),
    );

    return {
      notifications,
      unreadCount,

      pagination: {
        page,
        limit,
        totalNotifications,
        totalPages,
        hasPreviousPage:
          page > 1,
        hasNextPage:
          page < totalPages,
      },
    };
  };

// ======================================================
// GET UNREAD COUNT
// ======================================================

export const getUnreadNotificationCount =
  async (
    recipientId: string,
    recipientRole: NotificationRecipientRole,
  ): Promise<number> => {
    return prisma.notification.count({
      where: {
        recipientId:
          normalizeRecipientId(
            recipientId,
          ),

        recipientRole,

        isRead: false,
      },
    });
  };

// ======================================================
// MARK ONE AS READ
// ======================================================

export const markNotificationAsRead =
  async (
    notificationId: string,
    recipientId: string,
    recipientRole: NotificationRecipientRole,
  ) => {
    const normalizedNotificationId =
      normalizeRecipientId(
        notificationId,
      );

    const notification =
      await prisma.notification.findFirst(
        {
          where: {
            id: normalizedNotificationId,

            recipientId:
              normalizeRecipientId(
                recipientId,
              ),

            recipientRole,
          },

          select: {
            id: true,
            isRead: true,
          },
        },
      );

    if (!notification) {
      throw new NotFoundError(
        "Notification not found",
      );
    }

    if (notification.isRead) {
      return prisma.notification.findUnique(
        {
          where: {
            id: notification.id,
          },
        },
      );
    }

    return prisma.notification.update({
      where: {
        id: notification.id,
      },

      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  };

// ======================================================
// MARK ALL AS READ
// ======================================================

export const markAllNotificationsAsRead =
  async (
    recipientId: string,
    recipientRole: NotificationRecipientRole,
  ) => {
    const result =
      await prisma.notification.updateMany(
        {
          where: {
            recipientId:
              normalizeRecipientId(
                recipientId,
              ),

            recipientRole,

            isRead: false,
          },

          data: {
            isRead: true,
            readAt: new Date(),
          },
        },
      );

    return {
      updatedCount:
        result.count,
    };
  };