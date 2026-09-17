import {
  type NextFunction,
  type Response,
} from "express";

import {
  AuthenticationError,
  BadRequestError,
} from "@org/error-handler";

import {
  createConversation,
  getConversationMessages,
  getConversations,
  getUnreadMessageCount,
  markConversationAsRead,
  sendMessage,
} from "../services/chat.service";

import {
  type ChatAuthRequest,
} from "../types/chat.types";

// ======================================================
// HELPERS
// ======================================================

const getActor = (
  req: ChatAuthRequest
) => {
  if (!req.actor) {
    throw new AuthenticationError(
      "Authentication is required"
    );
  }

  return req.actor;
};

const getRouteId = (
  value:
    | string
    | string[]
    | undefined,
  fieldName: string
): string => {
  const normalized =
    Array.isArray(value)
      ? value[0]?.trim()
      : value?.trim();

  if (!normalized) {
    throw new BadRequestError(
      `${fieldName} is required`
    );
  }

  return normalized;
};

const parsePositiveInteger = (
  value: unknown,
  fallback: number
): number => {
  if (
    typeof value !==
    "string"
  ) {
    return fallback;
  }

  const parsed =
    Number(value);

  return Number.isInteger(
    parsed
  ) &&
    parsed > 0
    ? parsed
    : fallback;
};

// ======================================================
// CREATE CONVERSATION
// ======================================================

export const createConversationController =
  async (
    req: ChatAuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const response =
        await createConversation(
          getActor(req),
          {
            orderId:
              req.body?.orderId,

            sellerId:
              req.body?.sellerId,
          }
        );

      return res
        .status(200)
        .json(response);
    } catch (error) {
      return next(error);
    }
  };

// ======================================================
// GET CONVERSATIONS
// ======================================================

export const getConversationsController =
  async (
    req: ChatAuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const response =
        await getConversations(
          getActor(req),
          {
            page:
              parsePositiveInteger(
                req.query.page,
                1
              ),

            limit:
              parsePositiveInteger(
                req.query.limit,
                20
              ),
          }
        );

      return res
        .status(200)
        .json(response);
    } catch (error) {
      return next(error);
    }
  };

// ======================================================
// GET MESSAGES
// ======================================================

export const getConversationMessagesController =
  async (
    req: ChatAuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const conversationId =
        getRouteId(
          req.params
            .conversationId,
          "Conversation ID"
        );

      const response =
        await getConversationMessages(
          getActor(req),
          conversationId,
          {
            page:
              parsePositiveInteger(
                req.query.page,
                1
              ),

            limit:
              parsePositiveInteger(
                req.query.limit,
                20
              ),
          }
        );

      return res
        .status(200)
        .json(response);
    } catch (error) {
      return next(error);
    }
  };

// ======================================================
// SEND MESSAGE
// ======================================================

export const sendMessageController =
  async (
    req: ChatAuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const conversationId =
        getRouteId(
          req.params
            .conversationId,
          "Conversation ID"
        );

      const response =
        await sendMessage(
          getActor(req),
          conversationId,
          {
            content:
              req.body?.content,
          }
        );

      return res
        .status(201)
        .json(response);
    } catch (error) {
      return next(error);
    }
  };

// ======================================================
// MARK READ
// ======================================================

export const markConversationAsReadController =
  async (
    req: ChatAuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const conversationId =
        getRouteId(
          req.params
            .conversationId,
          "Conversation ID"
        );

      const response =
        await markConversationAsRead(
          getActor(req),
          conversationId
        );

      return res
        .status(200)
        .json(response);
    } catch (error) {
      return next(error);
    }
  };

// ======================================================
// UNREAD COUNT
// ======================================================

export const getUnreadMessageCountController =
  async (
    req: ChatAuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const response =
        await getUnreadMessageCount(
          getActor(req)
        );

      return res
        .status(200)
        .json(response);
    } catch (error) {
      return next(error);
    }
  };