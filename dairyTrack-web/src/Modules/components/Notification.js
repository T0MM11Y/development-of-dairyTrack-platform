import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import {
  Dropdown,
  Modal,
  Button,
  Badge,
  OverlayTrigger,
  Tooltip,
  FormControl,
  Spinner,
  InputGroup,
} from "react-bootstrap";
import { useSocket } from "../../socket/socket";
import { formatDistanceToNow } from "date-fns";
import {
  deleteNotification,
  clearAllNotifications,
} from "../controllers/notificationController";
import Swal from "sweetalert2";

const NotificationDropdown = React.memo(() => {
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
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Memoized user state
  const currentUser = useMemo(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    return userData.user_id || userData.id
      ? { ...userData, user_id: userData.user_id || userData.id }
      : null;
  }, []);

  // Refs for optimization
  const fetchCooldownRef = useRef(false);
  const lastFetchRef = useRef(0);
  const notificationsPerPage = 8;
  const FETCH_COOLDOWN = 3000;

  // Enhanced custom styles with modern design
  const customStyles = useMemo(
    () => ({
      bellIcon: {
        color: unreadCount > 0 ? "#4f46e5" : "#6b7280",
        transition: "all 0.3s ease",
        filter:
          unreadCount > 0
            ? "drop-shadow(0 0 8px rgba(79, 70, 229, 0.3))"
            : "none",
      },
      dropdownMenu: {
        minWidth: 450,
        maxWidth: 550,
        borderRadius: "16px",
        border: "none",
        boxShadow:
          "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        background: "white",
        overflow: "hidden",
      },
      notificationHeader: {
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        padding: "16px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
      },
      notificationItem: {
        borderRadius: "12px",
        margin: "8px 12px",
        padding: "16px",
        border: "1px solid #f1f5f9",
        background: "white",
        transition: "all 0.3s ease",
        position: "relative",
        overflow: "hidden",
      },
      notificationItemHover: {
        transform: "translateY(-2px)",
        boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
        borderColor: "#e2e8f0",
      },
      unreadItem: {
        background: "linear-gradient(135deg, #f8faff 0%, #f1f5ff 100%)",
        borderLeft: "4px solid #4f46e5",
        boxShadow: "0 4px 12px rgba(79, 70, 229, 0.1)",
      },
      iconContainer: {
        width: 44,
        height: 44,
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "18px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        position: "relative",
      },
      badge: {
        background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)",
        fontSize: "11px",
        fontWeight: "600",
        boxShadow: "0 2px 8px rgba(238, 90, 82, 0.3)",
      },
      modalHeader: {
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        borderBottom: "none",
        padding: "24px 32px",
      },
      filterButton: {
        borderRadius: "25px",
        padding: "8px 20px",
        fontWeight: "500",
        transition: "all 0.3s ease",
        border: "2px solid transparent",
      },
      searchInput: {
        borderRadius: "1px",
        border: "2px solid #e2e8f0",
        padding: "12px 20px",
        transition: "all 0.3s ease",
        background: "#f8fafc",
      },
      paginationButton: {
        borderRadius: "12px",
        padding: "8px 16px",
        fontWeight: "500",
        transition: "all 0.3s ease",
      },
      clearAllButton: {
        background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)",
        border: "none",
        borderRadius: "12px",
        padding: "12px 24px",
        fontWeight: "600",
        color: "white",
        transition: "all 0.3s ease",
      },
    }),
    [unreadCount]
  );

  // Enhanced icon mapping with better visual hierarchy
  const getNotificationIcon = useCallback((type) => {
    const iconMap = {
      production_decrease: "📉",
      low_production: "📊",
      production_increase: "📈",
      high_production: "🚀",
      health_check: "🏥",
      follow_up: "✅",
      milk_expiry: "⏰",
      PROD_EXPIRED: "🚨",
      milk_expired: "⚠️",
      product_expired: "📅",
      milk_warning: "⚡",
      PRODUCT_LONG_EXPIRED: "🔴",
      "Sisa Pakan Menipis": "🌾",
      PRODUCT_STOCK: "📦",
      ORDER: "🛍️",
      reproduction: "🐄",
    };
    return iconMap[type] || "🔔";
  }, []);

  const getNotificationIconColor = useCallback((type) => {
    const colorMap = {
      production_decrease: {
        bg: "linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)",
        text: "white",
      },
      low_production: {
        bg: "linear-gradient(135deg, #ff8a80 0%, #ff7043 100%)",
        text: "white",
      },
      production_increase: {
        bg: "linear-gradient(135deg, #4caf50 0%, #43a047 100%)",
        text: "white",
      },
      high_production: {
        bg: "linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)",
        text: "white",
      },
      health_check: {
        bg: "linear-gradient(135deg, #2196f3 0%, #1976d2 100%)",
        text: "white",
      },
      follow_up: {
        bg: "linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)",
        text: "white",
      },
      milk_expiry: {
        bg: "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)",
        text: "white",
      },
      PROD_EXPIRED: {
        bg: "linear-gradient(135deg, #f44336 0%, #d32f2f 100%)",
        text: "white",
      },
      milk_expired: {
        bg: "linear-gradient(135deg, #ff5722 0%, #e64a19 100%)",
        text: "white",
      },
      product_expired: {
        bg: "linear-gradient(135deg, #ff7043 0%, #ff5722 100%)",
        text: "white",
      },
      milk_warning: {
        bg: "linear-gradient(135deg, #ffeb3b 0%, #fbc02d 100%)",
        text: "#333",
      },
      PRODUCT_LONG_EXPIRED: {
        bg: "linear-gradient(135deg, #ffc107 0%, #ff8f00 100%)",
        text: "#333",
      },
      "Sisa Pakan Menipis": {
        bg: "linear-gradient(135deg, #8bc34a 0%, #689f38 100%)",
        text: "white",
      },
      PRODUCT_STOCK: {
        bg: "linear-gradient(135deg, #00bcd4 0%, #0097a7 100%)",
        text: "white",
      },
      ORDER: {
        bg: "linear-gradient(135deg, #673ab7 0%, #512da8 100%)",
        text: "white",
      },
      reproduction: {
        bg: "linear-gradient(135deg, #e91e63 0%, #c2185b 100%)",
        text: "white",
      },
    };
    return (
      colorMap[type] || {
        bg: "linear-gradient(135deg, #9e9e9e 0%, #757575 100%)",
        text: "white",
      }
    );
  }, []);

  // Notification permission
  useEffect(() => {
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Optimized initial fetch
  useEffect(() => {
    if (
      currentUser?.user_id &&
      fetchNotifications &&
      !fetchCooldownRef.current
    ) {
      const now = Date.now();
      if (now - lastFetchRef.current > FETCH_COOLDOWN) {
        fetchCooldownRef.current = true;
        lastFetchRef.current = now;
        fetchNotifications().finally(() => {
          setTimeout(() => {
            fetchCooldownRef.current = false;
          }, 2000);
        });
      }
    }
  }, [currentUser?.user_id, fetchNotifications]);

  // Reset pagination when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchTerm]);

  // Enhanced delete notification with better UX
  const handleDeleteNotification = useCallback(
    async (notificationId) => {
      const userId = currentUser?.user_id || currentUser?.id;
      if (!userId) return;

      const result = await Swal.fire({
        title: "Delete Notification",
        text: "Are you sure you want to delete this notification?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Yes, delete it",
        cancelButtonText: "Cancel",
        customClass: {
          popup: "rounded-lg",
          confirmButton: "rounded-lg",
          cancelButton: "rounded-lg",
        },
      });

      if (result.isConfirmed) {
        setLoading(true);
        try {
          const response = await deleteNotification(notificationId, userId);
          if (response.success) {
            await fetchNotifications();
            Swal.fire({
              icon: "success",
              title: "Deleted Successfully!",
              timer: 1500,
              showConfirmButton: false,
              customClass: {
                popup: "rounded-lg",
              },
            });
          }
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Failed to delete notification",
            customClass: {
              popup: "rounded-lg",
            },
          });
        } finally {
          setLoading(false);
        }
      }
    },
    [currentUser, fetchNotifications]
  );

  // Optimized filter logic
  const filteredNotifications = useMemo(() => {
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

  // Pagination calculations
  const paginationData = useMemo(() => {
    const indexOfLast = currentPage * notificationsPerPage;
    const indexOfFirst = indexOfLast - notificationsPerPage;
    const currentNotifications = filteredNotifications.slice(
      indexOfFirst,
      indexOfLast
    );
    const totalPages = Math.ceil(
      filteredNotifications.length / notificationsPerPage
    );
    return { currentNotifications, totalPages };
  }, [filteredNotifications, currentPage, notificationsPerPage]);

  // Enhanced dropdown toggle
  const handleToggle = useCallback(
    (open) => {
      setIsOpen(open);
      if (open && !fetchCooldownRef.current) {
        const now = Date.now();
        if (now - lastFetchRef.current > FETCH_COOLDOWN) {
          fetchCooldownRef.current = true;
          setLoading(true);
          lastFetchRef.current = now;
          fetchNotifications().finally(() => {
            setLoading(false);
            setTimeout(() => {
              fetchCooldownRef.current = false;
            }, 1000);
          });
        }
      }
    },
    [fetchNotifications]
  );

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
const utcDate = new Date(dateString);
    const wibDate = new Date(utcDate.getTime() + 7 * 60 * 60 * 1000); // Geser +7 jam
    return formatDistanceToNow(wibDate, { addSuffix: true });    } catch {
      return "Invalid date";
    }
  }, []);

  // Enhanced Clear All function
  const handleClearAll = useCallback(async () => {
    const userId = currentUser?.user_id || currentUser?.id;
    if (!userId) return;

    const result = await Swal.fire({
      title: "Clear All Notifications",
      text: "This action cannot be undone. Are you sure?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, clear all",
      cancelButtonText: "Cancel",
      customClass: {
        popup: "rounded-lg",
        confirmButton: "rounded-lg",
        cancelButton: "rounded-lg",
      },
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        const response = await clearAllNotifications(userId);
        if (response?.success) {
          await fetchNotifications();
          Swal.fire({
            icon: "success",
            title: "All notifications cleared!",
            timer: 1500,
            showConfirmButton: false,
            customClass: {
              popup: "rounded-lg",
            },
          });
          setShowAllModal(false);
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Failed to clear notifications",
          customClass: {
            popup: "rounded-lg",
          },
        });
      } finally {
        setLoading(false);
      }
    }
  }, [clearAllNotifications, fetchNotifications, currentUser]);

  return (
    <>
      <OverlayTrigger
        placement="bottom"
        overlay={
          <Tooltip className="custom-tooltip">
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
            style={{ outline: "none", boxShadow: "none" }}
          >
            <i className="fas fa-bell fa-lg" style={customStyles.bellIcon}></i>
            {unreadCount > 0 && (
              <Badge
                pill
                className="position-absolute top-0 start-100 translate-middle"
                style={customStyles.badge}
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
          </Dropdown.Toggle>

          <Dropdown.Menu
            className="border-0 p-0"
            style={customStyles.dropdownMenu}
          >
            <div style={customStyles.notificationHeader}>
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <i className="fas fa-bell me-3"></i>
                  <span className="fw-bold fs-5">Notifications</span>
                </div>
                {unreadCount > 0 && (
                  <Badge bg="light" text="dark" pill className="px-3 py-2">
                    {unreadCount} new
                  </Badge>
                )}
              </div>
            </div>

            {loading ? (
              <div className="text-center p-4">
                <Spinner animation="border" variant="primary" />
                <div className="text-muted mt-3 fw-medium">
                  Loading notifications...
                </div>
              </div>
            ) : (
              <div
                style={{ maxHeight: 450, overflowY: "auto", padding: "12px" }}
              >
                {notifications.length === 0 ? (
                  <div className="text-center text-muted py-5">
                    <div className="mb-3">
                      <i
                        className="fas fa-bell-slash"
                        style={{ fontSize: "3rem", opacity: 0.3 }}
                      ></i>
                    </div>
                    <div className="h5 text-muted">No notifications yet</div>
                    <div className="small">You're all caught up!</div>
                  </div>
                ) : (
                  notifications
                    .slice(0, 5)
                    .map((n) => (
                      <NotificationItem
                        key={n.id}
                        notification={n}
                        onMarkAsRead={handleMarkAsRead}
                        onDelete={handleDeleteNotification}
                        customStyles={customStyles}
                        formatTimeAgo={formatTimeAgo}
                        getNotificationIcon={getNotificationIcon}
                        getNotificationIconColor={getNotificationIconColor}
                      />
                    ))
                )}
              </div>
            )}

            <div className="px-4 py-3 border-top bg-light d-flex gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="flex-grow-1 rounded-pill fw-medium"
                  onClick={handleMarkAllAsRead}
                >
                  <i className="fas fa-check-double me-2"></i>Mark all read
                </Button>
              )}
              <Button
                variant="primary"
                size="sm"
                className="flex-grow-1 rounded-pill fw-medium"
                onClick={() => {
                  setShowAllModal(true);
                  setIsOpen(false);
                }}
              >
                <i className="fas fa-expand-arrows-alt me-2"></i>View all
              </Button>
            </div>
          </Dropdown.Menu>
        </Dropdown>
      </OverlayTrigger>

      {/* Enhanced Modal */}
      <Modal
        show={showAllModal}
        onHide={() => setShowAllModal(false)}
        size="xl"
        centered
        className="notification-modal"
      >
        <Modal.Header closeButton style={customStyles.modalHeader}>
          <Modal.Title className="d-flex align-items-center">
            <i className="fas fa-bell me-3"></i>
            <span>All Notifications</span>
            {filteredNotifications.length > 0 && (
              <Badge bg="light" text="dark" className="ms-3 px-3 py-2">
                {filteredNotifications.length} total
              </Badge>
            )}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ padding: "32px" }}>
          {/* Enhanced Filter Section */}
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="d-flex gap-2">
                {["all", "unread"].map((filterType) => (
                  <Button
                    key={filterType}
                    variant={
                      filter === filterType ? "primary" : "outline-secondary"
                    }
                    size="sm"
                    style={customStyles.filterButton}
                    onClick={() => setFilter(filterType)}
                  >
                    {filterType === "all" ? (
                      <>
                        <i className="fas fa-list me-2"></i>All
                      </>
                    ) : (
                      <>
                        <i className="fas fa-envelope me-2"></i>Unread
                      </>
                    )}
                  </Button>
                ))}
              </div>
            </div>
            <div className="col-md-6">
              <InputGroup>
                <InputGroup.Text
                  style={{ background: "#f8fafc", border: "2px solid #e2e8f0" }}
                >
                  <i className="fas fa-search text-muted"></i>
                </InputGroup.Text>
                <FormControl
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={customStyles.searchInput}
                />
              </InputGroup>
            </div>
          </div>

          {paginationData.currentNotifications.length === 0 ? (
            <div className="text-center text-muted py-5">
              <div className="mb-4">
                <i
                  className="fas fa-search"
                  style={{ fontSize: "4rem", opacity: 0.2 }}
                ></i>
              </div>
              <div className="h4 text-muted mb-2">No notifications found</div>
              <div className="text-muted">
                Try adjusting your search terms or filters
              </div>
            </div>
          ) : (
            <div style={{ maxHeight: 600, overflowY: "auto" }}>
              <div className="row">
                {paginationData.currentNotifications.map((n) => (
                  <div key={n.id} className="col-12 mb-3">
                    <NotificationItem
                      notification={n}
                      onMarkAsRead={handleMarkAsRead}
                      onDelete={handleDeleteNotification}
                      customStyles={customStyles}
                      formatTimeAgo={formatTimeAgo}
                      getNotificationIcon={getNotificationIcon}
                      getNotificationIconColor={getNotificationIconColor}
                      isModal={true}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Enhanced Pagination */}
          {paginationData.totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <div className="btn-group shadow-sm">
                <Button
                  variant="outline-primary"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  style={customStyles.paginationButton}
                >
                  <i className="fas fa-chevron-left me-2"></i>Previous
                </Button>
                <Button
                  variant="primary"
                  disabled
                  style={customStyles.paginationButton}
                >
                  Page {currentPage} of {paginationData.totalPages}
                </Button>
                <Button
                  variant="outline-primary"
                  disabled={currentPage === paginationData.totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  style={customStyles.paginationButton}
                >
                  Next<i className="fas fa-chevron-right ms-2"></i>
                </Button>
              </div>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer className="d-flex justify-content-between px-4 py-3">
          <Button
            style={customStyles.clearAllButton}
            onClick={handleClearAll}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner size="sm" className="me-2" />
                Clearing...
              </>
            ) : (
              <>
                <i className="fas fa-trash-alt me-2"></i>Clear All
              </>
            )}
          </Button>
          <Button
            variant="secondary"
            onClick={() => setShowAllModal(false)}
            className="rounded-pill px-4"
          >
            <i className="fas fa-times me-2"></i>Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
});

// Enhanced NotificationItem component
const NotificationItem = React.memo(
  ({
    notification,
    onMarkAsRead,
    onDelete,
    customStyles,
    formatTimeAgo,
    getNotificationIcon,
    getNotificationIconColor,
    isModal = false,
  }) => {
    const [isHovered, setIsHovered] = useState(false);
    const iconStyle = getNotificationIconColor(notification.type);
    const icon = getNotificationIcon(notification.type);

    const handleMarkAsRead = useCallback(
      (e) => {
        if (e) e.preventDefault();
        onMarkAsRead(notification.id, e);
      },
      [notification.id, onMarkAsRead]
    );

    const handleDelete = useCallback(
      (e) => {
        e.stopPropagation();
        onDelete(notification.id);
      },
      [notification.id, onDelete]
    );

    if (isModal) {
      return (
        <div
          className="d-flex align-items-start p-4 border rounded-3 position-relative overflow-hidden"
          style={{
            backgroundColor: notification.is_read ? "white" : "#f8faff",
            borderLeft: notification.is_read ? "none" : "4px solid #4f46e5",
            boxShadow: notification.is_read
              ? "0 2px 8px rgba(0,0,0,0.05)"
              : "0 4px 12px rgba(79, 70, 229, 0.1)",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Subtle background pattern for unread notifications */}
          {!notification.is_read && (
            <div
              className="position-absolute top-0 end-0"
              style={{
                width: "100px",
                height: "100px",
                background:
                  "radial-gradient(circle, rgba(79, 70, 229, 0.05) 0%, transparent 70%)",
                borderRadius: "50%",
                transform: "translate(30px, -30px)",
              }}
            />
          )}

          <div
            style={{
              ...customStyles.iconContainer,
              background: iconStyle.bg,
              color: iconStyle.text,
              marginRight: "20px",
              flexShrink: 0,
            }}
          >
            {icon}
          </div>

          <div className="flex-grow-1 position-relative">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <small className="text-muted fw-medium">
                <i className="fas fa-clock me-1"></i>
                {formatTimeAgo(notification.created_at)}
              </small>
              <div className="d-flex align-items-center gap-2">
                {!notification.is_read && (
                  <Badge bg="primary" className="px-2 py-1 rounded-pill">
                    <i
                      className="fas fa-circle me-1"
                      style={{ fontSize: "6px" }}
                    ></i>
                    New
                  </Badge>
                )}
                {!notification.is_read && (
                  <Button
                    variant="link"
                    size="sm"
                    className="p-1 text-primary text-decoration-none"
                    onClick={handleMarkAsRead}
                  >
                    <i className="fas fa-check me-1"></i>Mark as read
                  </Button>
                )}
              </div>
            </div>
            <div
              className="fw-medium mb-2"
              style={{ lineHeight: "1.5", color: "#374151" }}
            >
              {notification.message}
            </div>
          </div>

          <Button
            variant="outline-danger"
            size="sm"
            className="ms-3 rounded-pill"
            onClick={handleDelete}
            style={{
              opacity: isHovered ? 1 : 0.7,
              transition: "all 0.3s ease",
              padding: "8px 12px",
            }}
          >
            <i className="fas fa-trash-alt"></i>
          </Button>
        </div>
      );
    }

    return (
      <div
        className="d-flex align-items-center position-relative"
        style={{
          ...customStyles.notificationItem,
          ...(notification.is_read ? {} : customStyles.unreadItem),
          ...(isHovered ? customStyles.notificationItemHover : {}),
          cursor: "pointer",
        }}
        onClick={handleMarkAsRead}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          style={{
            ...customStyles.iconContainer,
            background: iconStyle.bg,
            color: iconStyle.text,
            marginRight: "16px",
            flexShrink: 0,
          }}
        >
          {icon}
        </div>

        <div className="flex-grow-1">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <small className="text-muted fw-medium">
              {formatTimeAgo(notification.created_at)}
            </small>
            {!notification.is_read && (
              <Badge
                bg="primary"
                style={{ fontSize: "9px" }}
                className="rounded-pill px-2"
              >
                New
              </Badge>
            )}
          </div>
          <div
            className="fw-medium"
            style={{ lineHeight: "1.4", fontSize: "14px" }}
          >
            {notification.message}
          </div>
        </div>

        <Button
          variant="outline-danger"
          size="sm"
          className="ms-2 rounded-circle"
          style={{
            padding: "6px 8px",
            opacity: isHovered ? 1 : 0.6,
            transition: "all 0.3s ease",
            width: "32px",
            height: "32px",
          }}
          onClick={handleDelete}
        >
          <i className="fas fa-times" style={{ fontSize: "12px" }}></i>
        </Button>
      </div>
    );
  }
);

export default NotificationDropdown;
