export type NotificationType =
  | "PAYMENT_SUCCESS"
  | "NEW_PAID_ORDER"
  | "ORDER_STATUS_UPDATED"
  | "NEW_REVIEW"
  | "SELLER_REPLY"
  | "PAYMENT_RECEIVED"
  | "NEW_MESSAGE"
| "SELLER_PAYMENT_SETTLED";

export interface Notification {
  id: string;
  recipientId: string;
  recipientRole:
    | "USER"
    | "SELLER"
    | "ADMIN";

  type:
    NotificationType;

  title: string;
  message: string;

  actionUrl:
    string | null;

  metadata:
    Record<
      string,
      unknown
    > | null;

  idempotencyKey:
    string;

  isRead:
    boolean;

  readAt:
    string | null;

  createdAt:
    string;

  updatedAt:
    string;
}

export interface NotificationPagination {
  page: number;
  limit: number;

  totalNotifications:
    number;

  totalPages:
    number;

  hasPreviousPage:
    boolean;

  hasNextPage:
    boolean;
}

export interface NotificationListResponse {
  success: boolean;
  message: string;

  notifications:
    Notification[];

  unreadCount:
    number;

  pagination:
    NotificationPagination;
}

export interface UnreadCountResponse {
  success: boolean;
  unreadCount: number;
}

export interface MarkNotificationReadResponse {
  success: boolean;
  message: string;

  notification:
    Notification;
}

export interface MarkAllNotificationsReadResponse {
  success: boolean;
  message: string;
  updatedCount: number;
}