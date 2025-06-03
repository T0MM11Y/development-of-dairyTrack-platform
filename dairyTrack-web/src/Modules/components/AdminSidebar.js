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
