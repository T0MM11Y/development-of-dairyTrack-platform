import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

// Import images

import logoSm from "../../assets/admin/images/logo-sm.png";
import logoDark from "../../assets/admin/images/logo-dark.png";
import logoLight from "../../assets/admin/images/logo-light.png";
import avatar1 from "../../assets/admin/images/users/toon_9.png";

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

<<<<<<< HEAD
=======
  const toggleVerticalMenu = () => {
    const verticalMenu = document.querySelector(".vertical-menu");
    const mainContent = document.querySelector(".main-content");

    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    
    if (verticalMenu && mainContent) {
      verticalMenu.style.width = newState ? "90px" : "250px";
      mainContent.style.marginLeft = newState ? "90px" : "250px";
      mainContent.style.width = newState ? "calc(100% - 90px)" : "calc(100% - 250px)";
    }
  };

>>>>>>> c5bd6d9a (api hasan)
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

          {/* Notifications dropdown */}
          <div className="dropdown d-inline-block">
            <button
              type="button"
              className="btn header-item noti-icon waves-effect"
              id="page-header-notifications-dropdown"
              onClick={toggleNotificationDropdown}
            >
              <i className="ri-notification-3-line"></i>
              <span className="noti-dot"></span>
            </button>
            <div
              className={`dropdown-menu dropdown-menu-lg dropdown-menu-end p-0 ${
                isNotificationDropdownOpen ? "show" : ""
              }`}
              style={{
                position: "absolute",
                inset: "0px auto auto 0px",
                margin: "0px",
                transform: "translate(-270px, 70px)",
              }}
              aria-labelledby="page-header-notifications-dropdown"
            >
              <div className="p-3">
                <div className="row align-items-center">
                  <div className="col">
                    <h6 className="m-0">Notifications</h6>
                  </div>
                  <div className="col-auto">
                    <a href="#!" className="small">
                      View All
                    </a>
                  </div>
                </div>
              </div>
              <div data-simplebar style={{ maxHeight: "370px" }}>
                <a href="" className="text-reset notification-item">
                  <div className="d-flex">
                    <div className="avatar-xs me-3">
                      <span className="avatar-title bg-danger rounded-circle font-size-16">
                        <i className="ri-shopping-cart-line"></i>
                      </span>
                    </div>
                    <div className="flex-1">
                      <h6 className="mb-1">Low feed stock alert</h6>
                      <div className="font-size-12 text-muted">
                        <p className="mb-1">
                          Hay stock is running low. Please reorder.
                        </p>
                        <p className="mb-0">
                          <i className="mdi mdi-clock-outline"></i> 3 min ago
                        </p>
                      </div>
                    </div>
                  </div>
                </a>
                <a href="" className="text-reset notification-item">
                  <div className="d-flex">
                    <div className="avatar-xs me-3">
                      <span className="avatar-title bg-success rounded-circle font-size-16">
                        <i className="ri-checkbox-circle-line"></i>
                      </span>
                    </div>
                    <div className="flex-1">
                      <h6 className="mb-1">Cow health check completed</h6>
                      <div className="font-size-12 text-muted">
                        <p className="mb-1">
                          Monthly health check for all cows completed.
                        </p>
                        <p className="mb-0">
                          <i className="mdi mdi-clock-outline"></i> 1 hours ago
                        </p>
                      </div>
                    </div>
                  </div>
                </a>
                <a href="" className="text-reset notification-item">
                  <div className="d-flex">
                    <div className="avatar-xs me-3">
                      <span className="avatar-title bg-success rounded-circle font-size-16">
                        <i className=" ri-arrow-up-circle-line"></i>
                      </span>
                    </div>
                    <div className="flex-1">
                      <h6 className="mb-1">Milk production update</h6>
                      <div className="font-size-12 text-muted">
                        <p className="mb-1">
                          Today's milk production reached 500 liters, a
                          significant 50% increase compared to yesterday.
                        </p>
                        <p className="mb-0">
                          <i className="mdi mdi-clock-outline"></i> 2 hours ago
                        </p>
                      </div>
                    </div>
                  </div>
                </a>
              </div>
              <div className="p-2 border-top d-grid">
                <a
                  className="btn btn-sm btn-link font-size-14 text-center"
                  href="javascript:void(0)"
                >
                  <i className="mdi mdi-arrow-right-circle me-1"></i> View
                  More..
                </a>
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
              <span className="d-none d-xl-inline-block ms-1">Gustavo</span>
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
