import React, { useState, useEffect, useRef } from "react";
import { logout } from "../controllers/authController";
import NotificationDropdown from "../components/Notification";
import Swal from "sweetalert2";
import { FaEye, FaEyeSlash, FaBars, FaTimes } from "react-icons/fa";

import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { changeUserPassword } from "../controllers/usersController";
import ProgressBar from "react-bootstrap/ProgressBar";

const AdminHeader = ({ toggleSidebar, sidebarCollapsed }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
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

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
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

  // Style objects
  const styles = {
    header: {
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      padding: "12px 20px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: "#fff",
      borderBottom: "1px solid #eaeaea",
    },
    sidebarToggle: {
      backgroundColor: "#2DAA9E",
      color: "white",
      border: "none",
      borderRadius: "5px",
      padding: "10px",
      marginRight: "15px",
      cursor: "pointer",
      transition: "all 0.3s ease",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "40px",
      height: "40px",
    },
    headerLeft: {
      display: "flex",
      alignItems: "center",
    },
    headerRight: {
      display: "flex",
      alignItems: "center",
    },
    title: {
      fontSize: "1.3rem",
      margin: 0,
      fontWeight: "600",
      color: "#333",
    },
    dateTime: {
      fontFamily: "Roboto, monospace",
      letterSpacing: "1px",
      fontSize: "15px",
      fontWeight: "400",
      color: "#8F87F1",
      marginLeft: "20px",
    },
    userAvatar: {
      width: "40px",
      height: "40px",
      borderRadius: "50%",
      backgroundColor: "#FFAD60",
      color: "white",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "16px",
      fontWeight: "bold",
      marginLeft: "10px",
    },
    userDropdown: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      cursor: "pointer",
      padding: "5px 10px",
      borderRadius: "20px",
      transition: "background-color 0.3s ease",
    },
    dropdown: {
      position: "absolute",
      top: "50px",
      right: "0",
      backgroundColor: "#fff",
      borderRadius: "5px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
      minWidth: "180px",
      zIndex: 1000,
      overflow: "hidden",
    },
    dropdownItem: {
      display: "block",
      padding: "10px 15px",
      width: "100%",
      textAlign: "left",
      backgroundColor: "transparent",
      border: "none",
      fontFamily: "Roboto, sans-serif",
      fontSize: "14px",
      letterSpacing: "0.8px",
      borderBottom: "1px solid #eee",
      color: "#333",
      fontWeight: "400", // Ubah dari 500 ke 400 agar lebih kecil
      cursor: "pointer",
      transition: "background-color 0.2s",
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
  };

  return (
    <header style={styles.header} className="admin-header">
      <div style={styles.headerLeft}>
        <button
          className="sidebar-toggle"
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          style={styles.sidebarToggle}
          onMouseEnter={(e) => {
            e.target.style.transform = "scale(1.1)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "scale(1)";
          }}
        >
          {sidebarCollapsed ? <FaBars /> : <FaTimes />}
        </button>

        <div>
          <h1 style={styles.title}>
            {userData ? `${userData.role} Dashboard` : "Dashboard"}
          </h1>
          <div style={styles.dateTime}>
            {currentTime.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}{" "}
            |{" "}
            {currentTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </div>

      <div style={styles.headerRight}>
        <div className="notification-container me-3">
          <NotificationDropdown />
        </div>

        <div
          style={styles.userDropdown}
          ref={dropdownRef}
          onClick={toggleDropdown}
        >
          {userData ? (
            <>
              <span>{userData.username}</span>
              <div style={styles.userAvatar}>
                {userData.username
                  ? userData.username.substring(0, 2).toUpperCase()
                  : "AU"}
              </div>

              {dropdownOpen && (
                <div style={styles.dropdown} className="dropdown-menu show">
                  <button
                    className="dropdown-item"
                    style={styles.dropdownItem}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowChangePasswordModal(true);
                      setDropdownOpen(false);
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = "#f8f9fa";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "transparent";
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
                      e.target.style.backgroundColor = "#f8f9fa";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "transparent";
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
              <span>Loading...</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
