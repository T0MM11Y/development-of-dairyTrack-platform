import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Dropdown,
  Modal,
  Button,
  Badge,
  Form,
  OverlayTrigger,
  Tooltip,
  FormControl,
  Card,
  Spinner,
} from "react-bootstrap";
import { useSocket } from "../../socket/socket";
import { formatDistanceToNow } from "date-fns";
import {
  deleteNotification,
  clearAllNotifications,
} from "../controllers/notificationController";
import Swal from "sweetalert2";

const NotificationDropdown = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    fetchNotifications,
    clearAllNotifications,
  } = useSocket();

  // State management
  const [isOpen, setIsOpen] = useState(false);
  const [showAllModal, setShowAllModal] = useState(false);
  const [clearAllLoading, setClearAllLoading] = useState(false);
  const [globalLoading, setGlobalLoading] = useState(false); // New global loading state
  const [fontAwesomeLoaded, setFontAwesomeLoaded] = useState(false);

  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [lastFetch, setLastFetch] = useState(0);

  // Refs to prevent multiple calls
  const fetchCooldownRef = useRef(false);
  const initializedRef = useRef(false);

  const notificationsPerPage = 8;
  const FETCH_COOLDOWN = 10000; // 10 seconds cooldown

  // Custom styles
  const customStyles = {
    bellIcon: {
      color: unreadCount > 0 ? "#3D90D7" : "#adb5bd",
      transition: "all 0.3s ease",
      filter:
        unreadCount > 0
          ? "drop-shadow(0 0 8px rgba(61, 144, 215, 0.4))"
          : "none",
      animation: unreadCount > 0 ? "pulse 2s infinite" : "none",
    },
    dropdownMenu: {
      minWidth: 360,
      borderRadius: "12px",
      border: "none",
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
      background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
    },
    notificationHeader: {
      background: "linear-gradient(135deg, #3D90D7 0%, #2c5282 100%)",
      color: "white",
      borderRadius: "12px 12px 0 0",
      padding: "16px 20px",
    },
    notificationItem: {
      borderRadius: "8px",
      margin: "8px",
      transition: "all 0.3s ease",
      border: "1px solid rgba(0,0,0,0.05)",
      background: "white",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
    },
    unreadItem: {
      background: "linear-gradient(135deg, #e3f2fd 0%, #f8f9ff 100%)",
      borderLeft: "4px solid #3D90D7",
      boxShadow: "0 4px 12px rgba(61, 144, 215, 0.15)",
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    },
    badge: {
      background: "linear-gradient(135deg, #ff4757 0%, #ff3742 100%)",
      border: "2px solid white",
      boxShadow: "0 2px 8px rgba(255, 71, 87, 0.3)",
      animation: "bounce 1s infinite",
    },
    modalHeader: {
      background: "linear-gradient(135deg, #3D90D7 0%, #2c5282 100%)",
      color: "white",
      borderRadius: "12px 12px 0 0",
    },
    filterButton: {
      borderRadius: "20px",
      padding: "6px 16px",
      transition: "all 0.3s ease",
      border: "2px solid transparent",
    },
    activeFilter: {
      background: "linear-gradient(135deg, #3D90D7 0%, #2c5282 100%)",
      color: "white",
      boxShadow: "0 4px 12px rgba(61, 144, 215, 0.3)",
    },
    pagination: {
      borderRadius: "8px",
      background: "white",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    },
  };
  // Check FontAwesome availability
  useEffect(() => {
    const checkFontAwesome = () => {
      // Check if FontAwesome CSS is loaded
      const fontAwesomeLinks = document.querySelectorAll(
        'link[href*="font-awesome"]'
      );
      const hasFontAwesome =
        fontAwesomeLinks.length > 0 ||
        window.FontAwesome !== undefined ||
        document.querySelector(".fa") !== null;

      setFontAwesomeLoaded(hasFontAwesome);

      if (!hasFontAwesome) {
        console.warn("FontAwesome might not be loaded properly");
        // Try to load FontAwesome if not present
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href =
          "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
        document.head.appendChild(link);

        link.onload = () => {
          setFontAwesomeLoaded(true);
          console.log("FontAwesome loaded successfully");
        };
      }
    };

    // Check immediately and after a short delay
    checkFontAwesome();
    const timer = setTimeout(checkFontAwesome, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Add CSS animations
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
      }
      @keyframes bounce {
        0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-3px); }
        60% { transform: translateY(-2px); }
      }
      @keyframes slideIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .notification-item {
        animation: slideIn 0.3s ease;
      }
      .notification-item:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1) !important;
      }
      .filter-button:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Prevent page navigation during loading
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (globalLoading || clearAllLoading) {
        e.preventDefault();
        e.returnValue =
          "Operation in progress. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [globalLoading, clearAllLoading]);

  // Request notification permission - ONE TIME ONLY
  useEffect(() => {
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Initialize user - ONE TIME ONLY
  useEffect(() => {
    if (!initializedRef.current) {
      // Pengecekan user data
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      if (!userData.user_id && !userData.id) {
        // Redirect to login if no user data found
        window.location.href = "/";
        return;
      }

      const normalizedUser = {
        ...userData,
        user_id: userData.user_id || userData.id,
      };

      // Role-based URL validation
      const currentPath = window.location.pathname.toLowerCase();
      const userRole = normalizedUser.role_id;

      // Check if URL contains role-specific paths that don't match user's role
      if (currentPath.includes("/admin") && userRole !== 1) {
        // User is not admin but trying to access admin routes
        console.log(
          "Unauthorized access to admin routes - redirecting to login"
        );
        window.location.href = "/";
        return;
      }

      if (currentPath.includes("/supervisor") && userRole !== 2) {
        // User is not supervisor but trying to access supervisor routes
        console.log(
          "Unauthorized access to supervisor routes - redirecting to login"
        );
        window.location.href = "/";
        return;
      }

      if (currentPath.includes("/farmer") && userRole !== 3) {
        // User is not farmer but trying to access farmer routes
        console.log(
          "Unauthorized access to farmer routes - redirecting to login"
        );
        window.location.href = "/";
        return;
      }

      // Additional check for dashboard routes based on role
      if (currentPath.includes("/dashboard")) {
        const allowedRoles = [1, 2, 3]; // Admin, Supervisor, Farmer
        if (!allowedRoles.includes(userRole)) {
          console.log(
            "Unauthorized access to dashboard - redirecting to login"
          );
          window.location.href = "/";
          return;
        }
      }

      setCurrentUser(normalizedUser);
      console.log(
        "Notification component initialized with user:",
        normalizedUser,
        "Current path:",
        currentPath
      );
      initializedRef.current = true;
    }
  }, []);

  // Initial fetch when user is available - WITH COOLDOWN
  useEffect(() => {
    if (
      currentUser?.user_id &&
      fetchNotifications &&
      !fetchCooldownRef.current &&
      initializedRef.current
    ) {
      console.log("Initial notification fetch for user:", currentUser.user_id);
      fetchCooldownRef.current = true;
      setLastFetch(Date.now());

      fetchNotifications().finally(() => {
        setTimeout(() => {
          fetchCooldownRef.current = false;
        }, 5000);
      });
    }
  }, [currentUser?.user_id, fetchNotifications]);

  // Handle delete notification with global loading
  const handleDeleteNotification = useCallback(
    async (notificationId) => {
      const userId = currentUser?.user_id || currentUser?.id;
      if (!userId) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "You must be logged in to delete notifications",
        });
        return;
      }

      try {
        const result = await Swal.fire({
          title: "Confirm Delete",
          text: "Are you sure you want to delete this notification?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Delete",
          cancelButtonText: "Cancel",
          allowOutsideClick: !globalLoading,
          allowEscapeKey: !globalLoading,
        });

        if (result.isConfirmed) {
          setGlobalLoading(true);

          // Show loading Swal
          Swal.fire({
            title: "Deleting Notification...",
            text: "Please wait while we delete this notification",
            icon: "info",
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => {
              Swal.showLoading();
            },
          });

          const response = await deleteNotification(notificationId, userId);

          if (response.success) {
            Swal.fire({
              icon: "success",
              title: "Success",
              text: "Notification deleted successfully",
              timer: 1500,
              showConfirmButton: false,
              allowOutsideClick: false,
              allowEscapeKey: false,
            });

            if (!fetchCooldownRef.current) {
              fetchCooldownRef.current = true;
              await fetchNotifications().finally(() => {
                setTimeout(() => {
                  fetchCooldownRef.current = false;
                }, 3000);
              });
            }
          } else {
            Swal.fire({
              icon: "error",
              title: "Error",
              text: response.message || "Failed to delete notification",
            });
          }
        }
      } catch (error) {
        console.error("Error deleting notification:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "An error occurred while deleting the notification",
        });
      } finally {
        setGlobalLoading(false);
      }
    },
    [currentUser, fetchNotifications, globalLoading]
  );

  // Filter logic - STABLE CALLBACK
  const applyFilters = useCallback(() => {
    let filtered = [...notifications];
    if (searchTerm.trim()) {
      filtered = filtered.filter((n) =>
        n.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filter === "unread") {
      filtered = filtered.filter((n) => !n.is_read);
    }
    return filtered;
  }, [notifications, filter, searchTerm]);

  // Update filtered notifications
  useEffect(() => {
    setFilteredNotifications(applyFilters());
    setCurrentPage(1);
  }, [notifications, filter, searchTerm]);

  // Handle dropdown toggle with strict cooldown
  const handleToggle = useCallback(
    (open) => {
      if (globalLoading) return; // Prevent toggle during loading

      setIsOpen(open);

      if (open) {
        const now = Date.now();
        const timeSinceLastFetch = now - lastFetch;

        if (
          (!notifications.length || timeSinceLastFetch > FETCH_COOLDOWN) &&
          !fetchCooldownRef.current
        ) {
          console.log("Fetching notifications on dropdown open");
          fetchCooldownRef.current = true;
          setLoading(true);
          setLastFetch(now);

          fetchNotifications().finally(() => {
            setLoading(false);
            setTimeout(() => {
              fetchCooldownRef.current = false;
            }, 3000);
          });
        } else {
          console.log("Fetch skipped - cooldown active or recent fetch");
        }
      }
    },
    [fetchNotifications, notifications.length, lastFetch, globalLoading]
  ); // Updated notification utility functions to match Flutter version
  const getNotificationIcon = useCallback(
    (type) => {
      console.log(
        "Getting icon for type:",
        type,
        "FontAwesome loaded:",
        fontAwesomeLoaded
      ); // Debug log

      // Use more basic FontAwesome icons that are more likely to be available
      switch (type) {
        case "production_decrease":
        case "low_production":
          return "fa fa-arrow-down";
        case "production_increase":
        case "high_production":
          return "fa fa-arrow-up";
        case "health_check":
          return "fa fa-heart";
        case "follow_up":
          return "fa fa-check";
        case "milk_expiry":
        case "PROD_EXPIRED":
          return "fa fa-warning";
        case "milk_warning":
        case "PRODUCT_LONG_EXPIRED":
          return "fa fa-exclamation";
        case "Sisa Pakan Menipis":
          return "fa fa-leaf";
        case "PRODUCT_STOCK":
          return "fa fa-cube";
        case "ORDER":
          return "fa fa-shopping-cart";
        case "reproduction":
          return "fa fa-heart";
        default:
          console.log("Using default icon for unknown type:", type); // Debug log
          return "fa fa-bell";
      }
    },
    [fontAwesomeLoaded]
  );

  const getNotificationIconColor = useCallback((type) => {
    switch (type) {
      case "production_decrease":
      case "low_production":
        return {
          bg: "linear-gradient(135deg, #E74C3C 0%, #C0392B 100%)",
          text: "white",
        };
      case "production_increase":
      case "high_production":
        return {
          bg: "linear-gradient(135deg, #27AE60 0%, #229954 100%)",
          text: "white",
        };
      case "health_check":
        return {
          bg: "linear-gradient(135deg, #3498DB 0%, #2980B9 100%)",
          text: "white",
        };
      case "follow_up":
        return {
          bg: "linear-gradient(135deg, #9B59B6 0%, #8E44AD 100%)",
          text: "white",
        };
      case "milk_expiry":
      case "PROD_EXPIRED":
        return {
          bg: "linear-gradient(135deg, #DC3545 0%, #C82333 100%)",
          text: "white",
        };
      case "milk_warning":
      case "PRODUCT_LONG_EXPIRED":
        return {
          bg: "linear-gradient(135deg, #F39C12 0%, #E67E22 100%)",
          text: "white",
        };
      case "Sisa Pakan Menipis":
        return {
          bg: "linear-gradient(135deg, #E67E22 0%, #D68910 100%)",
          text: "white",
        };
      case "PRODUCT_STOCK":
        return {
          bg: "linear-gradient(135deg, #17A2B8 0%, #138496 100%)",
          text: "white",
        };
      case "ORDER":
        return {
          bg: "linear-gradient(135deg, #6F42C1 0%, #5A32A3 100%)",
          text: "white",
        };
      case "reproduction":
        return {
          bg: "linear-gradient(135deg, #E91E63 0%, #C2185B 100%)",
          text: "white",
        };
      default:
        return {
          bg: "linear-gradient(135deg, #6C757D 0%, #5A6268 100%)",
          text: "white",
        };
    }
  }, []);

  // Icon component with fallback
  const NotificationIcon = useCallback(
    ({ type, style }) => {
      const iconClass = getNotificationIcon(type);

      // If FontAwesome is not loaded, show a simple fallback
      if (!fontAwesomeLoaded) {
        const fallbackMap = {
          production_decrease: "↓",
          low_production: "↓",
          production_increase: "↑",
          high_production: "↑",
          health_check: "♥",
          follow_up: "✓",
          milk_expiry: "⚠",
          PROD_EXPIRED: "⚠",
          milk_warning: "!",
          PRODUCT_LONG_EXPIRED: "!",
          "Sisa Pakan Menipis": "🌱",
          PRODUCT_STOCK: "📦",
          ORDER: "🛒",
          reproduction: "♥",
        };

        return (
          <span style={{ ...style, fontSize: "18px", fontWeight: "bold" }}>
            {fallbackMap[type] || "🔔"}
          </span>
        );
      }

      return <i className={iconClass} style={style}></i>;
    },
    [getNotificationIcon, fontAwesomeLoaded]
  );

  const handleMarkAsRead = useCallback(
    (id, e) => {
      if (e) e.preventDefault();
      if (!globalLoading) markAsRead(id);
    },
    [markAsRead, globalLoading]
  );

  const handleMarkAllAsRead = useCallback(() => {
    if (!globalLoading) {
      notifications.forEach((n) => {
        if (!n.is_read) markAsRead(n.id);
      });
    }
  }, [notifications, markAsRead, globalLoading]);

  const formatTimeAgo = (dateString) => {
    try {
      const utcDate = new Date(dateString);
      const wibDate = new Date(utcDate.getTime() + 7 * 60 * 60 * 1000);
      return formatDistanceToNow(wibDate, { addSuffix: true });
    } catch {
      return "Tanggal tidak valid";
    }
  };

  // Pagination
  const indexOfLast = currentPage * notificationsPerPage;
  const indexOfFirst = indexOfLast - notificationsPerPage;
  const currentNotifications = filteredNotifications.slice(
    indexOfFirst,
    indexOfLast
  );
  const totalPages = Math.ceil(
    filteredNotifications.length / notificationsPerPage
  );

  const paginate = useCallback(
    (pageNumber) => {
      if (!globalLoading) setCurrentPage(pageNumber);
    },
    [globalLoading]
  );

  // Enhanced Clear All function with global loading
  const handleClearAll = useCallback(async () => {
    const userId = currentUser?.user_id || currentUser?.id;
    if (!userId) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "You must be logged in to clear notifications",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Clear All Notifications?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, clear them",
      cancelButtonText: "Cancel",
      allowOutsideClick: !globalLoading,
      allowEscapeKey: !globalLoading,
    });

    if (result.isConfirmed) {
      setClearAllLoading(true);
      setGlobalLoading(true);

      try {
        // Show loading Swal
        Swal.fire({
          title: "Clearing Notifications...",
          text: "Please wait while we clear all notifications",
          icon: "info",
          allowOutsideClick: false,
          allowEscapeKey: false,
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        const response = await clearAllNotifications(userId);

        if (response?.success) {
          await fetchNotifications();

          Swal.fire({
            icon: "success",
            title: "Success",
            text: "All notifications cleared successfully",
            timer: 1800,
            showConfirmButton: false,
            allowOutsideClick: false,
            allowEscapeKey: false,
          });

          // Close modal after success
          setTimeout(() => {
            setShowAllModal(false);
          }, 1800);
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: response?.message || "Failed to clear notifications",
          });
        }
      } catch (error) {
        console.error("Error clearing notifications:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "An error occurred while clearing notifications",
        });
      } finally {
        setClearAllLoading(false);
        setGlobalLoading(false);
      }
    }
  }, [clearAllNotifications, fetchNotifications, currentUser, globalLoading]);
  return (
    <>
      {/* Global Loading Overlay */}
      {globalLoading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            style={{
              background: "white",
              padding: "30px",
              borderRadius: "12px",
              textAlign: "center",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
            }}
          >
            <Spinner
              animation="border"
              style={{ color: "#3D90D7", width: "50px", height: "50px" }}
            />
            <div
              className="mt-3"
              style={{ fontSize: "16px", fontWeight: "500" }}
            >
              Processing...
            </div>
            <div className="text-muted small mt-1">
              Please wait, do not close this page
            </div>
          </div>
        </div>
      )}

      <OverlayTrigger
        placement="bottom"
        overlay={
          <Tooltip id="notification-tooltip" style={{ borderRadius: "8px" }}>
            {unreadCount
              ? `${unreadCount} new notification${unreadCount > 1 ? "s" : ""}`
              : "No new notifications"}
          </Tooltip>
        }
      >
        <Dropdown
          onToggle={handleToggle}
          show={isOpen && !globalLoading}
          align="end"
        >
          <Dropdown.Toggle
            variant="link"
            className="nav-link p-0 text-dark position-relative"
            id="notification-dropdown"
            style={{
              outline: "none",
              boxShadow: "none",
              opacity: globalLoading ? 0.6 : 1,
            }}
            disabled={globalLoading}
          >
            <i className="fas fa-bell fa-lg" style={customStyles.bellIcon}></i>
            {unreadCount > 0 && (
              <span
                className="position-absolute top-0 start-100 translate-middle badge rounded-pill"
                style={{ ...customStyles.badge, fontSize: 10 }}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Dropdown.Toggle>

          <Dropdown.Menu
            className="dropdown-menu-end border-0 p-0"
            style={customStyles.dropdownMenu}
          >
            <div style={customStyles.notificationHeader}>
              <div className="d-flex align-items-center justify-content-between">
                <span
                  className="fw-bold"
                  style={{
                    fontFamily: "Roboto, sans-serif",
                    letterSpacing: "0.5px",
                    fontSize: "16px",
                  }}
                >
                  <i className="fas fa-bell me-2"></i>Notifications
                </span>
                {unreadCount > 0 && (
                  <Badge
                    bg="light"
                    text="dark"
                    pill
                    style={{
                      fontSize: 11,
                      background: "rgba(255, 255, 255, 0.2) !important",
                      color: "white !important",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                    }}
                  >
                    {unreadCount}
                  </Badge>
                )}
              </div>
            </div>

            {loading ? (
              <div className="text-center p-4">
                <Spinner
                  animation="border"
                  size="sm"
                  style={{ color: "#3D90D7" }}
                />
                <div className="text-muted small mt-2">
                  Loading notifications...
                </div>
              </div>
            ) : (
              <div
                style={{
                  maxHeight: 350,
                  overflowY: "auto",
                  padding: "8px",
                  opacity: globalLoading ? 0.6 : 1,
                  pointerEvents: globalLoading ? "none" : "auto",
                }}
              >
                {notifications.length === 0 ? (
                  <div className="text-center text-muted py-4">
                    <div
                      style={{
                        background:
                          "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                        borderRadius: "50%",
                        width: "60px",
                        height: "60px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 12px",
                      }}
                    >
                      <i className="fas fa-bell-slash fa-lg text-muted"></i>
                    </div>
                    <div style={{ fontWeight: "500" }}>No notifications</div>
                    <div className="small text-muted">
                      You're all caught up!
                    </div>
                  </div>
                ) : (
                  notifications.slice(0, 5).map((n) => {
                    console.log("Rendering notification:", n); // Debug log
                    const iconStyle = getNotificationIconColor(n.type);
                    return (
                      <div
                        key={n.id}
                        className={`notification-item d-flex align-items-start p-3 ${
                          !n.is_read ? "" : ""
                        }`}
                        style={{
                          ...customStyles.notificationItem,
                          ...(n.is_read ? {} : customStyles.unreadItem),
                          cursor: globalLoading ? "not-allowed" : "pointer",
                          opacity: globalLoading ? 0.6 : 1,
                        }}
                      >
                        <div
                          className="d-flex flex-grow-1 align-items-start"
                          onClick={(e) =>
                            !globalLoading && handleMarkAsRead(n.id, e)
                          }
                        >
                          <div className="me-3">
                            {" "}
                            <div
                              style={{
                                ...customStyles.iconContainer,
                                background: iconStyle.bg,
                                color: iconStyle.text,
                              }}
                            >
                              <NotificationIcon
                                type={n.type}
                                style={{ color: iconStyle.text }}
                              />
                            </div>
                          </div>
                          <div className="flex-grow-1">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <span className="small text-muted fw-medium">
                                {formatTimeAgo(n.created_at)}
                              </span>
                              {!n.is_read && (
                                <Badge
                                  style={{
                                    background:
                                      "linear-gradient(135deg, #3D90D7 0%, #2c5282 100%)",
                                    fontSize: 9,
                                    padding: "4px 8px",
                                  }}
                                >
                                  New
                                </Badge>
                              )}
                            </div>
                            <div
                              className="small fw-medium"
                              style={{ lineHeight: "1.4" }}
                            >
                              {n.message}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="ms-2 align-self-start"
                          style={{
                            padding: "4px 8px",
                            borderRadius: "6px",
                            transition: "all 0.3s ease",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNotification(n.id);
                          }}
                          disabled={globalLoading}
                          onMouseEnter={(e) => {
                            if (!globalLoading) {
                              e.target.style.background =
                                "linear-gradient(135deg, #ff4757 0%, #ff3742 100%)";
                              e.target.style.color = "white";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!globalLoading) {
                              e.target.style.background = "";
                              e.target.style.color = "";
                            }
                          }}
                        >
                          <i className="fas fa-trash-alt"></i>
                        </Button>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            <div
              className="px-3 py-3 border-top d-flex gap-2"
              style={{
                background: "rgba(61, 144, 215, 0.02)",
                opacity: globalLoading ? 0.6 : 1,
              }}
            >
              {unreadCount > 0 && (
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="flex-grow-1"
                  style={{
                    borderRadius: "8px",
                    borderColor: "#3D90D7",
                    color: "#3D90D7",
                    fontWeight: "500",
                  }}
                  onClick={handleMarkAllAsRead}
                  disabled={globalLoading}
                >
                  Mark all read
                </Button>
              )}
              <Button
                size="sm"
                className="flex-grow-1"
                style={{
                  background:
                    "linear-gradient(135deg, #3D90D7 0%, #2c5282 100%)",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "500",
                }}
                onClick={() => {
                  setShowAllModal(true);
                  setIsOpen(false);
                }}
                disabled={globalLoading}
              >
                View all
              </Button>
            </div>
          </Dropdown.Menu>
        </Dropdown>
      </OverlayTrigger>

      {/* Enhanced Modal */}
      <Modal
        show={showAllModal}
        onHide={() => !globalLoading && setShowAllModal(false)}
        size="lg"
        centered
        style={{ backdropFilter: "blur(8px)" }}
        backdrop={globalLoading ? "static" : true}
        keyboard={!globalLoading}
      >
        <Modal.Header
          closeButton={!globalLoading}
          style={{
            ...customStyles.modalHeader,
            opacity: globalLoading ? 0.6 : 1,
          }}
        >
          <Modal.Title
            style={{
              fontFamily: "Roboto, sans-serif",
              letterSpacing: "0.5px",
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            <i className="fas fa-bell me-2"></i>All Notifications
            {globalLoading && (
              <Spinner
                animation="border"
                size="sm"
                className="ms-2"
                style={{ color: "white" }}
              />
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{
            padding: "24px",
            background: "#f8f9fa",
            opacity: globalLoading ? 0.6 : 1,
            pointerEvents: globalLoading ? "none" : "auto",
          }}
        >
          {/* Enhanced Filter Section */}
          <div className="d-flex flex-wrap mb-4 gap-2 align-items-center">
            {["all", "unread"].map((filterType) => (
              <Button
                key={filterType}
                className="filter-button"
                style={{
                  ...customStyles.filterButton,
                  ...(filter === filterType
                    ? customStyles.activeFilter
                    : {
                        background: "white",
                        color: "#6c757d",
                        border: "2px solid #e9ecef",
                      }),
                }}
                size="sm"
                onClick={() => setFilter(filterType)}
                disabled={globalLoading}
              >
                {filterType === "all" && "All"}
                {filterType === "unread" && "Unread"}
              </Button>
            ))}
            <FormControl
              size="sm"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                maxWidth: 200,
                marginLeft: "auto",
                borderRadius: "8px",
                border: "2px solid #e9ecef",
              }}
              disabled={globalLoading}
            />
          </div>

          {currentNotifications.length === 0 ? (
            <div className="text-center text-muted py-5">
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                  borderRadius: "50%",
                  width: "80px",
                  height: "80px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <i className="fas fa-bell-slash fa-2x text-muted"></i>
              </div>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "500",
                  marginBottom: "8px",
                }}
              >
                No notifications found
              </div>
              <div className="text-muted">Try adjusting your filters</div>
            </div>
          ) : (
            <div style={{ maxHeight: 400, overflowY: "auto" }}>
              {currentNotifications.map((n) => {
                console.log("Rendering modal notification:", n); // Debug log
                const iconStyle = getNotificationIconColor(n.type);
                return (
                  <Card
                    key={n.id}
                    className="notification-item mb-3 border-0"
                    style={{
                      ...(!n.is_read
                        ? {
                            background:
                              "linear-gradient(135deg, #e3f2fd 0%, #f8f9ff 100%)",
                            borderLeft: "4px solid #3D90D7",
                          }
                        : {
                            background: "white",
                          }),
                      borderRadius: "12px",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                      opacity: globalLoading ? 0.6 : 1,
                    }}
                  >
                    <Card.Body className="py-3 px-4 d-flex align-items-center">
                      {" "}
                      <div
                        style={{
                          ...customStyles.iconContainer,
                          background: iconStyle.bg,
                          color: iconStyle.text,
                          marginRight: "16px",
                        }}
                      >
                        <NotificationIcon
                          type={n.type}
                          style={{ color: iconStyle.text }}
                        />
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="small text-muted fw-medium">
                            {formatTimeAgo(n.created_at)}
                          </span>
                          {!n.is_read ? (
                            <Button
                              variant="link"
                              size="sm"
                              className="p-0"
                              style={{
                                fontSize: 13,
                                color: "#3D90D7",
                                textDecoration: "none",
                                fontWeight: "500",
                              }}
                              onClick={() => markAsRead(n.id)}
                              disabled={globalLoading}
                            >
                              Mark as read
                            </Button>
                          ) : (
                            <span
                              className="small"
                              style={{
                                color: "#28a745",
                                fontWeight: "500",
                                background: "rgba(40, 167, 69, 0.1)",
                                padding: "2px 8px",
                                borderRadius: "4px",
                              }}
                            >
                              ✓ Read
                            </span>
                          )}
                        </div>
                        <div style={{ fontWeight: "500", lineHeight: "1.4" }}>
                          {n.message}
                        </div>
                      </div>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="ms-3"
                        style={{
                          padding: "6px 10px",
                          borderRadius: "8px",
                          transition: "all 0.3s ease",
                        }}
                        onClick={() => handleDeleteNotification(n.id)}
                        disabled={globalLoading}
                        onMouseEnter={(e) => {
                          if (!globalLoading) {
                            e.target.style.background =
                              "linear-gradient(135deg, #ff4757 0%, #ff3742 100%)";
                            e.target.style.color = "white";
                            e.target.style.transform = "scale(1.05)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!globalLoading) {
                            e.target.style.background = "";
                            e.target.style.color = "";
                            e.target.style.transform = "scale(1)";
                          }
                        }}
                      >
                        <i className="fas fa-trash-alt"></i>
                      </Button>
                    </Card.Body>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Enhanced Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <nav>
                <ul
                  className="pagination pagination-sm mb-0"
                  style={customStyles.pagination}
                >
                  <li
                    className={`page-item ${
                      currentPage === 1 || globalLoading ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => paginate(1)}
                      style={{ borderRadius: "8px 0 0 8px" }}
                      disabled={globalLoading}
                    >
                      &laquo;
                    </button>
                  </li>
                  <li
                    className={`page-item ${
                      currentPage === 1 || globalLoading ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => paginate(currentPage - 1)}
                      disabled={globalLoading}
                    >
                      &lsaquo;
                    </button>
                  </li>
                  {[...Array(totalPages)].map((_, i) => (
                    <li
                      key={i}
                      className={`page-item ${
                        currentPage === i + 1 ? "active" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => paginate(i + 1)}
                        style={
                          currentPage === i + 1
                            ? {
                                background:
                                  "linear-gradient(135deg, #3D90D7 0%, #2c5282 100%)",
                                border: "none",
                              }
                            : {}
                        }
                        disabled={globalLoading}
                      >
                        {i + 1}
                      </button>
                    </li>
                  ))}
                  <li
                    className={`page-item ${
                      currentPage === totalPages || globalLoading
                        ? "disabled"
                        : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => paginate(currentPage + 1)}
                      disabled={globalLoading}
                    >
                      &rsaquo;
                    </button>
                  </li>
                  <li
                    className={`page-item ${
                      currentPage === totalPages || globalLoading
                        ? "disabled"
                        : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => paginate(totalPages)}
                      style={{ borderRadius: "0 8px 8px 0" }}
                      disabled={globalLoading}
                    >
                      &raquo;
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer
          className="d-flex justify-content-between"
          style={{
            background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
            borderRadius: "0 0 12px 12px",
            opacity: globalLoading ? 0.6 : 1,
          }}
        >
          <Button
            variant="outline-danger"
            onClick={handleClearAll}
            style={{
              borderRadius: "8px",
              padding: "8px 20px",
              fontWeight: "500",
            }}
            disabled={clearAllLoading || globalLoading}
          >
            {clearAllLoading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Clearing...
              </>
            ) : (
              <>
                <i className="fas fa-trash me-2"></i>Clear all
              </>
            )}
          </Button>
          <Button
            onClick={() => setShowAllModal(false)}
            style={{
              background: "linear-gradient(135deg, #3D90D7 0%, #2c5282 100%)",
              border: "none",
              borderRadius: "8px",
              padding: "8px 20px",
              fontWeight: "500",
            }}
            disabled={clearAllLoading || globalLoading}
          >
            <i className="fas fa-times me-2"></i>Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default NotificationDropdown;
