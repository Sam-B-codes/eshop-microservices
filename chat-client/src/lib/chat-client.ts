// ======================================================
// CHAT TYPES
// ======================================================

export type ChatActorRole =
  | "USER"
  | "SELLER";

export type ChatClientActorRole =
  | "user"
  | "seller";

export type ChatMessageType =
  | "TEXT"
  | "SYSTEM";

export interface ChatUser {
  id: string;
  name: string;
  email: string;
}

export interface ChatSeller {
  id: string;
  name: string;
  email: string;
  shopName: string | null;
}

export interface ChatOrderItem {
  id: string;
  productTitle: string;
  productImage: string | null;
  quantity: number;
}

export interface ChatOrder {
  id: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  items?: ChatOrderItem[];
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: ChatActorRole;
  type: ChatMessageType;
  content: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  orderId: string;
  userId: string;
  sellerId: string;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;

  user: ChatUser;
  seller: ChatSeller;
  order: ChatOrder;

  lastMessage?: ChatMessage | null;
  unreadCount?: number;
}

export interface ChatPagination {
  page: number;
  limit: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface ConversationPagination
  extends ChatPagination {
  totalConversations: number;
  totalPages: number;
}

export interface MessagePagination
  extends ChatPagination {
  totalMessages: number;
  totalPages: number;
}

// ======================================================
// RESPONSE TYPES
// ======================================================

export interface CreateConversationResponse {
  success: boolean;
  message: string;
  conversation: Conversation;
}

export interface ConversationListResponse {
  success: boolean;
  message: string;
  conversations: Conversation[];
  pagination: ConversationPagination;
}

export interface ConversationMessagesResponse {
  success: boolean;
  message: string;
  conversation: Conversation;
  messages: ChatMessage[];
  pagination: MessagePagination;
}

export interface SendMessageResponse {
  success: boolean;
  message: string;
  chatMessage: ChatMessage;
}

export interface MarkConversationReadResponse {
  success: boolean;
  message: string;
  updatedMessages: number;
}

export interface UnreadMessageCountResponse {
  success: boolean;
  unreadCount: number;
}

// ======================================================
// INPUT TYPES
// ======================================================

export interface CreateConversationInput {
  orderId: string;
  sellerId: string;
}

export interface SendMessageInput {
  content: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

// ======================================================
// CLIENT CONFIGURATION
// ======================================================

export interface ChatClientOptions {
  baseUrl: string;

  actorRole:
    ChatClientActorRole;
}

interface ErrorResponse {
  message?: string;
}

// ======================================================
// CHAT CLIENT
// ======================================================

export const createChatClient = ({
  baseUrl,
  actorRole,
}: ChatClientOptions) => {
  const normalizedBaseUrl =
    baseUrl
      .trim()
      .replace(/\/+$/, "");

  if (!normalizedBaseUrl) {
    throw new Error(
      "Chat client base URL is required"
    );
  }

  // ====================================================
  // BUILD URL
  // ====================================================

  const buildUrl = (
    path: string,
    query?: PaginationQuery
  ): string => {
    const url =
      new URL(
        `${normalizedBaseUrl}${path}`
      );

    if (
      query?.page !==
      undefined
    ) {
      url.searchParams.set(
        "page",
        String(query.page)
      );
    }

    if (
      query?.limit !==
      undefined
    ) {
      url.searchParams.set(
        "limit",
        String(query.limit)
      );
    }

    return url.toString();
  };

  // ====================================================
  // SHARED REQUEST
  // ====================================================

  const request = async <
    ResponseBody extends object
  >(
    path: string,
    options:
      RequestInit = {},
    query?: PaginationQuery
  ): Promise<ResponseBody> => {
    const headers =
      new Headers(
        options.headers
      );

    headers.set(
      "Accept",
      "application/json"
    );

    headers.set(
      "x-chat-role",
      actorRole
    );

    if (
      options.body !==
        undefined &&
      !headers.has(
        "Content-Type"
      )
    ) {
      headers.set(
        "Content-Type",
        "application/json"
      );
    }

    const response =
      await fetch(
        buildUrl(
          path,
          query
        ),
        {
          ...options,

          headers,

          credentials:
            "include",
        }
      );

    const body =
      (await response
        .json()
        .catch(
          () => ({})
        )) as
        | ResponseBody
        | ErrorResponse;

    if (!response.ok) {
      const message =
        "message" in body &&
        typeof body.message ===
          "string"
          ? body.message
          : "Chat request failed";

      throw new Error(
        message
      );
    }

    return body as
      ResponseBody;
  };

  // ====================================================
  // PUBLIC METHODS
  // ====================================================

  return {
    createConversation(
      input:
        CreateConversationInput
    ) {
      return request<
        CreateConversationResponse
      >(
        "/chats",
        {
          method:
            "POST",

          body:
            JSON.stringify(
              input
            ),
        }
      );
    },

    getConversations(
      query:
        PaginationQuery = {}
    ) {
      return request<
        ConversationListResponse
      >(
        "/chats",
        {
          method:
            "GET",
        },
        query
      );
    },

    getUnreadCount() {
      return request<
        UnreadMessageCountResponse
      >(
        "/chats/unread-count",
        {
          method:
            "GET",
        }
      );
    },

    getConversation(
      conversationId: string,
      query:
        PaginationQuery = {}
    ) {
      return request<
        ConversationMessagesResponse
      >(
        `/chats/${encodeURIComponent(
          conversationId
        )}`,
        {
          method:
            "GET",
        },
        query
      );
    },

    sendMessage(
      conversationId: string,
      input:
        SendMessageInput
    ) {
      return request<
        SendMessageResponse
      >(
        `/chats/${encodeURIComponent(
          conversationId
        )}/messages`,
        {
          method:
            "POST",

          body:
            JSON.stringify(
              input
            ),
        }
      );
    },

    markConversationAsRead(
      conversationId: string
    ) {
      return request<
        MarkConversationReadResponse
      >(
        `/chats/${encodeURIComponent(
          conversationId
        )}/read`,
        {
          method:
            "PATCH",
        }
      );
    },
  };
};

export type ChatClient =
  ReturnType<
    typeof createChatClient
  >;