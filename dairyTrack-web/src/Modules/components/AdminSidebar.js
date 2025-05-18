import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const AdminSidebar = ({ collapsed, activeMenu, onMenuToggle }) => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Pastikan localStorage tersedia
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

  // Define all menu items
  const allMenuItems = [
    {
      id: "dashboard",
      title: "Dashboard",
      icon: "far fa-tachometer-alt", // Ikon regular tanpa fill
      link: "/admin",
      showForRoles: ["admin", "supervisor", "farmer"], // Visible for all roles
    },
    {
      id: "users",
      title: "Users Management",
      icon: "far fa-users", // Ikon regular tanpa fill
      submenu: [
        { id: "list-users", title: "List of Users", link: "/admin/list-users" },
        { id: "add-users", title: "Adding User", link: "/admin/add-users" },
        {
          id: "reset-password",
          title: "Reset Password",
          link: "/admin/reset-password",
        },
      ],
      showForRoles: ["admin", "supervisor"], // Not visible for farmers
    },
    {
      id: "cattle",
      title: "Cattle Distribution",
      icon: "far fa-link", // Ikon regular tanpa fill
      link: "/admin/cattle-distribution",
      showForRoles: ["admin", "supervisor"], // Not visible for farmers
    },
    {
      id: "highlights",
      title: "Highlights",
      icon: "fa-book-open", // Ikon solid dengan fill
      submenu: [
        { id: "gallery", title: "Gallery", link: "/admin/list-of-gallery" },
        { id: "blog", title: "Blog", link: "/admin/list-of-blog" },
      ],
      showForRoles: ["admin", "supervisor"], // Not visible for farmers
    },
    {
      id: "cow",
      title: "Cow Management",
      icon: "far fa-paw", // Ikon regular tanpa fill
      submenu: [
        { id: "list-cows", title: "All Cows", link: "/admin/list-cows" },
        { id: "add-cow", title: "Add Cow", link: "/admin/add-cow" },
      ],
      showForRoles: ["admin", "supervisor"], // Visible for farmers
    },

    {
      id: "milking",
      title: "Milking",
      icon: "far fa-mug-hot", // Ikon regular tanpa fill
      link: "/admin/list-milking",
      showForRoles: ["admin", "supervisor", "farmer"], // Visible for all roles
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
        {
          id: "health-dashboard",
          title: "Health Dashboard",
          link: "/admin/health-dashboard",
        },
      ],
      showForRoles: ["admin", "supervisor", "farmer"],
    },

    {
      id: "analytics",
      title: "Analytics",
      icon: "far fa-chart-line", // Using chart icon
      submenu: [
        { id: "milk-trend", title: "Milk Trend", link: "/admin/milk-trend" },
        { id: "feed-trend", title: "Feed Usage", link: "/admin/daily-feed-usage" },
        { id: "feed-trend", title: "Daily Nutrition", link: "/admin/daily-nutrition" },
      ],
      showForRoles: ["admin", "supervisor", "farmer"], // Only visible for admin, supervisor, and farmer
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
      ],
      showForRoles: ["admin", "supervisor"], // Only visible for admin and supervisor
    },
  ];

  // Filter menu items based on user role
  const userRole = userData?.role?.toLowerCase() || "";
  const menuItems = allMenuItems.filter(
    (item) => item.showForRoles.includes(userRole) || userRole === "admin" // Admin sees everything
  );

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
                  {item.submenu.map((subItem) => (
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
