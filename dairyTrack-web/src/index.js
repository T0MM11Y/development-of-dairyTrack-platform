// filepath: c:\Users\t0mm11y\Documents\TA\dairyTrack-web\src\backend\index.js
import React from "react";
import ReactDOM from "react-dom";
import App from "./Modules/App"; // Import backend App.js
import "./Modules/styles/App.css"; // Import global CSS styles
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS
import "bootstrap/dist/js/bootstrap.bundle.min.js"; // Import Bootstrap JS
import 'bootstrap-icons/font/bootstrap-icons.css';



ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
