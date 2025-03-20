import React from "react";
import "../../assets/admin/css/style.css";
import "../../assets/admin/css/uikit.min.css";
import "../../assets/admin/css/notyf.min.css";

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
          <a href="buttons.html">Buttons</a>
        </li>
        <li>
          <a href="components.html">Components</a>
        </li>
        <li>
          <a href="tables.html">Tables</a>
        </li>

        <li className="uk-nav-header">Pages</li>
        <li>
          <a href="login.html">Login</a>
        </li>
        <li>
          <a href="register.html">Register</a>
        </li>
        <li>
          <a href="article.html">Article</a>
        </li>
        <li>
          <a href="404.html">404</a>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
