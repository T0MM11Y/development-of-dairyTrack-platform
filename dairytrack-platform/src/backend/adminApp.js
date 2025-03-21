import "../assets/admin/vendor/fontawesome/css/fontawesome.min.css";
import "../assets/admin/vendor/fontawesome/css/solid.min.css";
import "../assets/admin/vendor/fontawesome/css/brands.min.css";
import "../assets/admin/vendor/bootstrap/css/bootstrap.min.css";
import "../assets/admin/css/master.css";
import $ from "jquery";
import { useEffect } from "react";
import "bootstrap/dist/js/bootstrap.bundle.min"; // Ensure Bootstrap JS is imported

function AdminApp() {
  useEffect(() => {
    const handleSidebarToggle = () => {
      $("#sidebar").toggleClass("active");
    };

    $("#sidebarCollapse").on("click", handleSidebarToggle);

    // Cleanup function to remove the event listener
    return () => {
      $("#sidebarCollapse").off("click", handleSidebarToggle);
    };
  }, []);

  return (
    <div className="wrapper">
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
      <div id="body" className="active">
        <nav className="navbar navbar-expand-lg navbar-white bg-white">
          <button type="button" id="sidebarCollapse" className="btn btn-light">
            <i className="fas fa-bars"></i>
            <span></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="nav navbar-nav ms-auto">
              <li className="nav-item dropdown">
                <div className="nav-dropdown">
                  <a
                    href="#"
                    id="nav1"
                    className="nav-item nav-link dropdown-toggle text-secondary"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="fas fa-link"></i> <span>Quick Links</span>{" "}
                    <i
                      style={{ fontSize: ".8em" }}
                      className="fas fa-caret-down"
                    ></i>
                  </a>
                  <div
                    className="dropdown-menu dropdown-menu-end nav-link-menu"
                    aria-labelledby="nav1"
                  >
                    <ul className="nav-list">
                      <li>
                        <a href="" className="dropdown-item">
                          <i className="fas fa-list"></i> Access Logs
                        </a>
                      </li>
                      <div className="dropdown-divider"></div>
                      <li>
                        <a href="" className="dropdown-item">
                          <i className="fas fa-database"></i> Back ups
                        </a>
                      </li>
                      <div className="dropdown-divider"></div>
                      <li>
                        <a href="" className="dropdown-item">
                          <i className="fas fa-cloud-download-alt"></i> Updates
                        </a>
                      </li>
                      <div className="dropdown-divider"></div>
                      <li>
                        <a href="" className="dropdown-item">
                          <i className="fas fa-user-shield"></i> Roles
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </li>
              <li className="nav-item dropdown">
                <div className="nav-dropdown">
                  <a
                    href="#"
                    id="nav2"
                    className="nav-item nav-link dropdown-toggle text-secondary"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="fas fa-user"></i> <span>John Doe</span>{" "}
                    <i
                      style={{ fontSize: ".8em" }}
                      className="fas fa-caret-down"
                    ></i>
                  </a>
                  <div className="dropdown-menu dropdown-menu-end nav-link-menu">
                    <ul className="nav-list">
                      <li>
                        <a href="" className="dropdown-item">
                          <i className="fas fa-address-card"></i> Profile
                        </a>
                      </li>
                      <li>
                        <a href="" className="dropdown-item">
                          <i className="fas fa-envelope"></i> Messages
                        </a>
                      </li>
                      <li>
                        <a href="" className="dropdown-item">
                          <i className="fas fa-cog"></i> Settings
                        </a>
                      </li>
                      <div className="dropdown-divider"></div>
                      <li>
                        <a href="" className="dropdown-item">
                          <i className="fas fa-sign-out-alt"></i> Logout
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </nav>
        <div className="content">
          <div className="container">
            <div className="row">
              <div className="col-md-12 page-header">
                <div className="page-pretitle">Overview</div>
                <h2 className="page-title">Dashboard</h2>
              </div>
            </div>
            <div className="row">
              <div className="col-sm-6 col-md-6 col-lg-3 mt-3">
                <div className="card">
                  <div className="content">
                    <div className="row">
                      <div className="col-sm-4">
                        <div className="icon-big text-center">
                          <i className="teal fas fa-shopping-cart"></i>
                        </div>
                      </div>
                      <div className="col-sm-8">
                        <div className="detail">
                          <p className="detail-subtitle">New Orders</p>
                          <span className="number">6,267</span>
                        </div>
                      </div>
                    </div>
                    <div className="footer">
                      <hr />
                      <div className="stats">
                        <i className="fas fa-calendar"></i> For this Week
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* ... other cards ... */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminApp;
