import React, { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";
import { API_URL1 } from "../api/apiController";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user?.id || user?.user_id;

  // Connect to socket and set up listeners
  useEffect(() => {
    if (!userId) return;

    console.log("Connecting to socket server...");
    const newSocket = io(API_URL1);
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to notification server");
      newSocket.emit("register", { user_id: userId });
    });

    newSocket.on("new_notification", (notification) => {
      console.log("New notification received:", notification);
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((count) => count + 1);
    });

    // Load initial notifications
    fetchNotifications(userId);

    return () => {
      newSocket.disconnect();
    };
  }, [userId]);

  // Fetch notifications from API
  const fetchNotifications = async (userId) => {
    try {
      const response = await fetch(
        `${API_URL1}/notification?user_id=${userId}`
      );
      const data = await response.json();

      setNotifications(data.notifications || []);
      setUnreadCount(
        (data.notifications || []).filter((n) => !n.is_read).length
      );
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
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
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        notifications,
        unreadCount,
        markAsRead,
        fetchNotifications: () => fetchNotifications(userId),
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
