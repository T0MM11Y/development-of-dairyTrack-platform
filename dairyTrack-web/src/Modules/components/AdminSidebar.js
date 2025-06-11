import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";

const AdminSidebar = ({ collapsed, activeMenu, onMenuToggle }) => {
  const [userData, setUserData] = useState(null);

  // Get user role for filtering
  const userRole = userData?.role?.toLowerCase() || "";

  // Define all menu items (using useMemo to avoid recreating on every render)
  const allMenuItems = useMemo(
    () => [
      {
        id: "dashboard",
        title: "Dashboard",
        icon: "far fa-tachometer-alt",
        link: "/admin",
        showForRoles: ["admin", "supervisor", "farmer"],
      },
      {
        id: "users",
        title: "User Management",
        icon: "far fa-users",
        submenu: [
          {
            id: "list-users",
            title: "User List",
            link: "/admin/list-users",
          },
          {
            id: "add-users",
            title: "Add New User",
            link: "/admin/add-users",
            showForRoles: ["admin", "farmer"],
          },
          {
            id: "reset-password",
            title: "Reset User Password",
            link: "/admin/reset-password",
          },
        ],
        showForRoles: ["admin", "supervisor"],
      },
      {
        id: "cow",
        title: "Livestock Management",
        icon: "far fa-paw",
        submenu: [
          {
            id: "list-cows",
            title: userRole === "farmer" ? "My Livestock" : "All Livestock",
            link: "/admin/list-cows",
            showForRoles: ["admin", "supervisor", "farmer"],
          },
          {
            id: "add-cow",
            title: "Register New Livestock",
            link: "/admin/add-cow",
            showForRoles: ["admin", "supervisor"],
          },
        ],
        showForRoles: ["admin", "supervisor", "farmer"],
      },
      {
        id: "cattle",
        title: "Livestock Distribution",
        icon: "far fa-link",
        link: "/admin/cattle-distribution",
        showForRoles: ["admin", "supervisor"],
      },
      {
        id: "milking",
        title: "Milk Production",
        icon: "far fa-mug-hot",
        link: "/admin/list-milking",
        showForRoles: ["admin", "supervisor", "farmer"],
      },
      {
        id: "feed-management",
        title: "Feed Management",
        icon: "fas fa-seedling",
        submenu: [
          { id: "feed-type", title: "Feed Type", link: "/admin/list-feedType" },
          {
            id: "nutrition-type",
            title: "Nutrition Type",
            link: "/admin/list-nutrition",
          },
          { id: "feed", title: "Feed", link: "/admin/list-feed" },
          { id: "feed-stock", title: "Feed Stock", link: "/admin/list-stock" },
          {
            id: "daily-feed-schedule",
            title: "Daily Feed Schedule",
            link: "/admin/list-schedule",
          },
          {
            id: "daily-feed-item",
            title: "Daily Feed Item",
            link: "/admin/list-feedItem",
          },
          {
            id: "daily-feed-nutrition",
            title: "Daily Feed Nutrition",
            link: "/admin/daily-feed-nutrition",
          },
        ],
        showForRoles: ["admin", "farmer", "supervisor"],
      },
      {
        id: "health-check",
        title: "Health Check Management",
        icon: "far fa-notes-medical", // Ganti ikon sesuai preferensi (misal: medical)
        submenu: [
          {
            id: "health-checks",
            title: "Health Checks",
            link: "/admin/list-health-checks",
          },
          { id: "symptoms", title: "Symptoms", link: "/admin/list-symptoms" },
          {
            id: "disease-history",
            title: "Disease History",
            link: "/admin/list-disease-history",
          },
          {
            id: "reproduction",
            title: "Reproduction",
            link: "/admin/list-reproduction",
          },
        ],
        showForRoles: ["admin", "supervisor", "farmer"],
      },
      {
        id: "analytics",
        title: "Reports & Analytics",
        icon: "far fa-chart-line",
        submenu: [
          {
            id: "cow's-milk-analytics",
            title: "Milk Production Analytics",
            link: "/admin/cows-milk-analytics",
          },
          {
            id: "milk-expiry-check",
            title: "Milk Quality Control",
            link: "/admin/milk-expiry-check",
          },
          {
            id: "health-dashboard",
            title: "Health Dashboard",
            link: "/admin/health-dashboard",
          },
          {
          id: "feed-trend",
          title: "Feed Usage",
          link: "/admin/daily-feed-usage",
        },
        {
          id: "feed-trend",
          title: "Daily Nutrition",
          link: "/admin/daily-nutrition",
        },
        ],
        showForRoles: ["admin", "supervisor", "farmer"],
      },
      {
        id: "highlights",
        title: "Content Management",
        icon: "far fa-book-open",
        submenu: [
          {
            id: "gallery",
            title: "Photo Gallery",
            link: "/admin/list-of-gallery",
          },
          {
            id: "blog",
            title: "Blog Articles",
            link: "/admin/list-of-blog",
          },
        ],
        showForRoles: ["admin", "supervisor"],
      },
      {
        id: "salesAndFinancial",
        title: "Sales And Financial",
        icon: "far fa-chart-bar", // Modified to bar chart for broader sales/finance context
        submenu: [
          {
            id: "product-type",
            title: "Product Type",
            link: "/admin/product-type",
          },
          { id: "product", title: "Product", link: "/admin/product" },
          {
            id: "product-history",
            title: "Product History",
            link: "/admin/product-history",
          },
          { id: "sales", title: "Sales", link: "/admin/sales" },
          { id: "finance", title: "Finance", link: "/admin/finance" },
          {
            id: "finance-record",
            title: "Finance Record",
            link: "/admin/finance-record",
          },
        ],
        showForRoles: ["admin", "supervisor"], // Only visible for admin and supervisor
      },
    ],
    [userRole]
  );

  // Filter menu items based on user role
  const menuItems = allMenuItems.filter(
    (item) => item.showForRoles.includes(userRole) || userRole === "admin"
  );

  useEffect(() => {
    // Ensure localStorage is available
    if (typeof localStorage !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          setUserData(JSON.parse(storedUser));
        } catch (error) {
          console.error("Failed to parse user data from localStorage:", error);
        }
      }
    }
  }, []);

  return (
    <aside className={`admin-sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="profile">
        <div className="avatar">
          {userData?.username?.substring(0, 2).toUpperCase() || "AU"}
        </div>
        <div className="user-info">
          {userData ? (
            <>
              <div className="username">
                {userData.username || "Unknown User"}
              </div>
              <div className="email">
                {userData.email || "No Email Provided"}
              </div>
            </>
          ) : (
            <div>Loading...</div>
          )}
        </div>
      </div>

      <ul className="sidebar-nav">
        {menuItems.map((item) => (
          <li
            key={item.id}
            className={`nav-item ${activeMenu === item.id ? "active" : ""}`}
          >
            {item.submenu ? (
              <>
                <div
                  className="nav-link"
                  onClick={() => onMenuToggle && onMenuToggle(item.id)}
                >
                  <span className="nav-icon">
                    <i className={`fas ${item.icon}`}></i>
                  </span>
                  <span className="nav-text">{item.title}</span>
                  <span className="nav-arrow">
                    <i className="fas fa-chevron-right"></i>
                  </span>
                </div>
                <ul className="submenu">
                  {item.submenu
                    .filter(
                      (subItem) =>
                        !subItem.showForRoles ||
                        subItem.showForRoles.includes(userRole) ||
                        userRole === "admin"
                    )
                    .map((subItem) => (
                      <li key={subItem.id}>
                        <Link to={subItem.link}>{subItem.title}</Link>
                      </li>
                    ))}
                </ul>
              </>
            ) : (
              <Link to={item.link} className="nav-link">
                <span className="nav-icon">
                  <i className={`fas ${item.icon}`}></i>
                </span>
                <span className="nav-text">{item.title}</span>
              </Link>
            )}
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default AdminSidebar;
