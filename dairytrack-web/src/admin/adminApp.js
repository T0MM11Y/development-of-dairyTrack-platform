import React from "react";
import Header from "./partials/header";
import Sidebar from "./partials/sidebar";
import Footer from "./partials/footer";
import Content from "./partials/content";

// Import CSS
import "../assets/admin/css/bootstrap.min.css";
import "../assets/admin/css/icons.min.css";
import "../assets/admin/css/app.css";

const AdminApp = () => {
  return (
    <div id="layout-wrapper">
      <Header />
      <Sidebar />
      <div className="main-content">
        <Content />
        <Footer />
      </div>
    </div>
  );
};

export default AdminApp;
