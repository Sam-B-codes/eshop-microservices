import api from "./api";

import {
  type MarkAllNotificationsReadResponse,
  type MarkNotificationReadResponse,
  type NotificationListResponse,
  type UnreadCountResponse,
} from "@/types/notification";

// ======================================================
// GET NOTIFICATIONS
// ======================================================

export const getSellerNotifications =
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
        "/notifications/seller",
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

export const getSellerUnreadCount =
  async (): Promise<
    UnreadCountResponse
  > => {
    const response =
      await api.get<
        UnreadCountResponse
      >(
        "/notifications/seller/unread-count"
      );

    return response.data;
  };

// ======================================================
// MARK ONE AS READ
// ======================================================

export const markSellerNotificationAsRead =
  async (
    notificationId: string
  ): Promise<
    MarkNotificationReadResponse
  > => {
    const response =
      await api.patch<
        MarkNotificationReadResponse
      >(
        `/notifications/seller/${notificationId}/read`
      );

    return response.data;
  };

// ======================================================
// MARK ALL AS READ
// ======================================================

export const markAllSellerNotificationsAsRead =
  async (): Promise<
    MarkAllNotificationsReadResponse
  > => {
    const response =
      await api.patch<
        MarkAllNotificationsReadResponse
      >(
        "/notifications/seller/read-all"
      );

    return response.data;
  };