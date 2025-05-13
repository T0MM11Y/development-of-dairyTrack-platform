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
