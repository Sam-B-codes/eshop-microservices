import api from "./api";

import {
  type MarkAllNotificationsReadResponse,
  type MarkNotificationReadResponse,
  type NotificationListResponse,
  type UnreadCountResponse,
} from "@/types/notification";

// ======================================================
// GET USER NOTIFICATIONS
// ======================================================

export const getUserNotifications =
  async (
    page = 1,
    limit = 10,
    unreadOnly = false
  ): Promise<
    NotificationListResponse
  > => {
    const response =
      await api.get<
        NotificationListResponse
      >(
        "/notifications/user",
        {
          params: {
            page,
            limit,
            unreadOnly,
          },
        }
      );

    return response.data;
  };

// ======================================================
// GET UNREAD COUNT
// ======================================================

export const getUserUnreadCount =
  async (): Promise<
    UnreadCountResponse
  > => {
    const response =
      await api.get<
        UnreadCountResponse
      >(
        "/notifications/user/unread-count"
      );

    return response.data;
  };

// ======================================================
// MARK ONE AS READ
// ======================================================

export const markUserNotificationAsRead =
  async (
    notificationId: string
  ): Promise<
    MarkNotificationReadResponse
  > => {
    const response =
      await api.patch<
        MarkNotificationReadResponse
      >(
        `/notifications/user/${notificationId}/read`
      );

    return response.data;
  };

// ======================================================
// MARK ALL AS READ
// ======================================================

export const markAllUserNotificationsAsRead =
  async (): Promise<
    MarkAllNotificationsReadResponse
  > => {
    const response =
      await api.patch<
        MarkAllNotificationsReadResponse
      >(
        "/notifications/user/read-all"
      );

    return response.data;
  };