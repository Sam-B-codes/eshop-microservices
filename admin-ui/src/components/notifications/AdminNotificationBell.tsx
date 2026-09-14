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
  CreditCard,
  Loader2,
  PackageCheck,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  useAdminContext,
} from "@/context/AdminContext";

import {
  getAdminNotifications,
  getAdminUnreadCount,
  markAdminNotificationAsRead,
  markAllAdminNotificationsAsRead,
} from "@/services/notification.service";

import {
  type Notification,
  type NotificationType,
} from "@/types/notification";

// ======================================================
// DATE
// ======================================================

const formatRelativeDate = (
  value: string
): string => {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  const difference =
    Math.max(
      0,
      Date.now() -
        date.getTime()
    );

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
// ICON
// ======================================================

const getNotificationIcon = (
  type: NotificationType
) => {
  switch (type) {
    case "PAYMENT_RECEIVED":
    case "PAYMENT_SUCCESS":
      return CreditCard;

    case "NEW_PAID_ORDER":
      return PackageCheck;

    default:
      return Bell;
  }
};

// ======================================================
// COMPONENT
// ======================================================

export default function AdminNotificationBell() {
  const router =
    useRouter();

  const {
    admin,
    loading:
      adminLoading,
  } = useAdminContext();

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
    activeId,
    setActiveId,
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
  // LOAD COUNT
  // ====================================================

  const loadUnreadCount =
    useCallback(
      async () => {
        if (!admin) {
          setUnreadCount(0);
          return;
        }

        try {
          const result =
            await getAdminUnreadCount();

          setUnreadCount(
            result.unreadCount
          );
        } catch (requestError) {
          console.error(
            "Failed to load admin notification count:",
            requestError
          );
        }
      },
      [admin]
    );

  // ====================================================
  // LOAD LIST
  // ====================================================

  const loadNotifications =
    useCallback(
      async () => {
        if (!admin) {
          return;
        }

        try {
          setLoading(true);
          setError(null);

          const result =
            await getAdminNotifications(
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
            "Failed to load admin notifications:",
            requestError
          );

          setError(
            "Unable to load notifications."
          );
        } finally {
          setLoading(false);
        }
      },
      [admin]
    );

  // ====================================================
  // POLLING
  // ====================================================

  useEffect(() => {
    if (
      adminLoading ||
      !admin
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
    admin,
    adminLoading,
    loadUnreadCount,
  ]);

  useEffect(() => {
    if (open) {
      void loadNotifications();
    }
  }, [
    open,
    loadNotifications,
  ]);

  // ====================================================
  // CLOSE
  // ====================================================

  useEffect(() => {
    const handleOutside = (
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
      handleOutside
    );

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutside
      );

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  // ====================================================
  // OPEN NOTIFICATION
  // ====================================================

  const openNotification =
    async (
      notification:
        Notification
    ) => {
      if (activeId) {
        return;
      }

      try {
        setActiveId(
          notification.id
        );

        if (
          !notification.isRead
        ) {
          const result =
            await markAdminNotificationAsRead(
              notification.id
            );

          setNotifications(
            (current) =>
              current.map(
                (item) =>
                  item.id ===
                  notification.id
                    ? result.notification
                    : item
              )
          );

          setUnreadCount(
            (current) =>
              Math.max(
                0,
                current - 1
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
          "Failed to open admin notification:",
          requestError
        );

        setError(
          "Unable to update notification."
        );
      } finally {
        setActiveId(null);
      }
    };

  // ====================================================
  // MARK ALL
  // ====================================================

  const markAllAsRead =
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

        await markAllAdminNotificationsAsRead();

        const readAt =
          new Date().toISOString();

        setNotifications(
          (current) =>
            current.map(
              (notification) => ({
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
          "Failed to mark admin notifications as read:",
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
    adminLoading ||
    !admin
  ) {
    return null;
  }

  const badge =
    unreadCount > 99
      ? "99+"
      : unreadCount;

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
        className={`relative flex h-10 w-10 items-center justify-center rounded-2xl border transition sm:h-11 sm:w-11 ${
          open
            ? "border-[#080d19] bg-[#080d19] text-white"
            : "border-black/[0.07] bg-white text-neutral-500 hover:bg-neutral-50 hover:text-neutral-950"
        }`}
      >
        <Bell className="h-[18px] w-[18px]" />

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[9px] font-bold leading-none text-white">
            {badge}
          </span>
        )}
      </button>

      <div
        role="dialog"
        aria-label="Admin notifications"
        
        className={`absolute right-0 top-[calc(100%+12px)] z-50 w-[calc(100vw-2rem)] max-w-[400px] origin-top-right overflow-hidden rounded-[26px] border border-black/[0.08] bg-white shadow-[0_28px_90px_rgba(15,23,42,0.2)] transition duration-200 ${
          open
            ? "visible translate-y-0 scale-100 opacity-100"
            : "pointer-events-none invisible -translate-y-1 scale-[0.98] opacity-0"
        }`}
      >
        <div className="flex items-center justify-between gap-4 border-b border-black/[0.06] px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-neutral-950">
              Notifications
            </h2>

            <p className="mt-1 text-xs text-neutral-500">
              {unreadCount > 0
                ? `${unreadCount} unread`
                : "No unread notifications"}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              void markAllAsRead()
            }
            disabled={
              markingAll ||
              unreadCount === 0
            }
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {markingAll ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCheck className="h-3.5 w-3.5" />
            )}

            Mark all read
          </button>
        </div>

        <div className="max-h-[430px] overflow-y-auto">
          {loading ? (
            <div className="space-y-3 p-4">
              {[1, 2, 3].map(
                (item) => (
                  <div
                    key={item}
                    className="animate-pulse rounded-2xl bg-neutral-50 p-4"
                  >
                    <div className="h-3 w-2/5 rounded bg-neutral-200" />
                    <div className="mt-3 h-3 w-full rounded bg-neutral-100" />
                    <div className="mt-2 h-3 w-3/4 rounded bg-neutral-100" />
                  </div>
                )
              )}
            </div>
          ) : error ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-red-600">
                {error}
              </p>

              <button
                type="button"
                onClick={() =>
                  void loadNotifications()
                }
                className="mt-4 rounded-xl border border-black/10 px-4 py-2 text-xs font-medium text-neutral-900 hover:bg-neutral-50"
              >
                Try again
              </button>
            </div>
          ) : notifications.length ===
            0 ? (
            <div className="px-6 py-14 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-500">
                <Bell className="h-5 w-5" />
              </div>

              <p className="mt-4 text-sm font-semibold text-neutral-950">
                No notifications
              </p>

              <p className="mt-1 text-xs text-neutral-500">
                Marketplace payment updates will appear here.
              </p>
            </div>
          ) : (
            <div className="p-2">
              {notifications.map(
                (notification) => {
                  const Icon =
                    getNotificationIcon(
                      notification.type
                    );

                  const isActive =
                    activeId ===
                    notification.id;

                  return (
                    <button
                      key={
                        notification.id
                      }
                      type="button"
                      disabled={
                        isActive
                      }
                      onClick={() =>
                        void openNotification(
                          notification
                        )
                      }
                      className={`flex w-full gap-3 rounded-2xl p-3.5 text-left transition ${
                        notification.isRead
                          ? "hover:bg-neutral-50"
                          : "bg-amber-50/70 hover:bg-amber-50"
                      }`}
                    >
                      <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                        notification.isRead
                          ? "bg-neutral-100 text-neutral-500"
                          : "bg-[#080d19] text-white"
                      }`}>
                        <Icon className="h-[18px] w-[18px]" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start gap-2">
                          <p className={`line-clamp-1 text-sm ${
                            notification.isRead
                              ? "font-medium text-neutral-700"
                              : "font-semibold text-neutral-950"
                          }`}>
                            {notification.title}
                          </p>

                          {!notification.isRead && (
                            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                          )}
                        </div>

                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-neutral-500">
                          {notification.message}
                        </p>

                        <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-neutral-400">
                          {formatRelativeDate(
                            notification.createdAt
                          )}
                        </p>
                      </div>

                      {isActive ? (
                        <Loader2 className="mt-1 h-4 w-4 shrink-0 animate-spin text-neutral-400" />
                      ) : notification.isRead ? (
                        <Check className="mt-1 h-4 w-4 shrink-0 text-neutral-300" />
                      ) : null}
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