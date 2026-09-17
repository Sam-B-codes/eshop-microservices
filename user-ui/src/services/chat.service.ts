import api from "./api";

import {
  type ConversationListResponse,
  type ConversationMessagesResponse,
  type CreateConversationInput,
  type CreateConversationResponse,
  type MarkConversationReadResponse,
  type PaginationQuery,
  type SendMessageInput,
  type SendMessageResponse,
  type UnreadMessageCountResponse,
} from "@org/chat-client";

// ======================================================
// USER CHAT HEADERS
// ======================================================

const userChatHeaders = {
  "x-chat-role":
    "user",
} as const;

// ======================================================
// CREATE OR REUSE CONVERSATION
// ======================================================

export const createUserConversation =
  async (
    input:
      CreateConversationInput
  ): Promise<CreateConversationResponse> => {
    const response =
      await api.post<
        CreateConversationResponse
      >(
        "/chats",

        input,

        {
          headers:
            userChatHeaders,
        }
      );

    return response.data;
  };

// ======================================================
// GET USER CONVERSATIONS
// ======================================================

export const getUserConversations =
  async (
    query:
      PaginationQuery = {}
  ): Promise<ConversationListResponse> => {
    const response =
      await api.get<
        ConversationListResponse
      >(
        "/chats",
        {
          params: query,

          headers:
            userChatHeaders,
        }
      );

    return response.data;
  };

// ======================================================
// GET USER UNREAD COUNT
// ======================================================

export const getUserChatUnreadCount =
  async (): Promise<UnreadMessageCountResponse> => {
    const response =
      await api.get<
        UnreadMessageCountResponse
      >(
        "/chats/unread-count",
        {
          headers:
            userChatHeaders,
        }
      );

    return response.data;
  };

// ======================================================
// GET CONVERSATION MESSAGES
// ======================================================

export const getUserConversation =
  async (
    conversationId: string,
    query:
      PaginationQuery = {}
  ): Promise<ConversationMessagesResponse> => {
    const response =
      await api.get<
        ConversationMessagesResponse
      >(
        `/chats/${encodeURIComponent(
          conversationId
        )}`,
        {
          params: query,

          headers:
            userChatHeaders,
        }
      );

    return response.data;
  };

// ======================================================
// SEND USER MESSAGE
// ======================================================

export const sendUserMessage =
  async (
    conversationId: string,
    input:
      SendMessageInput
  ): Promise<SendMessageResponse> => {
    const response =
      await api.post<
        SendMessageResponse
      >(
        `/chats/${encodeURIComponent(
          conversationId
        )}/messages`,

        input,

        {
          headers:
            userChatHeaders,
        }
      );

    return response.data;
  };

// ======================================================
// MARK CONVERSATION AS READ
// ======================================================

export const markUserConversationAsRead =
  async (
    conversationId: string
  ): Promise<MarkConversationReadResponse> => {
    const response =
      await api.patch<
        MarkConversationReadResponse
      >(
        `/chats/${encodeURIComponent(
          conversationId
        )}/read`,

        undefined,

        {
          headers:
            userChatHeaders,
        }
      );

    return response.data;
  };