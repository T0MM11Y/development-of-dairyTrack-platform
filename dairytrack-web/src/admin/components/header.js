import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

// Import images
import logoBlack from "../../assets/client/img/logo/logo_black.png";
import logoWhite from "../../assets/client/img/logo/logo_white.png";
import logoSm from "../../assets/admin/images/logo-sm.png";
import logoDark from "../../assets/admin/images/logo-dark.png";
import logoLight from "../../assets/admin/images/logo-light.png";
import avatar1 from "../../assets/admin/images/users/avatar-1.jpg";

const Header = () => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] =
    useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  // Refs
  const notificationDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);
  const notificationButtonRef = useRef(null);
  const userButtonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isNotificationDropdownOpen &&
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(event.target) &&
        !notificationButtonRef.current.contains(event.target)
      ) {
        setIsNotificationDropdownOpen(false);
      }

      if (
        isUserDropdownOpen &&
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target) &&
        !userButtonRef.current.contains(event.target)
      ) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isNotificationDropdownOpen, isUserDropdownOpen]);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  const toggleNotificationDropdown = (e) => {
    e.stopPropagation();
    setIsNotificationDropdownOpen(!isNotificationDropdownOpen);
    if (isUserDropdownOpen) setIsUserDropdownOpen(false);
  };

  const toggleUserDropdown = (e) => {
    e.stopPropagation();
    setIsUserDropdownOpen(!isUserDropdownOpen);
    if (isNotificationDropdownOpen) setIsNotificationDropdownOpen(false);
  };

  return (
    <header id="page-topbar" className="header">
      <div className="navbar-header">
        <div className="d-flex align-items-center w-100">
          {/* Logo */}
          <div className="navbar-brand-box">
            <Link to="/" className="logo logo-dark">
              <span className="logo-sm">
                <img src={logoSm} alt="logo-sm" height="24" />
              </span>
              <span className="logo-lg">
                <img src={logoDark} alt="logo-dark" height="22" />
              </span>
            </Link>
            <Link to="/" className="logo logo-light">
              <span className="logo-sm">
                <img src={logoSm} alt="logo-sm-light" height="24" />
              </span>
              <span className="logo-lg">
                <img src={logoLight} alt="logo-light" height="22" />
              </span>
            </Link>
          </div>

          {/* Search Form */}
          <form
            className="app-search me-4"
            style={{ width: "400px", maxWidth: "600px" }}
          >
            <div className="position-relative">
              <input
                type="text"
                className="form-control"
                placeholder="Search..."
                style={{ width: "100%", paddingRight: "40px" }}
              />
              <span
                className="ri-search-line"
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#999",
                }}
              ></span>
            </div>
          </form>

          <div className="flex-grow-1"></div>

          {/* Full-screen Toggle */}
          <div className="dropdown d-none d-lg-inline-block me-4">
            <button
              type="button"
              className="btn header-item noti-icon waves-effect"
              onClick={toggleFullScreen}
            >
              <i
                className={`ri-${
                  isFullScreen ? "fullscreen-exit-line" : "fullscreen-line"
                }`}
              ></i>
            </button>
          </div>

          {/* Notifications Dropdown */}
          <div className="dropdown d-inline-block me-4">
            <button
              ref={notificationButtonRef}
              type="button"
              className="btn header-item noti-icon waves-effect"
              id="page-header-notifications-dropdown"
              onClick={toggleNotificationDropdown}
            >
              <i className="ri-notification-3-line"></i>
              <span className="noti-dot"></span>
            </button>
            <div
              ref={notificationDropdownRef}
              className={`dropdown-menu dropdown-menu-end ${
                isNotificationDropdownOpen ? "show" : ""
              }`}
            >
              {/* Notification content */}
            </div>
          </div>

          {/* User Dropdown */}
          <div className="dropdown d-inline-block user-dropdown me-4">
            <button
              ref={userButtonRef}
              type="button"
              className="btn header-item waves-effect"
              id="page-header-user-dropdown"
              onClick={toggleUserDropdown}
            >
              <img
                className="rounded-circle header-profile-user"
                src={avatar1}
                alt="Header Avatar"
              />
              <span className="d-none d-xl-inline-block ms-1">JHON</span>
              <i className="mdi mdi-chevron-down d-none d-xl-inline-block"></i>
            </button>
            <div
              ref={userDropdownRef}
              className={`dropdown-menu dropdown-menu-end ${
                isUserDropdownOpen ? "show" : ""
              }`}
            >
              {/* User dropdown content */}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
