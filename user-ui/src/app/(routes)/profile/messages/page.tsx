"use client";

import {
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowUpRight,
  Loader2,
  MessageCircle,
  Package,
  RefreshCw,
  Send,
  Store,
} from "lucide-react";

import type {
  ChatMessage,
  Conversation,
} from "@org/chat-client";

import {
  getUserConversation,
  getUserConversations,
  markUserConversationAsRead,
  sendUserMessage,
} from "@/services/chat.service";

// ======================================================
// CONSTANTS
// ======================================================

const POLLING_INTERVAL =
  5000;

// ======================================================
// PAGE
// ======================================================

export default function UserMessagesPage() {
  const [
    conversations,
    setConversations,
  ] = useState<
    Conversation[]
  >([]);

  const [
    selectedId,
    setSelectedId,
  ] = useState("");

  const [
    messages,
    setMessages,
  ] = useState<
    ChatMessage[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    loadingMessages,
    setLoadingMessages,
  ] = useState(false);

  const [
    sending,
    setSending,
  ] = useState(false);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    content,
    setContent,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const messagesEndRef =
    useRef<HTMLDivElement>(
      null
    );

  // ====================================================
  // SELECTED CONVERSATION
  // ====================================================

  const selectedConversation =
    conversations.find(
      (conversation) =>
        conversation.id ===
        selectedId
    ) ?? null;

  // ====================================================
  // LOAD CONVERSATIONS
  // ====================================================

  const loadConversations =
    useCallback(
      async (
        showLoading =
          false
      ) => {
        try {
          if (showLoading) {
            setRefreshing(true);
          }

          const response =
            await getUserConversations({
              page: 1,
              limit: 50,
            });

          setConversations(
            response.conversations
          );

          setSelectedId(
            (currentId) => {
              if (
                currentId &&
                response
                  .conversations
                  .some(
                    (
                      conversation
                    ) =>
                      conversation
                        .id ===
                      currentId
                  )
              ) {
                return currentId;
              }

              return (
                response
                  .conversations[0]
                  ?.id ?? ""
              );
            }
          );

          setError("");
        } catch (
          loadError
        ) {
          console.error(
            "Failed to load conversations:",
            loadError
          );

          setError(
            loadError instanceof
              Error
              ? loadError.message
              : "Unable to load your messages."
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      []
    );

  // ====================================================
  // LOAD MESSAGES
  // ====================================================

  const loadMessages =
    useCallback(
      async (
        conversationId:
          string,
        showLoading =
          false
      ) => {
        if (
          !conversationId
        ) {
          setMessages([]);
          return;
        }

        try {
          if (showLoading) {
            setLoadingMessages(
              true
            );
          }

          const response =
            await getUserConversation(
              conversationId,
              {
                page: 1,
                limit: 50,
              }
            );

          setMessages(
            response.messages
          );

          await markUserConversationAsRead(
            conversationId
          );

          setConversations(
            (current) =>
              current.map(
                (
                  conversation
                ) =>
                  conversation
                    .id ===
                  conversationId
                    ? {
                        ...conversation,
                        unreadCount:
                          0,
                      }
                    : conversation
              )
          );

          setError("");
        } catch (
          loadError
        ) {
          console.error(
            "Failed to load messages:",
            loadError
          );

          setError(
            loadError instanceof
              Error
              ? loadError.message
              : "Unable to load this conversation."
          );
        } finally {
          setLoadingMessages(
            false
          );
        }
      },
      []
    );

  // ====================================================
  // INITIAL LOAD
  // ====================================================

  useEffect(() => {
    const requestedId =
      new URLSearchParams(
        window.location.search
      ).get(
        "conversation"
      );

    if (requestedId) {
      setSelectedId(
        requestedId
      );
    }

    void loadConversations();
  }, [loadConversations]);

  // ====================================================
  // LOAD SELECTED THREAD
  // ====================================================

  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }

    void loadMessages(
      selectedId,
      true
    );
  }, [
    loadMessages,
    selectedId,
  ]);

  // ====================================================
  // POLLING
  // ====================================================

  useEffect(() => {
    const intervalId =
      window.setInterval(
        () => {
          void loadConversations();

          if (selectedId) {
            void loadMessages(
              selectedId
            );
          }
        },
        POLLING_INTERVAL
      );

    return () => {
      window.clearInterval(
        intervalId
      );
    };
  }, [
    loadConversations,
    loadMessages,
    selectedId,
  ]);

  // ====================================================
  // SCROLL TO LATEST
  // ====================================================

  useEffect(() => {
    messagesEndRef
      .current
      ?.scrollIntoView({
        behavior:
          "smooth",
      });
  }, [messages]);

  // ====================================================
  // SEND MESSAGE
  // ====================================================

  const handleSubmit =
    async (
      event:
        FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();

      const normalizedContent =
        content.trim();

      if (
        !selectedId ||
        !normalizedContent ||
        sending
      ) {
        return;
      }

      try {
        setSending(true);
        setError("");

        await sendUserMessage(
          selectedId,
          {
            content:
              normalizedContent,
          }
        );

        setContent("");

        await Promise.all([
          loadMessages(
            selectedId
          ),

          loadConversations(),
        ]);
      } catch (
        sendError
      ) {
        console.error(
          "Failed to send message:",
          sendError
        );

        setError(
          sendError instanceof
            Error
            ? sendError.message
            : "Unable to send your message."
        );
      } finally {
        setSending(false);
      }
    };

  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {
    return (
      <div className="flex min-h-[520px] items-center justify-center rounded-[30px] border border-black/[0.06] bg-white">
        <div className="text-center">
          <Loader2 className="mx-auto h-7 w-7 animate-spin text-neutral-500" />

          <p className="mt-4 text-sm font-semibold text-neutral-700">
            Loading messages
          </p>
        </div>
      </div>
    );
  }

  return (
    <section>
      {/* PAGE HEADER */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
            Customer support
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-neutral-950 sm:text-4xl">
            Messages
          </h1>

          <p className="mt-2 text-sm leading-6 text-neutral-500">
            Speak directly with sellers about your paid orders.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            void loadConversations(
              true
            )
          }
          disabled={refreshing}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-black/[0.08] bg-white px-5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              refreshing
                ? "animate-spin"
                : ""
            }`}
          />

          Refresh
        </button>
      </div>

      {error && (
        <div className="mt-5 rounded-[18px] border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* CHAT WORKSPACE */}

      <div className="mt-7 grid min-h-[650px] overflow-hidden rounded-[30px] border border-black/[0.06] bg-white shadow-[0_18px_55px_rgba(0,0,0,0.04)] lg:grid-cols-[340px_minmax(0,1fr)]">
        {/* CONVERSATION LIST */}

        <aside className="border-b border-black/[0.06] bg-[#fbfaf8] lg:border-b-0 lg:border-r">
          <div className="border-b border-black/[0.06] px-5 py-5">
            <p className="text-sm font-semibold text-neutral-950">
              Conversations
            </p>

            <p className="mt-1 text-xs text-neutral-400">
              {
                conversations.length
              }{" "}
              active
            </p>
          </div>

          <div className="max-h-[300px] overflow-y-auto p-3 lg:max-h-[590px]">
            {conversations.length ===
            0 ? (
              <div className="px-4 py-14 text-center">
                <MessageCircle className="mx-auto h-7 w-7 text-neutral-300" />

                <p className="mt-4 text-sm font-semibold text-neutral-700">
                  No conversations yet
                </p>

                <p className="mt-2 text-xs leading-5 text-neutral-400">
                  Open a paid order and choose Contact seller.
                </p>
              </div>
            ) : (
              conversations.map(
                (
                  conversation
                ) => {
                  const active =
                    conversation
                      .id ===
                    selectedId;

                  return (
                    <button
                      key={
                        conversation.id
                      }
                      type="button"
                      onClick={() =>
                        setSelectedId(
                          conversation.id
                        )
                      }
                      className={`mb-2 w-full rounded-[20px] border p-4 text-left transition ${
                        active
                          ? "border-neutral-950 bg-neutral-950 text-white"
                          : "border-transparent bg-white hover:border-black/[0.06]"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] ${
                            active
                              ? "bg-white/10"
                              : "bg-[#e7ddd0]"
                          }`}
                        >
                          <Store className="h-4 w-4" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="truncate text-sm font-semibold">
                              {conversation
                                .seller
                                .shopName ||
                                conversation
                                  .seller
                                  .name}
                            </p>

                            {(conversation
                              .unreadCount ??
                              0) >
                              0 && (
                              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-white">
                                {
                                  conversation
                                    .unreadCount
                                }
                              </span>
                            )}
                          </div>

                          <p
                            className={`mt-1 truncate text-xs ${
                              active
                                ? "text-white/60"
                                : "text-neutral-400"
                            }`}
                          >
                            {conversation
                              .lastMessage
                              ?.content ||
                              "Conversation created"}
                          </p>

                          <p
                            className={`mt-2 text-[10px] uppercase tracking-[0.12em] ${
                              active
                                ? "text-white/40"
                                : "text-neutral-400"
                            }`}
                          >
                            Order #
                            {shortId(
                              conversation
                                .orderId
                            )}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                }
              )
            )}
          </div>
        </aside>

        {/* MESSAGE THREAD */}

        <div className="flex min-h-[650px] min-w-0 flex-col">
          {!selectedConversation ? (
            <EmptyThread />
          ) : (
            <>
              {/* THREAD HEADER */}

              <header className="flex min-h-[82px] items-center justify-between gap-4 border-b border-black/[0.06] px-5 py-4 sm:px-6">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-[#e7ddd0]">
                    <Store className="h-5 w-5 text-neutral-700" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-neutral-950">
                      {selectedConversation
                        .seller
                        .shopName ||
                        selectedConversation
                          .seller
                          .name}
                    </p>

                    <p className="mt-1 truncate text-xs text-neutral-400">
                      Order #
                      {shortId(
                        selectedConversation
                          .orderId
                      )}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/profile/orders/${encodeURIComponent(
                    selectedConversation
                      .orderId
                  )}`}
                  className="inline-flex min-h-10 items-center gap-2 rounded-full border border-black/[0.08] px-4 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50"
                >
                  <Package className="h-4 w-4" />

                  <span className="hidden sm:inline">
                    View order
                  </span>

                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </header>

              {/* MESSAGES */}

              <div className="min-h-0 flex-1 overflow-y-auto bg-[#f7f5f1] px-4 py-6 sm:px-6">
                {loadingMessages ? (
                  <div className="flex h-full items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
                  </div>
                ) : messages.length ===
                  0 ? (
                  <div className="flex h-full min-h-[380px] items-center justify-center text-center">
                    <div>
                      <MessageCircle className="mx-auto h-8 w-8 text-neutral-300" />

                      <p className="mt-4 text-sm font-semibold text-neutral-700">
                        Start the conversation
                      </p>

                      <p className="mt-2 text-xs text-neutral-400">
                        Ask the seller about this order.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map(
                      (message) => (
                        <MessageBubble
                          key={
                            message.id
                          }
                          message={
                            message
                          }
                        />
                      )
                    )}

                    <div
                      ref={
                        messagesEndRef
                      }
                    />
                  </div>
                )}
              </div>

              {/* COMPOSER */}

              <form
                onSubmit={
                  handleSubmit
                }
                className="border-t border-black/[0.06] bg-white p-4 sm:p-5"
              >
                <div className="flex items-end gap-3 rounded-[22px] border border-black/[0.08] bg-[#fbfaf8] p-2 focus-within:border-black/[0.18]">
                  <textarea
                    value={content}
                    onChange={(
                      event
                    ) =>
                      setContent(
                        event
                          .target
                          .value
                      )
                    }
                    onKeyDown={(
                      event
                    ) => {
                      if (
                        event.key ===
                          "Enter" &&
                        !event.shiftKey
                      ) {
                        event.preventDefault();

                        event
                          .currentTarget
                          .form
                          ?.requestSubmit();
                      }
                    }}
                    rows={1}
                    maxLength={2000}
                    placeholder="Write a message..."
                    className="max-h-32 min-h-11 min-w-0 flex-1 resize-none bg-transparent px-3 py-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
                  />

                  <button
                    type="submit"
                    disabled={
                      sending ||
                      !content.trim()
                    }
                    aria-label="Send message"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] bg-neutral-950 text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

// ======================================================
// MESSAGE BUBBLE
// ======================================================

function MessageBubble({
  message,
}: {
  message: ChatMessage;
}) {
  const mine =
    message.senderRole ===
    "USER";

  return (
    <div
      className={`flex ${
        mine
          ? "justify-end"
          : "justify-start"
      }`}
    >
      <div
        className={`max-w-[82%] rounded-[22px] px-4 py-3 sm:max-w-[70%] ${
          mine
            ? "rounded-br-md bg-neutral-950 text-white"
            : "rounded-bl-md border border-black/[0.06] bg-white text-neutral-800"
        }`}
      >
        <p className="whitespace-pre-wrap break-words text-sm leading-6">
          {message.content}
        </p>

        <p
          className={`mt-2 text-[10px] ${
            mine
              ? "text-white/45"
              : "text-neutral-400"
          }`}
        >
          {formatTime(
            message.createdAt
          )}

          {mine &&
            message.isRead &&
            " · Read"}
        </p>
      </div>
    </div>
  );
}

// ======================================================
// EMPTY THREAD
// ======================================================

function EmptyThread() {
  return (
    <div className="flex min-h-[650px] items-center justify-center px-6 text-center">
      <div>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#e7ddd0]">
          <MessageCircle className="h-7 w-7 text-neutral-700" />
        </div>

        <h2 className="mt-5 text-xl font-semibold tracking-[-0.03em] text-neutral-950">
          Select a conversation
        </h2>

        <p className="mt-2 max-w-xs text-sm leading-6 text-neutral-500">
          Choose an order conversation to view and send messages.
        </p>
      </div>
    </div>
  );
}

// ======================================================
// HELPERS
// ======================================================

function shortId(
  value: string
): string {
  return value
    .slice(-8)
    .toUpperCase();
}

function formatTime(
  value: string
): string {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day:
        "2-digit",

      month:
        "short",

      hour:
        "2-digit",

      minute:
        "2-digit",
    }
  ).format(date);
}