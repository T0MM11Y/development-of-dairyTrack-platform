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
import { getLowProductionNotifications } from "../../api/produktivitas/dailyMilkTotal";
import { getFreshnessNotifications } from "../../api/produktivitas/rawMilk";
import { getAllNotifications } from "../../api/peternakan/notification";
import { getFeedNotifications } from "../../api/pakan/notification";

import avatar1 from "../../assets/admin/images/users/toon_9.png";

const LanguageDropdown = () => {
  const { i18n } = useTranslation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Simpan bahasa dan flag berdasarkan kode bahasa
  const languages = {
    en: {
      name: "English",
      flag: englishFlag,
    },
    id: {
      name: "Indo",
      flag: indoFlag,
    },
  };

  const currentLangCode = i18n.language || "en"; // ambil kode bahasa aktif
  const currentLanguage = languages[currentLangCode]?.name || "English";
  const currentFlag = languages[currentLangCode]?.flag || englishFlag;

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode); // langsung ganti bahasa
    setIsDropdownOpen(false); // tutup dropdown setelah pilih
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
        <img src={currentFlag} alt="Flag" height="16" />
        <span className="align-middle ms-1">{currentLanguage}</span>
        <i className="mdi mdi-chevron-down ms-1"></i>
      </button>

      {isDropdownOpen && (
        <div className="dropdown-menu dropdown-menu-end show">
          {/* Tampilkan opsi selain yang sekarang aktif */}
          {Object.entries(languages).map(
            ([code, lang]) =>
              code !== currentLangCode && (
                <a
                  href="#"
                  key={code}
                  className="dropdown-item notify-item"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLanguageChange(code);
                  }}
                >
                  <img
                    src={lang.flag}
                    alt={lang.name}
                    className="me-1"
                    height="12"
                  />
                  <span className="align-middle">{lang.name}</span>
                </a>
              )
          )}
        </div>
      )}
    </div>
  );
};

const Header = ({ onToggleSidebar }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] =
    useState(false);
  const [notifications, setNotifications] = useState([]); // State for notifications
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false); // Loading state for notifications

  const notificationDropdownRef = useRef(null);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Processing");
  const [userName, setUserName] = useState("Guest");

  const navigate = useNavigate();

  const userDropdownRef = useRef(null);
  const notificationButtonRef = useRef(null);
  const userButtonRef = useRef(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoadingNotifications(true);
      try {
        const lowProductionResponse = await getLowProductionNotifications();
        const freshnessResponse = await getFreshnessNotifications();
        const signalNotifications = await getAllNotifications();
        const feedNotificationResponse = await getFeedNotifications();

        // Pastikan untuk mengambil data dari properti `data` untuk feedNotification
        const feedNotifications = feedNotificationResponse.data || [];

        const combinedNotifications = [
          ...(lowProductionResponse.notifications || []),
          ...(freshnessResponse.notifications || []),
          ...(signalNotifications || []),
          ...feedNotifications, // Gunakan feedNotifications yang sudah dipetakan
        ];

        // Sort notifications by date (newest first)
        combinedNotifications.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );

        setNotifications(combinedNotifications);
      } catch (error) {
        console.error("Failed to fetch notifications:", error.message);
      } finally {
        setIsLoadingNotifications(false);
      }
    };

    fetchNotifications();
  }, []);

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
        position: "sticky",
        top: 0,
        zIndex: 1050,
        width: "100%",
      }}
    >
      <div className="navbar-header d-flex align-items-center justify-content-between">
        {/* Logo and Sidebar Toggle */}
        <div className="d-flex align-items-center">
          <button
            type="button"
            className="btn btn-outline-secondary d-md-none me-3"
            onClick={onToggleSidebar}
          >
            <i className="ri-menu-line"></i>
          </button>
          <div className="navbar-brand-box">
            <span className="logo-lg">
              <img src={logoDark} alt="logo-dark" height="50" />
            </span>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="d-flex align-items-center gap-3">
          {/* Language Dropdown */}
          <LanguageDropdown />

          {/* Fullscreen Toggle */}
          <button
            type="button"
            className="btn header-item noti-icon waves-effect d-none d-lg-inline-block"
            onClick={toggleFullScreen}
          >
            <i
              className={`ri-${
                isFullScreen ? "fullscreen-exit-line" : "fullscreen-line"
              }`}
            ></i>
          </button>

          {/* Notification Dropdown */}
          <div className="dropdown d-inline-block">
            <button
              type="button"
              className="btn header-item noti-icon waves-effect position-relative"
              id="page-header-notifications-dropdown"
              onClick={toggleNotificationDropdown}
            >
              <i className="ri-notification-3-line"></i>
              {notifications.length > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "2px", // Adjusted to move badge slightly further down
                    right: "0px", // Unchanged to keep horizontal position
                    backgroundColor: "#dc3545", // Red background
                    color: "white", // White text
                    borderRadius: "50%",
                    width: "20px",
                    height: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: "bold",
                    lineHeight: "1",
                    border: "1px solid #fff", // Optional: white border for contrast
                  }}
                >
                  {notifications.length}
                </span>
              )}
            </button>
            <div
              className={`dropdown-menu dropdown-menu-lg dropdown-menu-end p-0 ${
                isNotificationDropdownOpen ? "show" : ""
              }`}
              aria-labelledby="page-header-notifications-dropdown"
              style={{
                position: "absolute",
                right: 0,
                left: "auto",
                width: "300px",
                maxHeight: "calc(100vh - 100px)",
                overflow: "hidden",
              }}
            >
              <div className="p-3 border-bottom">
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
              <div
                data-simplebar
                style={{ maxHeight: "250px", overflowY: "auto" }}
              >
                {isLoadingNotifications ? (
                  <div className="text-center p-3">Loading...</div>
                ) : notifications.length === 0 ? (
                  <div className="text-center p-3">
                    No notifications available.
                  </div>
                ) : (
                  notifications.map((notification, index) => (
                    <a
                      key={index}
                      href="#"
                      className={`text-reset notification-item ${
                        notification.isNew ? "new-notification" : ""
                      }`}
                    >
                      <div className="d-flex position-relative p-3 border-bottom">
                        <div className="avatar-xs me-3">
                          <span
                            className={`avatar-title ${
                              notification.type === "freshness"
                                ? "bg-success"
                                : "bg-warning"
                            } rounded-circle font-size-16`}
                          >
                            <i
                              className={
                                notification.type === "freshness"
                                  ? "ri-refresh-line"
                                  : "ri-alert-line"
                              }
                            ></i>
                          </span>
                        </div>
                        <div className="flex-1">
                          <h6 className="mb-1">
                            {notification.name || "Unknown Notification"}
                          </h6>
                          <p className="mb-1 text-muted">
                            {notification.message}
                          </p>
                          <div className="font-size-12 text-muted">
                            <i className="mdi mdi-clock-outline"></i>{" "}
                            {notification.date}
                          </div>
                        </div>
                        {notification.isNew && (
                          <span className="position-absolute top-0 end-0 mt-2 me-2 translate-middle p-1 bg-danger border border-light rounded-circle">
                            <span className="visually-hidden">New alerts</span>
                          </span>
                        )}
                      </div>
                    </a>
                  ))
                )}
              </div>
              <div className="p-2 border-top">
                <div className="d-grid">
                  <a
                    className="btn btn-sm btn-primary font-size-14 text-center"
                    href="#!"
                  >
                    <i className="mdi mdi-arrow-right-circle me-1"></i> View All
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* User Dropdown */}
          <div className="dropdown d-inline-block user-dropdown">
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
