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
    document.body.classList.toggle("sidebar-enable");
    if (window.innerWidth >= 992) {
      document.body.classList.toggle("vertical-collpsed");
    } else {
      document.body.classList.remove("vertical-collpsed");
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
    <header id="page-topbar">
      <div className="navbar-header">
        <div className="d-flex">
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

          <button
            type="button"
            className="btn btn-sm px-3 font-size-24 header-item waves-effect"
            id="vertical-menu-btn"
            onClick={toggleVerticalMenu}
          >
            <i className="ri-menu-2-line align-middle"></i>
          </button>

          {/* App Search*/}
          <form className="app-search d-none d-lg-block">
            <div className="position-relative">
              <input
                type="text"
                className="form-control"
                placeholder="Search..."
              />
              <span className="ri-search-line"></span>
            </div>
          </form>

          {/* Mega Menu */}
          {/* ... (Mega Menu code remains unchanged) ... */}
        </div>

        <div className="d-flex">
          {/* Mobile search dropdown */}
          <div className="dropdown d-inline-block d-lg-none ms-2">
            <button
              type="button"
              className="btn header-item noti-icon waves-effect"
              id="page-header-search-dropdown"
              onClick={toggleSearch}
            >
              <i className="ri-search-line"></i>
            </button>
            <div
              className={`dropdown-menu dropdown-menu-lg dropdown-menu-end p-0 ${
                isSearchVisible ? "show" : ""
              }`}
              aria-labelledby="page-header-search-dropdown"
            >
              <form className="p-3">
                <div className="mb-3 m-0">
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search ..."
                    />
                    <div className="input-group-append">
                      <button className="btn btn-primary" type="submit">
                        <i className="ri-search-line"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Full-screen toggler */}
          <div className="dropdown d-none d-lg-inline-block ms-1">
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
              <div data-simplebar style={{ maxHeight: "230px" }}>
                <a href="" className="text-reset notification-item">
                  <div className="d-flex">
                    <div className="avatar-xs me-3">
                      <span className="avatar-title bg-primary rounded-circle font-size-16">
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

          {/* User profile dropdown */}
          <div className="dropdown d-inline-block user-dropdown">
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
