import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import profileImage from "../../assets/admin/images/users/avatar-1.jpg";

const Sidebar = () => {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState([]);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSubmenu = (key) => {
    setOpenMenus((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  };

  const isMenuOpen = (key) => openMenus.includes(key);
  const isActive = (path) => location.pathname.startsWith(path);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  useEffect(() => {
    // Apply the margin to the main content area when sidebar state changes
    const content = document.querySelector(".main-content");
    if (content) {
      content.style.marginLeft = isCollapsed ? "90px" : "250px"; // Adjusted from 70px to 90px
      content.style.transition = "margin-left 0.3s ease-in-out";
    }
  }, [isCollapsed]);

  const sidebarStyle = {
    width: isCollapsed ? "70px" : "250px",
    transition: "width 0.3s ease-in-out",
  };

  return (
    <div className="vertical-menu">
      <div data-simplebar className="h-100">
        <div className="user-profile text-center mt-3">
          <img
            src={profileImage}
            alt="User Avatar"
            className="avatar-md rounded-circle"
          />
          <div className="mt-3">
            <h4 className="font-size-16 mb-1">Farm Manager</h4>
            <span className="text-muted">
              <i className="ri-record-circle-line align-middle font-size-14 text-success"></i>
              Online
            </span>
          </div>
        </div>

        <div id="sidebar-menu">
          <ul className="metismenu list-unstyled" id="side-menu">
            <li className="menu-title">
              <i className="ri-menu-line me-2"></i>DairyTrack Menu
            </li>

            <li className={isActive("/dashboard") ? "mm-active" : ""}>
              <Link to="/dashboard" className="waves-effect">
                <i className="ri-dashboard-line"></i> <span>Dashboard</span>
              </Link>
            </li>

            <li className={isMenuOpen("farmOperations") ? "mm-active" : ""}>
              <Link
                to="#"
                className="has-arrow waves-effect"
                onClick={(e) => {
                  e.preventDefault();
                  toggleSubmenu("farmOperations");
                }}
                aria-expanded={isMenuOpen("farmOperations")}
              >
                <i className="ri-farm-line"></i> <span>Farm Operations</span>
              </Link>
              {isMenuOpen("farmOperations") && (
                <ul className="sub-menu mm-show">
                  <li>
                    <Link
                      to="/cows"
                      className={isActive("/cows") ? "active" : ""}
                    >
                      <i className="dripicons-rocket"></i> Cow Management
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/milk/records"
                      className={isActive("/milk/records") ? "active" : ""}
                    >
                      <i className="ri-file-list-3-line"></i> Milk Productions
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/feed/inventory"
                      className={isActive("/feed/inventory") ? "active" : ""}
                    >
                      <i className="ri-stack-line"></i> Feed Management
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/breeding"
                      className={isActive("/breeding") ? "active" : ""}
                    >
                      <i className="ri-parent-line"></i> Breeding Records
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            <li className={isMenuOpen("healthManagement") ? "mm-active" : ""}>
              <Link
                to="#"
                className="has-arrow waves-effect"
                onClick={(e) => {
                  e.preventDefault();
                  toggleSubmenu("healthManagement");
                }}
              >
                <i className="ri-heart-pulse-line"></i>{" "}
                <span>Health Management</span>
              </Link>
              {isMenuOpen("healthManagement") && (
                <ul className="sub-menu mm-show">
                  <li>
                    <Link
                      to="/health/records"
                      className={isActive("/health/records") ? "active" : ""}
                    >
                      <i className="ri-file-list-3-line"></i> Health Records
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/vaccinations"
                      className={isActive("/vaccinations") ? "active" : ""}
                    >
                      <i className="fas fa-leaf"></i> Vaccinations
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            <li className={isActive("/analytics") ? "mm-active" : ""}>
              <Link to="/analytics" className="waves-effect">
                <i className="ri-bar-chart-box-line"></i> <span>Analytics</span>
              </Link>
            </li>

            <li className={isActive("/settings") ? "mm-active" : ""}>
              <Link to="/settings" className="waves-effect">
                <i className="ri-settings-2-line"></i> <span>Settings</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
