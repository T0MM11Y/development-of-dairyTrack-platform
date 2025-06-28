import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";

const AdminSidebar = ({ collapsed, activeMenu, onMenuToggle }) => {
  const [userData, setUserData] = useState(null);

  // Get user role ID and string for filtering
  const userRoleId = userData?.role_id || null;
  const userRole = userData?.role?.toLowerCase() || "";

  // Function to get role prefix based on role_id
  const getRolePrefix = (roleId) => {
    switch (roleId) {
      case 1:
        return "admin";
      case 2:
        return "supervisor";
      case 3:
        return "farmer";
      default:
        return "admin";
    }
  };

  // Function to get dashboard link based on user role ID
  const getDashboardLink = (roleId) => {
    const prefix = getRolePrefix(roleId);
    return `/${prefix}`;
  };

  // Function to generate role-based links
  const getRoleBasedLink = (path, roleId) => {
    const prefix = getRolePrefix(roleId);
    return `/${prefix}${path}`;
  };

  // Define all menu items (using useMemo to avoid recreating on every render)
  const allMenuItems = useMemo(
    () => [
      {
        id: "dashboard",
        title: "Dashboard",
        icon: "far fa-tachometer-alt",
        link: getDashboardLink(userRoleId),
        showForRoles: [1, 2, 3], // Admin, Supervisor, Farmer
      },
      {
        id: "users",
        title: "User Management",
        icon: "far fa-users",
        submenu: [
          {
            id: "list-users",
            title: "User List",
            link: getRoleBasedLink("/list-users", userRoleId),
            showForRoles: [1], // Admin only
          },
          {
            id: "add-users",
            title: "Add New User",
            link: getRoleBasedLink("/add-users", userRoleId),
            showForRoles: [1], // Admin only
          },
          {
            id: "reset-password",
            title: "Reset User Password",
            link: getRoleBasedLink("/reset-password", userRoleId),
            showForRoles: [1], // Admin only
          },
        ],
        showForRoles: [1], // Admin only
      },
      {
        id: "cow",
        title: "Livestock Management",
        icon: "far fa-paw",
        submenu: [
          {
            id: "list-cows",
            title: userRoleId === 3 ? "My Livestock" : "All Livestock",
            link: getRoleBasedLink("/list-cows", userRoleId),
            showForRoles: [1, 2, 3], // All roles
          },
          {
            id: "add-cow",
            title: "Register New Livestock",
            link: getRoleBasedLink("/add-cow", userRoleId),
            showForRoles: [1, 2], // Admin & Supervisor
          },
        ],
        showForRoles: [1, 2, 3], // All roles
      },
      {
        id: "cattle",
        title: "Livestock Distribution",
        icon: "far fa-link",
        link: getRoleBasedLink("/cattle-distribution", userRoleId),
        showForRoles: [1, 2], // Admin & Supervisor
      },
      {
        id: "milking",
        title: "Milk Production",
        icon: "far fa-mug-hot",
        link: getRoleBasedLink("/list-milking", userRoleId),
        showForRoles: [1, 2, 3], // All roles
      },
      {
        id: "feed-management",
        title: "Feed Management",
        icon: "fas fa-seedling",
        submenu: [
          {
            id: "feed-type",
            title: "Feed Type",
            link: getRoleBasedLink("/list-feedType", userRoleId),
            showForRoles: [1, 2, 3],
          },
          {
            id: "nutrition-type",
            title: "Nutrition Type",
            link: getRoleBasedLink("/list-nutrition", userRoleId),
            showForRoles: [1, 2, 3],
          },
          {
            id: "feed",
            title: "Feed",
            link: getRoleBasedLink("/list-feed", userRoleId),
            showForRoles: [1, 2, 3],
          },
          {
            id: "feed-stock",
            title: "Feed Stock",
            link: getRoleBasedLink("/list-stock", userRoleId),
            showForRoles: [1, 2, 3],
          },
          {
            id: "daily-feed-schedule",
            title: "Daily Feed Schedule",
            link: getRoleBasedLink("/list-schedule", userRoleId),
            showForRoles: [1, 2, 3],
          },
          {
            id: "daily-feed-item",
            title: "Daily Feed Item",
            link: getRoleBasedLink("/list-feedItem", userRoleId),
            showForRoles: [1, 2, 3],
          },
          {
            id: "daily-feed-nutrition",
            title: "Daily Feed Nutrition",
            link: getRoleBasedLink("/daily-nutrition", userRoleId),
            showForRoles: [1, 2, 3],
          },
        ],
        showForRoles: [1, 2, 3], // All roles
      },
      {
        id: "health-check",
        title: "Health Check Management",
        icon: "far fa-notes-medical",
        submenu: [
          {
            id: "health-checks",
            title: "Health Checks",
            link: getRoleBasedLink("/list-health-checks", userRoleId),
            showForRoles: [1, 2, 3],
          },
          {
            id: "symptoms",
            title: "Symptoms",
            link: getRoleBasedLink("/list-symptoms", userRoleId),
            showForRoles: [1, 2, 3],
          },
          {
            id: "disease-history",
            title: "Disease History",
            link: getRoleBasedLink("/list-disease-history", userRoleId),
            showForRoles: [1, 2, 3],
          },
          {
            id: "reproduction",
            title: "Reproduction",
            link: getRoleBasedLink("/list-reproduction", userRoleId),
            showForRoles: [1, 2, 3],
          },
        ],
        showForRoles: [1, 2, 3], // All roles
      },
      {
        id: "analytics",
        title: "Reports & Analytics",
        icon: "far fa-chart-line",
        submenu: [
          {
            id: "cow's-milk-analytics",
            title: "Milk Production Analytics",
            link: getRoleBasedLink("/cows-milk-analytics", userRoleId),
            showForRoles: [1, 2, 3],
          },
          {
            id: "milk-expiry-check",
            title: "Milk Quality Control",
            link: getRoleBasedLink("/milk-expiry-check", userRoleId),
            showForRoles: [1, 2, 3],
          },
          {
            id: "health-dashboard",
            title: "Health Dashboard",
            link: getRoleBasedLink("/health-dashboard", userRoleId),
            showForRoles: [1, 2, 3],
          },
          {
            id: "feed-usage",
            title: "Feed Usage",
            link: getRoleBasedLink("/daily-feed-usage", userRoleId),
            showForRoles: [1, 2, 3],
          },
          {
            id: "daily-nutrition",
            title: "Daily Nutrition",
            link: getRoleBasedLink("/daily-nutrition", userRoleId),
            showForRoles: [1, 2, 3],
          },
        ],
        showForRoles: [1, 2, 3], // All roles
      },
      {
        id: "highlights",
        title: "Content Management",
        icon: "far fa-book-open",
        submenu: [
          {
            id: "gallery",
            title: "Photo Gallery",
            link: getRoleBasedLink("/list-of-gallery", userRoleId),
            showForRoles: [1, 2],
          },
          {
            id: "blog",
            title: "Blog Articles",
            link: getRoleBasedLink("/list-of-blog", userRoleId),
            showForRoles: [1, 2],
          },
        ],
        showForRoles: [1, 2], // Admin & Supervisor
      },
      {
        id: "salesAndFinancial",
        title: "Sales And Financial",
        icon: "far fa-chart-bar",
        submenu: [
          {
            id: "product-type",
            title: "Product Type",
            link: getRoleBasedLink("/product-type", userRoleId),
            showForRoles: [1, 2],
          },
          {
            id: "product",
            title: "Product",
            link: getRoleBasedLink("/product", userRoleId),
            showForRoles: [1, 2],
          },
          {
            id: "product-history",
            title: "Product History",
            link: getRoleBasedLink("/product-history", userRoleId),
            showForRoles: [1, 2],
          },
          {
            id: "sales",
            title: "Sales",
            link: getRoleBasedLink("/sales", userRoleId),
            showForRoles: [1, 2],
          },
          {
            id: "salesTransaction",
            title: "Sales Transaction",
            link: getRoleBasedLink("/sales-transaction", userRoleId),
            showForRoles: [1, 2],
          },
          {
            id: "finance",
            title: "Finance",
            link: getRoleBasedLink("/finance", userRoleId),
            showForRoles: [1, 2],
          },
          {
            id: "finance-record",
            title: "Finance Record",
            link: getRoleBasedLink("/finance-record", userRoleId),
            showForRoles: [1, 2],
          },
        ],
        showForRoles: [1, 2], // Admin & Supervisor
      },
    ],
    [userRoleId]
  );

  // Filter menu items based on user role ID
  const menuItems = allMenuItems.filter((item) => {
    if (!item.showForRoles) return true;
    return item.showForRoles.includes(userRoleId);
  });

  useEffect(() => {
    // Ensure localStorage is available
    if (typeof localStorage !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          // Normalize user data to ensure consistent structure
          const normalizedUser = {
            ...parsedUser,
            user_id: parsedUser.user_id || parsedUser.id,
          };
          setUserData(normalizedUser);
        } catch (error) {
          console.error("Failed to parse user data from localStorage:", error);
        }
      }
    }
  }, []);

  // Get role display name
  const getRoleDisplayName = (roleId) => {
    switch (roleId) {
      case 1:
        return "Administrator";
      case 2:
        return "Supervisor";
      case 3:
        return "Farmer";
      default:
        return "Unknown Role";
    }
  };

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
              <div className="role">{getRoleDisplayName(userData.role_id)}</div>
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
                    .filter((subItem) => {
                      if (!subItem.showForRoles) return true;
                      return subItem.showForRoles.includes(userRoleId);
                    })
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
