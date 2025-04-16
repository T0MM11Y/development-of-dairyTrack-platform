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
const Header = ({onToggleSidebar }) => {
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
<header
  id="page-topbar"
  className="header bg-white shadow-sm px-3"
  style={{
    position: "sticky", // atau "fixed"
    top: 0,
    zIndex: 1100,
    width: "100%",
  }}
>
        {isLoading && (
        <div className="loading-overlay">
          <div className="loading-text">{loadingText}</div>
        </div>
      )}
  
      <div className="navbar-header">
        <div className="d-flex align-items-center justify-content-between w-100">
          {/* Left Section: Toggle Button (mobile only) + Logo */}
          <div className="d-flex align-items-center gap-3">
            {/* Toggle Button (mobile only) */}
            <button
              className="btn btn-outline-secondary d-md-none"
              onClick={onToggleSidebar}
            >
              <i className="ri-menu-line"></i>
            </button>
  
            {/* Logo */}
            <div className="navbar-brand-box">
              <span className="logo-lg">
                <img src={logoDark} alt="logo-dark" height="50" />
              </span>
            </div>
          </div>
  
          {/* Right Section: Dropdowns */}
          <div className="d-flex align-items-center ms-auto gap-3">
            {/* Language Dropdown */}
            <LanguageDropdown />
  
            {/* Full-screen Toggle */}
            <div className="d-none d-lg-inline-block">
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
            <div className="dropdown">
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
                {/* Notification content */}
              </div>
            </div>
  
            {/* User Dropdown */}
            <div className="dropdown user-dropdown">
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
      </div>
    </header>
  );
  
};

export default Header;
