import React, { useState, useEffect } from "react";
import AdminHeader from "../components/AdminHeader";
import AdminSidebar from "../components/AdminSidebar";
import AdminFooter from "../components/AdminFooter";
import "../styles/AdminApp.css";

function AdminLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [activeMenu, setActiveMenu] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const debounce = (func, delay) => {
      let timeout;
      return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
      };
    };

    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    const debouncedCheckScreenSize = debounce(checkScreenSize, 200);

    checkScreenSize();
    window.addEventListener("resize", debouncedCheckScreenSize);

    return () => {
      window.removeEventListener("resize", debouncedCheckScreenSize);
    };
  }, []);

  useEffect(() => {
    setSidebarVisible(!isMobile);
  }, [isMobile]);

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarVisible((prev) => !prev);
    } else {
      setSidebarCollapsed((prev) => !prev);
    }
  };

  const handleMenuToggle = (menu) => {
    setActiveMenu((prevMenu) => (prevMenu === menu ? "" : menu));
  };

  const getSidebarClassName = () => {
    let className = "";
    if (isMobile && sidebarVisible) {
      className += " show";
    }
    return className.trim();
  };

  // Style objects untuk layout
  const layoutStyles = {
    adminLayout: {
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh",
      position: "relative",
      overflow: "hidden",
    },
    adminMainContainer: {
      flex: "1",
      display: "flex",
      paddingTop: "70px",
      position: "relative",
      zIndex: 1,
      minHeight: "calc(100vh - 70px)", // Ensure minimum height
    },
    adminContentWrapper: {
      display: "flex",
      flexDirection: "column",
      flex: "1",
      position: "relative",
      zIndex: 1,
      minHeight: "100%", // Take full available height
    },
    adminContent: {
      flex: "1", // This will grow to fill available space
      padding: "20px",
      position: "relative",
      zIndex: 1,
      overflow: "auto", // Allow scrolling if content is too long
    },
  };

  return (
    <>
      {/* Global CSS untuk layout dengan fixed header */}
      <style>
        {`
        /* Layout base styles */
        html, body {
          margin: 0;
          padding: 0;
          height: 100%;
          overflow-x: hidden;
        }
        
        #root {
          min-height: 100vh;
        }
        
        .admin-layout {
          min-height: 100vh;
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
        }
        
        /* Ensure proper z-index stacking */
        .admin-main-container {
          position: relative;
          z-index: 1;
          flex: 1;
          display: flex;
        }
        
        .admin-content-wrapper {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          flex: 1;
          min-height: 100%;
        }
        
        .admin-content {
          position: relative;
          z-index: 1;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        
        /* Sidebar adjustments for fixed header */
        .admin-sidebar {
          position: fixed;
          top: 70px;
          left: 0;
          height: calc(100vh - 70px);
          z-index: 1100;
          overflow-y: auto;
        }
        
        .admin-sidebar.collapsed {
          width: 60px;
        }
        
        .admin-sidebar:not(.collapsed) {
          width: 300px;
        }
        
        /* Content margin adjustments */
        .admin-layout:not(.sidebar-collapsed) .admin-content-wrapper {
          margin-left: 300px;
        }
        
        .admin-layout.sidebar-collapsed .admin-content-wrapper {
          margin-left: 60px;
        }
        
        /* Footer always at bottom */
        .admin-footer {
          position: relative;
          z-index: 1;
          margin-top: auto;
          flex-shrink: 0;
          width: 100%;
        }
        
        /* Mobile responsive */
        @media (max-width: 768px) {
          .admin-sidebar {
            transform: translateX(-100%);
            transition: transform 0.3s ease;
            width: 300px !important;
            z-index: 1150;
          }
          
          .admin-sidebar.show {
            transform: translateX(0);
          }
          
          .admin-layout .admin-content-wrapper {
            margin-left: 0 !important;
          }
          
          .admin-content {
            padding: 15px;
          }
        }
        
        /* Overlay for mobile sidebar */
        .sidebar-overlay {
          position: fixed;
          top: 70px;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1140;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
        }
        
        .sidebar-overlay.show {
          opacity: 1;
          visibility: visible;
        }
        
        /* Scrollbar styling */
        .admin-content-wrapper::-webkit-scrollbar {
          width: 6px;
        }
        
        .admin-content-wrapper::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        
        .admin-content-wrapper::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        
        .admin-content-wrapper::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
        
        /* Debug styles - remove these after testing */
        .debug .admin-layout {
          border: 2px solid red;
        }
        
        .debug .admin-main-container {
          border: 2px solid blue;
        }
        
        .debug .admin-content-wrapper {
          border: 2px solid green;
        }
        
        .debug .admin-content {
          border: 2px solid orange;
        }
        
        .debug .admin-footer {
          border: 2px solid purple;
        }
        `}
      </style>

      <div
        className={`admin-layout ${
          sidebarCollapsed ? "sidebar-collapsed" : ""
        }`}
        style={layoutStyles.adminLayout}
      >
        <AdminHeader
          toggleSidebar={toggleSidebar}
          sidebarCollapsed={sidebarCollapsed}
        />

        {/* Mobile sidebar overlay */}
        {isMobile && sidebarVisible && (
          <div
            className="sidebar-overlay show"
            onClick={() => setSidebarVisible(false)}
          />
        )}

        <div
          className="admin-main-container"
          style={layoutStyles.adminMainContainer}
        >
          <AdminSidebar
            collapsed={sidebarCollapsed}
            activeMenu={activeMenu}
            onMenuToggle={handleMenuToggle}
            className={getSidebarClassName()}
            visible={sidebarVisible}
          />

          <div
            className="admin-content-wrapper"
            style={layoutStyles.adminContentWrapper}
          >
            <main className="admin-content" style={layoutStyles.adminContent}>
              {children}
            </main>
            <AdminFooter />
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminLayout;
