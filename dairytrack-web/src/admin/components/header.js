import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

// Import images
import logoSm from "../../assets/admin/images/logo-sm.png";
import logoDark from "../../assets/admin/images/logo-dark.png";
import logoLight from "../../assets/admin/images/logo-light.png";
import avatar1 from "../../assets/admin/images/users/avatar-1.jpg";

const Header = () => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Default expanded

  // Refs
  const notificationDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);
  const notificationButtonRef = useRef(null);
  const userButtonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isNotificationDropdownOpen && 
          notificationDropdownRef.current && 
          !notificationDropdownRef.current.contains(event.target) &&
          !notificationButtonRef.current.contains(event.target)) {
        setIsNotificationDropdownOpen(false);
      }
      
      if (isUserDropdownOpen && 
          userDropdownRef.current && 
          !userDropdownRef.current.contains(event.target) &&
          !userButtonRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

  const toggleVerticalMenu = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    
    // Update main content
    const content = document.querySelector(".main-content");
    if (content) {
      content.style.marginLeft = newState ? "90px" : "250px";
      content.style.width = newState ? "calc(100% - 90px)" : "calc(100% - 250px)";
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
          {/* Logo - Default expanded */}
          <div className="navbar-brand-box" style={{ width: isSidebarCollapsed ? "90px" : "250px" }}>
            <Link to="/" className="logo logo-dark">
              <span className="logo-sm" style={{ display: isSidebarCollapsed ? "block" : "none" }}>
                <img src={logoSm} alt="logo-sm" height="22" />
              </span>
              <span className="logo-lg" style={{ display: isSidebarCollapsed ? "none" : "block" }}>
                <img src={logoDark} alt="logo-dark" height="20" />
              </span>
            </Link>
            <Link to="/" className="logo logo-light">
              <span className="logo-sm" style={{ display: isSidebarCollapsed ? "block" : "none" }}>
                <img src={logoSm} alt="logo-sm-light" height="22" />
              </span>
              <span className="logo-lg" style={{ display: isSidebarCollapsed ? "none" : "block" }}>
                <img src={logoLight} alt="logo-light" height="20" />
              </span>
            </Link>
          </div>

          {/* Menu Toggle Button */}
          <button
            type="button"
            className="btn btn-sm px-3 font-size-24 header-item waves-effect me-3"
            id="vertical-menu-btn"
            onClick={toggleVerticalMenu}
          >
            <i className="ri-menu-2-line align-middle"></i>
          </button>

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
              style={{
                position: "absolute",
                inset: "0px auto auto 0px",
                margin: "0px",
                transform: "translate(-225px, 70px)",
                width: "380px",
                padding: "0",
              }}
            >
              <div className="p-3 border-bottom">
                <div className="row align-items-center">
                  <div className="col">
                    <h5 className="m-0" style={{ fontSize: "1.1rem" }}>Notifications</h5>
                  </div>
                  <div className="col-auto">
                    <a href="#!" className="small text-primary">View All</a>
                  </div>
                </div>
              </div>
              <div style={{ maxHeight: "350px", overflowY: "auto" }} className="p-3">
                <div className="text-reset notification-item d-block p-3">
                  <div className="d-flex">
                    <div className="flex-shrink-0 me-3">
                      <div className="avatar-md">
                        <span className="avatar-title bg-primary rounded-circle">
                          <i className="ri-message-3-line fs-4"></i>
                        </span>
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="mt-0 mb-2 fs-6 fw-semibold">New message received</h6>
                      <div className="text-muted">
                        <p className="mb-1">You have 87 unread messages</p>
                        <p className="mb-0 small text-muted">3 min ago</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-reset notification-item d-block p-3">
                  <div className="d-flex">
                    <div className="flex-shrink-0 me-3">
                      <div className="avatar-md">
                        <span className="avatar-title bg-success rounded-circle">
                          <i className="ri-bar-chart-line fs-4"></i>
                        </span>
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="mt-0 mb-2 fs-6 fw-semibold">Feed Usage Report</h6>
                      <div className="text-muted">
                        <p className="mb-1">26,200 kg Feed Used</p>
                        <p className="mb-0 small text-muted">Today</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-3 border-top">
                <div className="d-grid">
                  <a className="btn btn-link font-size-14 text-center py-2" href="#!">
                    <i className="ri-arrow-right-s-line me-1"></i> VIEW MORE
                  </a>
                </div>
              </div>
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
                <i className="ri-settings-2-line align-middle me-1"></i> Settings
              </a>
              <a className="dropdown-item" href="#">
                <i className="ri-lock-unlock-line align-middle me-1"></i> Lock screen
              </a>
              <div className="dropdown-divider"></div>
              <Link to="/logout" className="dropdown-item">
                <i className="ri-logout-circle-r-line align-middle me-1"></i> Logout
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;