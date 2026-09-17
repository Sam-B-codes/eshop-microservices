import {
  Router,
} from "express";

import {
  createConversationController,
  getConversationMessagesController,
  getConversationsController,
  getUnreadMessageCountController,
  markConversationAsReadController,
  sendMessageController,
} from "../controllers/chat.controller";

import {
  isChatAuthenticated,
} from "../middleware/auth.middleware";

const router =
  Router();

// ======================================================
// AUTHENTICATION
// ======================================================

router.use(
  isChatAuthenticated
);

// ======================================================
// COLLECTION ROUTES
// ======================================================

router.post(
  "/",
  createConversationController
);

router.get(
  "/",
  getConversationsController
);

router.get(
  "/unread-count",
  getUnreadMessageCountController
);

// ======================================================
// CONVERSATION ROUTES
// ======================================================

router.get(
  "/:conversationId",
  getConversationMessagesController
);

router.post(
  "/:conversationId/messages",
  sendMessageController
);

router.patch(
  "/:conversationId/read",
  markConversationAsReadController
);

export default router;