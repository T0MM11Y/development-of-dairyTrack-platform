import React, { useState } from "react";
import { Link } from "react-router-dom";

// Import images
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

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullScreen(false);
      }
    }
  };

  const toggleVerticalMenu = () => {
    // Find the sidebar toggle button and trigger its click
    const sidebarToggleBtn = document.querySelector('.vertical-menu .btn-light');
    if (sidebarToggleBtn) {
      sidebarToggleBtn.click();
    }
  };

  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
  };

  const toggleNotificationDropdown = () => {
    setIsNotificationDropdownOpen(!isNotificationDropdownOpen);
  };

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  const toggleRightSidebar = () => {
    document.body.classList.toggle("right-bar-enabled");
  };

  return (
    <header
      id="page-topbar"
      style={{
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
        border: "1px solid #e0e0e0",
      }}
    >
      <div className="navbar-header">
        <div className="d-flex align-items-center w-100">
          {/* LOGO */}
          <div className="navbar-brand-box">
            <Link to="/" className="logo logo-dark">
              <span className="logo-sm">
                <img src={logoSm} alt="logo-sm" height="22" />
              </span>
              <span className="logo-lg">
                <img src={logoDark} alt="logo-dark" height="20" />
              </span>
            </Link>

            <Link to="/" className="logo logo-light">
              <span className="logo-sm">
                <img src={logoSm} alt="logo-sm-light" height="22" />
              </span>
              <span className="logo-lg">
                <img src={logoLight} alt="logo-light" height="20" />
              </span>
            </Link>
          </div>

          {/* Tombol Toggle Menu */}
          <button
            type="button"
            className="btn btn-sm px-3 font-size-24 header-item waves-effect me-3"
            id="vertical-menu-btn"
            onClick={toggleVerticalMenu}
          >
            <i className="ri-menu-2-line align-middle"></i>
          </button>

          {/* Kolom Pencarian (Lebar dan Panjang Diperbesar) */}
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

          {/* Spacer untuk memberikan jarak */}
          <div className="flex-grow-1"></div>

          {/* Full-screen toggler */}
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

          {/* Notifications dropdown */}
          <div className="dropdown d-inline-block me-4">
            <button
              type="button"
              className="btn header-item noti-icon waves-effect"
              id="page-header-notifications-dropdown"
              onClick={toggleNotificationDropdown}
            >
              <i className="ri-notification-3-line"></i>
              <span className="noti-dot"></span>
            </button>
            {/* Konten dropdown notifikasi */}
          </div>

          {/* User profile dropdown */}
          <div className="dropdown d-inline-block user-dropdown me-4">
            <button
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
              <span className="d-none d-xl-inline-block ms-1">Julia</span>
              <i className="mdi mdi-chevron-down d-none d-xl-inline-block"></i>
            </button>
            <div
              className={`dropdown-menu dropdown-menu-end ${
                isUserDropdownOpen ? "show" : ""
              }`}
              style={{
                position: "absolute",
                inset: "0px auto auto 0px",
                margin: "0px",
                transform: "translate(-45px, 70px)",
              }}
            >
              <a className="dropdown-item" href="#">
                <i className="ri-user-line align-middle me-1"></i> Profile
              </a>
              <a className="dropdown-item" href="#">
                <i className="ri-wallet-2-line align-middle me-1"></i> My Wallet
              </a>
              <a className="dropdown-item d-block" href="#">
                <span className="badge bg-success float-end mt-1">11</span>
                <i className="ri-settings-2-line align-middle me-1"></i>{" "}
                Settings
              </a>
              <a className="dropdown-item" href="#">
                <i className="ri-lock-unlock-line align-middle me-1"></i> Lock
                screen
              </a>
              <div className="dropdown-divider"></div>
              <Link to="/logout" className="dropdown-item">
                <i className="ri-logout-circle-r-line align-middle me-1"></i>{" "}
                Logout
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;