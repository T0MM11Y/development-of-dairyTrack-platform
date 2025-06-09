import React, { useState, useEffect, useRef } from "react";
import { logout } from "../controllers/authController";
import NotificationDropdown from "../components/Notification";
import Swal from "sweetalert2";
import {
  FaEye,
  FaEyeSlash,
  FaBars,
  FaTimes,
  FaInfoCircle,
} from "react-icons/fa";

import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { changeUserPassword } from "../controllers/usersController";
import ProgressBar from "react-bootstrap/ProgressBar";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

const AdminHeader = ({ toggleSidebar, sidebarCollapsed }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changeLoading, setChangeLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordFeedback, setPasswordFeedback] = useState("");

  const dropdownRef = useRef(null);

  // Load user data from localStorage
  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "null");
      if (storedUser) {
        setUserData(storedUser);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  }, []);

  // Detect clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Calculate password strength
  const calculatePasswordStrength = (password) => {
    if (!password) {
      setPasswordStrength(0);
      setPasswordFeedback("");
      return;
    }

    let strength = 0;
    let feedback = "";

    // Length check
    if (password.length >= 8) {
      strength += 25;
    } else {
      feedback = "Password should be at least 8 characters";
    }

    // Contains lowercase
    if (/[a-z]/.test(password)) strength += 15;
    // Contains uppercase
    if (/[A-Z]/.test(password)) strength += 15;
    // Contains numbers
    if (/[0-9]/.test(password)) strength += 15;
    // Contains special chars
    if (/[^A-Za-z0-9]/.test(password)) strength += 30;

    // Set feedback based on strength
    if (strength <= 30) {
      feedback = feedback || "Password is weak";
    } else if (strength <= 60) {
      feedback = feedback || "Password is moderate";
    } else if (strength <= 80) {
      feedback = feedback || "Password is strong";
    } else {
      feedback = "Password is very strong";
    }

    setPasswordStrength(strength);
    setPasswordFeedback(feedback);
  };

  // Handle password change
  const handleChangePassword = async () => {
    if (!userData) return;

    // Validate password
    if (newPassword.length < 8) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Password must be at least 8 characters long",
      });
      return;
    }

    setChangeLoading(true);
    try {
      const result = await changeUserPassword(
        userData.user_id,
        oldPassword,
        newPassword
      );

      if (result.success) {
        setShowChangePasswordModal(false);
        setOldPassword("");
        setNewPassword("");
        setPasswordStrength(0);
        setPasswordFeedback("");

        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Your password has been changed successfully",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text:
            result.message || "Failed to change password. Please try again.",
        });
      }
    } catch (error) {
      console.error("Password change error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setChangeLoading(false);
    }
  };

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  const confirmLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out of your account.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, logout!",
    }).then((result) => {
      if (result.isConfirmed) {
        handleLogout();
      }
    });
  };

  const handleLogout = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        throw new Error("No user data found");
      }

      const userData = JSON.parse(storedUser);
      if (!userData?.token) {
        throw new Error("No token found in user data");
      }

      const response = await logout(userData.token, userData.user_id);

      if (!response.success) {
        throw new Error(response.message || "Logout failed");
      }

      localStorage.removeItem("user");
      await Swal.fire({
        icon: "success",
        title: "Logout Successful",
        text: "You have been logged out successfully.",
      });
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      // Even if logout fails, clear local storage and redirect
      localStorage.removeItem("user");
      Swal.fire({
        icon: "warning",
        title: "Logout Issue",
        text: "There was an issue with logout, but you've been signed out locally.",
      }).then(() => {
        window.location.href = "/";
      });
    }
  };

  // Get role explanation text
  const getRoleExplanation = () => {
    if (!userData) return "";

    switch (userData.role_id) {
      case 1:
        return "Full access to view, add, edit, and delete all data";
      case 2:
        return "Read-only access. Cannot add, edit or delete data";
      case 3:
        return "Can manage data related to assigned cows only";
      default:
        return "";
    }
  };

  // Style objects with retro background
  const styles = {
    header: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1200,
      background: "#FFFFFF",
      boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
      padding: "12px 20px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottom: "3px solid #FF6B35",
      flexWrap: "wrap",
      overflow: "visible",
      height: "70px",
    },
    // Retro overlay pattern
    headerOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `
        radial-gradient(circle at 25% 25%, rgba(255, 107, 53, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 75% 75%, rgba(107, 115, 255, 0.1) 0%, transparent 50%),
        repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)
      `,
      pointerEvents: "none",
      zIndex: 1,
    },
    sidebarToggle: {
      // Retro button styling
      background: "linear-gradient(145deg, #FF6B35, #E55A2B)",
      color: "#F7F7F7",
      border: "2px solid #FF8C42",
      borderRadius: "8px",
      padding: "10px",
      marginRight: "15px",
      cursor: "pointer",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "40px",
      height: "40px",
      flexShrink: 0,
      boxShadow:
        "0 4px 15px rgba(255, 107, 53, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
      textShadow: "0 1px 2px rgba(0,0,0,0.3)",
      zIndex: 3,
    },
    headerLeft: {
      display: "flex",
      alignItems: "center",
      flexGrow: 1,
      zIndex: 3,
      position: "relative",
    },
    headerRight: {
      display: "flex",
      alignItems: "center",
      zIndex: 3,
      position: "relative",
    },
    title: {
      fontSize: "1.2rem",
      margin: 0,
      fontWeight: "600",
      color: "#333333", // Ubah dari putih ke hitam
      textShadow: "none", // Hapus bayangan teks
    },
    dateTime: {
      fontFamily: "Roboto, sans-serif",
      fontSize: "14px",
      fontWeight: "300",
      color: "#E8E8E8",
    },
    userAvatar: {
      width: "38px",
      height: "38px",
      borderRadius: "50%",
      // Retro avatar styling
      background: "linear-gradient(145deg, #FF6B35, #E55A2B)",
      color: "#F7F7F7",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "15px",
      fontWeight: "bold",
      marginLeft: "10px",
      flexShrink: 0,
      border: "2px solid #FF8C42",
      boxShadow:
        "0 4px 15px rgba(255, 107, 53, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
      textShadow: "0 1px 2px rgba(0,0,0,0.3)",
    },
    userDropdown: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      cursor: "pointer",
      padding: "5px 10px",
      borderRadius: "20px",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      // Retro glassmorphism effect
      background: "rgba(255,255,255,0.1)",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255,255,255,0.2)",
      zIndex: 10, // Added z-index
    },
    notificationContainer: {
      position: "relative",
      zIndex: 10, // Added z-index
      marginRight: "15px",
    },
    dropdown: {
      position: "absolute",
      top: "100%", // Changed from 50px to 100%
      right: "0",
      marginTop: "5px", // Small gap
      // Retro dropdown styling
      background: "linear-gradient(145deg, #2A2A2A, #1A1A1A)",
      borderRadius: "12px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.1)",
      minWidth: "180px",
      zIndex: 9999, // Very high z-index
      overflow: "visible",
      border: "2px solid #FF6B35",
      backdropFilter: "blur(10px)",
    },
    dropdownItem: {
      display: "block",
      padding: "12px 15px",
      width: "100%",
      textAlign: "left",
      backgroundColor: "transparent",
      border: "none",
      fontFamily: "Roboto, sans-serif",
      fontSize: "14px",
      letterSpacing: "0.4px",
      borderBottom: "1px solid rgba(255, 107, 53, 0.3)",
      // Retro text color
      color: "#F7F7F7",
      fontWeight: "400",
      cursor: "pointer",
      transition: "all 0.3s ease",
    },
    passwordField: {
      position: "relative",
      marginBottom: "20px",
    },
    passwordToggle: {
      position: "absolute",
      right: "15px",
      top: "38px",
      cursor: "pointer",
      color: "#888",
      zIndex: 2,
      backgroundColor: "transparent",
      border: "none",
      display: "flex",
      alignItems: "center",
    },
    strengthMeter: {
      marginTop: "5px",
      marginBottom: "15px",
    },
    roleBadge: {
      padding: "4px 8px",
      borderRadius: "6px",
      fontWeight: 700,
      fontSize: "0.9em",
      display: "inline-flex",
      alignItems: "center",
      marginRight: "10px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
      // Enhanced retro badge styling
      border: "2px solid",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    },
    infoIcon: {
      marginLeft: "5px",
      fontSize: "14px",
      cursor: "help",
    },
    usernameDisplay: {
      marginRight: "10px",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      maxWidth: "150px",
      color: "#333333", // Ubah dari putih ke hitam
      fontWeight: "600",
      textShadow: "none", // Hapus bayangan teks
    },
    userDropdown: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      cursor: "pointer",
      padding: "5px 10px",
      borderRadius: "20px",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      background: "rgba(240,240,240,0.5)", // Warna latar lebih terang
      border: "1px solid rgba(200,200,200,0.5)",
      zIndex: 10,
    },
  };

  return (
    <>
      {/* Global CSS untuk memastikan dropdown tidak tertutup */}
      <style>
        {`
        /* Header base styles */
        .admin-header-fixed {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          z-index: 1200 !important;
          overflow: visible !important;
        }
        
        /* Notification dropdown styles */
        .notification-container {
          position: relative;
          z-index: 1300 !important;
        }
        
        .notification-container .dropdown-menu,
        .notification-container .dropdown-toggle,
        .notification-container .btn-group {
          z-index: 1300 !important;
        }
        
        /* User dropdown styles */
        .user-dropdown-container {
          position: relative;
          z-index: 1300 !important;
        }
        
        .user-dropdown-menu {
          position: absolute !important;
          top: 100% !important;
          right: 0 !important;
          margin-top: 5px !important;
          z-index: 9999 !important;
          display: block !important;
          opacity: 1 !important;
          visibility: visible !important;
          transform: translateY(0) !important;
          pointer-events: auto !important;
        }
        
        /* Bootstrap dropdown overrides */
        .dropdown-menu.show {
          z-index: 9999 !important;
          display: block !important;
          opacity: 1 !important;
          visibility: visible !important;
        }
        
        /* Ensure tooltips and overlays don't interfere */
        .tooltip,
        .tooltip-inner,
        .bs-tooltip-bottom .tooltip-arrow,
        .bs-tooltip-top .tooltip-arrow {
          z-index: 10000 !important;
        }
        
        /* Header content styles */
        .header-content {
          flex-grow: 1;
          min-width: 0;
          z-index: 3;
          position: relative;
        }
        
        .username-display {
          margin-right: 10px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 150px;
        }
        
        /* Retro animations */
        @keyframes retroGlow {
          0%, 100% {
            box-shadow: 0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2);
          }
          50% {
            box-shadow: 0 4px 25px rgba(255, 107, 53, 0.2), inset 0 1px 0 rgba(255,255,255,0.3);
          }
        }
        
        .admin-header {
          animation: retroGlow 4s ease-in-out infinite;
        }
        
        /* Dropdown retro animation */
        .dropdown-menu.show,
        .user-dropdown-menu {
          animation: retroSlideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        @keyframes retroSlideDown {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        /* Fix for Bootstrap modal z-index conflicts */
        .modal {
          z-index: 10500 !important;
        }
        
        .modal-backdrop {
          z-index: 10400 !important;
        }
        
        /* SweetAlert z-index fix */
        .swal2-container {
          z-index: 10600 !important;
        }
        
        @media (max-width: 768px) {
          .admin-header {
            padding: 12px 15px;
          }
          
          .header-content h1 {
            font-size: 1.1rem;
          }
        }
        
        @media (max-width: 640px) {
          .admin-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
            height: auto;
            min-height: 70px;
          }
          
          .admin-header > div {
            width: 100%;
          }
          
          .header-content {
            margin-left: 0;
            width: calc(100% - 55px);
          }
          
          .notification-container {
            margin-right: auto !important;
            margin-left: 55px;
          }
          
          .user-profile {
            margin-left: auto;
          }
        }
        
        @media (max-width: 480px) {
          .username-display {
            max-width: 80px;
          }
          
          .header-content h1 {
            font-size: 1rem;
          }
        }
        `}
      </style>

      <header style={styles.header} className="admin-header admin-header-fixed">
        {/* Retro overlay pattern */}
        <div style={styles.headerOverlay}></div>

        <div style={styles.headerLeft}>
          <button
            className="sidebar-toggle"
            onClick={toggleSidebar}
            aria-label={
              sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
            }
            style={styles.sidebarToggle}
            onMouseEnter={(e) => {
              e.target.style.transform = "scale(1.1) rotate(5deg)";
              e.target.style.boxShadow =
                "0 6px 20px rgba(255, 107, 53, 0.6), inset 0 1px 0 rgba(255,255,255,0.3)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "scale(1) rotate(0deg)";
              e.target.style.boxShadow =
                "0 4px 15px rgba(255, 107, 53, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)";
            }}
          >
            {sidebarCollapsed ? <FaBars /> : <FaTimes />}
          </button>

          <div className="header-content">
            <div className="d-flex align-items-center flex-wrap">
              {userData && (
                <div
                  style={{
                    ...styles.roleBadge,
                    backgroundColor:
                      userData.role_id === 1
                        ? "#4ECDC4"
                        : userData.role_id === 2
                        ? "#FFE66D"
                        : "#95E1D3",
                    color: "#2A2A2A",
                    borderColor:
                      userData.role_id === 1
                        ? "#26A69A"
                        : userData.role_id === 2
                        ? "#FFC107"
                        : "#4CAF50",
                  }}
                >
                  {userData.role}
                  <OverlayTrigger
                    placement="bottom"
                    overlay={
                      <Tooltip id="role-tooltip">
                        {getRoleExplanation()}
                      </Tooltip>
                    }
                  >
                    <span style={styles.infoIcon}>
                      <FaInfoCircle />
                    </span>
                  </OverlayTrigger>
                </div>
              )}
              <h1 style={styles.title}>Dashboard</h1>
            </div>
          </div>
        </div>

        <div style={styles.headerRight}>
          <div
            className="notification-container"
            style={styles.notificationContainer}
          >
            <NotificationDropdown />
          </div>

          <div
            className="user-profile user-dropdown-container"
            style={{
              ...styles.userDropdown,
              background: dropdownOpen
                ? "rgba(255,255,255,0.2)"
                : "rgba(255,255,255,0.1)",
              transform: dropdownOpen ? "translateY(-2px)" : "translateY(0)",
              boxShadow: dropdownOpen
                ? "0 4px 15px rgba(255, 107, 53, 0.3)"
                : "none",
            }}
            ref={dropdownRef}
            onClick={toggleDropdown}
          >
            {userData ? (
              <>
                <span
                  className="username-display"
                  style={styles.usernameDisplay}
                >
                  {userData.username}
                </span>
                <div style={styles.userAvatar}>
                  {userData.username
                    ? userData.username.substring(0, 2).toUpperCase()
                    : "AU"}
                </div>

                {dropdownOpen && (
                  <div
                    style={styles.dropdown}
                    className="dropdown-menu show user-dropdown-menu"
                  >
                    <button
                      className="dropdown-item"
                      style={styles.dropdownItem}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowChangePasswordModal(true);
                        setDropdownOpen(false);
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor =
                          "rgba(255, 107, 53, 0.2)";
                        e.target.style.color = "#FF6B35";
                        e.target.style.transform = "translateX(5px)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "transparent";
                        e.target.style.color = "#F7F7F7";
                        e.target.style.transform = "translateX(0)";
                      }}
                    >
                      Change Password
                    </button>
                    <button
                      className="dropdown-item"
                      style={styles.dropdownItem}
                      onClick={(e) => {
                        e.stopPropagation();
                        confirmLogout();
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor =
                          "rgba(255, 107, 53, 0.2)";
                        e.target.style.color = "#FF6B35";
                        e.target.style.transform = "translateX(5px)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "transparent";
                        e.target.style.color = "#F7F7F7";
                        e.target.style.transform = "translateX(0)";
                      }}
                    >
                      Logout
                    </button>
                  </div>
                )}

                {/* Change Password Modal */}
                <Modal
                  show={showChangePasswordModal}
                  onHide={() => {
                    if (!changeLoading) {
                      setShowChangePasswordModal(false);
                      setOldPassword("");
                      setNewPassword("");
                      setPasswordStrength(0);
                      setPasswordFeedback("");
                    }
                  }}
                  centered
                  backdrop="static"
                  keyboard={!changeLoading}
                >
                  <Modal.Header closeButton={!changeLoading}>
                    <Modal.Title>Change Password</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <div style={styles.passwordField}>
                      <label htmlFor="oldPassword">Current Password</label>
                      <input
                        id="oldPassword"
                        type={showOldPassword ? "text" : "password"}
                        className="form-control"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        disabled={changeLoading}
                        placeholder="Enter your current password"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        style={styles.passwordToggle}
                        onClick={() => setShowOldPassword((prev) => !prev)}
                        disabled={changeLoading}
                        aria-label={
                          showOldPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showOldPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>

                    <div style={styles.passwordField}>
                      <label htmlFor="newPassword">New Password</label>
                      <input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        className="form-control"
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          calculatePasswordStrength(e.target.value);
                        }}
                        disabled={changeLoading}
                        placeholder="Enter your new password"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        style={styles.passwordToggle}
                        onClick={() => setShowNewPassword((prev) => !prev)}
                        disabled={changeLoading}
                        aria-label={
                          showNewPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>

                      <div style={styles.strengthMeter}>
                        <ProgressBar
                          now={passwordStrength}
                          variant={
                            passwordStrength < 30
                              ? "danger"
                              : passwordStrength < 60
                              ? "warning"
                              : passwordStrength < 80
                              ? "info"
                              : "success"
                          }
                        />
                        <small
                          className={
                            passwordStrength < 30
                              ? "text-danger"
                              : passwordStrength < 60
                              ? "text-warning"
                              : passwordStrength < 80
                              ? "text-info"
                              : "text-success"
                          }
                        >
                          {passwordFeedback}
                        </small>
                      </div>
                    </div>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setShowChangePasswordModal(false);
                        setOldPassword("");
                        setNewPassword("");
                        setPasswordStrength(0);
                        setPasswordFeedback("");
                      }}
                      disabled={changeLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleChangePassword}
                      disabled={
                        changeLoading ||
                        !oldPassword ||
                        !newPassword ||
                        newPassword.length < 8
                      }
                    >
                      {changeLoading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Changing...
                        </>
                      ) : (
                        "Change Password"
                      )}
                    </Button>
                  </Modal.Footer>
                </Modal>
              </>
            ) : (
              <div className="d-flex align-items-center">
                <div
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                >
                  <span className="visually-hidden">Loading...</span>
                </div>
                <span style={{ color: "#F7F7F7" }}>Loading...</span>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default AdminHeader;
