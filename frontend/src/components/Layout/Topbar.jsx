import { useEffect, useRef, useState } from "react";
import {
  Menu,
  Moon,
  Sun,
  LogOut,
  Bell,
  Trash2,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import Modal from "../Common/Modal";

import {
  getNotifications,
  markNotificationAsRead,
  deleteNotification,
} from "../../api/notifications";

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [notificationLoading, setNotificationLoading] = useState(false);

  // Keep the latest notifications without restarting the interval
  const notificationsRef = useRef([]);

  // Prevent old notifications from showing Chrome popups
  // when the page first loads
  const firstLoad = useRef(true);

  // --------------------------------------------------
  // LOGOUT
  // --------------------------------------------------

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // --------------------------------------------------
  // REQUEST CHROME NOTIFICATION PERMISSION
  // --------------------------------------------------

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications.");
      return;
    }

    if (Notification.permission === "default") {
      try {
        await Notification.requestPermission();
      } catch (error) {
        console.error(
          "Notification permission error:",
          error
        );
      }
    }
  };

  // --------------------------------------------------
  // SHOW CHROME POPUP
  // --------------------------------------------------

  const showBrowserNotification = (notification) => {
    if (!("Notification" in window)) {
      return;
    }

    if (Notification.permission !== "granted") {
      return;
    }

    const browserNotification = new Notification(
      notification.title || "LifeFlow",
      {
        body:
          notification.message ||
          "You have a new notification.",
        icon: "/favicon.ico",

        // Prevent duplicate browser notifications
        tag: String(notification._id),
      }
    );

    browserNotification.onclick = () => {
      window.focus();
      setNotificationOpen(true);
      browserNotification.close();
    };
  };

  // --------------------------------------------------
  // LOAD NOTIFICATIONS
  // --------------------------------------------------

  const loadNotifications = async (showPopup = false) => {
    try {
      setNotificationLoading(true);

      const data = await getNotifications();

      const newNotifications = Array.isArray(data)
        ? data
        : [];

      // Get previous notifications
      const oldNotifications =
        notificationsRef.current;

      if (showPopup && !firstLoad.current) {
        const oldIds = new Set(
          oldNotifications.map(
            (notification) => notification._id
          )
        );

        // Only notifications that didn't exist before
        const newItems = newNotifications.filter(
          (notification) =>
            !oldIds.has(notification._id)
        );

        // Show Chrome popup for every new notification
        newItems.forEach((notification) => {
          showBrowserNotification(notification);
        });
      }

      // Update state
      setNotifications(newNotifications);

      // Update ref
      notificationsRef.current = newNotifications;

      // First successful load is complete
      firstLoad.current = false;
    } catch (error) {
      console.error(
        "Failed to load notifications:",
        error
      );
    } finally {
      setNotificationLoading(false);
    }
  };

  // --------------------------------------------------
  // INITIAL LOAD
  // --------------------------------------------------

  useEffect(() => {
    if (!user) return;

    loadNotifications(false);
  }, [user]);

  // --------------------------------------------------
  // LIVE POLLING
  // --------------------------------------------------

  useEffect(() => {
    if (!user) return;

    // Check every 5 seconds
    const interval = setInterval(() => {
      loadNotifications(true);
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [user]);

  // --------------------------------------------------
  // UNREAD COUNT
  // --------------------------------------------------

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  // --------------------------------------------------
  // CLICK NOTIFICATION
  // --------------------------------------------------

  const handleNotificationClick = async (
    notification
  ) => {
    try {
      if (!notification.read) {
        await markNotificationAsRead(
          notification._id
        );

        setNotifications(
          (currentNotifications) =>
            currentNotifications.map((item) =>
              item._id === notification._id
                ? {
                    ...item,
                    read: true,
                  }
                : item
            )
        );

        notificationsRef.current =
          notificationsRef.current.map((item) =>
            item._id === notification._id
              ? {
                  ...item,
                  read: true,
                }
              : item
          );
      }
    } catch (error) {
      console.error(
        "Failed to mark notification as read:",
        error
      );
    }
  };

  // --------------------------------------------------
  // DELETE NOTIFICATION
  // --------------------------------------------------

  const handleDeleteNotification = async (
    notificationId
  ) => {
    try {
      await deleteNotification(notificationId);

      const updatedNotifications =
        notificationsRef.current.filter(
          (item) =>
            item._id !== notificationId
        );

      setNotifications(updatedNotifications);

      notificationsRef.current =
        updatedNotifications;
    } catch (error) {
      console.error(
        "Failed to delete notification:",
        error
      );
    }
  };

  // --------------------------------------------------
  // MARK ALL AS READ
  // --------------------------------------------------

  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications =
        notifications.filter(
          (notification) => !notification.read
        );

      await Promise.all(
        unreadNotifications.map(
          (notification) =>
            markNotificationAsRead(
              notification._id
            )
        )
      );

      const updatedNotifications =
        notifications.map(
          (notification) => ({
            ...notification,
            read: true,
          })
        );

      setNotifications(updatedNotifications);

      notificationsRef.current =
        updatedNotifications;
    } catch (error) {
      console.error(
        "Failed to mark all notifications as read:",
        error
      );
    }
  };

  // --------------------------------------------------
  // FORMAT DATE
  // --------------------------------------------------

  const formatNotificationDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }
    );
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <>
      <header className="h-20 px-4 md:px-8 flex items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">

        {/* LEFT SIDE */}
        <div className="flex items-center gap-4">

          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="md:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Menu size={20} />
            </button>
          )}

          <div>
            <p className="text-sm text-gray-500">
              {new Date().toLocaleDateString(
                "en-US",
                {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                }
              )}
            </p>

            <h1 className="text-lg md:text-xl font-semibold">
              Welcome back,{" "}
              {user?.name?.split(" ")[0]} 👋
            </h1>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-2">

          {/* THEME */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
            title="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun size={18} />
            ) : (
              <Moon size={18} />
            )}
          </button>

          {/* NOTIFICATIONS */}
          <div className="relative">

            <button
              onClick={() => {
                setNotificationOpen(
                  !notificationOpen
                );

                requestNotificationPermission();
              }}
              className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
              title="Notifications"
            >
              <Bell size={19} />

              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">
                  {unreadCount > 99
                    ? "99+"
                    : unreadCount}
                </span>
              )}
            </button>

            {/* DROPDOWN */}
            {notificationOpen && (
              <div className="absolute right-0 top-12 z-50 w-[360px] max-w-[90vw] rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl overflow-hidden">

                {/* HEADER */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">

                  <div className="flex items-center gap-2">
                    <Bell size={17} />

                    <h3 className="font-semibold">
                      Notifications
                    </h3>
                  </div>

                  <span className="text-xs text-gray-500">
                    {unreadCount} unread
                  </span>
                </div>

                {/* BODY */}
                <div className="max-h-[420px] overflow-y-auto">

                  {notificationLoading ? (
                    <div className="p-5 text-center text-sm text-gray-500">
                      Loading notifications...
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-6 text-center text-sm text-gray-500">
                      No notifications yet 🔔
                    </div>
                  ) : (
                    notifications.map(
                      (notification) => (
                        <div
                          key={notification._id}
                          onClick={() =>
                            handleNotificationClick(
                              notification
                            )
                          }
                          className={`relative flex gap-3 px-4 py-4 border-b border-gray-200 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                            !notification.read
                              ? "bg-indigo-50/30 dark:bg-indigo-500/5"
                              : ""
                          }`}
                        >

                          {/* ICON */}
                          <div className="text-lg">
                            {notification.type ===
                            "reminder"
                              ? "⏰"
                              : notification.type ===
                                "task"
                              ? "✅"
                              : "🔔"}
                          </div>

                          {/* CONTENT */}
                          <div className="flex-1 min-w-0 pr-6">

                            <div className="flex items-center gap-2">

                              <p className="font-semibold text-sm">
                                {notification.title}
                              </p>

                              {!notification.read && (
                                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                              )}
                            </div>

                            <p className="text-sm text-gray-500 mt-1">
                              {notification.message}
                            </p>

                            <p className="text-xs text-gray-400 mt-2">
                              {formatNotificationDate(
                                notification.createdAt
                              )}
                            </p>
                          </div>

                          {/* DELETE */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();

                              handleDeleteNotification(
                                notification._id
                              );
                            }}
                            className="absolute right-3 top-4 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                            title="Delete notification"
                          >
                            <Trash2 size={16} />
                          </button>

                        </div>
                      )
                    )
                  )}
                </div>

                {/* FOOTER */}
                {notifications.some(
                  (notification) =>
                    !notification.read
                ) && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="w-full px-4 py-3 text-sm text-indigo-500 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    ✓ Mark all as read
                  </button>
                )}
              </div>
            )}
          </div>

          {/* AVATAR */}
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm"
            style={{
              backgroundColor:
                user?.avatarColor || "#6366f1",
            }}
          >
            {user?.name?.[0]?.toUpperCase()}
          </div>

          {/* LOGOUT */}
          <button
            onClick={() => setConfirmOpen(true)}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* LOGOUT MODAL */}
      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Log out"
      >
        <p className="text-sm text-gray-500 mb-4">
          Are you sure you want to log out?
        </p>

        <div className="flex gap-3">

          <button
            onClick={() =>
              setConfirmOpen(false)
            }
            className="btn-secondary flex-1"
          >
            Cancel
          </button>

          <button
            onClick={() => {
              setConfirmOpen(false);
              handleLogout();
            }}
            className="btn-primary flex-1"
          >
            Log out
          </button>

        </div>
      </Modal>
    </>
  );
}