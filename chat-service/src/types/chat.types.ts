import {
  type Request,
} from "express";

// ======================================================
// AUTHENTICATED ACTOR
// ======================================================

export type ChatActorRole =
  | "user"
  | "seller";

export interface ChatActor {
  id: string;
  role: ChatActorRole;
}

export interface ChatAuthRequest
  extends Request {
  actor?: ChatActor;
}

// ======================================================
// DATABASE ROLES
// ======================================================

export type ChatParticipantRole =
  | "USER"
  | "SELLER";

export type ChatMessageType =
  | "TEXT"
  | "SYSTEM";

// ======================================================
// CREATE CONVERSATION
// ======================================================

export interface CreateConversationInput {
  orderId: string;
  sellerId: string;
}

// ======================================================
// SEND MESSAGE
// ======================================================

export interface SendMessageInput {
  content: string;
}

// ======================================================
// LIST QUERY
// ======================================================

export interface ChatListQuery {
  page?: number;
  limit?: number;
}

export interface MessageListQuery {
  page?: number;
  limit?: number;
}

// ======================================================
// PAGINATION
// ======================================================

export interface PaginationResult {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}