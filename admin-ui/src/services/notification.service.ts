import api from "./api";

import {
  type MarkAllNotificationsReadResponse,
  type MarkNotificationReadResponse,
  type NotificationListResponse,
  type UnreadCountResponse,
} from "@/types/notification";

// ======================================================
// GET ADMIN NOTIFICATIONS
// ======================================================

export const getAdminNotifications =
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
        "/notifications/admin",
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

export const getAdminUnreadCount =
  async (): Promise<
    UnreadCountResponse
  > => {
    const response =
      await api.get<
        UnreadCountResponse
      >(
        "/notifications/admin/unread-count"
      );

    return response.data;
  };

// ======================================================
// MARK ONE AS READ
// ======================================================

export const markAdminNotificationAsRead =
  async (
    notificationId: string
  ): Promise<
    MarkNotificationReadResponse
  > => {
    const response =
      await api.patch<
        MarkNotificationReadResponse
      >(
        `/notifications/admin/${notificationId}/read`
      );

    return response.data;
  };

// ======================================================
// MARK ALL AS READ
// ======================================================

export const markAllAdminNotificationsAsRead =
  async (): Promise<
    MarkAllNotificationsReadResponse
  > => {
    const response =
      await api.patch<
        MarkAllNotificationsReadResponse
      >(
        "/notifications/admin/read-all"
      );

    return response.data;
  };