import React, { useState } from "react";

function Header() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications] = useState([
    { id: 1, message: "New user registered", time: "2m ago" },
    { id: 2, message: "System update available", time: "10m ago" },
    { id: 3, message: "Backup completed successfully", time: "1h ago" },
  ]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    document.getElementById("sidebar").classList.toggle("active");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white px-3">
      <button className="btn btn-light" onClick={toggleSidebar}>
        <i className="fas fa-bars"></i>
      </button>
      <div className="ms-auto d-flex align-items-center">
        {/* Notifications */}
        <div className="dropdown me-3">
          <button
            className="btn btn-light position-relative dropdown-toggle"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <i className="fas fa-bell"></i>
            {notifications.length > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {notifications.length}
              </span>
            )}
          </button>
          <ul className="dropdown-menu dropdown-menu-end">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <li key={notif.id} className="dropdown-item">
                  <strong>{notif.message}</strong>
                  <div className="text-muted small">{notif.time}</div>
                </li>
              ))
            ) : (
              <li className="dropdown-item text-center text-muted">
                No new notifications
              </li>
            )}
          </ul>
        </div>

        {/* User Profile */}
        <div className="dropdown">
          <button
            className="btn btn-light dropdown-toggle"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <i className="fas fa-user"></i> John Doe
          </button>
          <ul className="dropdown-menu dropdown-menu-end">
            <li>
              <a className="dropdown-item" href="#">
                <i className="fas fa-address-card me-2"></i> Profile
              </a>
            </li>
            <li>
              <a className="dropdown-item" href="#">
                <i className="fas fa-envelope me-2"></i> Messages
              </a>
            </li>
            <li>
              <a className="dropdown-item" href="#">
                <i className="fas fa-cog me-2"></i> Settings
              </a>
            </li>
            <li>
              <hr className="dropdown-divider" />
            </li>
            <li>
              <a className="dropdown-item text-danger" href="#">
                <i className="fas fa-sign-out-alt me-2"></i> Logout
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Header;
