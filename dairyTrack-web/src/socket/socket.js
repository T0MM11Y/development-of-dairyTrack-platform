import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import io from "socket.io-client";
import { API_URL1 } from "../api/apiController";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetchCooldown, setFetchCooldown] = useState(false);

  // Memoize user data to prevent unnecessary re-renders
  const user = useMemo(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      if (userData && (userData.id || userData.user_id)) {
        return {
          ...userData,
          user_id: userData.user_id || userData.id,
        };
      }
      return null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  }, []);

  const userId = user?.user_id;

  // Fetch notifications function with cooldown - REMOVE fetchCooldown from dependencies
  const fetchNotifications = useCallback(
    async (userIdParam = null) => {
      const targetUserId = userIdParam || userId;
      if (!targetUserId || fetchCooldown) {
        console.log("Fetch skipped - no userId or in cooldown");
        return;
      }

      try {
        setFetchCooldown(true);
        setLoading(true);

        const response = await fetch(
          `${API_URL1}/notification/?user_id=${targetUserId}`
        );
        if (response.ok) {
          const data = await response.json();
          console.log("Fetched notifications:", data);
          setNotifications(data.notifications || []);
          const unread = (data.notifications || []).filter(
            (n) => !n.is_read
          ).length;
          setUnreadCount(unread);
        } else {
          console.error("Failed to fetch notifications:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
        // Release cooldown after 2 seconds
        setTimeout(() => setFetchCooldown(false), 2000);
      }
    },
    [userId] // Remove fetchCooldown from dependencies
  );

  // Mark notification as read
  const markAsRead = useCallback(
    async (notificationId) => {
      if (!userId) return;

      try {
        const response = await fetch(
          `${API_URL1}/notification/${notificationId}/read`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ user_id: userId }),
          }
        );

        if (response.ok) {
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === notificationId ? { ...n, is_read: true } : n
            )
          );
          setUnreadCount((count) => Math.max(0, count - 1));
        }
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    },
    [userId]
  );

  // Clear all notifications
  const clearAllNotifications = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await fetch(`${API_URL1}/notification/clear-all`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: userId }),
      });

      if (response.ok) {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  }, [userId]);

  // MAIN FIX: Remove fetchNotifications from useEffect dependencies
  useEffect(() => {
    if (!userId) {
      console.log("No user ID found, skipping socket connection");
      return;
    }

    console.log("Connecting to socket server with user ID:", userId);
    console.log("User role:", user?.role_id);

    const newSocket = io(API_URL1, {
      transports: ["websocket", "polling"],
      timeout: 20000,
      forceNew: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      maxReconnectionAttempts: 5,
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to notification server");
      console.log("Registering user with ID:", userId);
      newSocket.emit("register", {
        user_id: userId,
        role_id: user?.role_id,
        timestamp: new Date().toISOString(),
      });
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Disconnected from notification server:", reason);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    newSocket.on("reconnect", () => {
      console.log("Reconnected to notification server");
      newSocket.emit("register", {
        user_id: userId,
        role_id: user?.role_id,
        timestamp: new Date().toISOString(),
      });
    });

    newSocket.on("new_notification", (notification) => {
      console.log("New notification received:", notification);
      console.log(
        "Notification user_id:",
        notification.user_id,
        "Current user_id:",
        userId
      );

      if (String(notification.user_id) === String(userId)) {
        setNotifications((prev) => {
          const exists = prev.find((n) => n.id === notification.id);
          if (exists) {
            return prev;
          }
          return [notification, ...prev];
        });
        setUnreadCount((count) => count + 1);

        if (Notification.permission === "granted") {
          new Notification("New DairyTrack Notification", {
            body: notification.message,
            icon: "/favicon.ico",
          });
        }
      }
    });

    // Load initial notifications - call directly here
    fetchNotifications(userId);

    return () => {
      console.log("Cleaning up socket connection");
      newSocket.disconnect();
    };
  }, [userId, user?.role_id]); // Remove fetchNotifications from dependencies

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      socket,
      notifications,
      unreadCount,
      loading,
      markAsRead,
      clearAllNotifications,
      fetchNotifications: () => fetchNotifications(userId),
    }),
    [
      socket,
      notifications,
      unreadCount,
      loading,
      markAsRead,
      clearAllNotifications,
      fetchNotifications,
      userId,
    ]
  );

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};
