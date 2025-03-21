import React from "react";

function Sidebar() {
  return (
    <nav id="sidebar" className="active">
      <div className="sidebar-header">
        <img
          src="assets/img/bootstraper-logo.png"
          alt="bootraper logo"
          className="app-logo"
        />
      </div>
      <ul className="list-unstyled components text-secondary">
        <li>
          <a href="dashboard.html">
            <i className="fas fa-home"></i> Dashboard
          </a>
        </li>
        <li>
          <a href="forms.html">
            <i className="fas fa-file-alt"></i> Forms
          </a>
        </li>
        <li>
          <a href="tables.html">
            <i className="fas fa-table"></i> Tables
          </a>
        </li>
        <li>
          <a href="charts.html">
            <i className="fas fa-chart-bar"></i> Charts
          </a>
        </li>
        <li>
          <a href="icons.html">
            <i className="fas fa-icons"></i> Icons
          </a>
        </li>
        <li>
          <a href="#uielementsmenu" className="dropdown-toggle no-caret-down">
            <i className="fas fa-layer-group"></i> UI Elements
          </a>
          <ul className="list-unstyled" id="uielementsmenu">
            <li>
              <a href="ui-buttons.html">
                <i className="fas fa-angle-right"></i> Buttons
              </a>
            </li>
            <li>
              <a href="ui-badges.html">
                <i className="fas fa-angle-right"></i> Badges
              </a>
            </li>
            <li>
              <a href="ui-cards.html">
                <i className="fas fa-angle-right"></i> Cards
              </a>
            </li>
            <li>
              <a href="ui-alerts.html">
                <i className="fas fa-angle-right"></i> Alerts
              </a>
            </li>
            <li>
              <a href="ui-tabs.html">
                <i className="fas fa-angle-right"></i> Tabs
              </a>
            </li>
            <li>
              <a href="ui-date-time-picker.html">
                <i className="fas fa-angle-right"></i> Date & Time Picker
              </a>
            </li>
          </ul>
        </li>
        <li>
          <a href="#authmenu" className="dropdown-toggle no-caret-down">
            <i className="fas fa-user-shield"></i> Authentication
          </a>
          <ul className="list-unstyled" id="authmenu">
            <li>
              <a href="login.html">
                <i className="fas fa-lock"></i> Login
              </a>
            </li>
            <li>
              <a href="signup.html">
                <i className="fas fa-user-plus"></i> Signup
              </a>
            </li>
            <li>
              <a href="forgot-password.html">
                <i className="fas fa-user-lock"></i> Forgot password
              </a>
            </li>
          </ul>
        </li>
        <li>
          <a href="#pagesmenu" className="dropdown-toggle no-caret-down">
            <i className="fas fa-copy"></i> Pages
          </a>
          <ul className="list-unstyled" id="pagesmenu">
            <li>
              <a href="blank.html">
                <i className="fas fa-file"></i> Blank page
              </a>
            </li>
            <li>
              <a href="404.html">
                <i className="fas fa-info-circle"></i> 404 Error page
              </a>
            </li>
            <li>
              <a href="500.html">
                <i className="fas fa-info-circle"></i> 500 Error page
              </a>
            </li>
          </ul>
        </li>
        <li>
          <a href="users.html">
            <i className="fas fa-user-friends"></i>Users
          </a>
        </li>
        <li>
          <a href="settings.html">
            <i className="fas fa-cog"></i>Settings
          </a>
        </li>
      </ul>
    </nav>
  );
}

export default Sidebar;
