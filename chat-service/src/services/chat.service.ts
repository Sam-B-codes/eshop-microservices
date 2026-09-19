import {
  ChatParticipantRole,
} from "@prisma/client";

import prisma from "@org/prisma";

import {
  AuthenticationError,
  BadRequestError,
  NotFoundError,
} from "@org/error-handler";

import {
  ChatActor,
  ChatListQuery,
  CreateConversationInput,
  MessageListQuery,
  SendMessageInput,
} from "../types/chat.types";

import {
  sendChatMessageEvent,
} from "./chat-event.service";

import {
  sendChatNotification,
} from "./chat-notification.service";

// ======================================================
// CONSTANTS
// ======================================================

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;
const MAX_MESSAGE_LENGTH = 2000;

// ======================================================
// HELPERS
// ======================================================

const normalizeString = (
  value: unknown,
): string => {
  return typeof value === "string"
    ? value.trim()
    : "";
};

const normalizePagination = (
  pageValue?: number,
  limitValue?: number,
) => {
  const requestedPage =
    Number(pageValue);

  const requestedLimit =
    Number(limitValue);

  const page =
    Number.isInteger(
      requestedPage,
    ) &&
    requestedPage > 0
      ? requestedPage
      : 1;

  const limit =
    Number.isInteger(
      requestedLimit,
    ) &&
    requestedLimit > 0
      ? Math.min(
          requestedLimit,
          MAX_LIMIT,
        )
      : DEFAULT_LIMIT;

  return {
    page,
    limit,
    skip:
      (page - 1) *
      limit,
  };
};

const getDatabaseRole = (
  actor: ChatActor,
): ChatParticipantRole => {
  return actor.role === "user"
    ? "USER"
    : "SELLER";
};

const getOppositeRole = (
  actor: ChatActor,
): ChatParticipantRole => {
  return actor.role === "user"
    ? "SELLER"
    : "USER";
};

// ======================================================
// VERIFY CONVERSATION ACCESS
// ======================================================

const getAccessibleConversation =
  async (
    actor: ChatActor,
    conversationId: string,
  ) => {
    const normalizedId =
      normalizeString(
        conversationId,
      );

    if (!normalizedId) {
      throw new BadRequestError(
        "Conversation ID is required",
      );
    }

    const conversation =
      await prisma.conversation.findFirst(
        {
          where: {
            id: normalizedId,

            ...(actor.role ===
            "user"
              ? {
                  userId:
                    actor.id,
                }
              : {
                  sellerId:
                    actor.id,
                }),
          },

          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },

            seller: {
              select: {
                id: true,
                name: true,
                email: true,
                shopName: true,
              },
            },

            order: {
              select: {
                id: true,
                status: true,
                paymentStatus:
                  true,
                createdAt: true,
              },
            },
          },
        },
      );

    if (!conversation) {
      throw new NotFoundError(
        "Conversation not found",
      );
    }

    return conversation;
  };

// ======================================================
// CREATE OR REUSE CONVERSATION
// ======================================================

export const createConversation =
  async (
    actor: ChatActor,
    input: CreateConversationInput,
  ) => {
    if (
      actor.role !== "user"
    ) {
      throw new AuthenticationError(
        "Only customers can start a conversation",
      );
    }

    const orderId =
      normalizeString(
        input.orderId,
      );

    const sellerId =
      normalizeString(
        input.sellerId,
      );

    if (!orderId) {
      throw new BadRequestError(
        "Order ID is required",
      );
    }

    if (!sellerId) {
      throw new BadRequestError(
        "Seller ID is required",
      );
    }

    const order =
      await prisma.order.findFirst(
        {
          where: {
            id: orderId,

            userId:
              actor.id,

            paymentStatus:
              "PAID",

            sellerOrders: {
              some: {
                sellerId,
              },
            },
          },

          select: {
            id: true,
            userId: true,

            sellerOrders: {
              where: {
                sellerId,
              },

              select: {
                id: true,
                sellerId: true,
              },
            },
          },
        },
      );

    if (!order) {
      throw new NotFoundError(
        "Paid order containing this seller was not found",
      );
    }

    const conversation =
      await prisma.conversation.upsert(
        {
          where: {
            orderId_sellerId: {
              orderId:
                order.id,

              sellerId,
            },
          },

          create: {
            orderId:
              order.id,

            userId:
              actor.id,

            sellerId,
          },

          update: {},

          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },

            seller: {
              select: {
                id: true,
                name: true,
                email: true,
                shopName: true,
              },
            },

            order: {
              select: {
                id: true,
                status: true,
                paymentStatus:
                  true,
                createdAt: true,
              },
            },
          },
        },
      );

    return {
      success: true,
      message:
        "Conversation ready",
      conversation,
    };
  };

// ======================================================
// GET CONVERSATIONS
// ======================================================

export const getConversations =
  async (
    actor: ChatActor,
    query: ChatListQuery = {},
  ) => {
    const {
      page,
      limit,
      skip,
    } = normalizePagination(
      query.page,
      query.limit,
    );

    const oppositeRole =
      getOppositeRole(
        actor,
      );

    const where =
      actor.role === "user"
        ? {
            userId:
              actor.id,
          }
        : {
            sellerId:
              actor.id,
          };

    const [
      totalConversations,
      conversations,
    ] =
      await prisma.$transaction(
        [
          prisma.conversation.count(
            {
              where,
            },
          ),

          prisma.conversation.findMany(
            {
              where,

              skip,
              take: limit,

              orderBy: [
                {
                  lastMessageAt:
                    "desc",
                },
                {
                  createdAt:
                    "desc",
                },
              ],

              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },

                seller: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    shopName:
                      true,
                  },
                },

                order: {
                  select: {
                    id: true,
                    status: true,
                    paymentStatus:
                      true,
                    createdAt:
                      true,

                    items: {
                      where:
                        actor.role ===
                        "seller"
                          ? {
                              sellerId:
                                actor.id,
                            }
                          : undefined,

                      take: 3,

                      orderBy: {
                        createdAt:
                          "asc",
                      },

                      select: {
                        id: true,
                        productTitle:
                          true,
                        productImage:
                          true,
                        quantity:
                          true,
                      },
                    },
                  },
                },

                messages: {
                  take: 1,

                  orderBy: {
                    createdAt:
                      "desc",
                  },
                },

                _count: {
                  select: {
                    messages: {
                      where: {
                        senderRole:
                          oppositeRole,

                        isRead:
                          false,
                      },
                    },
                  },
                },
              },
            },
          ),
        ],
      );

    const totalPages =
      totalConversations === 0
        ? 0
        : Math.ceil(
            totalConversations /
              limit,
          );

    return {
      success: true,

      message:
        "Conversations fetched successfully",

      conversations:
        conversations.map(
          (conversation) => ({
            ...conversation,

            lastMessage:
              conversation
                .messages[0] ??
              null,

            unreadCount:
              conversation
                ._count
                .messages,

            messages:
              undefined,

            _count:
              undefined,
          }),
        ),

      pagination: {
        page,
        limit,
        totalConversations,
        totalPages,
        hasPreviousPage:
          page > 1,
        hasNextPage:
          page <
          totalPages,
      },
    };
  };

// ======================================================
// GET CONVERSATION MESSAGES
// ======================================================

export const getConversationMessages =
  async (
    actor: ChatActor,
    conversationId: string,
    query: MessageListQuery = {},
  ) => {
    const conversation =
      await getAccessibleConversation(
        actor,
        conversationId,
      );

    const {
      page,
      limit,
      skip,
    } = normalizePagination(
      query.page,
      query.limit,
    );

    const [
      totalMessages,
      messages,
    ] =
      await prisma.$transaction(
        [
          prisma.chatMessage.count(
            {
              where: {
                conversationId:
                  conversation.id,
              },
            },
          ),

          prisma.chatMessage.findMany(
            {
              where: {
                conversationId:
                  conversation.id,
              },

              skip,
              take: limit,

              orderBy: {
                createdAt:
                  "desc",
              },
            },
          ),
        ],
      );

    const totalPages =
      totalMessages === 0
        ? 0
        : Math.ceil(
            totalMessages /
              limit,
          );

    return {
      success: true,

      message:
        "Messages fetched successfully",

      conversation,

      messages:
        messages.reverse(),

      pagination: {
        page,
        limit,
        totalMessages,
        totalPages,
        hasPreviousPage:
          page > 1,
        hasNextPage:
          page <
          totalPages,
      },
    };
  };

// ======================================================
// SEND MESSAGE
// ======================================================

export const sendMessage =
  async (
    actor: ChatActor,
    conversationId: string,
    input: SendMessageInput,
  ) => {
    const conversation =
      await getAccessibleConversation(
        actor,
        conversationId,
      );

    const content =
      normalizeString(
        input.content,
      );

    if (!content) {
      throw new BadRequestError(
        "Message cannot be empty",
      );
    }

    if (
      content.length >
      MAX_MESSAGE_LENGTH
    ) {
      throw new BadRequestError(
        `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters`,
      );
    }

    const senderRole =
      getDatabaseRole(
        actor,
      );

    const now =
      new Date();

    // ==================================================
    // SAVE MESSAGE
    // ==================================================

    const message =
      await prisma.$transaction(
        async (tx) => {
          const createdMessage =
            await tx.chatMessage.create(
              {
                data: {
                  conversationId:
                    conversation.id,

                  senderId:
                    actor.id,

                  senderRole,

                  type:
                    "TEXT",

                  content,
                },
              },
            );

          await tx.conversation.update(
            {
              where: {
                id:
                  conversation.id,
              },

              data: {
                lastMessageAt:
                  now,
              },
            },
          );

          return createdMessage;
        },
      );

    // ==================================================
    // NOTIFY RECIPIENT
    // ==================================================

    await sendChatNotification({
      actor,

      messageId:
        message.id,

      conversationId:
        conversation.id,

      orderId:
        conversation.orderId,

      userId:
        conversation.userId,

      sellerId:
        conversation.sellerId,

      userName:
        conversation.user.name,

      sellerName:
        conversation.seller
          .shopName ||
        conversation.seller
          .name,

      content:
        message.content,
    });

    // ==================================================
    // PUBLISH KAFKA EVENT
    //
    // This happens only after the message transaction
    // succeeds. Kafka failure is handled by the helper
    // and does not fail the customer request.
    // ==================================================

    await sendChatMessageEvent({
      actor,

      messageId:
        message.id,

      conversationId:
        conversation.id,

      orderId:
        conversation.orderId,

      userId:
        conversation.userId,

      sellerId:
        conversation.sellerId,
    });

    return {
      success: true,

      message:
        "Message sent successfully",

      chatMessage:
        message,
    };
  };

// ======================================================
// MARK CONVERSATION AS READ
// ======================================================

export const markConversationAsRead =
  async (
    actor: ChatActor,
    conversationId: string,
  ) => {
    const conversation =
      await getAccessibleConversation(
        actor,
        conversationId,
      );

    const senderRole =
      getOppositeRole(
        actor,
      );

    const now =
      new Date();

    const result =
      await prisma.chatMessage.updateMany(
        {
          where: {
            conversationId:
              conversation.id,

            senderRole,

            isRead: false,
          },

          data: {
            isRead: true,
            readAt: now,
          },
        },
      );

    return {
      success: true,

      message:
        "Conversation marked as read",

      updatedMessages:
        result.count,
    };
  };

// ======================================================
// GET TOTAL UNREAD COUNT
// ======================================================

export const getUnreadMessageCount =
  async (
    actor: ChatActor,
  ) => {
    const senderRole =
      getOppositeRole(
        actor,
      );

    const unreadCount =
      await prisma.chatMessage.count(
        {
          where: {
            senderRole,

            isRead: false,

            conversation:
              actor.role ===
              "user"
                ? {
                    userId:
                      actor.id,
                  }
                : {
                    sellerId:
                      actor.id,
                  },
          },
        },
      );

    return {
      success: true,
      unreadCount,
    };
  };