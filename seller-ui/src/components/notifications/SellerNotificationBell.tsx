"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Bell,
  Check,
  CheckCheck,
  Loader2,
  MessageSquare,
  PackageCheck,
  Star,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  useSellerContext,
} from "@/context/SellerContext";

import {
  getSellerNotifications,
  getSellerUnreadCount,
  markAllSellerNotificationsAsRead,
  markSellerNotificationAsRead,
} from "@/services/notification.service";

import {
  type Notification,
  type NotificationType,
} from "@/types/notification";

// ======================================================
// RELATIVE DATE
// ======================================================

const formatRelativeDate = (
  value: string
): string => {
  const date =
    new Date(value);

  const difference =
    Date.now() -
    date.getTime();

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  const minutes =
    Math.floor(
      difference /
        60_000
    );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours =
    Math.floor(
      minutes / 60
    );

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days =
    Math.floor(
      hours / 24
    );

  if (days < 7) {
    return `${days}d ago`;
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day:
        "numeric",

      month:
        "short",
    }
  );
};

// ======================================================
// NOTIFICATION ICON
// ======================================================

const getNotificationIcon = (
  type: NotificationType
) => {
  switch (type) {
    case "NEW_PAID_ORDER":
      return PackageCheck;

    case "NEW_REVIEW":
      return Star;

    case "SELLER_REPLY":
      return MessageSquare;

    default:
      return Bell;
  }
};

// ======================================================
// COMPONENT
// ======================================================

export default function SellerNotificationBell() {
  const router =
    useRouter();

  const {
    seller,
    loading:
      sellerLoading,
  } = useSellerContext();

  const containerRef =
    useRef<HTMLDivElement>(
      null
    );

  const [
    open,
    setOpen,
  ] = useState(false);

  const [
    notifications,
    setNotifications,
  ] = useState<
    Notification[]
  >([]);

  const [
    unreadCount,
    setUnreadCount,
  ] = useState(0);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    markingAll,
    setMarkingAll,
  ] = useState(false);

  const [
    activeNotificationId,
    setActiveNotificationId,
  ] = useState<
    string | null
  >(null);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  // ====================================================
  // LOAD UNREAD COUNT
  // ====================================================

  const loadUnreadCount =
    useCallback(
      async () => {
        if (!seller) {
          setUnreadCount(0);
          return;
        }

        try {
          const result =
            await getSellerUnreadCount();

          setUnreadCount(
            result.unreadCount
          );
        } catch (requestError) {
          console.error(
            "Failed to load seller notification count:",
            requestError
          );
        }
      },
      [seller]
    );

  // ====================================================
  // LOAD NOTIFICATIONS
  // ====================================================

  const loadNotifications =
    useCallback(
      async () => {
        if (!seller) {
          return;
        }

        try {
          setLoading(true);
          setError(null);

          const result =
            await getSellerNotifications(
              1,
              10,
              false
            );

          setNotifications(
            result.notifications
          );

          setUnreadCount(
            result.unreadCount
          );
        } catch (requestError) {
          console.error(
            "Failed to load seller notifications:",
            requestError
          );

          setError(
            "Unable to load notifications."
          );
        } finally {
          setLoading(false);
        }
      },
      [seller]
    );

  // ====================================================
  // INITIAL COUNT + POLLING
  // ====================================================

  useEffect(() => {
    if (
      sellerLoading ||
      !seller
    ) {
      return;
    }

    void loadUnreadCount();

    const intervalId =
      window.setInterval(
        () => {
          void loadUnreadCount();
        },
        30_000
      );

    const handleFocus =
      () => {
        void loadUnreadCount();
      };

    window.addEventListener(
      "focus",
      handleFocus
    );

    return () => {
      window.clearInterval(
        intervalId
      );

      window.removeEventListener(
        "focus",
        handleFocus
      );
    };
  }, [
    seller,
    sellerLoading,
    loadUnreadCount,
  ]);

  // ====================================================
  // LOAD WHEN OPENED
  // ====================================================

  useEffect(() => {
    if (open) {
      void loadNotifications();
    }
  }, [
    open,
    loadNotifications,
  ]);

  // ====================================================
  // CLOSE OUTSIDE + ESCAPE
  // ====================================================

  useEffect(() => {
    const handleOutsideClick = (
      event: MouseEvent
    ) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (
      event: KeyboardEvent
    ) => {
      if (
        event.key ===
        "Escape"
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  // ====================================================
  // MARK ONE + NAVIGATE
  // ====================================================

  const handleNotificationClick =
    async (
      notification:
        Notification
    ) => {
      if (
        activeNotificationId
      ) {
        return;
      }

      try {
        setActiveNotificationId(
          notification.id
        );

        if (
          !notification.isRead
        ) {
          const result =
            await markSellerNotificationAsRead(
              notification.id
            );

          setNotifications(
            (
              currentNotifications
            ) =>
              currentNotifications.map(
                (
                  currentNotification
                ) =>
                  currentNotification.id ===
                  notification.id
                    ? result.notification
                    : currentNotification
              )
          );

          setUnreadCount(
            (currentCount) =>
              Math.max(
                0,
                currentCount -
                  1
              )
          );
        }

        setOpen(false);

        if (
          notification.actionUrl
        ) {
          router.push(
            notification.actionUrl
          );
        }
      } catch (requestError) {
        console.error(
          "Failed to open notification:",
          requestError
        );

        setError(
          "Unable to update notification."
        );
      } finally {
        setActiveNotificationId(
          null
        );
      }
    };

  // ====================================================
  // MARK ALL
  // ====================================================

  const handleMarkAll =
    async () => {
      if (
        markingAll ||
        unreadCount === 0
      ) {
        return;
      }

      try {
        setMarkingAll(true);
        setError(null);

        await markAllSellerNotificationsAsRead();

        const readAt =
          new Date().toISOString();

        setNotifications(
          (
            currentNotifications
          ) =>
            currentNotifications.map(
              (
                notification
              ) => ({
                ...notification,
                isRead:
                  true,

                readAt:
                  notification.readAt ??
                  readAt,
              })
            )
        );

        setUnreadCount(0);
      } catch (requestError) {
        console.error(
          "Failed to mark all notifications as read:",
          requestError
        );

        setError(
          "Unable to mark notifications as read."
        );
      } finally {
        setMarkingAll(false);
      }
    };

  if (
    sellerLoading ||
    !seller
  ) {
    return null;
  }

  const badgeText =
    unreadCount > 99
      ? "99+"
      : String(
          unreadCount
        );

  return (
    <div
      ref={containerRef}
      className="relative"
    >
      <button
        type="button"
        onClick={() =>
          setOpen(
            (current) =>
              !current
          )
        }
        aria-label={`Notifications${
          unreadCount > 0
            ? `, ${unreadCount} unread`
            : ""
        }`}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`relative flex h-12 w-12 items-center justify-center rounded-2xl border transition ${
          open
            ? "border-white/[0.14] bg-white/[0.09] text-white"
            : "border-white/[0.07] bg-white/[0.04] text-slate-400 hover:border-white/[0.12] hover:bg-white/[0.07] hover:text-white"
        }`}
      >
        <Bell
          className="h-5 w-5"
          strokeWidth={1.8}
        />

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full border-2 border-[#0b1220] bg-rose-500 px-1 text-[9px] font-bold leading-none text-white">
            {badgeText}
          </span>
        )}
      </button>

      <div
        role="dialog"
        aria-label="Seller notifications"
       
        className={`absolute right-0 top-[calc(100%+10px)] z-50 w-[calc(100vw-2rem)] max-w-[390px] origin-top-right overflow-hidden rounded-[26px] border border-white/[0.08] bg-[#111827] shadow-[0_28px_90px_rgba(0,0,0,0.48)] transition duration-200 ${
          open
            ? "visible translate-y-0 scale-100 opacity-100"
            : "pointer-events-none invisible -translate-y-1 scale-[0.98] opacity-0"
        }`}
      >
        <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-white">
              Notifications
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {unreadCount > 0
                ? `${unreadCount} unread`
                : "You're all caught up"}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              void handleMarkAll()
            }
            disabled={
              markingAll ||
              unreadCount === 0
            }
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-400 transition hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {markingAll ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCheck className="h-3.5 w-3.5" />
            )}

            Mark all read
          </button>
        </div>

        <div className="max-h-[430px] overflow-y-auto [scrollbar-width:thin] [scrollbar-color:#334155_transparent]">
          {loading ? (
            <div className="space-y-3 p-4">
              {[1, 2, 3].map(
                (item) => (
                  <div
                    key={item}
                    className="animate-pulse rounded-2xl border border-white/[0.05] bg-white/[0.025] p-4"
                  >
                    <div className="h-3 w-2/5 rounded bg-white/[0.08]" />
                    <div className="mt-3 h-3 w-full rounded bg-white/[0.05]" />
                    <div className="mt-2 h-3 w-3/4 rounded bg-white/[0.05]" />
                  </div>
                )
              )}
            </div>
          ) : error ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-rose-300">
                {error}
              </p>

              <button
                type="button"
                onClick={() =>
                  void loadNotifications()
                }
                className="mt-4 rounded-xl border border-white/[0.08] px-4 py-2 text-xs font-medium text-white transition hover:bg-white/[0.05]"
              >
                Try again
              </button>
            </div>
          ) : notifications.length ===
            0 ? (
            <div className="px-6 py-14 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.035] text-slate-500">
                <Bell className="h-5 w-5" />
              </div>

              <p className="mt-4 text-sm font-medium text-white">
                No notifications
              </p>

              <p className="mt-1 text-xs text-slate-500">
                New orders and reviews will appear here.
              </p>
            </div>
          ) : (
            <div className="p-2">
              {notifications.map(
                (
                  notification
                ) => {
                  const Icon =
                    getNotificationIcon(
                      notification.type
                    );

                  const isActive =
                    activeNotificationId ===
                    notification.id;

                  return (
                    <button
                      key={
                        notification.id
                      }
                      type="button"
                      onClick={() =>
                        void handleNotificationClick(
                          notification
                        )
                      }
                      disabled={
                        isActive
                      }
                      className={`relative flex w-full gap-3 rounded-2xl p-3.5 text-left transition ${
                        notification.isRead
                          ? "hover:bg-white/[0.04]"
                          : "bg-white/[0.045] hover:bg-white/[0.075]"
                      }`}
                    >
                      <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                        notification.isRead
                          ? "bg-white/[0.04] text-slate-500"
                          : "bg-emerald-400/[0.12] text-emerald-300"
                      }`}>
                        <Icon className="h-[18px] w-[18px]" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start gap-2">
                          <p className={`line-clamp-1 text-sm ${
                            notification.isRead
                              ? "font-medium text-slate-300"
                              : "font-semibold text-white"
                          }`}>
                            {notification.title}
                          </p>

                          {!notification.isRead && (
                            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
                          )}
                        </div>

                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                          {notification.message}
                        </p>

                        <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.1em] text-slate-600">
                          {formatRelativeDate(
                            notification.createdAt
                          )}
                        </p>
                      </div>

                      {isActive && (
                        <Loader2 className="mt-1 h-4 w-4 shrink-0 animate-spin text-slate-500" />
                      )}

                      {notification.isRead &&
                        !isActive && (
                          <Check className="mt-1 h-4 w-4 shrink-0 text-slate-700" />
                        )}
                    </button>
                  );
                }
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}