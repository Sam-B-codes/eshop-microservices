import api from "./api";

import {
  type ConversationListResponse,
  type ConversationMessagesResponse,
  type MarkConversationReadResponse,
  type PaginationQuery,
  type SendMessageInput,
  type SendMessageResponse,
  type UnreadMessageCountResponse,
} from "@org/chat-client";

// ======================================================
// SELLER CHAT HEADERS
// ======================================================

const sellerChatHeaders = {
  "x-chat-role":
    "seller",
} as const;

// ======================================================
// GET SELLER CONVERSATIONS
// ======================================================

export const getSellerConversations =
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
            sellerChatHeaders,
        }
      );

    return response.data;
  };

// ======================================================
// GET SELLER UNREAD COUNT
// ======================================================

export const getSellerChatUnreadCount =
  async (): Promise<UnreadMessageCountResponse> => {
    const response =
      await api.get<
        UnreadMessageCountResponse
      >(
        "/chats/unread-count",
        {
          headers:
            sellerChatHeaders,
        }
      );

    return response.data;
  };

// ======================================================
// GET CONVERSATION MESSAGES
// ======================================================

export const getSellerConversation =
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
            sellerChatHeaders,
        }
      );

    return response.data;
  };

// ======================================================
// SEND SELLER MESSAGE
// ======================================================

export const sendSellerMessage =
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
            sellerChatHeaders,
        }
      );

    return response.data;
  };

// ======================================================
// MARK CONVERSATION AS READ
// ======================================================

export const markSellerConversationAsRead =
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
            sellerChatHeaders,
        }
      );

    return response.data;
  };