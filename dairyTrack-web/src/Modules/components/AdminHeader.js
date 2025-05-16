import React, { useState, useEffect, useRef } from "react";
import { logout } from "../controllers/authController";
import NotificationDropdown from "../components/Notification";

import Swal from "sweetalert2";

const AdminHeader = ({ toggleSidebar, sidebarCollapsed }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const dropdownRef = useRef(null);

  // Load user data from localStorage
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    if (storedUser) {
      setUserData(storedUser);
    }
  }, []);

  // Update waktu setiap detik
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Tambahkan event listener untuk mendeteksi klik di luar dropdown
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
      console.log("User data:", userData);
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
      Swal.fire({
        icon: "error",
        title: "Logout Failed",
        text: error.message,
      });
    }
  };

  return (
    <header className="admin-header">
      <div className="header-left">
        <button
          className="sidebar-toggle"
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          style={{
            backgroundColor: "#2DAA9E",
            color: "white",
            border: "none",
            marginLeft: "10px",
            borderRadius: "5px",
            padding: "10px",
            cursor: "pointer",
            transition: "transform 0.3s ease",
          }}
          onMouseEnter={(e) => (e.target.style.transform = "scale(1.1)")}
          onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
        >
          <i
            className={`fas fa-${
              sidebarCollapsed ? "chevron-right" : "chevron-left"
            }`}
            style={{
              fontSize: "18px",
              transition: "transform 0.3s ease",
            }}
          ></i>
        </button>

        <h1>
          {userData ? `${userData.role} Dashboard` : "Dashboard"}{" "}
          <span
            style={{
              fontFamily: "Roboto, monospace",
              letterSpacing: "1.5px",
              fontSize: "15px",
              fontWeight: "400",
              color: "#8F87F1",
              marginLeft: "10vh",
            }}
          >
            {currentTime.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              year: "numeric",
            })}{" "}
            {currentTime.toLocaleTimeString()}
          </span>
        </h1>
      </div>

      <div className="header-right">
        <div className="me-3">
          <NotificationDropdown />
        </div>

        <div
          className="user-dropdown"
          ref={dropdownRef}
          onClick={toggleDropdown}
        >
          {userData ? (
            <>
              <span>{userData.username}</span>
              <div
                style={{
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
                  marginRight: "10px",
                }}
              >
                {userData.username
                  ? userData.username.substring(0, 2).toUpperCase()
                  : "AU"}
              </div>
              {dropdownOpen && (
                <div className="dropdown-menu show">
                  <button className="dropdown-item">Reset Password</button>
                  <button className="dropdown-item" onClick={confirmLogout}>
                    Logout
                  </button>
                </div>
              )}
            </>
          ) : (
            <span>Loading...</span>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
