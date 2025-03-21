import React from "react";
import {
  FaUser,
  FaTable,
  FaCogs,
  FaSignInAlt,
  FaUserPlus,
  FaFileAlt,
  FaExclamationTriangle,
} from "react-icons/fa";

import "../../assets/admin/css/style.css";
function Sidebar({ setCurrentPage }) {
  return (
    <div id="sidebar" className="tm-sidebar-left uk-background-default">
      <center>
        <div className="user">
          <img
            id="avatar"
            width="100"
            className="uk-border-circle"
            src="images/avatar.jpg"
            alt="User Avatar"
          />
          <div className="uk-margin-top"></div>
          <div id="name" className="uk-text-truncate">
            Èrik Campobadal
          </div>
          <div id="email" className="uk-text-truncate">
            ConsoleTVs@gmail.com
          </div>
          <span
            id="status"
            data-enabled="true"
            data-online-text="Online"
            data-away-text="Away"
            data-interval="10000"
            className="uk-margin-top uk-label uk-label-success"
          >
            Online
          </span>
        </div>
        <br />
      </center>
      <ul className="uk-nav uk-nav-default">
        <li className="uk-nav-header">UI Elements</li>
        <li>
          <a href="#" onClick={() => setCurrentPage("buttons")}>
            <FaCogs /> Buttons
          </a>
        </li>
        <li>
          <a href="#" onClick={() => setCurrentPage("components")}>
            <FaCogs /> Components
          </a>
        </li>
        <li>
          <a href="#" onClick={() => setCurrentPage("tables")}>
            <FaTable /> Tables
          </a>
        </li>

        <li className="uk-nav-header">Pages</li>
        <li>
          <a href="#" onClick={() => setCurrentPage("login")}>
            <FaSignInAlt /> Login
          </a>
        </li>
        <li>
          <a href="#" onClick={() => setCurrentPage("register")}>
            <FaUserPlus /> Register
          </a>
        </li>
        <li>
          <a href="#" onClick={() => setCurrentPage("article")}>
            <FaFileAlt /> Article
          </a>
        </li>
        <li>
          <a href="#" onClick={() => setCurrentPage("404")}>
            <FaExclamationTriangle /> 404
          </a>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
