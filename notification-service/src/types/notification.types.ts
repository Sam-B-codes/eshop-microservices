import {
  type Request,
} from "express";

// ======================================================
// AUTHENTICATED ACTOR
// ======================================================

export type NotificationActorRole =
  | "user"
  | "seller"
  | "admin";

export interface NotificationActor {
  id: string;
  role: NotificationActorRole;
}

export interface NotificationAuthRequest
  extends Request {
  actor?: NotificationActor;
}

export interface NotificationJwtPayload {
  id?: unknown;
  role?: unknown;
}

// ======================================================
// DATABASE VALUES
// ======================================================

export type NotificationRecipientRole =
  | "USER"
  | "SELLER"
  | "ADMIN";

export type NotificationEventType =
  | "PAYMENT_SUCCESS"
  | "NEW_PAID_ORDER"
  | "ORDER_STATUS_UPDATED"
  | "NEW_REVIEW"
  | "SELLER_REPLY"
  | "PAYMENT_RECEIVED";

// ======================================================
// CREATE NOTIFICATION
// ======================================================

export interface CreateNotificationInput {
  recipientId: string;

  recipientRole:
    NotificationRecipientRole;

  type:
    NotificationEventType;

  title: string;
  message: string;

  actionUrl?: string | null;

  metadata?: Record<
    string,
    unknown
  > | null;

  idempotencyKey: string;
}

// ======================================================
// LIST_NOTIFICATION LIST
// ======================================================

export interface NotificationListQuery {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}