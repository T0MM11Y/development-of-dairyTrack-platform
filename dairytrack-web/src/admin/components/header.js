import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import { fetchAPI } from "../../api/apiClient";

import logoSm from "../../assets/client/img/logo/logo.png";
import logoDark from "../../assets/client/img/logo/logo.png";
import logoLight from "../../assets/client/img/logo/logo.png";
import englishFlag from "../../assets/admin/images/flags/us.jpg";
import indoFlag from "../../assets/admin/images/flags/indo.png";

import avatar1 from "../../assets/admin/images/users/toon_9.png";

const LanguageDropdown = () => {
  const { t, i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState("English");
  const [currentFlag, setCurrentFlag] = useState(englishFlag);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLanguageChange = (language) => {
    if (language === "English") {
      setCurrentLanguage("English");
      setCurrentFlag(englishFlag);
      i18n.changeLanguage("en");
    } else if (language === "Indo") {
      setCurrentLanguage("Indo");
      setCurrentFlag(indoFlag);
      i18n.changeLanguage("id");
    }
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="dropdown ms-auto mt-2">
      <button
        type="button"
        className="btn header-item waves-effect"
        onClick={toggleDropdown}
        aria-haspopup="true"
        aria-expanded={isDropdownOpen}
      >
        <img className="" src={currentFlag} alt="Header Language" height="16" />
        <span className="align-middle ms-1">{currentLanguage}</span>
        <i className="mdi mdi-chevron-down ms-1"></i>
      </button>
      {isDropdownOpen && (
        <div className="dropdown-menu dropdown-menu-end show">
          {currentLanguage === "English" && (
            <a
              href="#"
              className="dropdown-item notify-item"
              onClick={() => handleLanguageChange("Indo")}
            >
              <img src={indoFlag} alt="Indo" className="me-1" height="12" />
              <span className="align-middle">Indo</span>
            </a>
          )}
          {currentLanguage === "Indo" && (
            <a
              href="#"
              className="dropdown-item notify-item"
              onClick={() => handleLanguageChange("English")}
            >
              <img
                src={englishFlag}
                alt="English"
                className="me-1"
                height="12"
              />
              <span className="align-middle">English</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
};

const Header = () => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] =
    useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Processing");
  const [userName, setUserName] = useState("Guest");

  const navigate = useNavigate();

  const notificationDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);
  const notificationButtonRef = useRef(null);
  const userButtonRef = useRef(null);

  useEffect(() => {
    const sessionTimeout = setTimeout(() => {
      Swal.fire({
        title: "Session Expired",
        text: "Your session has expired. Please log in again.",
        icon: "warning",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "OK",
      }).then(async () => {
        setIsLoading(true);

        try {
          const response = await fetchAPI("auth/logout", "POST", {
            email: JSON.parse(localStorage.getItem("user"))?.email,
          });

          if (response.status === 200) {
            localStorage.removeItem("user");

            setTimeout(() => {
              navigate("/logout", { replace: true });
              window.history.pushState(null, null, window.location.href);
              window.onpopstate = () => {
                navigate("/logout", { replace: true });
              };
              setIsLoading(false);
            }, 2000);
          } else {
            Swal.fire("Error", response.message || "Logout failed.", "error");
            setIsLoading(false);
          }
        } catch (error) {
          Swal.fire(
            "Error",
            "An unexpected error occurred. Please try again later.",
            "error"
          );
          setIsLoading(false);
        }
      });
    }, 30 * 60 * 1000);

    return () => clearTimeout(sessionTimeout);
  }, [navigate]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      const role = `${user.role || "Unknown"}`;
      setUserName(role);
    }
  }, []);

  useEffect(() => {
    let interval;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingText((prev) =>
          prev === "Processing..." ? "Processing" : prev + "."
        );
      }, 500);
    } else {
      setLoadingText("Processing");
    }
    return () => clearInterval(interval);
  }, [isLoading]);

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

  const handleLogout = async () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out of your account.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, logout!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsLoading(true);

        try {
          const response = await fetchAPI("auth/logout", "POST", {
            email: JSON.parse(localStorage.getItem("user"))?.email,
          });

          if (response.status === 200) {
            localStorage.removeItem("user");

            setTimeout(() => {
              navigate("/logout", { replace: true });
              window.history.pushState(null, null, window.location.href);
              window.onpopstate = () => {
                navigate("/logout", { replace: true });
              };
              setIsLoading(false);
            }, 2000);
          } else {
            Swal.fire("Error", response.message || "Logout failed.", "error");
            setIsLoading(false);
          }
        } catch (error) {
          Swal.fire(
            "Error",
            "An unexpected error occurred. Please try again later.",
            "error"
          );
          setIsLoading(false);
        }
      }
    });
  };

  return (
    <header id="page-topbar" className="header">
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-text">{loadingText}</div>
        </div>
      )}

      <div className="navbar-header">
        <div className="d-flex align-items-start w-100">
          {/* Logo */}
          <div className="navbar-brand-box">
            <span className="logo-lg">
              <img src={logoDark} alt="logo-dark" height="90" />
            </span>
          </div>

          {/* Language Dropdown */}
          <LanguageDropdown />

          {/* Full-screen Toggle */}
          <div className="dropdown d-none d-lg-inline-block me-4 mt-2">
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
          <div className="dropdown d-inline-block mt-2">
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
                transform: "translate(-250px, 60px)",
                width: "300px", // Adjusted width for compact view
              }}
              aria-labelledby="page-header-notifications-dropdown"
            >
              <div className="p-3">
                <div className="row align-items-center">
                  <div className="col">
                    <h6 className="m-0"> Notifications </h6>
                  </div>
                  <div className="col-auto">
                    <a href="#!" className="small">
                      View All
                    </a>
                  </div>
                </div>
              </div>
              <div data-simplebar="init" style={{ maxHeight: "250px" }}>
                <div className="simplebar-content">
                  {/* Feed Notifications */}
                  <a href="" className="text-reset notification-item">
                    <div className="d-flex">
                      <div className="avatar-xs me-3">
                        <span className="avatar-title bg-warning rounded-circle font-size-16">
                          <i className="ri-alert-line"></i>
                        </span>
                      </div>
                      <div className="flex-1">
                        <h6 className="mb-1">Feed Stock Low</h6>
                        <div className="font-size-12 text-muted">
                          <p className="mb-0">
                            <i className="mdi mdi-clock-outline"></i> 10 min ago
                          </p>
                        </div>
                      </div>
                    </div>
                  </a>

                  {/* Health Notifications */}
                  <a href="" className="text-reset notification-item">
                    <div className="d-flex">
                      <div className="avatar-xs me-3">
                        <span className="avatar-title bg-danger rounded-circle font-size-16">
                          <i className="ri-heart-pulse-line"></i>
                        </span>
                      </div>
                      <div className="flex-1">
                        <h6 className="mb-1">Health Alert</h6>
                        <div className="font-size-12 text-muted">
                          <p className="mb-0">
                            <i className="mdi mdi-clock-outline"></i> 2 hours
                            ago
                          </p>
                        </div>
                      </div>
                    </div>
                  </a>

                  {/* Sales Notifications */}
                  <a href="" className="text-reset notification-item">
                    <div className="d-flex">
                      <div className="avatar-xs me-3">
                        <span className="avatar-title bg-primary rounded-circle font-size-16">
                          <i className="ri-shopping-cart-line"></i>
                        </span>
                      </div>
                      <div className="flex-1">
                        <h6 className="mb-1">New Order</h6>
                        <div className="font-size-12 text-muted">
                          <p className="mb-0">
                            <i className="mdi mdi-clock-outline"></i> 30 min ago
                          </p>
                        </div>
                      </div>
                    </div>
                  </a>

                  {/* Milk Notifications */}
                  <a href="" className="text-reset notification-item">
                    <div className="d-flex">
                      <div className="avatar-xs me-3">
                        <span className="avatar-title bg-info rounded-circle font-size-16">
                          <i className="ri-drop-line"></i>
                        </span>
                      </div>
                      <div className="flex-1">
                        <h6 className="mb-1">Milk Production Down</h6>
                        <div className="font-size-12 text-muted">
                          <p className="mb-0">
                            <i className="mdi mdi-clock-outline"></i> 3 hours
                            ago
                          </p>
                        </div>
                      </div>
                    </div>
                  </a>
                </div>
              </div>
              <div className="p-2 border-top">
                <div className="d-grid">
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
          </div>
          {/* User Dropdown */}
          <div className="dropdown d-inline-block user-dropdown me-4 mt-2">
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
                style={{ height: "34px", width: "34px" }}
              />
              <span className="d-none d-xl-inline-block ms-1">{userName}</span>
              <i className="mdi mdi-chevron-down d-none d-xl-inline-block"></i>
            </button>
            <div
              ref={userDropdownRef}
              className={`dropdown-menu dropdown-menu-end ${
                isUserDropdownOpen ? "show" : ""
              }`}
            >
              <a className="dropdown-item" href="#">
                <i className="ri-user-line align-middle me-1"></i> Profile
              </a>

              <div className="dropdown-divider"></div>
              <button className="dropdown-item" onClick={handleLogout}>
                <i className="ri-logout-circle-r-line align-middle me-1"></i>{" "}
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
