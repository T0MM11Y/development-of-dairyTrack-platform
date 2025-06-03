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
import { deleteNotification } from "../controllers/notificationController";
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

  // Request notification permission - ONE TIME ONLY
  useEffect(() => {
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Initialize user - ONE TIME ONLY
  useEffect(() => {
    if (!initializedRef.current) {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      if (userData.user_id || userData.id) {
        const normalizedUser = {
          ...userData,
          user_id: userData.user_id || userData.id,
        };
        setCurrentUser(normalizedUser);
        console.log(
          "Notification component initialized with user:",
          normalizedUser
        );
        initializedRef.current = true;
      }
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

  // Handle delete notification
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
        });

        if (result.isConfirmed) {
          const response = await deleteNotification(notificationId, userId);

          if (response.success) {
            Swal.fire({
              icon: "success",
              title: "Success",
              text: "Notification deleted successfully",
              timer: 1500,
              showConfirmButton: false,
            });

            if (!fetchCooldownRef.current) {
              fetchCooldownRef.current = true;
              fetchNotifications().finally(() => {
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
      }
    },
    [currentUser, fetchNotifications]
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
    } else if (filter === "low") {
      filtered = filtered.filter((n) => n.type === "low_production");
    } else if (filter === "high") {
      filtered = filtered.filter((n) => n.type === "high_production");
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
    [fetchNotifications, notifications.length, lastFetch]
  );

  // Notification utility functions
  const getNotificationIcon = useCallback((type) => {
    switch (type) {
      case "milk_expiry":
        return "fas fa-exclamation-triangle";
      case "milk_warning":
        return "fas fa-clock";
      case "milk_used":
        return "fas fa-check-circle";
      case "low_production":
        return "fas fa-arrow-down";
      case "high_production":
        return "fas fa-arrow-up";
      default:
        return "fas fa-bell";
    }
  }, []);

  const getNotificationIconColor = useCallback((type) => {
    switch (type) {
      case "milk_expiry":
        return {
          bg: "linear-gradient(135deg, #ff4757 0%, #ff3742 100%)",
          text: "white",
        };
      case "milk_warning":
        return {
          bg: "linear-gradient(135deg, #ffa502 0%, #ff6348 100%)",
          text: "white",
        };
      case "milk_used":
        return {
          bg: "linear-gradient(135deg, #2ed573 0%, #1e90ff 100%)",
          text: "white",
        };
      case "low_production":
        return {
          bg: "linear-gradient(135deg, #ff4757 0%, #ff3742 100%)",
          text: "white",
        };
      case "high_production":
        return {
          bg: "linear-gradient(135deg, #2ed573 0%, #17c0eb 100%)",
          text: "white",
        };
      default:
        return {
          bg: "linear-gradient(135deg, #747d8c 0%, #57606f 100%)",
          text: "white",
        };
    }
  }, []);

  const handleMarkAsRead = useCallback(
    (id, e) => {
      if (e) e.preventDefault();
      markAsRead(id);
    },
    [markAsRead]
  );

  const handleMarkAllAsRead = useCallback(() => {
    notifications.forEach((n) => {
      if (!n.is_read) markAsRead(n.id);
    });
  }, [notifications, markAsRead]);

  const formatTimeAgo = useCallback((dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "Date unknown";
    }
  }, []);

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

  const paginate = useCallback((pageNumber) => setCurrentPage(pageNumber), []);

  // Handle clear all notifications
  const handleClearAll = useCallback(async () => {
    const result = await Swal.fire({
      title: "Clear All Notifications?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, clear them",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed && clearAllNotifications) {
      clearAllNotifications();
      setShowAllModal(false);
    }
  }, [clearAllNotifications]);

  return (
    <>
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
        <Dropdown onToggle={handleToggle} show={isOpen} align="end">
          <Dropdown.Toggle
            variant="link"
            className="nav-link p-0 text-dark position-relative"
            id="notification-dropdown"
            style={{ outline: "none", boxShadow: "none" }}
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
                style={{ maxHeight: 350, overflowY: "auto", padding: "8px" }}
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
                          cursor: "pointer",
                        }}
                      >
                        <div
                          className="d-flex flex-grow-1 align-items-start"
                          onClick={(e) => handleMarkAsRead(n.id, e)}
                        >
                          <div className="me-3">
                            <div
                              style={{
                                ...customStyles.iconContainer,
                                background: iconStyle.bg,
                                color: iconStyle.text,
                              }}
                            >
                              <i
                                className={`${getNotificationIcon(n.type)}`}
                              ></i>
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
                          onMouseEnter={(e) => {
                            e.target.style.background =
                              "linear-gradient(135deg, #ff4757 0%, #ff3742 100%)";
                            e.target.style.color = "white";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = "";
                            e.target.style.color = "";
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
              style={{ background: "rgba(61, 144, 215, 0.02)" }}
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
        onHide={() => setShowAllModal(false)}
        size="lg"
        centered
        style={{ backdropFilter: "blur(8px)" }}
      >
        <Modal.Header closeButton style={customStyles.modalHeader}>
          <Modal.Title
            style={{
              fontFamily: "Roboto, sans-serif",
              letterSpacing: "0.5px",
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            <i className="fas fa-bell me-2"></i>All Notifications
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: "24px", background: "#f8f9fa" }}>
          {/* Enhanced Filter Section */}
          <div className="d-flex flex-wrap mb-4 gap-2 align-items-center">
            {["all", "unread", "low", "high"].map((filterType) => (
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
              >
                {filterType === "all" && "All"}
                {filterType === "unread" && "Unread"}
                {filterType === "low" && "🔻 Low"}
                {filterType === "high" && "🔺 High"}
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
                    }}
                  >
                    <Card.Body className="py-3 px-4 d-flex align-items-center">
                      <div
                        style={{
                          ...customStyles.iconContainer,
                          background: iconStyle.bg,
                          color: iconStyle.text,
                          marginRight: "16px",
                        }}
                      >
                        <i className={getNotificationIcon(n.type)}></i>
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
                        onMouseEnter={(e) => {
                          e.target.style.background =
                            "linear-gradient(135deg, #ff4757 0%, #ff3742 100%)";
                          e.target.style.color = "white";
                          e.target.style.transform = "scale(1.05)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = "";
                          e.target.style.color = "";
                          e.target.style.transform = "scale(1)";
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
                      currentPage === 1 ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => paginate(1)}
                      style={{ borderRadius: "8px 0 0 8px" }}
                    >
                      &laquo;
                    </button>
                  </li>
                  <li
                    className={`page-item ${
                      currentPage === 1 ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => paginate(currentPage - 1)}
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
                      >
                        {i + 1}
                      </button>
                    </li>
                  ))}
                  <li
                    className={`page-item ${
                      currentPage === totalPages ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => paginate(currentPage + 1)}
                    >
                      &rsaquo;
                    </button>
                  </li>
                  <li
                    className={`page-item ${
                      currentPage === totalPages ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => paginate(totalPages)}
                      style={{ borderRadius: "0 8px 8px 0" }}
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
          >
            <i className="fas fa-trash me-2"></i>Clear all
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
          >
            <i className="fas fa-times me-2"></i>Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default NotificationDropdown;
