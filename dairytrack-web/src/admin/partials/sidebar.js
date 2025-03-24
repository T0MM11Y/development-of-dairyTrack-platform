import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import profileImage from "../../assets/admin/images/users/avatar-1.jpg";

const Sidebar = () => {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState([]);
  // Start with the sidebar collapsed by default
  const [isCollapsed, setIsCollapsed] = useState(true);

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
    // Apply the styles when component mounts and when sidebar state changes
    const content = document.querySelector(".main-content");
    if (content) {
      // When collapsed, content takes up more space (remains in place but expands)
      content.style.marginLeft = isCollapsed ? "90px" : "250px";
      content.style.width = isCollapsed ? "calc(100% - 90px)" : "calc(100% - 250px)";
      content.style.transition = "all 0.3s ease-in-out";
    }
    
    // Apply this effect on component mount to ensure default collapsed state
  }, [isCollapsed]);

  // Run this effect only once when component mounts
  useEffect(() => {
    // Set the initial state for the sidebar and content
    const content = document.querySelector(".main-content");
    if (content) {
      content.style.marginLeft = "90px";
      content.style.width = "calc(100% - 90px)";
    }
    
    // Also add styles to the sidebar
    const sidebar = document.querySelector(".vertical-menu");
    if (sidebar) {
      sidebar.style.width = "90px";
    }
  }, []);

  return (
    <div className="vertical-menu" style={{ 
      width: isCollapsed ? "90px" : "250px",
      transition: "width 0.3s ease-in-out"
    }}>
      <div data-simplebar className="h-100">
        {/* Only show profile details when expanded */}
        {!isCollapsed && (
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
        )}
        
        {/* When collapsed, just show a smaller profile image */}
        {isCollapsed && (
          <div className="text-center mt-3">
            <img
              src={profileImage}
              alt="User Avatar"
              className="avatar-sm rounded-circle mx-auto d-block"
            />
          </div>
        )}

        <div id="sidebar-menu">
          <ul className="metismenu list-unstyled" id="side-menu">
            {!isCollapsed && (
              <li className="menu-title">
                <i className="ri-menu-line me-2"></i>DairyTrack Menu
              </li>
            )}

            <li className={isActive("/dashboard") ? "mm-active" : ""}>
              <Link to="/dashboard" className={`waves-effect ${isCollapsed ? 'text-center' : ''}`}>
                <i className="ri-dashboard-line"></i> 
                {!isCollapsed && <span>Dashboard</span>}
              </Link>
            </li>

            <li className={isMenuOpen("farmOperations") ? "mm-active" : ""}>
              <Link
                to="#"
                className={`has-arrow waves-effect ${isCollapsed ? 'text-center' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  toggleSubmenu("farmOperations");
                }}
                aria-expanded={isMenuOpen("farmOperations")}
              >
                <i className="ri-farm-line"></i> 
                {!isCollapsed && <span>Farm Operations</span>}
              </Link>
              {isMenuOpen("farmOperations") && !isCollapsed && (
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
                className={`has-arrow waves-effect ${isCollapsed ? 'text-center' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  toggleSubmenu("healthManagement");
                }}
              >
                <i className="ri-heart-pulse-line"></i>
                {!isCollapsed && <span>Health Management</span>}
              </Link>
              {isMenuOpen("healthManagement") && !isCollapsed && (
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
              <Link to="/analytics" className={`waves-effect ${isCollapsed ? 'text-center' : ''}`}>
                <i className="ri-bar-chart-box-line"></i> 
                {!isCollapsed && <span>Analytics</span>}
              </Link>
            </li>

            <li className={isActive("/settings") ? "mm-active" : ""}>
              <Link to="/settings" className={`waves-effect ${isCollapsed ? 'text-center' : ''}`}>
                <i className="ri-settings-2-line"></i> 
                {!isCollapsed && <span>Settings</span>}
              </Link>
            </li>
          </ul>
        </div>
      </div>
      
      {/* Add toggle button to the bottom of sidebar */}
      <div className="text-center py-3" style={{
        position: "absolute",
        bottom: "0",
        width: "100%",
        borderTop: "1px solid rgba(0,0,0,0.1)"
      }}>
        <button 
          onClick={toggleSidebar} 
          className="btn btn-sm btn-light"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <i className={`ri-arrow-${isCollapsed ? 'right' : 'left'}-s-line`}></i>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;