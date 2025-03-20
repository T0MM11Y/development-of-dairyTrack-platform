import React from "react";

function Sidebar({ setCurrentPage }) {
  return (
    <nav className="admin-sidebar">
      <ul>
        <li>
          <a href="#" onClick={() => setCurrentPage("dashboard")}>
            Dashboard
          </a>
        </li>
        <li>
          <a href="#" onClick={() => setCurrentPage("users")}>
            Users
          </a>
        </li>
        <li>
          <a href="#" onClick={() => setCurrentPage("products")}>
            Products
          </a>
        </li>
        <li>
          <a href="#" onClick={() => setCurrentPage("orders")}>
            Orders
          </a>
        </li>
        <li>
          <a href="#" onClick={() => setCurrentPage("settings")}>
            Settings
          </a>
        </li>
      </ul>
    </nav>
  );
}

export default Sidebar;
