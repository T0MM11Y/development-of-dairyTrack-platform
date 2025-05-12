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
    return className.trim(); // Menghindari spasi tambahan
  };

  return (
    <div
      className={`admin-layout ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}
    >
      <AdminHeader
        toggleSidebar={toggleSidebar}
        sidebarCollapsed={sidebarCollapsed}
      />
      <div className="admin-main-container">
        <AdminSidebar
          collapsed={sidebarCollapsed}
          activeMenu={activeMenu}
          onMenuToggle={handleMenuToggle}
          className={getSidebarClassName()}
        />
        <div className="admin-content-wrapper">
          <main className="admin-content">{children}</main>
          <AdminFooter />
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;
