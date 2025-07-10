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

// Membuat context untuk socket agar bisa digunakan di seluruh aplikasi React
const SocketContext = createContext();

// Custom hook untuk mengakses context socket
export const useSocket = () => useContext(SocketContext);

// Provider utama untuk socket dan notifikasi
export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null); // State untuk menyimpan objek socket
  const [notifications, setNotifications] = useState([]); // State daftar notifikasi
  const [unreadCount, setUnreadCount] = useState(0); // State jumlah notifikasi belum dibaca
  const [loading, setLoading] = useState(false); // State loading fetch notifikasi
  const [fetchCooldown, setFetchCooldown] = useState(false); // State cooldown fetch notifikasi

  // Mengambil data user dari localStorage dan memoize agar tidak re-render
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

  // Fungsi untuk fetch notifikasi dari API, dengan cooldown agar tidak spam request
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
          // Hitung jumlah notifikasi belum dibaca
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
        // Cooldown 2 detik sebelum bisa fetch lagi
        setTimeout(() => setFetchCooldown(false), 2000);
      }
    },
    [userId] // fetchCooldown tidak perlu di-dependencies
  );

  // Fungsi untuk menandai notifikasi sudah dibaca
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

  // Fungsi untuk menghapus semua notifikasi
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

  // useEffect untuk menginisialisasi koneksi socket saat userId tersedia
  useEffect(() => {
    if (!userId) {
      console.log("No user ID found, skipping socket connection");
      return;
    }

    console.log("Connecting to socket server with user ID:", userId);
    console.log("User role:", user?.role_id);

    // Membuka koneksi ke server socket.io backend
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

    // Saat terkoneksi, register user ke backend
    newSocket.on("connect", () => {
      console.log("Connected to notification server");
      console.log("Registering user with ID:", userId);
      newSocket.emit("register", {
        user_id: userId,
        role_id: user?.role_id,
        timestamp: new Date().toISOString(),
      });
    });

    // Event jika disconnect dari server
    newSocket.on("disconnect", (reason) => {
      console.log("Disconnected from notification server:", reason);
    });

    // Event jika terjadi error koneksi
    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    // Jika reconnect, register ulang user
    newSocket.on("reconnect", () => {
      console.log("Reconnected to notification server");
      newSocket.emit("register", {
        user_id: userId,
        role_id: user?.role_id,
        timestamp: new Date().toISOString(),
      });
    });

    // Event menerima notifikasi baru dari backend
    newSocket.on("new_notification", (notification) => {
      console.log("New notification received:", notification);
      console.log(
        "Notification user_id:",
        notification.user_id,
        "Current user_id:",
        userId
      );

      // Hanya tambahkan jika notifikasi untuk user ini
      if (String(notification.user_id) === String(userId)) {
        setNotifications((prev) => {
          // Cegah duplikasi notifikasi
          const exists = prev.find((n) => n.id === notification.id);
          if (exists) {
            return prev;
          }
          return [notification, ...prev];
        });
        setUnreadCount((count) => count + 1);

        // Tampilkan browser notification jika diizinkan
        if (Notification.permission === "granted") {
          new Notification("New DairyTrack Notification", {
            body: notification.message,
            icon: "/favicon.ico",
          });
        }
      }
    });

    // Fetch notifikasi awal saat socket connect
    fetchNotifications(userId);

    // Cleanup: disconnect socket saat komponen unmount
    return () => {
      console.log("Cleaning up socket connection");
      newSocket.disconnect();
    };
  }, [userId, user?.role_id]); // fetchNotifications tidak perlu di-dependencies

  // Memoize context value agar tidak re-render berlebihan
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

  // Provider context agar bisa digunakan di seluruh aplikasi
  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};
